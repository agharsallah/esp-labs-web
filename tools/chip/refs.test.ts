import { describe, expect, it } from "vitest";
import { citedSections, headingIds, missingSections } from "./refs.ts";

describe("chip reference check", () => {
  it("collects heading numbers of every level and prefix", () => {
    const md = [
      "# Part T: Technical Reference Manual",
      "## 26 UART Controller (UART)",
      "#### C2.3.5 Peripheral Pin Assignment",
      "##### 4.3.3.1 External Memory Address Mapping",
      "## 25A Secure Boot",
      "##### Register 6.1. GPIO_BT_SELECT_REG (0x0000)",
      "Not a heading 26.9",
    ].join("\n");
    expect([...headingIds(md)].sort()).toEqual(["25A", "26", "4.3.3.1", "C2.3.5"]);
  });

  it("finds sections in SourceRefs and in the C()/T() helpers", () => {
    const src = `source: { doc: "C", section: "C3.3" }, chapter: T("26"), x: C( "C2.6" ), y: "26.9"`;
    expect(citedSections(src)).toEqual(["C3.3", "26", "C2.6"]);
  });

  it("reports each missing section once", () => {
    expect(missingSections(["26", "99.9", "99.9", "C3"], new Set(["26", "C3"]))).toEqual(["99.9"]);
  });
});
