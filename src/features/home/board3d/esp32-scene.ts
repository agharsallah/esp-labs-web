// The ESP32-S3 DevKitC-1 as an illustrated 3D model: board, WROOM module with its can and
// meander antenna, two USB-C ports, BOOT and RST, the RGB LED, the support chips and the 44
// header pins, with the silkscreen drawn from the same pin list as the pinout.
import type * as Three from "three";
import { HEADER, pinLabel } from "@/domain/board";
import { definePalette } from "@/lib/palette";
import type { Stage3d, ThreeModule } from "@/ui/stage3d/stage3d";
import { glowTexture, toon } from "@/ui/stage3d/toon";
import type { PartId } from "./parts";

const colours = definePalette({
  pcb: "--pcb",
  edge: "--pcb-edge",
  silk: "--silk",
  silkDim: "--silk-dim",
  pad: "--pad",
  copper: "--copper",
  gold: "--gold",
  metal: "--metal",
  metalDark: "--metal-dark",
  plastic: "--plastic",
  hotspot: "--hotspot",
  power: "--danger",
  white: "--card-white",
  mono: "--font-mono",
});

// 1 unit = 10 mm. The board is 69 × 25.4 mm; USB end at -x, antenna end at +x, top face at y = 0.
const L = 6.9;
const W = 2.54;
const H = 0.16;
const PITCH = 0.254;
const PIN0_X = 2.95; // the first header pin, at the module end
const ROW_Z = W / 2 - 0.13;
const pinX = (i: number) => PIN0_X - i * PITCH;

/** Where each callout's leader lands on the model. */
export const PART_ANCHORS: Record<PartId, readonly [number, number, number]> = {
  usb: [-3.3, 0.33, -0.6],
  buttons: [-2.78, 0.24, 0.86],
  rgb: [0.3, 0.12, 0.62],
  module: [1.6, 0.42, -0.2],
  antenna: [3.18, 0.1, 0.1],
  headers: [pinX(16), 0.06, ROW_Z],
};

export interface BoardScene {
  /** Glow one part (the callout you are on), or none. */
  highlight(part: PartId | null): void;
  /** The module's metal can, for scenes that take the board apart (the chip descent). */
  readonly can: Three.Mesh;
  /**
   * The board's own animation (the LED, the radio waves). The board registers it as the stage's
   * frame callback; a scene that registers its own afterwards calls it from there.
   */
  readonly frame: (t: number) => void;
}

type Toon = Three.MeshToonMaterial;

export function buildBoardScene(T: ThreeModule, S: Stage3d): BoardScene {
  const C = colours();
  const board = new T.Group();
  S.scene.add(board);
  const parts: Record<PartId, Toon[]> = {
    usb: [],
    buttons: [],
    rgb: [],
    module: [],
    antenna: [],
    headers: [],
  };
  /** A material that belongs to a part (so the part can glow on its own). */
  const mat = (
    part: PartId | null,
    color: string,
    extra: Three.MeshToonMaterialParameters = {},
  ) => {
    const m = toon(T, color, extra);
    if (part) parts[part].push(m);
    return m;
  };
  const mesh = (
    geo: Three.BufferGeometry,
    material: Three.Material | Three.Material[],
    x: number,
    y: number,
    z: number,
    outline = true,
  ) => {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.userData.noOutline = !outline;
    board.add(m);
    return m;
  };

  // The board: silkscreen on top, a lighter edge like the fibreglass core.
  const top = toon(T, C.white, { map: silkscreen(T, C) });
  const side = toon(T, C.edge);
  mesh(new T.BoxGeometry(L, H, W), [side, side, top, toon(T, C.pcb), side, side], 0, -H / 2, 0);

  // The WROOM-1 module: its own small board, the metal can, the antenna end.
  const modX0 = L / 2 - 2.55;
  mesh(new T.BoxGeometry(2.55, 0.08, 1.8), mat("antenna", C.pcb), modX0 + 1.275, 0.04, 0);
  const can = mat("module", C.metal);
  const canTop = mat("module", C.metal, { map: canLabel(T, C) });
  const canMesh = mesh(
    new T.BoxGeometry(1.9, 0.32, 1.66),
    [can, can, canTop, can, can, can],
    modX0 + 0.08 + 0.95,
    0.08 + 0.16,
    0,
  );
  // The meander antenna: copper runs across, joined at alternate ends.
  const trace = mat("antenna", C.gold);
  const runs = 8;
  for (let i = 0; i < runs; i++) {
    const z = -0.7 + (i * 1.4) / (runs - 1);
    mesh(new T.BoxGeometry(0.36, 0.012, 0.035), trace, 3.15, 0.086, z, false);
    if (i < runs - 1)
      mesh(
        new T.BoxGeometry(0.035, 0.012, 1.4 / (runs - 1)),
        trace,
        i % 2 ? 2.97 : 3.33,
        0.086,
        z + 0.7 / (runs - 1),
        false,
      );
  }

  // Two USB-C receptacles at the USB end: COM (the UART bridge) at the back, USB in front.
  const usbShape = roundedShape(T, 0.89, 0.32, 0.15);
  const usbGeo = new T.ExtrudeGeometry(usbShape, { depth: 0.73, bevelEnabled: false });
  usbGeo.rotateY(-Math.PI / 2);
  const shell = mat("usb", C.metal);
  const mouth = mat("usb", C.plastic);
  for (const z of [-0.6, 0.6]) {
    mesh(usbGeo, shell, -L / 2 + 0.65, 0.16, z);
    mesh(new T.BoxGeometry(0.02, 0.2, 0.7), mouth, -L / 2 - 0.085, 0.16, z, false);
  }

  // BOOT (back) and RST (front): tactile switches.
  for (const z of [-0.86, 0.86]) {
    mesh(new T.BoxGeometry(0.36, 0.12, 0.36), mat("buttons", C.metal), -2.78, 0.06, z);
    mesh(new T.CylinderGeometry(0.1, 0.1, 0.1, 20), mat("buttons", C.plastic), -2.78, 0.17, z);
  }

  // The RGB LED: a white 5050 package; its colour and glow are set every frame.
  const ledMat = mat("rgb", C.white, { emissive: new T.Color(C.hotspot), emissiveIntensity: 0.6 });
  mesh(new T.BoxGeometry(0.5, 0.1, 0.5), ledMat, 0.3, 0.05, 0.62);
  const glowMat = new T.SpriteMaterial({
    map: glowTexture(T),
    color: new T.Color(C.hotspot),
    blending: T.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const glow = new T.Sprite(glowMat);
  glow.position.set(0.3, 0.2, 0.62);
  glow.scale.setScalar(1.3);
  board.add(glow);

  // Support parts: the USB-UART bridge, the 3.3 V regulator, the power LED, a few passives.
  mesh(new T.BoxGeometry(0.42, 0.08, 0.42), toon(T, C.plastic), -2.0, 0.04, 0.25);
  mesh(new T.BoxGeometry(0.66, 0.16, 0.36), toon(T, C.plastic), -1.45, 0.08, -0.5);
  mesh(new T.BoxGeometry(0.32, 0.03, 0.18), toon(T, C.metal), -1.45, 0.015, -0.8, false);
  const powerLed = toon(T, C.power, { emissive: new T.Color(C.power), emissiveIntensity: 0.8 });
  mesh(new T.BoxGeometry(0.16, 0.06, 0.09), powerLed, -2.35, 0.03, -0.2, false);
  const passive = toon(T, C.metalDark);
  for (const [x, z, turn] of PASSIVES) {
    const m = mesh(new T.BoxGeometry(0.16, 0.06, 0.08), passive, x, 0.03, z, false);
    m.rotation.y = turn;
  }

  // The header pins point down into a breadboard; black spacers under the board hold them.
  const spacer = mat("headers", C.plastic);
  const pin = mat("headers", C.gold);
  const solder = mat("headers", C.metal);
  const pinGeo = new T.BoxGeometry(0.064, 0.86, 0.064);
  const jointGeo = new T.CylinderGeometry(0.03, 0.065, 0.06, 10);
  for (const z of [-ROW_Z, ROW_Z]) {
    const n = HEADER.L.length;
    mesh(new T.BoxGeometry(n * PITCH, 0.25, PITCH), spacer, pinX((n - 1) / 2), -H - 0.125, z);
    for (let i = 0; i < n; i++) {
      mesh(pinGeo, pin, pinX(i), -0.43 + 0.06, z, false);
      mesh(jointGeo, solder, pinX(i), 0.03, z, false);
    }
  }

  // Radio waves leave the antenna: half rings that grow and fade.
  const waves = Array.from({ length: 3 }, () => {
    const m = new T.MeshBasicMaterial({
      color: new T.Color(C.hotspot),
      transparent: true,
      opacity: 0,
      side: T.DoubleSide,
      depthWrite: false,
    });
    const ring = new T.Mesh(new T.RingGeometry(0.95, 1, 40, 1, 0, Math.PI), m);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(L / 2 + 0.05, 0.05, 0);
    board.add(ring);
    return { ring, m };
  });

  let lit: PartId | null = null;
  const hotspot = new T.Color(C.hotspot);
  const black = new T.Color(0);
  const led = new T.Color();

  const frame = (t: number) => {
    // The LED walks the colour wheel, like lesson 01's firmware; still when motion is down.
    led.setHSL(S.reduce ? 0.47 : (t * 0.08) % 1, 0.9, 0.55);
    ledMat.emissive.copy(led);
    glowMat.color.copy(led);
    glow.scale.setScalar(lit === "rgb" ? 1.9 : 1.3);
    waves.forEach(({ ring, m }, i) => {
      if (S.reduce) {
        m.opacity = lit === "antenna" ? 0.5 : 0;
        ring.scale.setScalar(1.2 + i * 0.5);
        return;
      }
      const k = (t * 0.35 + i / waves.length) % 1;
      ring.scale.setScalar(0.4 + k * 2.4);
      m.opacity = (1 - k) * (lit === "antenna" ? 0.85 : 0.35);
    });
    const pulse = S.reduce ? 0.35 : 0.25 + 0.15 * Math.sin(t * 5);
    for (const [part, list] of Object.entries(parts) as [PartId, Toon[]][]) {
      if (part === "rgb") continue;
      for (const m of list) {
        m.emissive.copy(part === lit ? hotspot : black);
        m.emissiveIntensity = part === lit ? pulse : 0;
      }
    }
  };
  S.onFrame(frame);

  return {
    highlight(part) {
      lit = part;
    },
    can: canMesh,
    frame,
  };
}

// Small parts scattered as on the real board: [x, z, rotation].
const PASSIVES: readonly (readonly [number, number, number])[] = [
  [-2.45, 0.3, 0],
  [-2.45, 0.5, 0],
  [-1.6, 0.35, Math.PI / 2],
  [-1.0, 0.2, 0],
  [-0.9, -0.45, Math.PI / 2],
  [-0.5, 0.55, 0],
  [-0.2, -0.3, 0],
  [0.55, -0.6, Math.PI / 2],
];

/** A rounded rectangle centred on the origin (the face of a USB-C receptacle). */
function roundedShape(T: ThreeModule, w: number, h: number, r: number): Three.Shape {
  const s = new T.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

type Colours = ReturnType<typeof colours>;

/** The board's top face: solder mask, traces, pads and silkscreen, drawn once into a canvas. */
function silkscreen(T: ThreeModule, C: Colours): Three.CanvasTexture {
  const k = 2048 / L; // pixels per unit
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round(W * k);
  const g = c.getContext("2d");
  const tex = new T.CanvasTexture(c);
  if (!g) return tex;
  const px = (x: number) => (x + L / 2) * k;
  const pz = (z: number) => (z + W / 2) * k;
  g.fillStyle = C.pcb;
  g.fillRect(0, 0, c.width, c.height);

  // Traces: a few buses from the USB end towards the module, with vias.
  g.strokeStyle = C.edge;
  g.lineWidth = 7;
  g.lineJoin = "round";
  for (const [z0, z1, bend] of TRACES) {
    g.beginPath();
    g.moveTo(px(-2.6), pz(z0));
    g.lineTo(px(bend), pz(z0));
    g.lineTo(px(bend + 0.4), pz(z1));
    g.lineTo(px(0.85), pz(z1));
    g.stroke();
    g.fillStyle = C.edge;
    g.beginPath();
    g.arc(px(bend + 0.4), pz(z1), 11, 0, Math.PI * 2);
    g.fill();
  }

  // Pads around every header pin, and their labels beside them.
  const font = C.mono || "monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const [side, z, labelZ] of [
    ["L", -ROW_Z, -ROW_Z + 0.2],
    ["R", ROW_Z, ROW_Z - 0.2],
  ] as const) {
    HEADER[side].forEach((name, i) => {
      g.fillStyle = C.pad;
      g.beginPath();
      g.arc(px(pinX(i)), pz(z), 0.085 * k, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = C.silk;
      g.font = `600 ${Math.round(0.07 * k)}px ${font}`;
      g.fillText(pinLabel(name).replace(/^(TX|RX) /, ""), px(pinX(i)), pz(labelZ));
    });
  }

  // Board markings.
  g.fillStyle = C.silk;
  g.font = `700 ${Math.round(0.17 * k)}px ${font}`;
  g.textAlign = "left";
  g.fillText("ESP32-S3-DevKitC-1", px(-1.9), pz(-0.12));
  g.font = `500 ${Math.round(0.1 * k)}px ${font}`;
  g.fillStyle = C.silkDim;
  g.fillText("N16R8 · v1.0", px(-1.9), pz(0.16));
  g.fillStyle = C.silk;
  g.font = `700 ${Math.round(0.09 * k)}px ${font}`;
  g.textAlign = "center";
  g.fillText("COM", px(-2.55), pz(-0.6));
  g.fillText("USB", px(-2.55), pz(0.6));
  g.fillText("BOOT", px(-2.78), pz(-0.56));
  g.fillText("RST", px(-2.78), pz(0.56));
  g.fillText("RGB", px(0.3), pz(0.25));
  g.strokeStyle = C.silk;
  g.lineWidth = 4;
  g.strokeRect(px(0.3) - 0.3 * k, pz(0.62) - 0.3 * k, 0.6 * k, 0.6 * k);
  return tex;
}

// [from z, to z, where the bend is]
const TRACES: readonly (readonly [number, number, number])[] = [
  [0.25, 0.05, -1.2],
  [0.35, 0.15, -1.0],
  [-0.15, -0.35, -0.9],
  [-0.25, -0.45, -0.6],
  [0.45, 0.35, -0.4],
];

/** The laser-etched top of the module's can. */
function canLabel(T: ThreeModule, C: Colours): Three.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 448;
  const g = c.getContext("2d");
  const tex = new T.CanvasTexture(c);
  if (!g) return tex;
  g.fillStyle = C.metal;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = C.metalDark;
  const font = C.mono || "monospace";
  g.textAlign = "center";
  g.font = `700 46px ${font}`;
  g.fillText("ESPRESSIF", 256, 150);
  g.font = `600 34px ${font}`;
  g.fillText("ESP32-S3-WROOM-1", 256, 220);
  g.font = `500 30px ${font}`;
  g.fillText("N16R8", 256, 278);
  g.strokeStyle = C.metalDark;
  g.lineWidth = 4;
  g.strokeRect(24, 24, 464, 400);
  return tex;
}
