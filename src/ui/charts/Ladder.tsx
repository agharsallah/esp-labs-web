import { useTranslation } from "react-i18next";
import { ChartFrame } from "./ChartFrame";
import { formatRatio } from "./format";
import { layoutLadder } from "./geometry/ladder-layout";
import { seriesStyle, type ColorToken } from "./series";
import { useFormat } from "./use-format";
import styles from "./charts.module.css";

export interface LadderRung {
  id: string;
  label: string;
  value: number;
  /** What stays on at this rung. */
  items: readonly string[];
}

export interface LadderProps {
  caption: string;
  rungs: readonly LadderRung[];
  unit?: string;
  color?: ColorToken;
  /** Show "×N less" against the first rung on the other rungs. */
  showGain?: boolean;
  format?: (value: number) => string;
}

const BAR = 200;

/** Rungs top to bottom: a bar on a log axis, the value, and the list of what stays on. */
export function Ladder({ caption, rungs, unit, color, showGain = true, format }: LadderProps) {
  const { t, i18n } = useTranslation();
  const fmt = useFormat(format);
  const layout = layoutLadder(
    rungs.map((r) => r.value),
    { x0: 0, x1: BAR, rowHeight: 1, top: 0 },
  );
  const value = (r: LadderRung) => fmt(r.value) + (unit ? ` ${unit}` : "");
  const gain = (i: number) => {
    const ratio = layout.rungs[i]?.ratio ?? 1;
    return showGain && i > 0 && ratio > 1 ? t("charts.gain", { ratio: formatRatio(ratio, i18n.language) }) : "";
  };
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("charts.item"), t("charts.value"), t("charts.keeps")],
        rows: rungs.map((r, i) => ({
          key: r.id,
          cells: [r.label, [value(r), gain(i)].filter(Boolean).join(" · "), r.items.join(", ")],
        })),
      }}
    >
      <ol className={styles.ladder} style={seriesStyle(color)}>
        {rungs.map((r, i) => (
          <li key={r.id} className={styles.rung} style={seriesStyle(undefined, i)}>
            <span className={styles.rungLabel}>{r.label}</span>
            <svg className={styles.rungBar} viewBox={`0 0 ${BAR} 10`} preserveAspectRatio="none">
              <rect className={styles.track} x={0} y={2} width={BAR} height={6} />
              <rect
                className={`${styles.bar} ${styles.grow}`}
                x={0}
                y={1}
                width={Math.max(3, layout.rungs[i]?.length ?? 0)}
                height={8}

              />
            </svg>
            <span className={styles.rungValue}>
              {value(r)}
              {gain(i) ? <em>{gain(i)}</em> : null}
            </span>
            {r.items.length > 0 ? (
              <ul className={`${styles.rungItems} ${styles.fade}`}>
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </ChartFrame>
  );
}
