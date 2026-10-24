import { useTranslation } from "react-i18next";
import { Axis } from "./Axis";
import { ChartFrame } from "./ChartFrame";
import { layoutBars } from "./geometry/bar-layout";
import { labelColumn, RowLabel } from "./RowLabel";
import { seriesStyle, type ColorToken } from "./series";
import { useFormat } from "./use-format";
import styles from "./charts.module.css";

export interface CompareBarsItem {
  id: string;
  label: string;
  value: number;
  color?: ColorToken;
}

export interface CompareBarsProps {
  caption: string;
  items: readonly CompareBarsItem[];
  unit?: string;
  log?: boolean;
  /** Default colour for items without their own. */
  color?: ColorToken;
  /** Id of the item to emphasise (e.g. the block on screen). */
  highlight?: string;
  format?: (value: number) => string;
}

const W = 320;
const ROW = 22;

/** One metric across several items, as horizontal bars on a shared axis. */
export function CompareBars({ caption, items, unit, log = false, color, highlight, format }: CompareBarsProps) {
  const { t } = useTranslation();
  const fmt = useFormat(format);
  const labelW = labelColumn(items.map((it) => it.label));
  const { lengths, ticks } = layoutBars(
    items.map((it) => it.value),
    { x0: labelW, x1: W - 12, log },
  );
  const height = items.length * ROW + 4;
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("charts.item"), unit ? t("charts.valueIn", { unit }) : t("charts.value")],
        rows: items.map((it) => ({ key: it.id, cells: [it.label, fmt(it.value)] })),
      }}
    >
      <svg className={styles.svg} viewBox={`0 0 ${W} ${height + 18}`} style={seriesStyle(color)}>
        <Axis ticks={ticks} top={0} bottom={height} format={fmt} />
        {items.map((it, i) => {
          const y = 4 + i * ROW;
          return (
            <g key={it.id} style={seriesStyle(it.color, i)} data-highlight={it.id === highlight || undefined} className={styles.compareRow}>
              <RowLabel label={it.label} x={labelW - 6} mid={y + ROW / 2} width={labelW} />
              <rect className={`${styles.bar} ${styles.grow}`} x={labelW} y={y + 5} width={Math.max(2, lengths[i] ?? 0)} height={ROW - 10} rx={3} />
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
