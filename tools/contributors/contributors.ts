import * as z from "zod/mini";

// The people who contributed to the guide on GitHub, as the about dialog names them: the owner is
// already its author line, and bots are not people.

export interface Contributor {
  readonly login: string;
  readonly url: string;
}

const GithubContributors = z.array(
  z.object({
    login: z.string(),
    html_url: z.string(),
    type: z.string(),
    contributions: z.number(),
  }),
);

/**
 * GitHub's `/repos/{owner}/{repo}/contributors` response, reduced to the people to thank: no owner,
 * no bots, most contributions first (then by name, so the order is stable).
 */
export function pickContributors(response: unknown, owner: string): Contributor[] {
  const isOwner = (login: string) => login.toLowerCase() === owner.toLowerCase();
  return GithubContributors.parse(response)
    .filter((c) => c.type === "User" && !c.login.endsWith("[bot]") && !isOwner(c.login))
    .filter((c) => c.html_url.startsWith("https://github.com/"))
    .sort((a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login))
    .map((c) => ({ login: c.login, url: c.html_url }));
}
