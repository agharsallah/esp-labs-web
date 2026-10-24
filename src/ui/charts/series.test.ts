import { describe, expect, it } from "vitest";
import type { ColorToken } from "./series";
import { seriesStyle } from "./series";

describe("seriesStyle", () => {
  it("wraps a token name in var() and refuses anything else", () => {
    expect(seriesStyle("--fam-analog", 2)).toEqual({ "--series": "var(--fam-analog)", "--i": "2" });
    expect(seriesStyle("--x; color: red" as ColorToken)).toEqual({});
    expect(seriesStyle(undefined)).toEqual({});
  });
});
