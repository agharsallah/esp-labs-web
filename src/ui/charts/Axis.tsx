import styles from "./charts.module.css";

/** Vertical grid lines with their values under the plot. */
export function Axis({
  ticks,
  top,
  bottom,
  format,
}: {
  ticks: readonly { value: number; at: number }[];
  top: number;
  bottom: number;
  format: (value: number) => string;
}) {
  return (
    <g>
      {ticks.map((tk) => (
        <g key={tk.value}>
          <line className={styles.grid} x1={tk.at} x2={tk.at} y1={top} y2={bottom} />
          <text x={tk.at} y={bottom + 12} textAnchor="middle">
            {format(tk.value)}
          </text>
        </g>
      ))}
    </g>
  );
}
