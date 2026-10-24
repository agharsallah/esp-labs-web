// The headline numbers count up from zero on entry: an ease-out curve, then the value it shows.

/** Fast at first, settling into the value. 0 → 0, 1 → 1, clamped outside. */
export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/** The number shown at time `t` (0-1) of the count, with as many decimals as the target has. */
export function countUpValue(target: number, t: number): number {
  const decimals = decimalsOf(target);
  const f = 10 ** decimals;
  return Math.round(target * easeOutCubic(t) * f) / f;
}

/** Decimal places of a number as written: 240 → 0, 17.5 → 1, 0.136 → 3. */
export function decimalsOf(value: number): number {
  const s = String(value);
  const dot = s.indexOf(".");
  return dot < 0 || s.includes("e") ? 0 : s.length - dot - 1;
}
