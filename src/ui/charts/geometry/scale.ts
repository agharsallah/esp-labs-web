// Scales and ticks for the chart kit: plain numbers in, plain numbers out.

/** Maps a value in [d0, d1] onto [r0, r1]. Values outside the domain are clamped. */
export type Scale = (value: number) => number;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function linearScale(d0: number, d1: number, r0: number, r1: number): Scale {
  const span = d1 - d0;
  return (v) => (span === 0 ? r0 : r0 + (clamp(v, Math.min(d0, d1), Math.max(d0, d1)) - d0) * ((r1 - r0) / span));
}

/** A base-10 log scale. The domain must be positive; values at or below zero land on r0. */
export function logScale(d0: number, d1: number, r0: number, r1: number): Scale {
  if (d0 <= 0 || d1 <= 0) throw new RangeError("logScale needs a positive domain");
  const inner = linearScale(Math.log10(d0), Math.log10(d1), r0, r1);
  return (v) => (v <= 0 ? r0 : inner(Math.log10(v)));
}

/** A "nice" step (1, 2 or 5 × 10^n) that splits the span into about `count` parts. */
export function niceStep(span: number, count: number): number {
  if (span <= 0 || count <= 0) return 1;
  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return nice * power;
}

/** Rounds [min, max] out to whole steps and lists the ticks across it. */
export function niceTicks(min: number, max: number, count = 4): { domain: [number, number]; ticks: number[] } {
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) / 2;
    return niceTicks(min - pad, max + pad, count);
  }
  const step = niceStep(max - min, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Round each tick so 0.1 + 0.2 never shows as 0.30000000000000004.
  for (let i = 0; lo + i * step <= hi + step / 2; i++) ticks.push(Number((lo + i * step).toPrecision(12)));
  return { domain: [lo, hi], ticks };
}

/** Powers of ten that cover [min, max]; min and max must be positive. */
export function logTicks(min: number, max: number): { domain: [number, number]; ticks: number[] } {
  if (min <= 0 || max <= 0) throw new RangeError("logTicks needs positive values");
  const lo = Math.floor(Math.log10(Math.min(min, max)));
  let hi = Math.ceil(Math.log10(Math.max(min, max)));
  if (hi === lo) hi = lo + 1;
  const ticks: number[] = [];
  for (let p = lo; p <= hi; p++) ticks.push(Number((10 ** p).toPrecision(12)));
  return { domain: [10 ** lo, 10 ** hi], ticks };
}

/** A value axis for a set of values: linear from zero (or the data minimum) or log. */
export function valueAxis(
  values: readonly number[],
  log: boolean,
  r0: number,
  r1: number,
  fromZero = true,
): { scale: Scale; ticks: { value: number; at: number }[] } {
  const positive = values.filter((v) => v > 0);
  if (log && positive.length > 0) {
    const { domain, ticks } = logTicks(Math.min(...positive), Math.max(...positive));
    const scale = logScale(domain[0], domain[1], r0, r1);
    return { scale, ticks: ticks.map((value) => ({ value, at: scale(value) })) };
  }
  const max = values.length > 0 ? Math.max(...values) : 1;
  const min = fromZero ? Math.min(0, ...values) : Math.min(...values);
  const { domain, ticks } = niceTicks(min, max);
  const scale = linearScale(domain[0], domain[1], r0, r1);
  return { scale, ticks: ticks.map((value) => ({ value, at: scale(value) })) };
}
