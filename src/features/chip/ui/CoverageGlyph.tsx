import { useTranslation } from "react-i18next";
import type { Coverage } from "@/domain/chip";
import { StateGlyph } from "@/features/progress/LessonState";
import styles from "./cards.module.css";

/** A block's coverage as the lesson state glyph and its word; "not yet" when no lab uses it. */
export function CoverageGlyph({ coverage }: { coverage: Coverage }) {
  const { t } = useTranslation();
  const { t: tc } = useTranslation("chip");
  return (
    <span className={styles.coverage} data-coverage={coverage}>
      {coverage === "none" ? <span className={styles.notYet} aria-hidden="true" /> : <StateGlyph state={coverage} />}
      {coverage === "none" ? tc("coverage.none") : t(`states.${coverage}.label`)}
    </span>
  );
}
