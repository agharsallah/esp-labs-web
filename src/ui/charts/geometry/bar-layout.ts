import { valueAxis } from "./scale";

/** Bar lengths from x0 for each value, on a linear (from zero) or log axis. */
export function layoutBars(values: readonly number[], opts: { x0: number; x1: number; log: boolean }) {
  const axis = valueAxis(values, opts.log, opts.x0, opts.x1);
  return {
    lengths: values.map((v) => Math.max(0, axis.scale(v) - opts.x0)),
    ticks: axis.ticks,
  };
}

/** Share of `max` as 0–1, clamped; a non-positive max gives 0. */
export function share(value: number, max: number): number {
  return max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
}
