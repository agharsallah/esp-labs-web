import { describe, expect, it } from "vitest";
import { pickContributors } from "./contributors.ts";

const person = (login: string, contributions: number, type = "User") => ({
  login,
  html_url: `https://github.com/${login}`,
  type,
  contributions,
  avatar_url: "https://avatars.githubusercontent.com/u/1",
});

describe("pickContributors", () => {
  it("leaves out the owner, whatever the case, and bots", () => {
    const list = pickContributors(
      [
        person("Owner", 50),
        person("ada", 2),
        person("dependabot[bot]", 9, "Bot"),
        person("renovate[bot]", 3),
      ],
      "owner",
    );
    expect(list.map((c) => c.login)).toEqual(["ada"]);
  });

  it("puts the most contributions first, then sorts by name", () => {
    const list = pickContributors([person("cy", 1), person("bo", 4), person("al", 1)], "owner");
    expect(list).toEqual([
      { login: "bo", url: "https://github.com/bo" },
      { login: "al", url: "https://github.com/al" },
      { login: "cy", url: "https://github.com/cy" },
    ]);
  });

  it("drops a profile link that is not on github.com", () => {
    const odd = { ...person("eve", 3), html_url: "javascript:alert(1)" };
    expect(pickContributors([odd], "owner")).toEqual([]);
  });

  it("rejects a response that is not a contributor list", () => {
    expect(() => pickContributors({ message: "API rate limit exceeded" }, "owner")).toThrow();
  });
});
