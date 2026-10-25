import { describe, expect, it } from "vitest";
import { matchesQuery } from "./search";

describe("matchesQuery", () => {
  it("matches everything on an empty query", () => {
    expect(matchesQuery("  ", ["anything"])).toBe(true);
  });

  it("ignores case, accents and separators", () => {
    expect(matchesQuery("ecran", ["Écran TFT 1,9″"])).toBe(true);
    expect(matchesQuery("max 98357", ["MAX98357A amplifier"])).toBe(true);
    expect(matchesQuery("ky-037", ["KY037 analog mic"])).toBe(true);
  });

  it("needs every word to appear in one of the texts", () => {
    expect(matchesQuery("mic i2s", ["INMP441 mic", "i2s"])).toBe(true);
    expect(matchesQuery("mic speaker", ["INMP441 mic"])).toBe(false);
  });
});
