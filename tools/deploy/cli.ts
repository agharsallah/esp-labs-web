import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { bumpOf, nextVersion, parseCommit, releaseNotes, stalePreviews, type Commit } from "./release.ts";

// The Deploy workflow's helper (.github/workflows/deploy.yml). Needs the full history and tags.
//   node tools/deploy/cli.ts plan                  key=value lines for $GITHUB_OUTPUT
//   node tools/deploy/cli.ts notes <version> <url> the release notes, on stdout
//   node tools/deploy/cli.ts cleanup <days>        removes Vercel previews older than <days>

const ROOT = join(import.meta.dirname, "..", "..");

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function env(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") throw new Error(`${name} is not set`);
  return value;
}

/** The last v* tag reachable from HEAD, or null before the first release. */
function previousTag(): string | null {
  try {
    return git("describe", "--tags", "--abbrev=0", "--match", "v[0-9]*", "HEAD");
  } catch {
    return null;
  }
}

function commitsSince(previous: string | null): Commit[] {
  const range = previous === null ? "HEAD" : `${previous}..HEAD`;
  const log = git("log", "--format=%H%x1f%s%x1f%b%x1e", range);
  return log
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "")
    .map((entry) => {
      const [sha = "", subject = "", body = ""] = entry.split("\x1f");
      return parseCommit(sha, subject, body);
    });
}

function plan(): void {
  const previous = previousTag();
  const commits = commitsSince(previous);
  const initial = z.object({ version: z.string() }).parse(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")));
  const version = nextVersion(previous, bumpOf(commits), initial.version);
  // HEAD already tagged: a redeploy of a released commit makes no new release.
  const release = previous === null || git("rev-list", "-n", "1", previous) !== git("rev-parse", "HEAD");
  console.log(`version=${version}`);
  console.log(`tag=v${version}`);
  console.log(`previous=${previous ?? ""}`);
  console.log(`release=${String(release)}`);
}

function notes(version: string | undefined, url: string | undefined): void {
  if (version === undefined || url === undefined) throw new Error("usage: notes <version> <url>");
  const previous = previousTag();
  const server = env("GITHUB_SERVER_URL");
  process.stdout.write(
    releaseNotes({
      version,
      previous,
      repository: env("GITHUB_REPOSITORY"),
      commits: commitsSince(previous),
      deployment: {
        url,
        sha: git("rev-parse", "HEAD"),
        runUrl: `${server}/${env("GITHUB_REPOSITORY")}/actions/runs/${env("GITHUB_RUN_ID")}`,
      },
    }),
  );
}

const DeploymentList = z.object({
  deployments: z.array(
    z.object({ uid: z.string(), url: z.string(), created: z.number(), target: z.string().nullable() }),
  ),
});

async function cleanup(days: string | undefined): Promise<void> {
  const maxAgeDays = Number(days);
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1) throw new Error("usage: cleanup <days>");
  const headers = { Authorization: `Bearer ${env("VERCEL_TOKEN")}` };
  const team = env("VERCEL_ORG_ID");
  const query = new URLSearchParams({ projectId: env("VERCEL_PROJECT_ID"), teamId: team, target: "preview", limit: "100" });
  const response = await fetch(`https://api.vercel.com/v6/deployments?${query.toString()}`, { headers });
  if (!response.ok) throw new Error(`listing deployments: HTTP ${String(response.status)}`);
  const { deployments } = DeploymentList.parse(await response.json());
  const stale = stalePreviews(deployments, Date.now(), maxAgeDays);
  for (const deployment of stale) {
    const removed = await fetch(`https://api.vercel.com/v13/deployments/${deployment.uid}?teamId=${team}`, {
      method: "DELETE",
      headers,
    });
    if (!removed.ok) throw new Error(`removing ${deployment.url}: HTTP ${String(removed.status)}`);
    console.log(`removed preview ${deployment.url}`);
  }
  console.log(`${String(stale.length)} preview deployment(s) older than ${String(maxAgeDays)} days removed.`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "plan") plan();
else if (command === "notes") notes(args[0], args[1]);
else if (command === "cleanup") await cleanup(args[0]);
else throw new Error(`unknown command "${command ?? ""}": plan, notes or cleanup`);
