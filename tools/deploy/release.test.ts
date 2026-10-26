import { describe, expect, it } from "vitest";
import { bumpOf, nextVersion, parseCommit, releaseNotes, stalePreviews } from "./release.ts";

const SHA = "1681662abcdef0123456789abcdef0123456789a";

describe("parseCommit", () => {
  it("reads type, scope and the squash-merge PR number", () => {
    expect(parseCommit(SHA, "feat(home): kit finder, the labs you can build (#7)")).toEqual({
      sha: SHA,
      type: "feat",
      scope: "home",
      breaking: false,
      description: "kit finder, the labs you can build",
      pr: 7,
    });
  });

  it("marks a ! or a BREAKING CHANGE footer as breaking", () => {
    expect(parseCommit(SHA, "feat!: drop the old router").breaking).toBe(true);
    expect(parseCommit(SHA, "fix: rename", "BREAKING CHANGE: the URL changed").breaking).toBe(true);
  });

  it("keeps a subject that is not a Conventional Commit, untyped", () => {
    const commit = parseCommit(SHA, "Merge feat/datasheet-read: the datasheet as a book");
    expect(commit.type).toBeNull();
    expect(commit.description).toBe("Merge feat/datasheet-read: the datasheet as a book");
  });
});

describe("nextVersion", () => {
  const commit = (subject: string) => parseCommit(SHA, subject);

  it("starts at package.json's version when nothing is tagged", () => {
    expect(nextVersion(null, "minor", "0.1.0")).toBe("0.1.0");
  });

  it("bumps minor for a feature, patch for anything else", () => {
    expect(nextVersion("v0.1.0", bumpOf([commit("fix: a"), commit("feat: b")]), "0.1.0")).toBe("0.2.0");
    expect(nextVersion("v0.2.0", bumpOf([commit("docs: a")]), "0.1.0")).toBe("0.2.1");
    expect(nextVersion("v0.2.1", bumpOf([]), "0.1.0")).toBe("0.2.2");
  });

  it("bumps minor for a breaking change below 1.0.0 and major from 1.0.0", () => {
    expect(nextVersion("v0.3.4", bumpOf([commit("feat!: b")]), "0.1.0")).toBe("0.4.0");
    expect(nextVersion("v1.3.4", bumpOf([commit("feat!: b")]), "0.1.0")).toBe("2.0.0");
  });

  it("rejects a tag that is not semver", () => {
    expect(() => nextVersion("latest", "patch", "0.1.0")).toThrow(/semver/);
  });
});

describe("releaseNotes", () => {
  const deployment = { url: "https://example.vercel.app", sha: SHA, runUrl: "https://run" };

  it("groups changes by kind, breaking first, and links the deploy and the comparison", () => {
    const notes = releaseNotes({
      version: "0.2.0",
      previous: "v0.1.0",
      repository: "o/r",
      deployment,
      commits: [
        parseCommit(SHA, "fix(i18n): plural forms"),
        parseCommit(SHA, "feat(home): kit finder (#7)"),
        parseCommit(SHA, "feat!: new routes"),
        parseCommit(SHA, "Merge branch x"),
      ],
    });
    expect(notes.indexOf("### ⚠ Breaking changes")).toBeLessThan(notes.indexOf("### Features"));
    expect(notes).toContain("- **home:** kit finder (#7)");
    expect(notes).toContain("- **i18n:** plural forms (1681662)");
    expect(notes).toContain("### Other\n- Merge branch x (1681662)");
    expect(notes).toContain("- **Live:** https://example.vercel.app");
    expect(notes).toContain("https://github.com/o/r/compare/v0.1.0...v0.2.0");
  });

  it("says when a deploy has nothing new", () => {
    const notes = releaseNotes({ version: "0.2.1", previous: "v0.2.0", repository: "o/r", deployment, commits: [] });
    expect(notes).toContain("No changes since the last release");
  });
});

describe("stalePreviews", () => {
  const day = 24 * 60 * 60 * 1000;
  const now = 100 * day;

  it("picks previews past the age and never a production deployment", () => {
    const stale = stalePreviews(
      [
        { uid: "old-preview", url: "a", created: now - 40 * day, target: null },
        { uid: "new-preview", url: "b", created: now - 2 * day, target: "preview" },
        { uid: "old-prod", url: "c", created: now - 90 * day, target: "production" },
      ],
      now,
      30,
    );
    expect(stale.map((d) => d.uid)).toEqual(["old-preview"]);
  });
});
