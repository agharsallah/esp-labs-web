import { describe, expect, it } from "vitest";
import { HEADER } from "@/domain/board";
import { BLOCK_FAMILIES, type BlockFamily, blockCoverage, type SourceRef } from "@/domain/chip";
import type { LessonEntry } from "@/domain/lesson";
import { CHIP_PARTS } from "@/ui/parts/chip-registry";
import { bleLessons } from "../lessons/ble";
import { displayLessons } from "../lessons/display";
import { introLessons } from "../lessons/intro";
import { rfidLessons } from "../lessons/rfid";
import { soundLessons } from "../lessons/sound";
import { wifiLessons } from "../lessons/wifi";
import { CHIP } from ".";

// The brief's block list (docs/plans-chip-brief.md): id → family, and the twelve written in full.
const FAMILIES: Readonly<Record<BlockFamily, readonly string[]>> = {
  system: ["cpu", "ulp", "gdma", "gpio", "rtc"],
  memory: ["sram", "rom", "flash-psram", "cache", "efuse"],
  security: ["crypto", "rng"],
  connectivity: ["uart", "i2c", "i2s", "spi", "lcd-cam", "twai", "usb-otg", "usb-serial-jtag", "sdmmc"],
  timing: ["timers", "wdt", "ledc", "mcpwm", "rmt", "pcnt"],
  analog: ["adc", "touch", "temp-sensor"],
  radio: ["wifi", "ble"],
};
const FULL = new Set(["gpio", "uart", "i2c", "spi", "ledc", "adc", "touch", "i2s", "rmt", "wifi", "ble", "usb-serial-jtag"]);
const BRIEF_ORDER = BLOCK_FAMILIES.flatMap((f) => FAMILIES[f]);

const LESSONS: readonly LessonEntry[] = [
  ...introLessons,
  ...displayLessons,
  ...wifiLessons,
  ...rfidLessons,
  ...bleLessons,
  ...soundLessons,
];

const { blocks, pins, gotchas, memory, clocks, power, facts, headline } = CHIP;
const blockFacts = blocks.flatMap((b) => b.facts);

const hasSource = (s: SourceRef | undefined) =>
  s !== undefined && ["A", "M", "C", "T", "X"].includes(s.doc) && s.section.length > 0;

const duplicates = (ids: readonly string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

describe("chip content", () => {
  it("cites a source for every fact, number, gotcha, region, clock, power mode and register", () => {
    const sourced = [
      ...facts,
      ...headline,
      ...blockFacts,
      ...gotchas,
      ...memory,
      ...clocks.nodes,
      ...power,
      ...blocks.flatMap((b) => b.registers ?? []),
    ];
    expect(sourced.filter((x) => !hasSource(x.source))).toEqual([]);
    expect(blocks.filter((b) => !hasSource(b.chapter)).map((b) => b.id)).toEqual([]);
  });

  it("keeps ids unique", () => {
    expect(duplicates(blocks.map((b) => b.id))).toEqual([]);
    expect(duplicates([...facts, ...blockFacts].map((f) => f.id))).toEqual([]);
    expect(duplicates(headline.map((h) => h.id))).toEqual([]);
    expect(duplicates(gotchas.map((g) => g.id))).toEqual([]);
    expect(duplicates(memory.map((m) => m.id))).toEqual([]);
    expect(duplicates(clocks.nodes.map((n) => n.id))).toEqual([]);
    expect(duplicates(power.map((p) => p.id))).toEqual([]);
    expect(duplicates(pins.map((p) => String(p.gpio)))).toEqual([]);
  });

  it("has every block of the brief once, in its family and order", () => {
    expect(blocks.map((b) => b.id)).toEqual(BRIEF_ORDER);
    for (const family of BLOCK_FAMILIES)
      expect(blocks.filter((b) => b.family === family).map((b) => b.id)).toEqual(FAMILIES[family]);
  });

  it("writes the twelve brief blocks in full and lists the rest", () => {
    for (const b of blocks) {
      expect(b.depth, b.id).toBe(FULL.has(b.id) ? "full" : "listed");
      if (b.depth === "full") {
        expect(b.facts.length, b.id).toBeGreaterThanOrEqual(3);
        expect(b.facts.length, b.id).toBeLessThanOrEqual(6);
        expect(b.facts.some((f) => f.importance === "key"), b.id).toBe(true);
        expect(b.spark, b.id).toBeDefined();
        expect(b.registers?.length ?? 0, b.id).toBeGreaterThanOrEqual(3);
        expect(b.registers?.length ?? 0, b.id).toBeLessThanOrEqual(6);
      } else {
        expect(b.facts.length, b.id).toBeGreaterThanOrEqual(1);
        expect(b.facts.length, b.id).toBeLessThanOrEqual(3);
        expect(b.registers, b.id).toBeUndefined();
      }
    }
  });

  it("draws every block with its parts-library icon", () => {
    for (const b of blocks) {
      expect(b.icon).toBe(b.id === "flash-psram" ? "blk-flash" : `blk-${b.id}`);
      expect(CHIP_PARTS, b.icon).toHaveProperty([b.icon]);
    }
  });

  it("ties gotchas to pins and blocks that exist, both ways", () => {
    const gpios = new Set(pins.map((p) => p.gpio));
    const blockIds = new Set(blocks.map((b) => b.id));
    const gotchaIds = new Set(gotchas.map((g) => g.id));
    for (const g of gotchas) {
      expect((g.pins ?? []).filter((p) => !gpios.has(p)), g.id).toEqual([]);
      expect((g.blocks ?? []).filter((b) => !blockIds.has(b)), g.id).toEqual([]);
    }
    for (const p of pins) expect((p.gotchas ?? []).filter((id) => !gotchaIds.has(id)), `GPIO${p.gpio}`).toEqual([]);
  });

  it("lists pins only on gotchas about a hazard of specific pins", () => {
    const pinHazards = ["strapping-pins", "gpio3-floating", "flash-pins", "octal-psram-pins", "r16v-1v8", "usb-pins", "uart0-boot-log", "jtag-pins", "rgb-led-pin"];
    for (const g of gotchas) expect((g.pins ?? []).length > 0, g.id).toBe(pinHazards.includes(g.id));
    for (const p of pins)
      for (const id of p.gotchas ?? []) expect(pinHazards, `GPIO${p.gpio} ${id}`).toContain(id);
  });

  it("covers GPIO0-21 and 26-48, and every GPIO on the DevKitC header", () => {
    const expected = [...Array.from({ length: 22 }, (_, i) => i), ...Array.from({ length: 23 }, (_, i) => i + 26)];
    expect(pins.map((p) => p.gpio)).toEqual(expected);
    const header = [...HEADER.L, ...HEADER.R].filter((p) => /^\d+$/.test(p)).map(Number);
    const byGpio = new Map(pins.map((p) => [p.gpio, p]));
    for (const gpio of header) expect(byGpio.get(gpio)?.onHeader, `GPIO${gpio}`).toBe(true);
    expect(pins.filter((p) => p.onHeader && !header.includes(p.gpio)).map((p) => p.gpio)).toEqual([]);
  });

  it("lights blocks from the real lessons", () => {
    const coverage = blocks.map((b) => blockCoverage(b, LESSONS, {}));
    expect(coverage.filter((c) => c !== "none").length).toBeGreaterThan(0);
    const used = (id: string) => coverage[blocks.findIndex((b) => b.id === id)];
    for (const id of ["cpu", "gpio", "uart", "spi", "i2s", "adc", "rmt", "wifi", "ble", "usb-serial-jtag"])
      expect(used(id), id).not.toBe("none");
  });

  it("only points clock edges at clock nodes", () => {
    const ids = new Set(clocks.nodes.map((n) => n.id));
    expect(clocks.edges.filter((e) => !ids.has(e.from) || !ids.has(e.to))).toEqual([]);
  });
});
