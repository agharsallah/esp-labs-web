import { describe, expect, it } from "vitest";
import type { ChipBlock } from "@/domain/chip";
import { buildReference } from "../../../../tools/reference/build";
import { FIXTURE } from "../../../../tools/reference/fixture";
import { refParam, sectionOfParam, sourceOf, withRef } from "../ref-param";
import { SectionSchema } from "../schema";
import type { Block, IndexEntry } from "../schema";
import { citingTexts, neighboursOf, relatedBlock } from "./citations";
import { collectKeyInfo } from "./key-info";
import { matchPassage } from "./match";
import { nextCount, scrollTopFor } from "./progressive";
import { passageRange, passagesOf, readingMinutes, richOf } from "./text";

const ref = buildReference(FIXTURE);
const section = (id: string) => ref.section(id)?.blocks ?? [];

describe("the build's documents", () => {
  it("every fixture section passes the app's schema", () => {
    for (const { id } of ref.index) expect(SectionSchema.safeParse(ref.section(id)).success).toBe(true);
  });
});

describe("ref param", () => {
  it("round-trips doc and section", () => {
    expect(refParam({ doc: "T", section: "26.2" })).toBe("T26.2");
    expect(refParam({ doc: "C", section: "C2.3.5" })).toBe("C2.3.5");
    expect(sectionOfParam("T26.2")).toBe("26.2");
    expect(sectionOfParam("C2.3.5")).toBe("C2.3.5");
    expect(sectionOfParam("X1")).toBe("X1");
    expect(sectionOfParam("../etc")).toBeNull();
    expect(sourceOf("26.2")).toEqual({ doc: "T", section: "26.2" });
    expect(withRef("?pin=3", "26.2")).toBe("?pin=3&ref=T26.2");
    expect(withRef("?pin=3&ref=T26.2", null)).toBe("?pin=3");
  });
});

describe("sentence matcher", () => {
  const passages = passagesOf(section("26.2"));

  it("finds the sentence by shared numbers and keywords", () => {
    const n = matchPassage("5 to 8 data bits, optional parity, and <b>1, 1.5 or 2 stop bits</b>.", passages);
    expect(passages.find((p) => p.n === n)?.text).toBe("Stop bits of 1, 1.5, or 2 bits");
  });

  it("returns null when nothing is close", () => {
    expect(matchPassage("Wi-Fi shares the antenna with Bluetooth.", passages)).toBeNull();
  });
});

describe("key information", () => {
  it("collects tagged numbers once and warning sentences", () => {
    const info = collectKeyInfo([...section("26.1"), ...section("26.2")]);
    expect(info.numbers.map((n) => [n.v, n.k])).toEqual([
      ["80 MHz", "frequency"],
      ["5 Mbps", "frequency"],
    ]);
    expect(info.warnings.map((w) => w.text)).toEqual([
      "Note that it is not recommended to only reset the APB clock domain module.",
    ]);
  });
});

describe("citations and neighbours", () => {
  const content = {
    blocks: [
      { id: "uart", chapter: { doc: "T", section: "26" }, facts: [{ text: "<b>Five</b> Mbps", source: { doc: "T", section: "26.2" } }] },
      { id: "sram", chapter: { doc: "T", section: "4.3.2" }, facts: [] },
    ],
    headline: [{ value: 240, unit: "MHz", label: "Top clock", source: { doc: "T", section: "26.2" } }],
  };

  it("finds what cites a section, as plain text", () => {
    expect(citingTexts(content, "26.2")).toEqual(["Five Mbps", "240 MHz Top clock"]);
    expect(citingTexts(content, "26.1")).toEqual([]);
  });

  it("finds the block whose chapter holds the section", () => {
    const blocks = content.blocks as unknown as ChipBlock[];
    expect(relatedBlock(blocks, "26.4")?.id).toBe("uart");
    expect(relatedBlock(blocks, "4.3.2.1")?.id).toBe("sram");
    expect(relatedBlock(blocks, "27")).toBeUndefined();
  });

  it("gives the trail, siblings and children", () => {
    const index: readonly IndexEntry[] = ref.index;
    const nav = neighboursOf(index, "26.2");
    expect(nav.trail.map((e) => e.id)).toEqual(["26"]);
    expect([nav.prev?.id, nav.next?.id]).toEqual(["26.1", "26.4"]);
    expect(neighboursOf(index, "26").children.map((e) => e.id)).toEqual(["26.1", "26.2", "26.4"]);
  });
});

describe("text and progressive rendering", () => {
  it("passage ranges, reading time and Rich markup", () => {
    const blocks: readonly Block[] = section("26.2");
    expect(blocks[0] ? passageRange(blocks[0]) : null).toEqual([1, 1]);
    expect(readingMinutes(10)).toBe(1);
    expect(readingMinutes(1100)).toBe(5);
    expect(richOf([{ t: "b", c: [{ t: "text", v: "a<b" }] }, { t: "field", v: "X_Y" }])).toBe("<b>a&lt;b</b><code>X_Y</code>");
  });

  it("slices: at least one block, up to the target, then a slice at a time", () => {
    expect(nextCount([10, 10, 10], 0)).toBe(3);
    expect(nextCount([7000, 10, 10], 0)).toBe(1);
    expect(nextCount([7000, 7000, 7000, 10], 0, 3)).toBe(3);
    expect(nextCount([7000, 7000, 10], 1)).toBe(2);
    expect(scrollTopFor({ top: 100, scrollTop: 50, height: 600 }, 900)).toBe(650);
  });
});
