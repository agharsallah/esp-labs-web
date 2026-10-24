// Numbers the pages compute: printed addresses ("0x3FC8_8000") as numbers, and power gains.

/** "0x3FC8_8000" → 0x3fc88000; NaN when it isn't a hex address. */
export function parseAddress(hex: string): number {
  const clean = hex.replaceAll("_", "").trim();
  return /^0x[0-9a-f]+$/i.test(clean) ? Number.parseInt(clean.slice(2), 16) : Number.NaN;
}

/** How many times less the last value draws than the first: 340 vs 0.007 → 48571. */
export function gainOver(first: number, last: number): number {
  return last > 0 ? Math.round(first / last) : 0;
}
