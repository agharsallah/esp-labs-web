import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChartFrame } from "./ChartFrame";
import { filterRows, fitMatrix, layoutMatrix } from "./geometry/matrix-layout";
import { CHAR_WIDTH, charsIn, wrapLabel } from "./geometry/text-fit";
import { seriesStyle, type ColorToken } from "./series";
import { useElementWidth } from "./use-element-width";
import styles from "./charts.module.css";

export interface PinMatrixColumn {
  id: string;
  label: string;
  color?: ColorToken;
}

export interface PinMatrixCell {
  /** What the cell means, for the table (e.g. "ADC1_CH3"). */
  label: string;
  /** SVG content drawn in a 16×16 box; a dot when absent. */
  icon?: ReactNode;
}

export interface PinMatrixRow {
  id: string;
  label: string;
  cells: Readonly<Partial<Record<string, PinMatrixCell>>>;
  /** Carries the warning triangle (a gotcha pin). */
  warn?: boolean;
}

export interface PinMatrixProps {
  caption: string;
  columns: readonly PinMatrixColumn[];
  rows: readonly PinMatrixRow[];
  /** Keep only rows with a cell in this column. */
  filter?: string;
  /** Row ids drawn emphasised (e.g. pins our labs used). */
  highlighted?: ReadonlySet<string>;
  color?: ColorToken;
}

const FIT = {
  minCell: 24,
  maxCell: 80,
  maxRow: 32,
  charWidth: CHAR_WIDTH,
  lineHeight: 12,
  rowHeader: { min: 72, max: 160, lead: 22 },
};

/** Rows × columns of cells, each an icon or a dot; rows can be filtered, highlighted and warned. */
export function PinMatrix({ caption, columns, rows, filter, highlighted, color }: PinMatrixProps) {
  const { t } = useTranslation();
  const shown = filterRows(rows, filter);
  const [measure, available] = useElementWidth<HTMLDivElement>();
  const fit = fitMatrix(
    available,
    columns.map((col) => col.label),
    shown.map((r) => r.label),
    FIT,
  );
  const g = layoutMatrix(shown.length, columns.length, fit);
  const c = g.cell;
  const w = g.width + fit.overhang + 4;
  const rh = g.rowHeight;
  const icon = Math.min(c, rh) - 8;
  return (
    <ChartFrame
      caption={caption}
      wide
      table={{
        columns: [t("charts.item"), ...columns.map((col) => col.label), t("charts.warn"), t("charts.highlight")],
        rows: shown.map((r) => ({
          key: r.id,
          cells: [
            r.label,
            ...columns.map((col) => r.cells[col.id]?.label ?? ""),
            r.warn ? t("charts.yes") : "",
            highlighted?.has(r.id) ? t("charts.yes") : "",
          ],
        })),
      }}
    >
      <div ref={measure}>
      <svg className={styles.svgWide} width={w} height={g.height + 4} viewBox={`0 0 ${w} ${g.height + 4}`} style={seriesStyle(color)}>
        {columns.map((col, j) => {
          const x = (g.columns[j] ?? 0) + c / 2;
          const lines = fit.headers[j] ?? [];
          const y = fit.columnHeader - 6;
          return fit.rotated ? (
            <text key={col.id} x={x} y={y} transform={`rotate(-50 ${x} ${y})`} data-active={col.id === filter || undefined} className={styles.columnHead}>
              {lines[0]}
            </text>
          ) : (
            <text key={col.id} x={x} y={y - (lines.length - 1) * FIT.lineHeight} textAnchor="middle" data-active={col.id === filter || undefined} className={styles.columnHead}>
              {lines.map((line, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : FIT.lineHeight}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
        {shown.map((r, i) => {
          const y = g.rows[i] ?? 0;
          const lit = highlighted?.has(r.id) ?? false;
          return (
            <g key={r.id} className={`${styles.matrixRow} ${styles.fade}`} data-highlight={lit || undefined} style={seriesStyle(undefined, Math.min(i, 12))}>
              <rect className={styles.rowBand} x={0} y={y + 1} width={g.width} height={rh - 2} rx={4} />
              {r.warn ? <path className={styles.warn} d={`M${4} ${y + rh / 2 + 5}l6 -11l6 11z`} /> : null}
              <text className={styles.strong} x={22} y={y + rh / 2 + 3.5}>
                {wrapLabel(r.label, charsIn(fit.rowHeader - FIT.rowHeader.lead - 4), 1)[0]}
              </text>
              {columns.map((col, j) => {
                const cell = r.cells[col.id];
                if (!cell) return null;
                const x = g.columns[j] ?? 0;
                return (
                  <g key={col.id} style={seriesStyle(col.color)}>
                    {cell.icon ? (
                      <svg x={x + (c - icon) / 2} y={y + (rh - icon) / 2} width={icon} height={icon} viewBox="0 0 16 16">
                        {cell.icon}
                      </svg>
                    ) : (
                      <circle className={styles.bar} cx={x + c / 2} cy={y + rh / 2} r={5} />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      </div>
    </ChartFrame>
  );
}
