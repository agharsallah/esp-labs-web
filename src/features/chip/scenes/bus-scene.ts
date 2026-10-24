// One block on its bus: the CPU, one to four signal lines and the peripheral with its pads.
// Particles run along the lines at a speed that tells the block's relative rate (UART slower than
// SPI); with reduced motion they stand still, evenly spaced.
import type { BlockFamily } from "@/domain/chip";
import { definePalette } from "@/lib/palette";
import type { Stage3d, StageOptions, ThreeModule } from "@/ui/stage3d/stage3d";
import { toon } from "@/ui/stage3d/toon";
import { familyColours } from "./die-tiles";

const colours = definePalette({
  cpu: "--fam-system",
  board: "--pcb",
  copper: "--copper",
  pad: "--pad",
  spark: "--hotspot",
});

const FROM = -1.7; // the CPU's edge
const TO = 1.7; // the peripheral's edge
const PER_LINE = 5;

export const BUS_STAGE: Omit<StageOptions, "reduce"> = {
  target: { x: 0, y: 0.2, z: 0 },
  radius: 8,
  fitWidth: 6.6,
  az: 1.2,
  el: 0.8,
  fov: 30,
  spin: false,
  sway: 0.14,
  zoom: [0.6, 1.4],
  dragOn: "canvas",
  ground: { w: 7.5, d: 3.6, y: -0.06 },
};

export interface BusSpec {
  readonly family: BlockFamily;
  /** Relative speed, 0-1. */
  readonly rate: number;
  /** One to four signal line names. */
  readonly lines: readonly string[];
  readonly cpuLabel: string;
  readonly peripheralLabel: string;
}

export function buildBusScene(T: ThreeModule, S: Stage3d, spec: BusSpec): void {
  const C = colours();
  const fam = familyColours();
  const lines = spec.lines.slice(0, 4);
  const n = Math.max(1, lines.length);
  const pitch = 0.42;
  const z = (i: number) => (i - (n - 1) / 2) * pitch;

  const board = new T.Mesh(new T.BoxGeometry(6.4, 0.06, Math.max(2.2, n * pitch + 1)), toon(T, C.board));
  board.position.y = -0.03;
  S.scene.add(board);

  const box = (w: number, h: number, d: number, color: string, x: number) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), toon(T, color));
    m.position.set(x, h / 2, 0);
    S.scene.add(m);
    return m;
  };
  box(1.4, 0.5, 1.4, C.cpu, FROM - 0.7);
  box(1.2, 0.36, Math.max(1.1, n * pitch + 0.2), fam[spec.family], TO + 0.6);
  S.label(spec.cpuLabel, new T.Vector3(FROM - 0.7, 0.75, 0));
  S.label(spec.peripheralLabel, new T.Vector3(TO + 0.6, 0.6, 0));

  // The traces, a pad at the peripheral's far side for each, and the particles on them.
  const copper = toon(T, C.copper);
  const pad = toon(T, C.pad);
  const sparkMat = new T.MeshBasicMaterial({ color: new T.Color(C.spark) });
  const sparkGeo = new T.BoxGeometry(0.16, 0.06, 0.08);
  const sparks: { mesh: InstanceType<ThreeModule["Mesh"]>; phase: number }[] = [];
  for (let i = 0; i < n; i++) {
    const trace = new T.Mesh(new T.BoxGeometry(TO - FROM, 0.02, 0.07), copper);
    trace.position.set((FROM + TO) / 2, 0.01, z(i));
    trace.userData.noOutline = true;
    S.scene.add(trace);
    const p = new T.Mesh(new T.BoxGeometry(0.22, 0.03, 0.18), pad);
    p.position.set(TO + 1.4, 0.015, z(i));
    S.scene.add(p);
    const name = lines[i];
    if (name) S.label(name, new T.Vector3(FROM + 0.45, 0.12, z(i)), () => true, "chip-bus-line");
    for (let k = 0; k < PER_LINE; k++) {
      const mesh = new T.Mesh(sparkGeo, sparkMat);
      mesh.position.set(0, 0.05, z(i));
      mesh.userData.noOutline = true;
      S.scene.add(mesh);
      sparks.push({ mesh, phase: k / PER_LINE + i * 0.13 });
    }
  }

  const speed = 0.12 + Math.min(1, Math.max(0, spec.rate)) * 1.1; // trips per second
  S.onFrame((t) => {
    for (const s of sparks) {
      const k = S.reduce ? s.phase % 1 : (s.phase + t * speed) % 1;
      s.mesh.position.x = FROM + 0.1 + k * (TO - FROM - 0.2);
    }
  });
}
