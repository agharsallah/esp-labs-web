import type { Plugin } from "vite";
import { type Contributor, pickContributors } from "./contributors.ts";

// `virtual:contributors`: the repo's contributors on GitHub, fetched once when the build (or the
// dev server) starts and bundled as data, so readers never call GitHub and the list works offline.
// A failed fetch warns and ships an empty list (the dialog then leaves the section out); it never
// fails a deploy. GITHUB_TOKEN, when set, lifts the API's anonymous rate limit. Tests get [].

const ID = "virtual:contributors";
const RESOLVED = `\0${ID}`;

async function fetchContributors(repo: string): Promise<Contributor[]> {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const [owner = ""] = repo.split("/");
  return pickContributors(await res.json(), owner);
}

/** `repo`: "owner/name". The owner is the dialog's author line, so the list leaves them out. */
export function contributorsPlugin(options: { repo: string }): Plugin {
  let list: Promise<Contributor[]> = Promise.resolve([]);
  return {
    name: "bench-contributors",
    configResolved(config) {
      if (config.mode === "test" || process.env.VITEST) return;
      list = fetchContributors(options.repo).catch((error: unknown) => {
        config.logger.warn(`[contributors] none listed: ${String(error)}`);
        return [];
      });
    },
    resolveId: {
      filter: { id: new RegExp(`^${ID}$`) },
      handler: () => RESOLVED,
    },
    load: {
      filter: { id: new RegExp(`^\\0${ID}$`) },
      handler: async () => `export default ${JSON.stringify(await list)};`,
    },
  };
}
