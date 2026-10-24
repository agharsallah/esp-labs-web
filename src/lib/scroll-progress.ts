// Scroll-scrubbed scenes: where the reader is inside a tall section, as a 0-1 progress, the layer
// that progress falls in, and the scene position the camera eases between keyframes. Pure.

export interface LayerPosition {
  /** The layer whose band the progress is in, 0 … layers − 1. */
  readonly layer: number;
  /** How far through that band, 0-1. */
  readonly within: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * How far a tall section has scrolled past the top of the viewport: 0 when its top reaches the
 * top, 1 when its bottom reaches the bottom (the span a sticky child stays pinned).
 */
export function sectionProgress(rect: { readonly top: number; readonly height: number }, viewport: number): number {
  const travel = rect.height - viewport;
  if (travel <= 0) return rect.top < 0 ? 1 : 0;
  return clamp01(-rect.top / travel);
}

/** The layer a progress falls in when the section is cut into `layers` equal bands. */
export function layerAt(progress: number, layers: number): LayerPosition {
  const n = Math.max(1, Math.floor(layers));
  const s = clamp01(progress) * n;
  const layer = Math.min(n - 1, Math.floor(s));
  return { layer, within: clamp01(s - layer) };
}

/**
 * The scene position (0 … layers − 1, a keyframe at each whole number) for a progress. Each move
 * from one keyframe to the next is centred on the border between their bands, so the caption,
 * which changes with the band (`layerAt`), switches at the midpoint of the move: the scene is half
 * way there when the new caption shows, never still on the old layer. Between moves each keyframe
 * holds for `hold` of a band.
 */
export function scenePosition(progress: number, layers: number, hold = 0.35): number {
  const n = Math.max(1, Math.floor(layers));
  const s = clamp01(progress) * n;
  const width = Math.max(1e-6, 1 - clamp01(hold));
  let pos = 0;
  for (let border = 1; border < n; border++) pos += easeInOut((s - border) / width + 0.5);
  return pos;
}

/** Cubic ease in and out, 0-1 to 0-1. */
export function easeInOut(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** How far `pos` is through the span [from, to], 0-1 (for one object's part of the motion). */
export function span(pos: number, from: number, to: number): number {
  return to === from ? (pos >= to ? 1 : 0) : clamp01((pos - from) / (to - from));
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
