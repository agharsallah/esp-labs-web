export interface AddressRegionDatum {
  start: number;
  /** Exclusive end address. */
  end: number;
}

export interface AddressRegionGeometry {
  y: number;
  height: number;
  /** Where the label's centre sits; nudged so labels never overlap. */
  labelY: number;
}

/**
 * Stacks regions top to bottom in the order given. Heights follow log2 of each region's length,
 * so a 4 KB region and a 32 MB one both stay visible, with a floor of `minHeight`.
 * Labels start at their region's centre and are pushed apart by at least `labelGap`, within [0, total].
 */
export function layoutAddressMap(
  regions: readonly AddressRegionDatum[],
  opts: { unit: number; minHeight: number; labelGap: number },
): { regions: AddressRegionGeometry[]; height: number } {
  let y = 0;
  const placed = regions.map((r) => {
    const length = Math.max(1, r.end - r.start);
    const height = Math.max(opts.minHeight, Math.log2(length) * opts.unit);
    const g = { y, height, labelY: y + height / 2 };
    y += height;
    return g;
  });
  const total = y;
  const labels = spreadLabels(
    placed.map((g) => g.labelY),
    opts.labelGap,
    0,
    total,
  );
  return { regions: placed.map((g, i) => ({ ...g, labelY: labels[i] ?? g.labelY })), height: total };
}

/**
 * Pushes sorted label centres apart by `gap`, keeping each within [lo + gap/2, hi - gap/2].
 * When every region is at least `gap` tall the result always fits.
 */
export function spreadLabels(wanted: readonly number[], gap: number, lo: number, hi: number): number[] {
  const out = [...wanted];
  let floor = lo + gap / 2;
  for (let i = 0; i < out.length; i++) {
    const v = Math.max(out[i] ?? floor, floor);
    out[i] = v;
    floor = v + gap;
  }
  let ceiling = hi - gap / 2;
  for (let i = out.length - 1; i >= 0; i--) {
    const v = Math.min(out[i] ?? ceiling, ceiling);
    out[i] = v;
    ceiling = v - gap;
  }
  return out;
}
