import type { Block } from "../schema";

// Long sections (some are over 100 KB) render in slices: the first screens at once, then the
// rest a slice per idle moment, so opening the reader never janks. Weights are the blocks' sizes.

/** About two screens of text per slice. */
export const SLICE = 6000;

export const weightOf = (block: Block): number => JSON.stringify(block).length;

/** How many blocks to render after `shown`: one slice's worth, at least one block, up to `min`. */
export function nextCount(weights: readonly number[], shown: number, min = 0): number {
  let count = shown;
  let sum = 0;
  while (count < weights.length && (sum < SLICE || count < min || count === shown)) {
    sum += weights[count] ?? 0;
    count += 1;
  }
  return count;
}

/** The scroll offset that puts an element a third of the way down its scrolling container. */
export function scrollTopFor(container: { top: number; scrollTop: number; height: number }, elementTop: number): number {
  return Math.max(0, Math.round(elementTop - container.top + container.scrollTop - container.height / 3));
}
