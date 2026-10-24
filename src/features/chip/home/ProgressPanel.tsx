import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { type ChipBlock, type Coverage, nextBlocks } from "@/domain/chip";
import type { LessonEntry } from "@/domain/lesson";
import type { Ticks } from "@/domain/progress";
import { CoverageRing } from "@/ui/charts";
import { RichText } from "@/ui/RichText";
import { BlockIcon } from "../ui/BlockIcon";
import { Marker } from "../ui/Marker";
import styles from "./home.module.css";

/** "Your progress through the chip": the ring, one sentence, and the next three blocks to light. */
export function ProgressPanel({
  blocks,
  lessons,
  ticks,
  tally,
}: {
  blocks: readonly ChipBlock[];
  lessons: readonly LessonEntry[];
  ticks: Ticks;
  tally: Record<Coverage, number>;
}) {
  const { t } = useTranslation("chip");
  const total = blocks.length;
  const used = total - tally.none;
  const next = nextBlocks(blocks, lessons, ticks);
  return (
    <div className={styles.progress}>
      <div className={styles.ring}>
        <CoverageRing caption={t("home.ringCaption")} counts={tally} center={t("home.ringCenter", { used, total })} />
        <p className={styles.sentence}>{t("home.sentence", { used, total })}</p>
      </div>
      <div>
        <h3 className={styles.sectionHead}>{t("home.next")}</h3>
        {next.length ? (
          <ul className={styles.next}>
            {next.map(({ block, lesson }) => (
              <li key={block.id}>
                <Link to={`/lessons/${lesson.id}`} className={styles.nextCard}>
                  <BlockIcon icon={block.icon} size={44} />
                  <span>
                    <strong>{block.name}</strong>
                    <span className={styles.nextShort}>
                      <RichText text={block.short} />
                    </span>
                    <span className={styles.nextLesson}>
                      <Marker kind="used" />
                      {t("home.nextLesson", { id: lesson.id, title: lesson.title })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>{t("home.nextNone")}</p>
        )}
      </div>
    </div>
  );
}
