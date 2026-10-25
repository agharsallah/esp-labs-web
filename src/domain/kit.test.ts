import { describe, expect, it } from "vitest";
import { kitParts, matchKit, type LessonKit } from "./kit";

const sound: LessonKit = { need: [["tft"], ["ky037", "inmp441"]], optional: ["amp"] };

describe("matchKit", () => {
  it("is ready when the lesson needs nothing beyond the board", () => {
    expect(matchKit({ need: [] }, new Set<string>())).toEqual({ fit: "ready", missing: [] });
  });

  it("accepts any one part of an either-or requirement", () => {
    expect(matchKit(sound, new Set(["tft", "inmp441"])).fit).toBe("ready");
    expect(matchKit(sound, new Set(["tft", "ky037"])).fit).toBe("ready");
  });

  it("is near when exactly one requirement is missing, and names it", () => {
    expect(matchKit(sound, new Set(["tft"]))).toEqual({
      fit: "near",
      missing: [["ky037", "inmp441"]],
    });
  });

  it("is far when two or more are missing; optional parts never count", () => {
    expect(matchKit(sound, new Set(["amp"]))).toEqual({
      fit: "far",
      missing: [["tft"], ["ky037", "inmp441"]],
    });
  });
});

describe("kitParts", () => {
  it("collects required and optional parts once", () => {
    expect([...kitParts(sound)]).toEqual(["tft", "ky037", "inmp441", "amp"]);
  });
});
