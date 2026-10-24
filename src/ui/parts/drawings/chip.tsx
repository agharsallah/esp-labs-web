// The chip's blocks: one icon per hardware block of the ESP32-S3. Every icon stands on the same
// small chip slab; a band in the block's family colour runs along its front face and carries the
// family's mark (so the colour is never the only cue), and the block's own metaphor sits on top.
import type { ReactNode } from "react";
import { arc, box, cylinder, disc, line, LEFT_FACE, poly, project, ring, type P3 } from "../iso";
import { Cyl, Face, Glow, type Hue, Shadow, Slab, Solid, Stroke, Wire } from "../shapes";
import { Waves } from "./radio";

type Family = "system" | "memory" | "security" | "connectivity" | "timing" | "analog" | "radio";

const S = 12; // half the slab's side
const Z = 5; // the slab's top, where every metaphor stands
const PINS = [-8, -3, 2, 7];

/** A point on the slab's front face: x across, z up. */
const front = (x: number, z: number): P3 => [x, S, z];

/** The family's mark, drawn small on the left end of the band. */
function Mark({ family }: { family: Family }) {
  const w = { hue: "white", t: "lit", w: 1 } as const;
  switch (family) {
    case "system":
      return (
        <Face d={poly(front(-9.6, 1.6), front(-7, 1.6), front(-7, 3.6), front(-9.6, 3.6))} hue="white" t="lit" ink={false} />
      );
    case "memory":
      return (
        <>
          {[-10, -8.4, -6.8].map((x) => (
            <Stroke key={x} d={line(front(x, 1.5), front(x, 3.7))} {...w} />
          ))}
        </>
      );
    case "security":
      return (
        <Face
          d={poly(front(-8.4, 1.3), front(-7, 2.6), front(-8.4, 3.9), front(-9.8, 2.6))}
          hue="white"
          t="lit"
          ink={false}
        />
      );
    case "connectivity":
      return (
        <>
          <Stroke d={line(front(-10, 2.6), front(-6.4, 2.6))} {...w} />
          <Face d={ring(front(-10, 2.6), LEFT_FACE.u, LEFT_FACE.v, 0.8)} hue="white" t="lit" ink={false} />
          <Face d={ring(front(-6.4, 2.6), LEFT_FACE.u, LEFT_FACE.v, 0.8)} hue="white" t="lit" ink={false} />
        </>
      );
    case "timing":
      return <Stroke d={ring(front(-8.2, 2.6), LEFT_FACE.u, LEFT_FACE.v, 1.2, 16)} {...w} />;
    case "analog": {
      const pts: P3[] = [];
      for (let i = 0; i <= 8; i++) pts.push(front(-10.4 + i * 0.5, 2.6 + Math.sin(i * 0.8) * 1));
      return <Stroke d={line(...pts)} {...w} />;
    }
    case "radio":
      return (
        <>
          {[-10, -8].map((x) => (
            <Stroke key={x} d={line(front(x, 1.4), front(x + 1.3, 2.6), front(x, 3.8))} {...w} />
          ))}
        </>
      );
  }
}

/** The shared base: a dark package with pins, the family band and mark, and the metaphor on top. */
function Chip({ family, children }: { family: Family; children: ReactNode }) {
  const hue: Hue = `fam-${family}`;
  return (
    <>
      <Shadow rx={24} y={49} />
      <Solid b={box(-S, -S, 0, 2 * S, 2 * S, Z)} hue="plastic" />
      <Face d={poly(front(-S, 1), front(S, 1), front(S, 4), front(-S, 4))} hue={hue} />
      <Mark family={family} />
      {PINS.map((p) => (
        <Stroke key={`l${p}`} d={line([p, S, 0.5], [p, S + 2, 0.5], [p, S + 2, -1.5])} hue="metal" w={1.2} t="lit" />
      ))}
      {PINS.map((p) => (
        <Stroke key={`r${p}`} d={line([S, p, 0.5], [S + 2, p, 0.5], [S + 2, p, -1.5])} hue="metal" w={1.2} t="lit" />
      ))}
      {children}
    </>
  );
}

/** A square wave along x in the plane y, between z0 and z1: `edges` are the x of each toggle. */
function square(x0: number, x1: number, y: number, z0: number, z1: number, edges: number[]): P3[] {
  const pts: P3[] = [[x0, y, z0]];
  let high = false;
  for (const e of edges) {
    const z = high ? z1 : z0;
    pts.push([e, y, z], [e, y, high ? z0 : z1]);
    high = !high;
  }
  pts.push([x1, y, high ? z1 : z0]);
  return pts;
}

/** A crescent moon, in viewBox units, around (x, y). */
const moon = (x: number, y: number, r: number) =>
  `M${x} ${y - r}a${r} ${r} 0 1 0 ${r * 0.9} ${r * 1.5}a${r * 0.75} ${r * 0.75} 0 1 1 ${-r * 0.9} ${-r * 1.5}z`;

// System

export function BlkCpu() {
  return (
    <Chip family="system">
      {[-8, 1].map((x) => (
        <g key={x}>
          <Solid b={box(x, -6, Z, 7, 12, 4)} hue="metal" />
          <Face d={poly([x + 1.5, -4, Z + 4], [x + 5.5, -4, Z + 4], [x + 5.5, 4, Z + 4], [x + 1.5, 4, Z + 4])} hue="steel" ink={false} />
        </g>
      ))}
    </Chip>
  );
}

export function BlkUlp() {
  return (
    <Chip family="system">
      <Solid b={box(-5, -2, Z, 7, 7, 3)} hue="metal" />
      <Slab d={moon(42, 13, 6)} hue="yellow" depth={1.5} />
    </Chip>
  );
}

export function BlkGdma() {
  return (
    <Chip family="system">
      <Solid b={box(-10, -4, Z, 5, 8, 5)} hue="white" />
      <Solid b={box(5, -4, Z, 5, 8, 5)} hue="white" />
      <Wire d={line([-4, 0, Z + 3], [3.5, 0, Z + 3])} hue="copper" w={1.8} />
      <Stroke d={line([1, -2.5, Z + 3], [3.8, 0, Z + 3], [1, 2.5, Z + 3])} hue="copper" w={1.8} t="lit" />
    </Chip>
  );
}

export function BlkGpio() {
  const n = [-6, 0, 6];
  return (
    <Chip family="system">
      {n.map((y) => (
        <Wire key={`x${y}`} d={line([-9, y, Z + 0.6], [9, y, Z + 0.6])} hue="gold" w={1.2} />
      ))}
      {n.map((x) => (
        <Wire key={`y${x}`} d={line([x, -9, Z + 1.2], [x, 9, Z + 1.2])} hue="copper" w={1.2} />
      ))}
      {(
        [
          [-6, -6],
          [0, 6],
          [6, 0],
        ] as const
      ).map(([x, y]) => (
        <Face key={`${x}${y}`} d={disc(x, y, Z + 1.2, 1.6)} hue="green" t="lit" />
      ))}
    </Chip>
  );
}

function ClockFace({ r, h, hue = "white" }: { r: number; h: number; hue?: Hue }) {
  const top = Z + h;
  return (
    <>
      <Cyl c={cylinder(0, 0, Z, r, h)} hue={hue} />
      <Stroke d={line([0, 0, top], [0, -r * 0.65, top])} hue="plastic" w={1.4} />
      <Stroke d={line([0, 0, top], [r * 0.45, 0, top])} hue="plastic" w={1.4} />
    </>
  );
}

export function BlkRtc() {
  return (
    <Chip family="system">
      <ClockFace r={7} h={3} />
      <Slab d={moon(45, 12, 5)} hue="yellow" depth={1.5} />
    </Chip>
  );
}

// Memory

export function BlkSram() {
  const cells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      cells.push(
        <Solid key={`${r}${c}`} b={box(-9 + c * 6.4, -9 + r * 6.4, Z, 4.6, 4.6, 2.5)} hue="purple" />,
      );
  return <Chip family="memory">{cells}</Chip>;
}

export function BlkRom() {
  const shackle: P3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI - (i / 10) * Math.PI;
    shackle.push([3.6 * Math.cos(a), 0, Z + 9 + 4.5 * Math.sin(a)]);
  }
  return (
    <Chip family="memory">
      <Solid b={box(-9, -9, Z, 18, 18, 1.5)} hue="white" />
      <Wire d={line([-3.6, 0, Z + 7], ...shackle, [3.6, 0, Z + 7])} hue="metal" w={2} />
      <Solid b={box(-5, -2.5, Z + 1.5, 10, 5, 8)} hue="gold" />
      <Face d={ring([0, 2.5, Z + 5.5], LEFT_FACE.u, LEFT_FACE.v, 1.2)} hue="plastic" t="deep" />
    </Chip>
  );
}

export function BlkFlash() {
  return (
    <Chip family="memory">
      {[0, 1, 2, 3].map((i) => (
        <Solid key={i} b={box(-8 + i, -8 + i, Z + i * 2.6, 16 - 2 * i, 16 - 2 * i, 2.6)} hue={i % 2 ? "white" : "purple"} />
      ))}
    </Chip>
  );
}

export function BlkCache() {
  return (
    <Chip family="memory">
      {[0, 1, 2].map((i) => (
        <Solid key={i} b={box(-1, -4, Z + i * 2.8, 8, 8, 2.8)} hue={i % 2 ? "white" : "purple"} />
      ))}
      {[-2, 1, 4].map((z) => (
        <Stroke key={z} d={line([-10, 0, Z + 3 + z], [-4, 0, Z + 3 + z])} hue="sky" w={1.4} t="lit" />
      ))}
    </Chip>
  );
}

export function BlkEfuse() {
  const zig: P3[] = [];
  for (let i = 0; i <= 8; i++) zig.push([-5 + i * 1.25, 3, Z + 3.5 + (i % 2 ? 1.2 : -1.2)]);
  return (
    <Chip family="memory">
      <Solid b={box(-6, -3, Z + 1, 12, 6, 6)} hue="glass" />
      <Stroke d={line(...zig)} hue="orange" w={1.2} t="lit" />
      <Solid b={box(-10, -3.4, Z, 4, 6.8, 7.5)} hue="metal" />
      <Solid b={box(6, -3.4, Z, 4, 6.8, 7.5)} hue="metal" />
    </Chip>
  );
}

// Security

export function BlkCrypto() {
  const shackle: P3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI - (i / 10) * Math.PI;
    shackle.push([-4 + 3.4 * Math.cos(a), -2, Z + 8 + 4.2 * Math.sin(a)]);
  }
  return (
    <Chip family="security">
      <Wire d={line([-7.4, -2, Z + 6], ...shackle, [-0.6, -2, Z + 6])} hue="metal" w={2} />
      <Solid b={box(-9, -5, Z, 10, 6, 8)} hue="gold" />
      <Face d={ring([-4, 1, Z + 4.5], LEFT_FACE.u, LEFT_FACE.v, 1.2)} hue="plastic" t="deep" />
      <Stroke d={disc(6, 3, Z + 0.6, 2.4)} hue="gold" w={1.8} t="lit" />
      <Wire d={line([6, 0.6, Z + 0.6], [6, -8, Z + 0.6], [8, -8, Z + 0.6])} hue="gold" w={1.4} />
    </Chip>
  );
}

function Die({ x, y, s, pips }: { x: number; y: number; s: number; pips: readonly (readonly [number, number])[] }) {
  return (
    <>
      <Solid b={box(x, y, Z, s, s, s)} hue="white" />
      {pips.map(([u, v]) => (
        <Face key={`${u}${v}`} d={disc(x + u * s, y + v * s, Z + s, s * 0.11)} hue="red" ink={false} />
      ))}
    </>
  );
}

export function BlkRng() {
  return (
    <Chip family="security">
      <Die x={-9} y={-8} s={7} pips={[[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]]} />
      <Die x={1} y={0} s={7} pips={[[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]]} />
    </Chip>
  );
}

// Connectivity

export function BlkUart() {
  const fifo = (y: number) =>
    [0, 1, 2].map((i) => <Solid key={`${y}${i}`} b={box(-9, y, Z + i * 2.2, 6, 6, 2.2)} hue={i % 2 ? "white" : "sky"} />);
  return (
    <Chip family="connectivity">
      {fifo(-8)}
      {fifo(1)}
      <Wire d={line(...square(-1, 10, 0, Z + 4, Z + 7, [1, 3, 4.5, 7.5]))} hue="yellow" w={1.3} />
    </Chip>
  );
}

export function BlkI2c() {
  return (
    <Chip family="connectivity">
      <Wire d={line(...square(-10, 10, -3, Z + 1, Z + 5, [-2, 2]))} hue="yellow" w={1.5} />
      <Wire d={line([-10, 4, Z + 1], [10, 4, Z + 1])} hue="sky" w={1.5} />
    </Chip>
  );
}

export function BlkI2s() {
  const wave: P3[] = [];
  for (let i = 0; i <= 14; i++) wave.push([-10 + i, -4, Z + 5 + 3 * Math.sin(i * 0.9)]);
  return (
    <Chip family="connectivity">
      <Stroke d={line(...wave)} hue="sky" w={1.6} t="lit" />
      <Solid b={box(3, -1, Z, 7, 7, 9)} hue="white" />
      <Face d={ring([6.5, 6, Z + 4.5], LEFT_FACE.u, LEFT_FACE.v, 2.6)} hue="plastic" />
      <Face d={ring([6.5, 6, Z + 4.5], LEFT_FACE.u, LEFT_FACE.v, 1)} hue="steel" ink={false} />
    </Chip>
  );
}

const SPI: readonly Hue[] = ["yellow", "sky", "green", "pink"];

export function BlkSpi() {
  return (
    <Chip family="connectivity">
      {SPI.map((hue, i) => (
        <Wire key={hue} d={line([-10, -7.5 + i * 5, Z + 1], [10, -7.5 + i * 5, Z + 1])} hue={hue} w={1.5} />
      ))}
    </Chip>
  );
}

export function BlkLcdCam() {
  return (
    <Chip family="connectivity">
      <Solid b={box(-10, -8, Z, 12, 2, 10)} hue="plastic" />
      <Face d={poly([-9, -6, Z + 1], [1, -6, Z + 1], [1, -6, Z + 9], [-9, -6, Z + 9])} hue="screen" t="lit" />
      <Solid b={box(3, 1, Z, 7, 7, 4)} hue="steel" />
      <Face d={ring([6.5, 8, Z + 2], LEFT_FACE.u, LEFT_FACE.v, 1.7)} hue="glass" />
    </Chip>
  );
}

export function BlkTwai() {
  const a: P3[] = [];
  const b: P3[] = [];
  for (let i = 0; i <= 20; i++) {
    const x = -10 + i;
    a.push([x, 0, Z + 3 + 2 * Math.sin(i * 0.8)]);
    b.push([x, 0, Z + 3 - 2 * Math.sin(i * 0.8)]);
  }
  return (
    <Chip family="connectivity">
      <Wire d={line(...a)} hue="yellow" w={1.4} />
      <Wire d={line(...b)} hue="green" w={1.4} />
    </Chip>
  );
}

function Plug({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Solid b={box(x, y, Z, 7, 5, 4)} hue="metal" />
      <Face d={poly([x + 1.5, y + 5, Z + 1.5], [x + 5.5, y + 5, Z + 1.5], [x + 5.5, y + 5, Z + 2.8], [x + 1.5, y + 5, Z + 2.8])} hue="plastic" ink={false} />
      <Solid b={box(x, y - 8, Z, 7, 8, 4)} hue="plastic" />
    </>
  );
}

export function BlkUsbOtg() {
  return (
    <Chip family="connectivity">
      <Wire d={line([-0.5, -9, Z + 2], [-0.5, -12, Z + 2])} hue="steel" w={2} />
      <Plug x={-4} y={1} />
    </Chip>
  );
}

export function BlkUsbSerialJtag() {
  return (
    <Chip family="connectivity">
      <Plug x={-10} y={3} />
      <Solid b={box(1, -6, Z, 9, 2, 10)} hue="plastic" />
      <Stroke d={line([2.5, -4, Z + 7.5], [4.5, -4, Z + 6], [2.5, -4, Z + 4.5])} hue="green" w={1.3} t="lit" />
      <Stroke d={line([5.5, -4, Z + 3.5], [8.5, -4, Z + 3.5])} hue="green" w={1.3} t="lit" />
    </Chip>
  );
}

export function BlkSdmmc() {
  const z = Z + 1.4;
  return (
    <Chip family="connectivity">
      <Solid b={box(-6, -9, Z, 12, 18, 1.4)} hue="blue" />
      <Face d={poly([-6, -9, z], [2, -9, z], [-6, -5, z])} hue="plastic" />
      {[-4, -1.5, 1, 3.5].map((x) => (
        <Face key={x} d={poly([x, -6, z], [x + 1.6, -6, z], [x + 1.6, -3, z], [x, -3, z])} hue="gold" t="lit" ink={false} />
      ))}
      <Face d={poly([-4, 2, z], [4, 2, z], [4, 7, z], [-4, 7, z])} hue="white" t="lit" ink={false} />
    </Chip>
  );
}

// Timing

export function BlkTimers() {
  const [bx, by] = project([0, 0, Z + 3]);
  return (
    <Chip family="timing">
      <Cyl c={cylinder(0, 0, Z + 3, 1.3, 2.5)} hue="steel" />
      <Cyl c={cylinder(-6, -6, Z, 1.6, 4.5)} hue="steel" />
      <ClockFace r={7.5} h={3} />
      <Face d={`M${bx} ${by}l0 -6.5a10 5 0 0 1 9 3z`} hue="orange" t="lit" ink={false} />
      <Stroke d={line([0, 0, Z + 3], [0, -7.5 * 0.65, Z + 3])} hue="plastic" w={1.4} />
    </Chip>
  );
}

export function BlkWdt() {
  const z = Z + 1.2;
  return (
    <Chip family="timing">
      <Face d={poly([-9, -9, Z], [9, -9, Z], [9, 4, Z], [4, 9, Z], [-9, 9, Z])} hue="white" t="shade" />
      <Face d={poly([-9, -9, z], [9, -9, z], [9, 4, z], [4, 9, z], [-9, 9, z])} hue="white" t="lit" />
      <Face d={poly([9, 4, z], [4, 4, z + 0.4], [4, 9, z])} hue="white" t="shade" />
      <Stroke d={disc(-1, -1, z, 5)} hue="orange" w={1.4} />
      <Stroke d={line([-1, -1, z], [-1, -5, z])} hue="plastic" w={1.4} />
      <Stroke d={line([-1, -1, z], [2, -1, z])} hue="plastic" w={1.4} />
    </Chip>
  );
}

export function BlkLedc() {
  const [lx, ly] = project([6, 2, Z + 9]);
  return (
    <Chip family="timing">
      <Wire d={line(...square(-11, 1, -4, Z + 1, Z + 6, [-9, -7, -4, -2, 1]))} hue="orange" w={1.3} />
      <Cyl c={cylinder(6, 2, Z, 3, 6)} hue="red" />
      <Glow x={lx} y={ly} r={9} hue="red" />
    </Chip>
  );
}

export function BlkMcpwm() {
  const [sx, sy] = project([3, 2, Z + 7]);
  return (
    <Chip family="timing">
      <Solid b={box(-10, -8, Z, 4, 4, 4)} hue="steel" />
      <Solid b={box(-10, -2, Z, 4, 4, 4)} hue="steel" />
      <Cyl c={cylinder(3, 2, Z, 6, 7)} hue="metal" />
      <Face d={disc(3, 2, Z + 7, 3)} hue="steel" t="shade" />
      <Wire d={`M${sx} ${sy}l0 -5`} hue="metal" w={1.6} />
      <Stroke d={arc(sx, sy - 2, 5, 30, 150)} hue="orange" w={1.3} t="lit" />
    </Chip>
  );
}

export function BlkRmt() {
  return (
    <Chip family="timing">
      <Wire d={line(...square(-11, 11, 0, Z + 2, Z + 7, [-8, -7, -5, -1, 0, 2, 3, 7]))} hue="orange" w={1.6} />
    </Chip>
  );
}

export function BlkPcnt() {
  const z = Z + 2;
  return (
    <Chip family="timing">
      <Solid b={box(-9, -7, Z, 18, 14, 2)} hue="white" />
      {[-6, -3.5, -1, 1.5].map((x) => (
        <Stroke key={x} d={line([x, -4, z], [x, 4, z])} hue="plastic" w={1.4} />
      ))}
      <Stroke d={line([-7.5, 3, z], [3, -3, z])} hue="orange" w={1.4} />
      <Stroke d={line([5, -4, z], [5, 4, z])} hue="plastic" w={1.4} />
    </Chip>
  );
}

// Analog

export function BlkAdc() {
  return (
    <Chip family="analog">
      {[0, 1, 2, 3].map((i) => (
        <Solid key={i} b={box(-10 + i * 5, -4, Z, 5, 8, 2.5 + i * 2.5)} hue="teal" />
      ))}
    </Chip>
  );
}

export function BlkTouch() {
  return (
    <Chip family="analog">
      <Stroke d={disc(0, 0, Z, 9)} hue="teal" w={1.2} t="lit" dash="2 2" />
      <Cyl c={cylinder(0, 0, Z, 6, 1)} hue="copper" />
      <Slab d="M28 13a5 6 0 0 1 10 0v11a5 3 0 0 1-10 0z" hue="pink" depth={2} />
    </Chip>
  );
}

export function BlkTempSensor() {
  const [tx, ty] = project([0, 0, Z + 18]);
  return (
    <Chip family="analog">
      <Wire d={line([0, 0, Z + 4], [0, 0, Z + 18])} hue="white" w={3.4} />
      <Stroke d={line([0, 0, Z + 4], [0, 0, Z + 12])} hue="red" w={1.6} />
      <Cyl c={cylinder(0, 0, Z, 3, 4)} hue="red" />
      <Stroke d={`M${tx + 3} ${ty + 3}h2M${tx + 3} ${ty + 6}h2M${tx + 3} ${ty + 9}h2`} hue="white" w={1} t="lit" />
    </Chip>
  );
}

// Radio

/** The plane that faces the viewer, for the badge that stands on the BLE chip. */
const FACING: P3 = [Math.SQRT1_2, -Math.SQRT1_2, 0];

export function BlkWifi() {
  const [x, y] = project([0, 0, Z + 6]);
  return (
    <Chip family="radio">
      <Cyl c={cylinder(0, 0, Z, 2, 6)} hue="plastic" />
      <Waves x={x} y={y} hue="sky" />
    </Chip>
  );
}

export function BlkBle() {
  const [x, y] = project([0, 0, Z + 12]);
  return (
    <Chip family="radio">
      <Wire d={line([0, 0, Z], [0, 0, Z + 4])} hue="steel" w={1.4} />
      <Face d={ring([0, 0, Z + 12], FACING, [0, 0, 1], 8)} hue="blue" />
      <Stroke d={`M${x - 3} ${y - 2.5}l6 5-3 3v-11l3 3-6 5`} hue="white" w={1.6} t="lit" />
    </Chip>
  );
}
