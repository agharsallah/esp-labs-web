// The chip model: pure data and rules, no React. Content files in src/content/chip describe the
// ESP32-S3 with these types; the chip pages render them and light up what the labs have used.
import type { ActiveLesson, LessonEntry, PinUse, Rich, TrackId } from "./lesson";
import { type LessonState, lessonState, type Ticks } from "./progress";

/** Where a fact comes from: a section id of docs-llm/esp32-s3/ESP32-S3_REFERENCE.md. */
export interface SourceRef {
  /** "A" board, "M" module, "C" chip datasheet, "T" technical reference manual, "X" appendices. */
  readonly doc: "A" | "M" | "C" | "T" | "X";
  /** The heading number, as written in the reference: "C2.3.5", "26.4", "M3.3". */
  readonly section: string;
}

/** How much a fact matters to a maker. Drawn as different shapes, never by colour alone. */
export type Importance = "key" | "gotcha" | "detail";

export interface ChipFact {
  readonly id: string;
  readonly text: Rich;
  readonly importance: Importance;
  readonly source: SourceRef;
}

/** A headline number: "240 MHz", counted up on entry. */
export interface HeadlineNumber {
  readonly id: string;
  readonly value: number;
  readonly unit: string;
  readonly label: string;
  readonly source: SourceRef;
}

export const BLOCK_FAMILIES = [
  "system",
  "memory",
  "security",
  "connectivity",
  "timing",
  "analog",
  "radio",
] as const;
export type BlockFamily = (typeof BLOCK_FAMILIES)[number];

/** When a lesson counts as using a block. A lesson uses a block if any listed field matches. */
export interface UsageRule {
  readonly tracks?: readonly TrackId[];
  /** GPIO numbers as in domain/board.ts ("0", "48"). */
  readonly pins?: readonly string[];
  readonly lessons?: readonly string[];
  /** Lessons that flash firmware (a `-e <env>` command) use the CPU, memory and flash. */
  readonly firmware?: boolean;
  readonly usb?: boolean;
}

/** A register a maker actually touches, drawn as a bit-field strip. */
// Register, field and pin-function names are symbols ("UART_CONF0_REG", "ADC1_CH0"), not text:
// they are called `symbol` so the translation overlay never picks them up as names.
export interface KeyRegister {
  readonly symbol: string;
  readonly offset: string;
  readonly fields: readonly { readonly bits: string; readonly symbol: string; readonly does: Rich }[];
  readonly source: SourceRef;
}

export interface ChipBlock {
  readonly id: string;
  readonly family: BlockFamily;
  readonly name: string;
  /** One line under the name. */
  readonly short: Rich;
  /** Parts-library drawing for the tile (a PartName; checked by the content test). */
  readonly icon: string;
  /** Written out in full (key facts, registers) or listed only, greyed as "not yet". */
  readonly depth: "full" | "listed";
  /** The tile's one number: "5 Mbps". `max` is the fastest peer, for a Spark bar. */
  readonly spark?: { readonly value: number; readonly unit: string; readonly max: number };
  readonly facts: readonly ChipFact[];
  readonly registers?: readonly KeyRegister[];
  readonly usage: UsageRule;
  /** Chapter of the reference for "Read the full section". */
  readonly chapter: SourceRef;
}

/** A command that builds and flashes a PlatformIO env (`-e <env>`). */
const flashes = (cmd: string | undefined) => /(?:^|\s)-e\s/.test(cmd ?? "");

const pinsOf = (l: ActiveLesson): readonly PinUse[] => [
  ...(l.pins ?? []),
  ...(l.variants ?? []).flatMap((v) => v.pins ?? []),
];

/** Does an open lesson match a usage rule? */
export function lessonUses(rule: UsageRule, lesson: ActiveLesson): boolean {
  if (rule.tracks?.includes(lesson.track)) return true;
  if (rule.lessons?.includes(lesson.id)) return true;
  if (rule.usb && lesson.usb) return true;
  if (rule.firmware && [lesson.cmd, ...(lesson.variants ?? []).map((v) => v.cmd)].some(flashes))
    return true;
  const pins = rule.pins;
  return pins !== undefined && pinsOf(lesson).some((p) => pins.includes(p.pin));
}

/** The open lessons that use a block, in table-of-contents order. */
export function blockLessons(block: ChipBlock, lessons: readonly LessonEntry[]): ActiveLesson[] {
  return lessons.filter((l): l is ActiveLesson => l.kind === "lesson" && lessonUses(block.usage, l));
}

/** Most advanced first, as LessonState reads; "none" when no lab touches the block yet. */
const ORDER: readonly LessonState[] = ["done", "works", "built", "planned"];
export type Coverage = LessonState | "none";

/** How far the labs have taken a block: the best state among the lessons that use it. */
export function blockCoverage(
  block: ChipBlock,
  lessons: readonly LessonEntry[],
  ticks: Ticks,
): Coverage {
  const states = new Set(blockLessons(block, lessons).map((l) => lessonState(l, ticks)));
  return ORDER.find((s) => states.has(s)) ?? "none";
}

/** How many blocks sit at each coverage, for the progress ring. */
export function chipProgress(
  blocks: readonly ChipBlock[],
  lessons: readonly LessonEntry[],
  ticks: Ticks,
): Record<Coverage, number> {
  const tally: Record<Coverage, number> = { done: 0, works: 0, built: 0, planned: 0, none: 0 };
  for (const b of blocks) tally[blockCoverage(b, lessons, ticks)] += 1;
  return tally;
}

/** The next blocks to unlock: not yet done, with the first lesson that would light them. */
export function nextBlocks(
  blocks: readonly ChipBlock[],
  lessons: readonly LessonEntry[],
  ticks: Ticks,
  limit = 3,
): { block: ChipBlock; lesson: ActiveLesson }[] {
  const out: { block: ChipBlock; lesson: ActiveLesson }[] = [];
  for (const block of blocks) {
    if (out.length >= limit) break;
    const coverage = blockCoverage(block, lessons, ticks);
    if (coverage === "done") continue;
    const lesson = blockLessons(block, lessons).find((l) => lessonState(l, ticks) !== "done");
    if (lesson) out.push({ block, lesson });
  }
  return out;
}

/** A GPIO and everything it can be. */
export interface ChipPin {
  readonly gpio: number;
  /** Functions by kind: "ADC1_CH0", "TOUCH1", "RTC_GPIO1", "U0TXD", "FSPICLK"... */
  readonly functions: readonly { readonly kind: PinFunctionKind; readonly symbol: string }[];
  /** Strapping role, if any: "boot mode", "JTAG source"... */
  readonly strapping?: string;
  /** Gotcha ids that apply to this pin. */
  readonly gotchas?: readonly string[];
  /** On the DevKitC-1 header (false for in-package flash/PSRAM pins). */
  readonly onHeader: boolean;
}

export const PIN_FUNCTION_KINDS = [
  "adc",
  "touch",
  "rtc",
  "uart",
  "spi",
  "usb",
  "jtag",
  "clock",
  "strap",
] as const;
export type PinFunctionKind = (typeof PIN_FUNCTION_KINDS)[number];

/** A pitfall that breaks boards or wastes a day. Always shown with the warning shape. */
export interface Gotcha {
  readonly id: string;
  readonly title: string;
  readonly text: Rich;
  readonly pins?: readonly number[];
  readonly blocks?: readonly string[];
  readonly source: SourceRef;
}

/** One region of the address map. Addresses are hex strings, as printed. */
export interface MemoryRegion {
  readonly id: string;
  readonly name: string;
  readonly kind: "rom" | "sram" | "rtc" | "flash" | "psram" | "peripheral";
  readonly bus: "instruction" | "data" | "both";
  readonly start: string;
  readonly end: string;
  /** Where your sketch's code or data goes, highlighted on the tower. */
  readonly yours?: boolean;
  readonly note?: Rich;
  readonly source: SourceRef;
}

/** The clock tree, as nodes (sources, dividers, consumers) and edges. */
export interface ClockNode {
  readonly id: string;
  readonly name: string;
  readonly kind: "source" | "pll" | "divider" | "consumer";
  readonly mhz?: readonly number[];
  readonly source: SourceRef;
}
export interface ClockEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

/** A power mode: current draw and what stays on. Currents in mA, as printed (typ or range). */
export interface PowerMode {
  readonly id: string;
  readonly name: string;
  readonly currentMa: { readonly min?: number; readonly typ: number; readonly max?: number };
  readonly keepsOn: readonly string[];
  readonly note?: Rich;
  readonly source: SourceRef;
}
