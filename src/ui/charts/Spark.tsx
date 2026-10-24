import { share } from "./geometry/bar-layout";
import { seriesStyle, type ColorToken } from "./series";
import styles from "./charts.module.css";

export interface SparkProps {
  /** The accessible name, which carries the number: "Up to 5 Mbps, against 80 Mbps for SPI". */
  caption: string;
  value: number;
  max: number;
  color?: ColorToken;
}

/**
 * A tiny inline bar against a maximum, for tiles and sentences. Unlike the other charts it is
 * an image with a name, not a figure with a table: its caption already says the one number.
 */
export function Spark({ caption, value, max, color }: SparkProps) {
  const w = share(value, max) * 60;
  return (
    <svg className={styles.spark} viewBox="0 0 60 6" role="img" aria-label={caption} style={seriesStyle(color)}>
      <rect className={styles.track} x={0} y={1} width={60} height={4} rx={2} />
      <rect className={styles.bar} x={0} y={0} width={Math.max(1.5, w)} height={6} rx={3} />
    </svg>
  );
}
