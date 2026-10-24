import { describe, expect, it } from "vitest";
import { blockCoverage, blockLessons, type ChipBlock, chipProgress, lessonUses, nextBlocks } from "./chip";
import type { ActiveLesson, LessonEntry } from "./lesson";

const lesson = (id: string, over: Partial<ActiveLesson> = {}): ActiveLesson => ({
  kind: "lesson",
  id,
  track: "intro",
  title: id,
  status: "built",
  heading: id,
  steps: ["one"],
  ...over,
});

const block = (id: string, usage: ChipBlock["usage"]): ChipBlock => ({
  id,
  family: "connectivity",
  name: id,
  short: id,
  icon: "module",
  depth: "full",
  facts: [],
  usage,
  chapter: { doc: "T", section: "26" },
});

const LESSONS: LessonEntry[] = [
  lesson("01", { pins: [{ pin: "48", role: "rgb", side: "R" }], cmd: "pio run -e 01-blink" }),
  lesson("W1", { track: "wifi", status: "works on your board" }),
  lesson("S1", { track: "sound", variants: [{ key: "v", label: "v", short: "v", pins: [{ pin: "4", role: "mic", side: "L" }] }] }),
  { kind: "planned", id: "X1", track: "sensors", title: "x", status: "planned" },
];

describe("chip usage rules", () => {
  it("matches tracks, pins (variants included), lesson ids, firmware and USB", () => {
    const [l01, w1, s1] = LESSONS as [ActiveLesson, ActiveLesson, ActiveLesson];
    expect(lessonUses({ tracks: ["wifi"] }, w1)).toBe(true);
    expect(lessonUses({ pins: ["48"] }, l01)).toBe(true);
    expect(lessonUses({ pins: ["4"] }, s1)).toBe(true);
    expect(lessonUses({ lessons: ["S1"] }, s1)).toBe(true);
    expect(lessonUses({ firmware: true }, l01)).toBe(true);
    expect(lessonUses({ firmware: true }, w1)).toBe(false);
    expect(lessonUses({ firmware: true }, lesson("W2", { variants: [{ key: "a", label: "a", short: "a", cmd: "pio run -e w2-a" }] }))).toBe(true);
    expect(lessonUses({ usb: true }, lesson("U", { usb: true }))).toBe(true);
    expect(lessonUses({}, l01)).toBe(false);
  });

  it("never counts planned lessons", () => {
    expect(blockLessons(block("b", { tracks: ["sensors"] }), LESSONS)).toEqual([]);
  });
});

describe("chip coverage", () => {
  const wifi = block("wifi", { tracks: ["wifi"] });
  const rgb = block("rmt", { pins: ["48"] });
  const unused = block("twai", {});

  it("takes the most advanced state of the lessons using a block", () => {
    expect(blockCoverage(wifi, LESSONS, {})).toBe("works");
    expect(blockCoverage(rgb, LESSONS, {})).toBe("built");
    expect(blockCoverage(rgb, LESSONS, { "01-0": true })).toBe("done");
    expect(blockCoverage(unused, LESSONS, {})).toBe("none");
  });

  it("tallies blocks by coverage", () => {
    expect(chipProgress([wifi, rgb, unused], LESSONS, {})).toEqual({
      done: 0,
      works: 1,
      built: 1,
      planned: 0,
      none: 1,
    });
  });

  it("suggests the next blocks with the lesson that lights them, skipping done ones", () => {
    expect(nextBlocks([wifi, rgb, unused], LESSONS, {}).map((n) => [n.block.id, n.lesson.id])).toEqual([
      ["wifi", "W1"],
      ["rmt", "01"],
    ]);
    expect(nextBlocks([rgb], LESSONS, { "01-0": true })).toEqual([]);
  });
});
