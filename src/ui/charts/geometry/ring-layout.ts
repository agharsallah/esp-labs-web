export interface RingSegment<K extends string> {
  key: K;
  value: number;
  /** Arc path on a circle of the given radius, starting at 12 o'clock, clockwise. */
  path: string;
  /** Share of the whole ring, 0–1. */
  share: number;
}

/**
 * Splits a ring into arcs proportional to the values, in the order given, with `gapDeg` between
 * arcs. Zero values are dropped; a single segment fills the whole ring with no gap.
 */
export function layoutRing<K extends string>(
  parts: readonly { key: K; value: number }[],
  opts: { cx: number; cy: number; radius: number; gapDeg: number },
): RingSegment<K>[] {
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((s, p) => s + p.value, 0);
  if (total === 0) return [];
  const gap = shown.length > 1 ? opts.gapDeg : 0;
  let angle = 0;
  return shown.map((p) => {
    const share = p.value / total;
    const sweep = share * 360;
    const a0 = angle + gap / 2;
    const a1 = angle + Math.max(gap / 2 + 0.01, sweep - gap / 2);
    angle += sweep;
    return { key: p.key, value: p.value, share, path: arc(opts.cx, opts.cy, opts.radius, a0, a1) };
  });
}

/** An SVG arc from a0 to a1 degrees (0 = top, clockwise). A full turn is drawn as two halves. */
export function arc(cx: number, cy: number, radius: number, a0: number, a1: number): string {
  if (a1 - a0 >= 359.99) {
    const top = point(cx, cy, radius, 0);
    const bottom = point(cx, cy, radius, 180);
    return `M${top}A${radius} ${radius} 0 1 1 ${bottom}A${radius} ${radius} 0 1 1 ${top}`;
  }
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${point(cx, cy, radius, a0)}A${radius} ${radius} 0 ${large} 1 ${point(cx, cy, radius, a1)}`;
}

function point(cx: number, cy: number, radius: number, deg: number): string {
  const rad = (deg * Math.PI) / 180;
  const x = Math.round((cx + radius * Math.sin(rad)) * 100) / 100;
  const y = Math.round((cy - radius * Math.cos(rad)) * 100) / 100;
  return `${x} ${y}`;
}
