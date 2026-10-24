import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { TRACKS } from "@/content/tracks";
import type { ActiveLesson } from "@/domain/lesson";
import { lessonState, type Ticks } from "@/domain/progress";
import { useTrackText } from "@/features/navigation/use-track-text";
import { StateGlyph, StateLegend } from "@/features/progress/LessonState";
import { groupByTrack } from "../logic/lab-groups";
import styles from "./block.module.css";

/**
 * "In our labs": one line per track (its colour, title, lab count and a row of state glyphs),
 * each opening to its lessons as wrapped chips.
 */
export function BlockLabs({ lessons, ticks }: { lessons: readonly ActiveLesson[]; ticks: Ticks }) {
  const { t } = useTranslation("chip");
  const { t: tc } = useTranslation();
  const trackText = useTrackText();
  if (!lessons.length) return <p className={styles.muted}>{t("block.labsNone")}</p>;
  const groups = groupByTrack(lessons, TRACKS);
  return (
    <>
      <p className={styles.muted}>{t("block.labsLead", { count: lessons.length, tracks: groups.length })}</p>
      <ul className={styles.tracks}>
        {groups.map(({ track, lessons: own }) => (
          <li key={track.id} style={{ "--track": `var(${track.color})` } as CSSProperties}>
            <details className={styles.track}>
              <summary>
                <span className={styles.trackName}>{trackText(track).title}</span>
                <span className={styles.trackCount}>{t("block.labsCount", { count: own.length })}</span>
                <span className={styles.glyphs} aria-hidden="true">
                  {own.map((l) => (
                    <StateGlyph key={l.id} state={lessonState(l, ticks)} />
                  ))}
                </span>
              </summary>
              <ul className={styles.chips}>
                {own.map((l) => {
                  const state = lessonState(l, ticks);
                  return (
                    <li key={l.id}>
                      <Link to={`/lessons/${l.id}`} className={styles.lab}>
                        <StateGlyph state={state} />
                        <span className="visually-hidden">{tc(`states.${state}.label`)}</span>
                        <span className={styles.labId}>{l.id}</span>
                        <span>{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ul>
      <StateLegend className={styles.legend} />
    </>
  );
}
