import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ChartFrame } from "./ChartFrame";
import { layoutRing } from "./geometry/ring-layout";
import styles from "./CoverageRing.module.css";

/** The lesson states (as the progress glyphs draw them) plus "none": not touched by any lab. */
export const COVERAGE_STATES = ["done", "works", "built", "planned", "none"] as const;
export type CoverageState = (typeof COVERAGE_STATES)[number];

export interface CoverageRingProps {
  caption: string;
  counts: Readonly<Partial<Record<CoverageState, number>>>;
  /** Big text in the middle, e.g. "9 / 32". */
  center?: string;
}

const SIZE = 120;
const R = 48;

/** One ring split by state, in the colours and shapes of the lesson state glyphs, with its legend. */
export function CoverageRing({ caption, counts, center }: CoverageRingProps) {
  const { t } = useTranslation();
  const label = (s: CoverageState) => (s === "none" ? t("charts.none") : t(`states.${s}.label`));
  const parts = COVERAGE_STATES.map((key) => ({ key, value: counts[key] ?? 0 }));
  const segments = layoutRing(parts, { cx: SIZE / 2, cy: SIZE / 2, radius: R, gapDeg: 3 });
  return (
    <ChartFrame
      caption={caption}
      table={{
        columns: [t("charts.state"), t("charts.count")],
        rows: parts.map((p) => ({ key: p.key, cells: [label(p.key), String(p.value)] })),
      }}
    >
      <div className={styles.wrap}>
        <svg className={styles.ring} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle className={styles.base} cx={SIZE / 2} cy={SIZE / 2} r={R} />
          {segments.map((s, i) => (
            <g key={s.key} data-state={s.key} className={styles.segment} style={{ "--i": String(i) } as CSSProperties}>
              <path className={styles.arc} d={s.path} pathLength={100} />
              {s.key === "works" ? <path className={styles.inner} d={s.path} /> : null}
            </g>
          ))}
          {center ? (
            <text className={styles.center} x={SIZE / 2} y={SIZE / 2} textAnchor="middle" dominantBaseline="central">
              {center}
            </text>
          ) : null}
        </svg>
        <ul className={styles.legend}>
          {parts
            .filter((p) => p.value > 0)
            .map((p) => (
              <li key={p.key}>
                <span className={styles.glyph} data-state={p.key}>
                  {p.key === "done" ? (
                    <svg viewBox="0 0 12 12" width="100%" height="100%">
                      <path d="M3 6.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  ) : null}
                </span>
                {label(p.key)} <b>{p.value}</b>
              </li>
            ))}
        </ul>
      </div>
    </ChartFrame>
  );
}
