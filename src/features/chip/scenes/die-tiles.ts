// The die's block tiles as 3D boxes on a silicon slab, shared by the descent and the standalone
// die. One unit wide, centred on its group's origin, the slab's top at y = 0. Tiles extrude to
// their coverage height as `rise` goes 0 → 1; one tile can be lifted and lit.
import type * as Three from "three";
import type { BlockFamily } from "@/domain/chip";
import { definePalette } from "@/lib/palette";
import type { Stage3d, ThreeModule } from "@/ui/stage3d/stage3d";
import { toon } from "@/ui/stage3d/toon";
import { type Floorplan, slabSize } from "./floorplan";

export const familyColours = definePalette({
  system: "--fam-system",
  memory: "--fam-memory",
  security: "--fam-security",
  connectivity: "--fam-connectivity",
  timing: "--fam-timing",
  analog: "--fam-analog",
  radio: "--fam-radio",
} satisfies Record<BlockFamily, `--${string}`>);

const dieColours = definePalette({ silicon: "--metal-dark", hotspot: "--hotspot" });

const GAP = 0.18; // of a cell
/** The tallest tile (coverage "done"), in slab widths. */
export const MAX_H = 0.3;
// Flat tiles keep a visible thickness and float a hair above the slab: a face level with the
// slab's top flickers (z-fighting).
const MIN_H = 0.03;
const LIFT = 0.004;

export interface DieTiles {
  readonly group: Three.Group;
  /** 0: flat on the slab; 1: every tile at its coverage height. */
  setRise(rise: number): void;
  /** Lift and light one tile, or none. */
  lift(id: string | null): void;
  /** The tile under a ray, if any. */
  pick(ray: Three.Raycaster): string | null;
}

export function buildDieTiles(T: ThreeModule, S: Stage3d, plan: Floorplan): DieTiles {
  const fam = familyColours();
  const C = dieColours();
  const group = new T.Group();
  const cell = 1 / plan.cols;
  const depth = cell * plan.rows;
  const rim = slabSize(plan);
  // Pushed back in depth, so the tiles standing on it always win the depth test.
  const slab = new T.Mesh(
    new T.BoxGeometry(rim.w, 0.04, rim.d),
    toon(T, C.silicon, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  );
  slab.position.y = -0.02;
  group.add(slab);

  const hotspot = new T.Color(C.hotspot);
  const black = new T.Color(0);
  const unit = new T.BoxGeometry(1, 1, 1);
  unit.translate(0, 0.5, 0);
  const tiles = plan.tiles.map((tile) => {
    const material = toon(T, fam[tile.family], { emissive: new T.Color(0), emissiveIntensity: 0 });
    const mesh = new T.Mesh(unit, material);
    const size = cell * (1 - GAP);
    mesh.scale.set(size, MIN_H, size);
    mesh.position.set(
      -0.5 + cell * (tile.col + 0.5),
      LIFT,
      -depth / 2 + cell * (tile.row + 0.5),
    );
    mesh.userData.blockId = tile.id;
    group.add(mesh);
    return { tile, mesh, material, y: 0 };
  });

  let rise = 0;
  let lifted: string | null = null;
  for (const t of tiles) {
    const at = new T.Vector3();
    S.label(
      t.tile.name,
      () => t.mesh.getWorldPosition(at).setY(at.y + t.mesh.scale.y * group.scale.y + 0.05),
      () => lifted === t.tile.id,
      "chip-tile-label",
    );
  }

  const apply = () => {
    for (const t of tiles) {
      const on = t.tile.id === lifted;
      // MIN_H is a floor the rise adds to: a tile no lab uses keeps its thickness, never zero.
      t.mesh.scale.y = MIN_H + MAX_H * t.tile.height * rise + (on ? 0.04 : 0);
      t.mesh.position.y = LIFT + (on ? 0.03 : 0);
      t.material.emissive.copy(on ? hotspot : black);
      t.material.emissiveIntensity = on ? 0.35 : 0;
    }
  };
  apply();

  return {
    group,
    setRise(next) {
      if (Math.abs(next - rise) < 1e-4) return;
      rise = next;
      apply();
    },
    lift(id) {
      if (id === lifted) return;
      lifted = id;
      apply();
    },
    pick(ray) {
      const hit = ray.intersectObjects(tiles.map((t) => t.mesh), false)[0];
      const id: unknown = hit?.object.userData.blockId;
      return typeof id === "string" ? id : null;
    },
  };
}
