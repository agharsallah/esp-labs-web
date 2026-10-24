import { useTranslation } from "react-i18next";
import { Marker } from "@/features/chip/ui/Marker";
import { useReader } from "./reader-context";
import styles from "./reader.module.css";

/** "Why you're here": what the guide says that cites this section, and a way to its passage. */
export function WhyHere({ texts, target }: { texts: readonly string[]; target: number | null }) {
  const { t } = useTranslation("chip");
  const { jumpTo } = useReader();
  return (
    <section className={styles.why} aria-labelledby="reader-why">
      <h3 id="reader-why" className={styles.boxTitle}>
        <span aria-hidden="true">
          <Marker kind="key" />
        </span>
        {t("reader.why.title")}
      </h3>
      <p className={styles.whyLead}>{t("reader.why.lead")}</p>
      <ul className={styles.whyList}>
        {texts.slice(0, 3).map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      {target !== null ? (
        <p className={styles.whyFoot}>
          {t("reader.why.highlighted")}{" "}
          <button type="button" className={styles.textButton} onClick={() => jumpTo(target)}>
            {t("reader.why.jump")}
          </button>
        </p>
      ) : null}
    </section>
  );
}
