import { valueAxis } from "./scale";

export interface RangeDatum {
  min: number;
  typ?: number;
  max: number;
}

export interface RangeRowGeometry {
  y: number;
  x0: number;
  x1: number;
  xTyp: number | null;
}

/** Lays rows of min/typ/max bars on one shared axis between x0 and x1. */
export function layoutRanges(
  rows: readonly RangeDatum[],
  opts: { x0: number; x1: number; rowHeight: number; top: number; log: boolean },
) {
  const values = rows.flatMap((r) => [r.min, r.max, ...(r.typ === undefined ? [] : [r.typ])]);
  const axis = valueAxis(values, opts.log, opts.x0, opts.x1, false);
  const geometry: RangeRowGeometry[] = rows.map((r, i) => ({
    y: opts.top + i * opts.rowHeight,
    x0: axis.scale(Math.min(r.min, r.max)),
    x1: axis.scale(Math.max(r.min, r.max)),
    xTyp: r.typ === undefined ? null : axis.scale(r.typ),
  }));
  return { rows: geometry, ticks: axis.ticks, height: opts.top + rows.length * opts.rowHeight };
}
