import { useTranslation } from "react-i18next";
import { Axis } from "./Axis";
import { ChartFrame } from "./ChartFrame";
import { layoutRanges } from "./geometry/range-layout";
import { labelColumn, RowLabel } from "./RowLabel";
import { seriesStyle, type ColorToken } from "./series";
import { useFormat } from "./use-format";
import styles from "./charts.module.css";

export interface RangeBarItem {
  id: string;
  label: string;
  min: number;
  typ?: number;
  max: number;
}

export interface RangeBarProps {
  caption: string;
  items: readonly RangeBarItem[];
  /** Unit shown in the table header, e.g. "V". */
  unit?: string;
  log?: boolean;
  color?: ColorToken;
  format?: (value: number) => string;
}

const W = 320;
const ROW = 22;

/** Min–max bars with a typical tick, all on one axis (linear or log). */
export function RangeBar({ caption, items, unit, log = false, color, format }: RangeBarProps) {
  const { t } = useTranslation();
  const fmt = useFormat(format);
  const labelW = labelColumn(items.map((it) => it.label));
  const { rows, ticks, height } = layoutRanges(items, { x0: labelW, x1: W - 12, rowHeight: ROW, top: 4, log });
  const u = unit ? ` (${unit})` : "";
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("charts.item"), t("charts.min") + u, t("charts.typical") + u, t("charts.max") + u],
        rows: items.map((it) => ({
          key: it.id,
          cells: [it.label, fmt(it.min), it.typ === undefined ? "" : fmt(it.typ), fmt(it.max)],
        })),
      }}
    >
      <svg className={styles.svg} viewBox={`0 0 ${W} ${height + 18}`} style={seriesStyle(color)}>
        <Axis ticks={ticks} top={0} bottom={height} format={fmt} />
        {items.map((it, i) => {
          const g = rows[i];
          if (!g) return null;
          const mid = g.y + ROW / 2;
          return (
            <g key={it.id} style={seriesStyle(undefined, i)}>
              <RowLabel label={it.label} x={labelW - 6} mid={mid} width={labelW} />
              <rect
                className={`${styles.bar} ${styles.grow}`}
                x={g.x0}
                y={mid - 4}
                width={Math.max(2, g.x1 - g.x0)}
                height={8}
                rx={4}
              />
              {g.xTyp === null ? null : (
                <rect className={`${styles.mark} ${styles.fade}`} x={g.xTyp - 1.5} y={mid - 7} width={3} height={14} rx={1.5} />
              )}
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
