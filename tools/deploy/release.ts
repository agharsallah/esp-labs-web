// The release a production deploy makes: the next version from the Conventional Commits since the
// last tag, and the release notes grouped by type. Pure: tools/deploy/cli.ts feeds it git's output.

export interface Commit {
  sha: string;
  type: string | null;
  scope: string | null;
  breaking: boolean;
  description: string;
  pr: number | null;
}

export type Bump = "major" | "minor" | "patch";

const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?: (?<description>.+)$/;
const PR_SUFFIX = /\s\(#(?<pr>\d+)\)$/;

/** Reads a commit's subject (and body, for a BREAKING CHANGE footer) as a Conventional Commit. */
export function parseCommit(sha: string, subject: string, body = ""): Commit {
  const prMatch = PR_SUFFIX.exec(subject);
  const pr = prMatch?.groups?.pr === undefined ? null : Number(prMatch.groups.pr);
  const text = prMatch === null ? subject : subject.slice(0, prMatch.index);
  const groups = HEADER.exec(text)?.groups;
  const breakingFooter = /^BREAKING[ -]CHANGE: /m.test(body);
  if (groups?.type === undefined || groups.description === undefined) {
    return { sha, type: null, scope: null, breaking: breakingFooter, description: text, pr };
  }
  return {
    sha,
    type: groups.type,
    scope: groups.scope ?? null,
    breaking: groups.bang === "!" || breakingFooter,
    description: groups.description,
    pr,
  };
}

/** The largest bump the commits ask for. Every deploy ships something, so the least is a patch. */
export function bumpOf(commits: readonly Commit[]): Bump {
  if (commits.some((c) => c.breaking)) return "major";
  if (commits.some((c) => c.type === "feat")) return "minor";
  return "patch";
}

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;

/**
 * The version after `previous`. Below 1.0.0 a breaking change bumps the minor, as semver allows
 * for initial development. With no previous tag the first release is `initial` (package.json's).
 */
export function nextVersion(previous: string | null, bump: Bump, initial: string): string {
  if (previous === null) return initial.replace(/^v/, "");
  const match = SEMVER.exec(previous);
  if (match === null) throw new Error(`"${previous}" is not a semver tag`);
  const [major, minor, patch] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const effective = bump === "major" && major === 0 ? "minor" : bump;
  if (effective === "major") return `${major + 1}.0.0`;
  if (effective === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const SECTIONS: readonly { title: string; types: readonly string[] }[] = [
  { title: "Features", types: ["feat"] },
  { title: "Fixes", types: ["fix"] },
  { title: "Performance", types: ["perf"] },
  { title: "Documentation", types: ["docs"] },
  { title: "Maintenance", types: ["refactor", "test", "build", "ci", "chore", "revert", "style"] },
];

export interface Deployment {
  url: string;
  sha: string;
  runUrl: string;
}

export interface NotesInput {
  version: string;
  previous: string | null;
  repository: string;
  commits: readonly Commit[];
  deployment: Deployment;
}

function line(commit: Commit): string {
  const scope = commit.scope === null ? "" : `**${commit.scope}:** `;
  const ref = commit.pr === null ? commit.sha.slice(0, 7) : `#${commit.pr}`;
  return `- ${scope}${commit.description} (${ref})`;
}

/** The release body: breaking changes first, then one section per kind of change, then the deploy. */
export function releaseNotes({ version, previous, repository, commits, deployment }: NotesInput): string {
  const parts: string[] = [];
  const breaking = commits.filter((c) => c.breaking);
  if (breaking.length > 0) parts.push(["### ⚠ Breaking changes", ...breaking.map(line)].join("\n"));
  const known = new Set(SECTIONS.flatMap((s) => s.types));
  for (const { title, types } of SECTIONS) {
    const listed = commits.filter((c) => c.type !== null && types.includes(c.type));
    if (listed.length > 0) parts.push([`### ${title}`, ...listed.map(line)].join("\n"));
  }
  const other = commits.filter((c) => c.type === null || !known.has(c.type));
  if (other.length > 0) parts.push(["### Other", ...other.map(line)].join("\n"));
  if (commits.length === 0) parts.push("No changes since the last release: a redeploy.");

  const server = `https://github.com/${repository}`;
  parts.push(
    [
      "### Deployment",
      `- **Live:** ${deployment.url}`,
      `- **Commit:** ${server}/commit/${deployment.sha}`,
      `- **Workflow run:** ${deployment.runUrl}`,
    ].join("\n"),
  );
  parts.push(
    previous === null
      ? `**Full changelog:** ${server}/commits/v${version}`
      : `**Full changelog:** ${server}/compare/${previous}...v${version}`,
  );
  return `${parts.join("\n\n")}\n`;
}

export interface VercelDeployment {
  uid: string;
  url: string;
  created: number;
  target: string | null;
}

/** Preview deployments older than `maxAgeDays`. Production deployments stay: they are rollbacks. */
export function stalePreviews(
  deployments: readonly VercelDeployment[],
  now: number,
  maxAgeDays: number,
): VercelDeployment[] {
  const cutoff = now - maxAgeDays * 24 * 60 * 60 * 1000;
  return deployments.filter((d) => d.target !== "production" && d.created < cutoff);
}
