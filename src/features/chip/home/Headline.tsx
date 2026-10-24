import { useTranslation } from "react-i18next";
import type { HeadlineNumber } from "@/domain/chip";
import { useInView } from "@/lib/use-in-view";
import { CountUp } from "../ui/CountUp";
import styles from "./home.module.css";

/** L0: the chip in one sentence and a row of numbers that count up when they come into view. */
export function Headline({ numbers }: { numbers: readonly HeadlineNumber[] }) {
  const { t } = useTranslation("chip");
  const [ref, shown] = useInView<HTMLDListElement>(0.3);
  return (
    <header className={styles.headline}>
      <p className={styles.kicker}>{t("home.kicker")}</p>
      <h1 className={styles.title}>{t("pages.home")}</h1>
      <p className={styles.lead}>{t("home.lead")}</p>
      <dl ref={ref} className={styles.numbers} aria-label={t("home.numbers")}>
        {numbers.map((n) => (
          <div key={n.id} className={styles.number}>
            <dt>{n.label}</dt>
            <dd>
              <strong>
                <CountUp value={n.value} start={shown} />
              </strong>{" "}
              <span>{n.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
