import { charsIn, clamp, textWidth, wrapLabel } from "./geometry/text-fit";
import styles from "./charts.module.css";

const LINE = 10.5;

/** Width of a bar chart's label column: the longest label, between `min` and `max`. */
export function labelColumn(labels: readonly string[], min = 96, max = 150): number {
  return Math.ceil(clamp(Math.max(0, ...labels.map((l) => textWidth(l))) + 8, min, max));
}

/** A row's label ending at `x`, centred on `mid`, wrapped to two lines before it is shortened. */
export function RowLabel({ label, x, mid, width }: { label: string; x: number; mid: number; width: number }) {
  const lines = wrapLabel(label, charsIn(width - 8));
  return (
    <text className={styles.strong} x={x} y={mid + 3.5 - ((lines.length - 1) * LINE) / 2} textAnchor="end">
      {lines.map((line, k) => (
        <tspan key={k} x={x} dy={k === 0 ? 0 : LINE}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
