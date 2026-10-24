import { useTranslation } from "react-i18next";
import { ChartFrame } from "@/ui/charts";
import styles from "./reader.module.css";

const WIDTH = 600;
const MIN_SPAN = 70;

/**
 * Timing parameters (t_STBL, t_RST…) one after the other on a time line, each span as wide as its
 * minimum time (never narrower than its label), with the exact value under it.
 */
export function TimingDiagram({
  caption,
  unit,
  items,
}: {
  caption: string;
  unit: string;
  items: readonly { label: string; value: number }[];
}) {
  const { t } = useTranslation("chip");
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const free = Math.max(0, WIDTH - MIN_SPAN * items.length);
  const widths = items.map((item) => MIN_SPAN + (free * item.value) / total);
  const spans = items.map((item, i) => ({
    ...item,
    x: widths.slice(0, i).reduce((s, w) => s + w, 0),
    w: widths[i] ?? MIN_SPAN,
  }));
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("reader.chart.parameter"), t("reader.chart.timing", { unit })],
        rows: items.map((i) => ({ key: i.label, cells: [i.label, String(i.value)] })),
      }}
    >
      <svg className={styles.timing} viewBox={`0 0 ${WIDTH} 76`} role="presentation">
        <line x1="0" x2={WIDTH} y1="40" y2="40" className={styles.timingAxis} />
        {spans.map((s, i) => (
          <g key={s.label} className={styles.timingSpan} data-odd={i % 2 === 1 || undefined}>
            <rect x={s.x + 1} y="28" width={s.w - 2} height="24" rx="4" />
            <text x={s.x + s.w / 2} y="20" textAnchor="middle" className={styles.timingLabel}>
              {s.label}
            </text>
            <text x={s.x + s.w / 2} y="70" textAnchor="middle" className={styles.timingValue}>
              {`≥ ${s.value} ${unit}`}
            </text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}
