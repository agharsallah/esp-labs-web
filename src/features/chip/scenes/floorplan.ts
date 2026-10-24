// The die as a floor plan: block tiles in a grid, grouped by family in the families' order, each
// with a height from how far the labs have taken it. Pure: the 3D scenes and the flat SVG
// fallback lay out the same plan.
import { BLOCK_FAMILIES, type BlockFamily, type Coverage } from "@/domain/chip";

export interface DieBlock {
  readonly id: string;
  readonly family: BlockFamily;
  readonly name: string;
  readonly coverage: Coverage;
}

export interface Tile extends DieBlock {
  /** Cell position in the grid, from the top-left corner. */
  readonly col: number;
  readonly row: number;
  /** Extrusion, 0-1: done > works > built > planned > none, which lies flat (0). */
  readonly height: number;
}

export interface Floorplan {
  readonly cols: number;
  readonly rows: number;
  readonly tiles: readonly Tile[];
}

export const COVERAGE_HEIGHT: Record<Coverage, number> = {
  done: 1,
  works: 0.72,
  built: 0.45,
  planned: 0.2,
  none: 0,
};

/** Lays the blocks out in reading order, family by family, on a grid about twice as wide as tall. */
export function floorplan(blocks: readonly DieBlock[], cols = 8): Floorplan {
  const width = Math.max(1, Math.min(cols, blocks.length));
  const order = [...blocks].sort(
    (a, b) => BLOCK_FAMILIES.indexOf(a.family) - BLOCK_FAMILIES.indexOf(b.family),
  );
  const tiles = order.map((b, i) => ({
    ...b,
    col: i % width,
    row: Math.floor(i / width),
    height: COVERAGE_HEIGHT[b.coverage],
  }));
  return { cols: width, rows: Math.max(1, Math.ceil(blocks.length / width)), tiles };
}

/** The slab's size in its group's units: one unit wide, the depth from the rows, with a rim. */
export function slabSize(plan: Pick<Floorplan, "cols" | "rows">): { w: number; d: number } {
  const cell = 1 / plan.cols;
  return { w: 1 + cell * 0.3, d: cell * plan.rows + cell * 0.3 };
}

export interface FitView {
  /** Slab footprint and tallest tile, in world units. */
  readonly w: number;
  readonly d: number;
  readonly h: number;
  /** Camera azimuth and elevation, radians (the stage's convention). */
  readonly az: number;
  readonly el: number;
  /** Canvas width over height. */
  readonly aspect: number;
  /** Room left around the slab, and for the near edge looming larger in perspective. */
  readonly margin?: number;
}

/**
 * The width the stage must keep in view (`fitWidth`) so the whole slab shows with a margin: its
 * screen width, or its screen height turned into a width by the canvas's aspect, whichever binds.
 */
export function fitSlabWidth({ w, d, h, az, el, aspect, margin = 1.3 }: FitView): number {
  const across = w * Math.abs(Math.sin(az)) + d * Math.abs(Math.cos(az));
  const along = w * Math.abs(Math.cos(az)) + d * Math.abs(Math.sin(az));
  const tall = along * Math.sin(el) + h * Math.cos(el);
  return Math.max(across, tall * aspect) * margin;
}

/** Phones only: frames slower than this, on average, swap the 3D scene for the flat plan. */
export const SLOW_FRAME_S = 0.02;
export const PHONE_WIDTH = 480;

/**
 * Watches frame times and says when a phone-sized viewport can't keep up. It skips the first
 * frames (shader compiles) and judges an average, so one hiccup never trips it.
 */
export function frameBudget(warmup = 20, window = 30) {
  let seen = 0;
  let sum = 0;
  return (dt: number, viewportWidth: number): boolean => {
    seen += 1;
    if (seen <= warmup || viewportWidth >= PHONE_WIDTH) return false;
    sum += dt;
    if (seen - warmup < window) return false;
    const slow = sum / window > SLOW_FRAME_S;
    seen = warmup;
    sum = 0;
    return slow;
  };
}
