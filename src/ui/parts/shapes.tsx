// The building blocks every part is drawn with: solids lit from the top-left (light top, base
// colour on the left face, shaded right face), wires with an ink casing, slabs (a flat shape
// given thickness), glows and a ground shadow. Colours are tokens only, mixed for the tones.
import type { CSSProperties } from "react";
import type { BoxFaces, CylinderFaces } from "./iso";
import styles from "./parts.module.css";

const HUES = {
  metal: "--metal",
  steel: "--metal-dark",
  gold: "--gold",
  copper: "--copper",
  pcb: "--pcb",
  edge: "--pcb-edge",
  plastic: "--plastic",
  white: "--card-white",
  silk: "--silk",
  glass: "--part-glass",
  screen: "--part-screen",
  red: "--part-red",
  green: "--part-green",
  blue: "--part-blue",
  sky: "--part-sky",
  yellow: "--part-yellow",
  orange: "--part-orange",
  purple: "--part-purple",
  pink: "--part-pink",
  teal: "--part-teal",
  reader: "--rc522",
  "fam-system": "--fam-system",
  "fam-memory": "--fam-memory",
  "fam-security": "--fam-security",
  "fam-connectivity": "--fam-connectivity",
  "fam-timing": "--fam-timing",
  "fam-analog": "--fam-analog",
  "fam-radio": "--fam-radio",
} as const;

export type Hue = keyof typeof HUES;
export type Tone = "lit" | "mid" | "shade" | "deep";

/** A hue at one of four tones, as a CSS colour built from tokens. */
export function tone(hue: Hue, t: Tone = "mid"): string {
  const c = `var(${HUES[hue]})`;
  if (t === "lit") return `color-mix(in oklab, ${c} 74%, var(--part-light))`;
  if (t === "shade") return `color-mix(in oklab, ${c} 70%, var(--model-ink))`;
  if (t === "deep") return `color-mix(in oklab, ${c} 45%, var(--model-ink))`;
  return c;
}

const fill = (hue: Hue, t: Tone): CSSProperties => ({ fill: tone(hue, t) });

/** One filled, outlined face. */
export function Face({
  d,
  hue,
  t = "mid",
  ink = true,
}: {
  d: string;
  hue: Hue;
  t?: Tone;
  ink?: boolean;
}) {
  return <path d={d} style={fill(hue, t)} className={ink ? styles.ink : undefined} />;
}

/** A box: lit top, base-colour left face, shaded right face. */
export function Solid({ b, hue, top }: { b: BoxFaces; hue: Hue; top?: Hue }) {
  return (
    <>
      <Face d={b.left} hue={hue} />
      <Face d={b.right} hue={hue} t="shade" />
      <Face d={b.top} hue={top ?? hue} t="lit" />
    </>
  );
}

/** An upright cylinder. */
export function Cyl({ c, hue, top }: { c: CylinderFaces; hue: Hue; top?: Hue }) {
  return (
    <>
      <Face d={c.side} hue={hue} />
      <Face d={c.top} hue={top ?? hue} t="lit" />
    </>
  );
}

/** A wire, leg or trace: a coloured stroke inside an ink casing. */
export function Wire({ d, hue, w = 2 }: { d: string; hue: Hue; w?: number }) {
  return (
    <>
      <path d={d} className={styles.casing} style={{ strokeWidth: w + 1.6 }} />
      <path d={d} className={styles.wire} style={{ stroke: tone(hue, "lit"), strokeWidth: w }} />
    </>
  );
}

/** A thin coloured stroke with no casing: waves, field lines, screen graphics. */
export function Stroke({
  d,
  hue,
  w = 1.6,
  t = "mid",
  dash,
}: {
  d: string;
  hue: Hue;
  w?: number;
  t?: Tone;
  /** Dash pattern, e.g. "2 2", for fields and paths of travel. */
  dash?: string;
}) {
  return (
    <path
      d={d}
      className={styles.wire}
      style={{ stroke: tone(hue, t), strokeWidth: w, strokeDasharray: dash }}
    />
  );
}

/**
 * A flat 2D shape given thickness, like a die-cut sticker: the shape repeated downwards in the
 * shaded tone for its edge, then the shape itself on top.
 */
export function Slab({
  d,
  hue,
  depth = 3,
  t = "mid",
}: {
  d: string;
  hue: Hue;
  depth?: number;
  t?: Tone;
}) {
  const steps = Array.from({ length: Math.max(1, Math.round(depth * 2)) }, (_, i) => (i + 1) / 2);
  return (
    <>
      {steps.map((dy, i) => (
        <path
          key={dy}
          d={d}
          transform={`translate(0 ${dy})`}
          style={fill(hue, "shade")}
          className={i === steps.length - 1 ? styles.ink : undefined}
        />
      ))}
      <path d={d} style={fill(hue, t)} className={styles.ink} />
    </>
  );
}

/** A soft light around a point (LEDs, screens). */
export function Glow({ x, y, r, hue }: { x: number; y: number; r: number; hue: Hue }) {
  return (
    <g className={styles.glow} style={{ fill: tone(hue, "lit") }}>
      <circle cx={x} cy={y} r={r} opacity={0.2} />
      <circle cx={x} cy={y} r={r * 0.62} opacity={0.32} />
      <circle cx={x} cy={y} r={r * 0.3} opacity={0.5} />
    </g>
  );
}

/** The contact shadow under a part. */
export function Shadow({ rx = 22, y = 50 }: { rx?: number; y?: number }) {
  return <ellipse cx={32} cy={y} rx={rx} ry={rx * 0.32} className={styles.shadow} />;
}
