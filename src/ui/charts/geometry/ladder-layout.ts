import { valueAxis } from "./scale";

export interface LadderRungGeometry {
  y: number;
  length: number;
  /** How many times smaller than the first rung (1 for the first). */
  ratio: number;
}

/** Rungs top to bottom, each a bar whose length is its value on a log axis from x0. */
export function layoutLadder(
  values: readonly number[],
  opts: { x0: number; x1: number; rowHeight: number; top: number },
) {
  const axis = valueAxis(values, true, opts.x0, opts.x1);
  const first = values[0] ?? 0;
  const rungs: LadderRungGeometry[] = values.map((v, i) => ({
    y: opts.top + i * opts.rowHeight,
    length: Math.max(0, axis.scale(v) - opts.x0),
    ratio: v > 0 && first > 0 ? first / v : 1,
  }));
  return { rungs, ticks: axis.ticks, height: opts.top + values.length * opts.rowHeight };
}
