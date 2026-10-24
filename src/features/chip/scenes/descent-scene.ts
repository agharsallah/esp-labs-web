// The descent: the DevKitC from the home page, then the camera dives to the module, the shield
// can lifts off and away, the QFN56 package opens and the die rises out of it as a floor plan of
// block tiles. A scene position 0-4 (a keyframe per layer) drives every transform; the page sets
// where it should be, and the scene eases there each frame (or jumps, with reduced motion).
import type * as Three from "three";
import { buildBoardScene } from "@/features/home/board3d/esp32-scene";
import { definePalette } from "@/lib/palette";
import { lerp, span } from "@/lib/scroll-progress";
import type { Stage3d, StageOptions, ThreeModule } from "@/ui/stage3d/stage3d";
import { toon } from "@/ui/stage3d/toon";
import { buildDieTiles } from "./die-tiles";
import type { Floorplan } from "./floorplan";

export const DESCENT_LAYERS = 5;

const colours = definePalette({ plastic: "--plastic", pad: "--pad", metal: "--metal" });

// Where the WROOM's can sits on the home model (esp32-scene.ts): the camera aims here.
const CAN = { x: 1.93 };
const PKG = { w: 0.7, h: 0.09, y: 0.08 };
const DIE_WIDTH = 2.4;

/** One keyframe per layer: what the camera looks at, from how far and which side. */
interface Shot {
  readonly at: readonly [number, number, number];
  readonly radius: number;
  readonly az: number;
  readonly el: number;
}
const SHOTS: readonly Shot[] = [
  { at: [0.1, -0.15, 0], radius: 10, az: 1.22, el: 0.74 },
  { at: [CAN.x, 0.25, 0], radius: 4.4, az: 1.0, el: 0.8 },
  { at: [CAN.x, 0.7, 0], radius: 5, az: 0.85, el: 0.62 },
  { at: [CAN.x, 0.15, 0], radius: 2.3, az: 0.9, el: 0.95 },
  { at: [CAN.x, 0.75, 0], radius: 4.8, az: 1.2, el: 1.1 },
];
// The width each shot was framed for: narrower canvases back the camera off.
const FRAMED_ASPECT = 1.6;

export const DESCENT_STAGE: Omit<StageOptions, "reduce"> = {
  target: { x: 0, y: 0, z: 0 },
  radius: 1,
  az: 0,
  el: 0.5,
  fov: 30,
  spin: false,
  zoom: [0.6, 1.5],
  dragOn: "canvas",
  ground: { w: 9.5, d: 4.6, y: -0.82 },
};

export interface DescentScene {
  /** Where the scene should be, 0 … 4, read every frame. */
  follow(position: () => number): void;
  /** The block tile under a canvas point (normalised device coordinates), once the die is up. */
  pick(x: number, y: number): string | null;
  lift(id: string | null): void;
}

export function buildDescentScene(T: ThreeModule, S: Stage3d, plan: Floorplan): DescentScene {
  const C = colours();
  // The home board, built as is. A stage has one frame callback, so ours (registered below)
  // replaces the board's and runs the board's animation (the LED, the radio waves) itself.
  const board = buildBoardScene(T, S);

  // The module's can lifts off and away, fading.
  const can = board.can;
  const canMaterials = materialsOf(can);
  canMaterials.forEach((m) => (m.transparent = true));

  // The QFN56: a body, 14 pads a side and a lid that opens in two halves, hinged at the sides.
  const pkg = new T.Group();
  pkg.position.set(CAN.x, PKG.y, 0);
  S.scene.add(pkg);
  const body = toon(T, C.plastic);
  const base = new T.Mesh(new T.BoxGeometry(PKG.w, PKG.h * 0.5, PKG.w), body);
  base.position.y = PKG.h * 0.25;
  pkg.add(base);
  const pad = toon(T, C.pad);
  const padGeo = new T.BoxGeometry(0.025, 0.02, 0.05);
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < 14; i++) {
      const m = new T.Mesh(padGeo, pad);
      const along = -PKG.w / 2 + 0.06 + (i * (PKG.w - 0.12)) / 13;
      const out = PKG.w / 2 + 0.01;
      m.position.set(side < 2 ? along : (side === 2 ? 1 : -1) * out, 0.01, side < 2 ? (side ? 1 : -1) * out : along);
      if (side >= 2) m.rotation.y = Math.PI / 2;
      m.userData.noOutline = true;
      pkg.add(m);
    }
  const lids = [-1, 1].map((dir) => {
    const hinge = new T.Group();
    hinge.position.set((dir * PKG.w) / 2, PKG.h * 0.5, 0);
    const lid = new T.Mesh(new T.BoxGeometry(PKG.w / 2, PKG.h * 0.5, PKG.w), body);
    lid.position.set((-dir * PKG.w) / 4, PKG.h * 0.25, 0);
    hinge.add(lid);
    pkg.add(hinge);
    return { hinge, dir };
  });

  // The die, inside the package: it grows and rises once the lid is open.
  const die = buildDieTiles(T, S, plan);
  S.scene.add(die.group);

  let target: () => number = () => 0;
  let pos = 0;
  let lifted: string | null = null;
  const look = new T.Vector3();
  const offset = new T.Vector3();
  const ray = new T.Raycaster();
  const device = new T.Vector2();
  const home = DESCENT_STAGE.target;

  S.onFrame((t, dt) => {
    board.frame(t);
    const goal = target();
    pos = S.reduce ? goal : pos + (goal - pos) * (1 - Math.exp(-dt * 7));
    if (Math.abs(goal - pos) < 1e-3) pos = goal;

    // Layer 2 → 3: the can lifts and slides off; it is gone by the time the package opens.
    const off = span(pos, 1, 2);
    can.position.set(CAN.x + off * 0.6, 0.24 + off * 2.2, -off * 1.6);
    can.rotation.z = off * 0.5;
    can.visible = off < 0.98;
    canMaterials.forEach((m) => (m.opacity = 1 - span(pos, 1.4, 1.95)));
    // Layer 3 → 4: the lid halves swing open.
    const open = span(pos, 2.1, 3);
    for (const { hinge, dir } of lids) hinge.rotation.z = -dir * open * 2.1;
    // Layer 4 → 5: the die rises, grows to a readable slab, and its tiles extrude.
    const up = span(pos, 3, 3.7);
    const size = lerp(PKG.w * 0.55, DIE_WIDTH, up);
    die.group.visible = open > 0.3;
    die.group.position.set(CAN.x, lerp(PKG.y + PKG.h * 0.55, 0.65, up), 0);
    die.group.scale.setScalar(size);
    die.setRise(span(pos, 3.5, 4));
    die.lift(pos > 3.5 ? lifted : null);

    // The camera: between the two keyframes around pos, plus whatever orbit and zoom the reader
    // added (read back from where the stage put its own camera).
    offset.set(S.camera.position.x - home.x, S.camera.position.y - home.y, S.camera.position.z - home.z);
    const r0 = offset.length() || 1;
    const dAz = Math.atan2(offset.z, offset.x) - (DESCENT_STAGE.az ?? 0);
    const dEl = Math.asin(Math.max(-1, Math.min(1, offset.y / r0))) - (DESCENT_STAGE.el ?? 0);
    const zoom = r0 / DESCENT_STAGE.radius;
    const i = Math.min(SHOTS.length - 2, Math.floor(pos));
    const k = pos - i;
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    if (!a || !b) return;
    const back = Math.max(1, FRAMED_ASPECT / S.camera.aspect);
    const radius = lerp(a.radius, b.radius, k) * zoom * back;
    const az = lerp(a.az, b.az, k) + dAz;
    const el = Math.min(1.45, Math.max(0.08, lerp(a.el, b.el, k) + dEl));
    look.set(lerp(a.at[0], b.at[0], k), lerp(a.at[1], b.at[1], k), lerp(a.at[2], b.at[2], k));
    S.camera.position.set(
      look.x + radius * Math.cos(el) * Math.cos(az),
      look.y + radius * Math.sin(el),
      look.z + radius * Math.cos(el) * Math.sin(az),
    );
    S.camera.lookAt(look);
  });

  return {
    follow(position) {
      target = position;
    },
    pick(x, y) {
      if (pos < 3.5) return null;
      ray.setFromCamera(device.set(x, y), S.camera);
      return die.pick(ray);
    },
    lift(id) {
      lifted = id;
    },
  };
}

function materialsOf(mesh: Three.Mesh): Three.Material[] {
  return [...new Set(Array.isArray(mesh.material) ? mesh.material : [mesh.material])];
}
