// A register drawn as a strip of 32 bits, bit 31 on the start side as datasheets print it.
// Pure layout: which fields sit where, and the reserved gaps between them.

export const REGISTER_BITS = 32;

export interface BitRange {
  readonly hi: number;
  readonly lo: number;
}

/** "11:10" → {hi: 11, lo: 10}; "7" → {hi: 7, lo: 7}. Null when it isn't a range inside 0-31. */
export function parseBits(bits: string): BitRange | null {
  const m = /^\s*(\d+)\s*(?::\s*(\d+)\s*)?$/.exec(bits);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] === undefined ? a : Number(m[2]);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return hi < REGISTER_BITS ? { hi, lo } : null;
}

export interface StripSegment<F> extends BitRange {
  /** The field, or null for reserved bits. */
  readonly field: F | null;
  /** Offset from bit 31 and width, both in bits. */
  readonly start: number;
  readonly width: number;
}

/**
 * Fields laid across the 32 bits from bit 31 down, with reserved gaps filled in. Fields whose
 * bits don't parse, or that overlap one already placed, are left out of the strip.
 */
export function layoutRegister<F extends { readonly bits: string }>(
  fields: readonly F[],
): StripSegment<F>[] {
  const placed: { range: BitRange; field: F }[] = [];
  for (const field of fields) {
    const range = parseBits(field.bits);
    if (!range) continue;
    if (placed.some((p) => range.lo <= p.range.hi && range.hi >= p.range.lo)) continue;
    placed.push({ range, field });
  }
  placed.sort((a, b) => b.range.hi - a.range.hi);

  const out: StripSegment<F>[] = [];
  let next = REGISTER_BITS - 1;
  const push = (hi: number, lo: number, field: F | null) =>
    out.push({ hi, lo, field, start: REGISTER_BITS - 1 - hi, width: hi - lo + 1 });
  for (const { range, field } of placed) {
    if (range.hi < next) push(next, range.hi + 1, null);
    push(range.hi, range.lo, field);
    next = range.lo - 1;
  }
  if (next >= 0) push(next, 0, null);
  return out;
}
