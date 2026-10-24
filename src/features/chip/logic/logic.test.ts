import { describe, expect, it } from "vitest";
import type { ChipBlock, ChipPin, Coverage, Gotcha } from "@/domain/chip";
import type { LessonEntry } from "@/domain/lesson";
import { gainOver, parseAddress } from "./numbers";
import { filterBlocks, groupByFamily, parseAtlasFilter, withAtlasFilter } from "./atlas-filter";
import { countUpValue, decimalsOf, easeOutCubic } from "./count-up";
import { neighbours } from "./neighbours";
import { pageCoverage } from "./nav-pages";
import { CHIP } from "@/content/chip";
import { functionsOfKind, gotchasForPin, pinsUsedByLessons, pinWarns, splitGotchas } from "./pins";
import { groupByTrack } from "./lab-groups";
import { layoutRegister, parseBits } from "./register-layout";

const SRC = { doc: "T", section: "1" } as const;
const block = (id: string, family: ChipBlock["family"], short = ""): ChipBlock => ({
  id,
  family,
  name: id.toUpperCase(),
  short,
  icon: `blk-${id}`,
  depth: "listed",
  facts: [],
  usage: {},
  chapter: SRC,
});
const BLOCKS = [block("uart", "connectivity", "Serial port"), block("ledc", "timing", "PWM for LEDs"), block("adc", "analog")];
const COVERAGE = new Map<string, Coverage>([["uart", "done"], ["ledc", "none"], ["adc", "built"]]);

describe("atlas filter", () => {
  it("parses the URL and falls back to all for unknown values", () => {
    expect(parseAtlasFilter(new URLSearchParams("family=timing&used=no&q= pwm "))).toEqual({
      family: "timing",
      used: "no",
      query: "pwm",
    });
    expect(parseAtlasFilter(new URLSearchParams("family=bogus&used=maybe"))).toEqual({
      family: "all",
      used: "all",
      query: "",
    });
  });

  it("writes a field and drops defaults", () => {
    const p = withAtlasFilter(new URLSearchParams("family=timing&lang=fr"), { family: "all", query: "spi" });
    expect(p.toString()).toBe("lang=fr&q=spi");
  });

  it("filters by family, use and search", () => {
    const ids = (f: Parameters<typeof filterBlocks>[2]) => filterBlocks(BLOCKS, COVERAGE, f).map((b) => b.id);
    expect(ids({ family: "all", used: "all", query: "" })).toEqual(["uart", "ledc", "adc"]);
    expect(ids({ family: "timing", used: "all", query: "" })).toEqual(["ledc"]);
    expect(ids({ family: "all", used: "yes", query: "" })).toEqual(["uart", "adc"]);
    expect(ids({ family: "all", used: "no", query: "" })).toEqual(["ledc"]);
    expect(ids({ family: "all", used: "all", query: "pwm" })).toEqual(["ledc"]);
  });

  it("groups in family order and skips empty families", () => {
    expect(groupByFamily(BLOCKS).map((g) => g.family)).toEqual(["connectivity", "timing", "analog"]);
  });
});

describe("register layout", () => {
  it("parses single bits and ranges", () => {
    expect(parseBits("11:10")).toEqual({ hi: 11, lo: 10 });
    expect(parseBits("7")).toEqual({ hi: 7, lo: 7 });
    expect(parseBits("40")).toBeNull();
    expect(parseBits("x")).toBeNull();
  });

  it("lays fields from bit 31 down with reserved gaps", () => {
    const strip = layoutRegister([{ bits: "0" }, { bits: "31:24" }, { bits: "4:2" }]);
    expect(strip.map((s) => [s.hi, s.lo, s.field !== null])).toEqual([
      [31, 24, true],
      [23, 5, false],
      [4, 2, true],
      [1, 1, false],
      [0, 0, true],
    ]);
    expect(strip.reduce((n, s) => n + s.width, 0)).toBe(32);
    expect(strip[1]?.start).toBe(8);
  });

  it("drops overlapping and unreadable fields", () => {
    const strip = layoutRegister([{ bits: "31:0" }, { bits: "3" }, { bits: "?" }]);
    expect(strip).toHaveLength(1);
  });
});

describe("count-up", () => {
  it("eases from 0 to 1 and clamps", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("keeps the target's decimals", () => {
    expect(decimalsOf(240)).toBe(0);
    expect(decimalsOf(17.5)).toBe(1);
    expect(countUpValue(240, 1)).toBe(240);
    expect(countUpValue(7, 0)).toBe(0);
    expect(Number.isInteger(countUpValue(240, 0.37))).toBe(true);
  });
});

describe("pins", () => {
  const pin: ChipPin = {
    gpio: 3,
    functions: [
      { kind: "adc", symbol: "ADC1_CH2" },
      { kind: "touch", symbol: "TOUCH3" },
      { kind: "adc", symbol: "X" },
    ],
    gotchas: ["a"],
    onHeader: true,
  };
  const g = (id: string, pins?: number[]): Gotcha => ({ id, title: id, text: "", pins, source: SRC });

  it("selects the gotchas a pin names or that name it, once each", () => {
    expect(gotchasForPin(pin, [g("a", [3]), g("b", [3, 4]), g("c", [5])]).map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("joins the functions of one kind", () => {
    expect(functionsOfKind(pin, "adc")).toBe("ADC1_CH2 / X");
    expect(functionsOfKind(pin, "uart")).toBe("");
  });

  it("collects numbered pins from open lessons and their variants", () => {
    const lessons = [
      { kind: "lesson", pins: [{ pin: "4" }, { pin: "GND" }], variants: [{ pins: [{ pin: "6" }] }] },
      { kind: "planned", pins: [{ pin: "9" }] },
    ] as unknown as LessonEntry[];
    expect([...pinsUsedByLessons(lessons)].sort()).toEqual(["4", "6"]);
  });

  it("marks only header pins with a gotcha", () => {
    expect(pinWarns(pin)).toBe(true);
    expect(pinWarns({ ...pin, onHeader: false })).toBe(false);
    expect(pinWarns({ ...pin, gotchas: [] })).toBe(false);
  });

  it("keeps the warning mark rare on the real chip: fewer than 20 GPIOs", () => {
    const marked = CHIP.pins.filter(pinWarns).length;
    expect(marked).toBeGreaterThan(0);
    expect(marked).toBeLessThan(20);
  });

  it("splits pin hazards from whole-chip gotchas", () => {
    const split = splitGotchas([g("a", [3]), g("b"), g("c", [])]);
    expect(split.pins.map((x) => x.id)).toEqual(["a"]);
    expect(split.chip.map((x) => x.id)).toEqual(["b", "c"]);
  });
});

describe("addresses and gains", () => {
  it("parses printed hex addresses", () => {
    expect(parseAddress("0x3FC8_8000")).toBe(0x3fc88000);
    expect(parseAddress("nope")).toBeNaN();
  });
  it("computes the gain", () => {
    expect(gainOver(340, 0.007)).toBe(48571);
    expect(gainOver(1, 0)).toBe(0);
  });
});

describe("navigation", () => {
  it("finds neighbours", () => {
    expect(neighbours(BLOCKS, "ledc")).toEqual({ prev: BLOCKS[0], next: BLOCKS[2] });
    expect(neighbours(BLOCKS, "zzz")).toEqual({ prev: undefined, next: undefined });
  });
  it("counts a page's used blocks", () => {
    expect(pageCoverage(BLOCKS, COVERAGE, null)).toEqual({ used: 2, total: 3 });
    expect(pageCoverage(BLOCKS, COVERAGE, ["timing"])).toEqual({ used: 0, total: 1 });
  });
});

describe("pin params", async () => {
  const { parsePinParams, withPinParams } = await import("./pin-params");
  it("reads a known pin and function, ignoring the rest", () => {
    expect(parsePinParams(new URLSearchParams("pin=3&fn=adc"), [0, 3])).toEqual({ pin: 3, kind: "adc" });
    expect(parsePinParams(new URLSearchParams("pin=22&fn=nope"), [0, 3])).toEqual({ pin: null, kind: "all" });
  });
  it("writes and clears", () => {
    const p = withPinParams(new URLSearchParams("pin=3&fn=adc"), { pin: null, kind: "all" });
    expect(p.toString()).toBe("");
    expect(withPinParams(new URLSearchParams(), { pin: 4 }).toString()).toBe("pin=4");
  });
});

describe("lab groups", () => {
  const track = (id: "intro" | "wifi" | "rfid", lessonIds: string[]) => ({ id, title: id, blurb: "", color: "--ok" as const, lessonIds });
  const tracks = [track("intro", ["00", "01"]), track("wifi", ["W1", "W2"]), track("rfid", ["R1"])];

  it("groups lessons by track, in the tracks' order and their lesson order", () => {
    const groups = groupByTrack([{ id: "W2" }, { id: "01" }, { id: "W1" }, { id: "X9" }], tracks);
    expect(groups.map((g) => [g.track.id, g.lessons.map((l) => l.id)])).toEqual([
      ["intro", ["01"]],
      ["wifi", ["W1", "W2"]],
    ]);
  });

  it("returns nothing for no lessons", () => {
    expect(groupByTrack([], tracks)).toEqual([]);
  });
});
