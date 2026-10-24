import type { BlockFamily, ChipBlock, Coverage } from "@/domain/chip";

// The chip section's pages, and which blocks each page's meter counts.

export const CHIP_PAGES = [
  { id: "home", to: "/chip", families: null },
  { id: "pins", to: "/chip/pins", families: ["connectivity", "analog", "timing"] },
  { id: "blocks", to: "/chip/blocks", families: null },
  { id: "inside", to: "/chip/inside", families: ["system", "memory", "security"] },
] as const satisfies readonly {
  id: string;
  to: string;
  families: readonly BlockFamily[] | null;
}[];
export type ChipPageId = (typeof CHIP_PAGES)[number]["id"];

/** Used and total blocks among a page's families (all families when null). */
export function pageCoverage(
  blocks: readonly ChipBlock[],
  coverage: ReadonlyMap<string, Coverage>,
  families: readonly BlockFamily[] | null,
): { used: number; total: number } {
  const mine = families ? blocks.filter((b) => families.includes(b.family)) : blocks;
  const used = mine.filter((b) => (coverage.get(b.id) ?? "none") !== "none").length;
  return { used, total: mine.length };
}
