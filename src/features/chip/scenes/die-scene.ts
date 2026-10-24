// The die alone: the floor plan of block tiles on its slab, the tiles rising to their coverage
// height the first time it comes on screen (at once, with reduced motion).
import type { Stage3d, StageOptions, ThreeModule } from "@/ui/stage3d/stage3d";
import { easeInOut } from "@/lib/scroll-progress";
import { buildDieTiles, MAX_H } from "./die-tiles";
import { fitSlabWidth, type Floorplan, slabSize } from "./floorplan";

const RISE_S = 1.4;
const SIZE = 4;

/**
 * The widest the canvas gets (scenes.module.css .dieStage: 2 / 1 from 900 px, 16 / 10 below).
 * Framing for the widest shape keeps the whole slab in view on the narrower one too.
 */
const STAGE_ASPECT = 2;
const AZ = 1.15;
const EL = 0.85;

/** Stage options that frame the whole slab of this plan, with a margin, at the canvas's shape. */
export function dieStage(plan: Floorplan): Omit<StageOptions, "reduce"> {
  const slab = slabSize(plan);
  const w = slab.w * SIZE;
  const d = slab.d * SIZE;
  return {
    target: { x: 0, y: MAX_H * SIZE * 0.15, z: 0 },
    radius: 6,
    fitWidth: fitSlabWidth({ w, d, h: MAX_H * SIZE, az: AZ, el: EL, aspect: STAGE_ASPECT, margin: 1.12 }),
    az: AZ,
    el: EL,
    fov: 26,
    spin: false,
    sway: 0.12,
    zoom: [0.6, 1.4],
    dragOn: "canvas",
    ground: { w: w * 1.2, d: d * 1.4, y: -0.1 },
  };
}

export interface DieScene {
  pick(x: number, y: number): string | null;
  lift(id: string | null): void;
}

export function buildDieScene(T: ThreeModule, S: Stage3d, plan: Floorplan): DieScene {
  const die = buildDieTiles(T, S, plan);
  die.group.scale.setScalar(SIZE);
  S.scene.add(die.group);
  const ray = new T.Raycaster();
  const at = new T.Vector2();
  let shown = 0;
  S.onFrame((_t, dt) => {
    shown += dt;
    die.setRise(S.reduce ? 1 : easeInOut(shown / RISE_S));
  });
  return {
    pick(x, y) {
      ray.setFromCamera(at.set(x, y), S.camera);
      return die.pick(ray);
    },
    lift: die.lift,
  };
}
