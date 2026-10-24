import { useTranslation } from "react-i18next";
import { ChartFrame } from "./ChartFrame";
import { formatAddress, formatBytes } from "./format";
import { layoutAddressMap } from "./geometry/address-map-layout";
import { charsIn, wrapLabel } from "./geometry/text-fit";
import { seriesStyle, type ColorToken } from "./series";
import styles from "./charts.module.css";

export interface AddressRegion {
  id: string;
  label: string;
  start: number;
  /** Exclusive end address. */
  end: number;
  color?: ColorToken;
  /** Drawn emphasised, e.g. "where your sketch lives". */
  highlight?: boolean;
}

export interface AddressMapProps {
  caption: string;
  /** Top to bottom, usually by start address. */
  regions: readonly AddressRegion[];
  color?: ColorToken;
}

const W = 384;
const TOWER_X = 84;
const TOWER_W = 70;
const LABEL_X = TOWER_X + TOWER_W + 18;
const TOP = 6;
const LINE = 11;
/** Characters that fit beside the tower. */
const ROOM = charsIn(W - LABEL_X - 4);

/** The memory map as a tower: each region's height grows with log2 of its size, labelled beside it. */
export function AddressMap({ caption, regions, color }: AddressMapProps) {
  const { t, i18n } = useTranslation();
  const labels = regions.map((r) => wrapLabel(r.label, ROOM));
  // Room for the label lines and the size line under them.
  const gap = (Math.max(1, ...labels.map((l) => l.length)) + 1) * LINE;
  const layout = layoutAddressMap(regions, { unit: 2.4, minHeight: gap, labelGap: gap });
  const last = regions.at(-1);
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("charts.region"), t("charts.start"), t("charts.end"), t("charts.size"), t("charts.highlight")],
        rows: regions.map((r) => ({
          key: r.id,
          cells: [
            r.label,
            formatAddress(r.start),
            formatAddress(r.end - 1),
            formatBytes(r.end - r.start, i18n.language),
            r.highlight ? t("charts.yes") : "",
          ],
        })),
      }}
    >
      <svg className={styles.svg} viewBox={`0 0 ${W} ${layout.height + TOP * 2 + 8}`} style={seriesStyle(color)}>
        <g transform={`translate(0 ${TOP})`}>
          {regions.map((r, i) => {
            const g = layout.regions[i];
            if (!g) return null;
            const lines = labels[i] ?? [];
            const first = g.labelY - ((lines.length + 1) * LINE) / 2 + 8;
            return (
              <g key={r.id} style={seriesStyle(r.color, i)} className={styles.region} data-highlight={r.highlight || undefined}>
                <rect className={styles.growY} x={TOWER_X} y={g.y} width={TOWER_W} height={g.height} />
                <text x={TOWER_X - 6} y={g.y + 4} textAnchor="end" dominantBaseline="hanging">
                  {formatAddress(r.start)}
                </text>
                <path
                  className={`${styles.leader} ${styles.fade}`}
                  d={`M${TOWER_X + TOWER_W} ${g.y + g.height / 2}L${LABEL_X - 10} ${g.labelY}H${LABEL_X - 4}`}
                />
                <text className={`${styles.strong} ${styles.fade}`} x={LABEL_X} y={first}>
                  {lines.map((line, k) => (
                    <tspan key={k} x={LABEL_X} dy={k === 0 ? 0 : LINE}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <text className={styles.fade} x={LABEL_X} y={first + lines.length * LINE}>
                  {formatBytes(r.end - r.start, i18n.language)}
                </text>
              </g>
            );
          })}
          {last ? (
            <text x={TOWER_X - 6} y={layout.height} textAnchor="end">
              {formatAddress(last.end - 1)}
            </text>
          ) : null}
        </g>
      </svg>
    </ChartFrame>
  );
}
