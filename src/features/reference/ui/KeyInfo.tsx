import { useTranslation } from "react-i18next";
import { Icon } from "@/ui/Icon";
import type { KeyInfo as KeyInfoData } from "../logic/key-info";
import { NUM_ICON } from "./icons";
import { useReader } from "./reader-context";
import styles from "./reader.module.css";

/** The section's numbers and warnings as small cards; each one jumps to its sentence. */
export function KeyInfo({ info }: { info: KeyInfoData }) {
  const { t } = useTranslation("chip");
  const { jumpTo } = useReader();
  if (info.numbers.length === 0 && info.warnings.length === 0) return null;
  return (
    <section className={styles.key} aria-labelledby="reader-key">
      <h3 id="reader-key" className={styles.boxTitle}>
        {t("reader.key.title")}
      </h3>
      {info.numbers.length > 0 ? (
        <ul className={styles.stats} aria-label={t("reader.key.numbers")}>
          {info.numbers.map((num) => (
            <li key={num.v}>
              <button
                type="button"
                className={styles.stat}
                data-kind={num.k}
                onClick={() => jumpTo(num.n)}
              >
                <Icon name={NUM_ICON[num.k]} size={16} />
                <span className={styles.statValue}>{num.v}</span>
                <span className={styles.statContext} lang="en">
                  {num.context}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {info.warnings.length > 0 ? (
        <ul className={styles.warnCards} aria-label={t("reader.key.warnings")}>
          {info.warnings.map((w) => (
            <li key={w.n}>
              <button type="button" className={styles.warnCard} onClick={() => jumpTo(w.n)} lang="en">
                <Icon name="warning" size={16} />
                <span>{w.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
