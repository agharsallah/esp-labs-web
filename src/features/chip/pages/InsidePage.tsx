import { useTranslation } from "react-i18next";
import { useChipContent } from "../hooks/use-chip-content";
import { ClockSection } from "../inside/ClockSection";
import { MemorySection } from "../inside/MemorySection";
import { PowerSection } from "../inside/PowerSection";
import { PageTitle } from "../ui/PageTitle";
import { Reveal } from "../ui/Reveal";
import styles from "./page.module.css";

const SECTIONS = ["memory", "clocks", "power"] as const;

/** #/datasheet/inside: where code and data live, what clocks what, and what sleep saves. */
export function InsidePage() {
  const { t } = useTranslation("chip");
  const chip = useChipContent();
  const body = {
    memory: <MemorySection regions={chip.memory} />,
    clocks: <ClockSection nodes={chip.clocks.nodes} edges={chip.clocks.edges} />,
    power: <PowerSection modes={chip.power} />,
  };
  return (
    <div className={styles.page}>
      <PageTitle page={t("pages.inside")} />
      <header className={styles.hero}>
        <p className={styles.kicker}>{t("inside.kicker")}</p>
        <h1 className={styles.title}>{t("pages.inside")}</h1>
        <p className={styles.lead}>{t("inside.lead")}</p>
      </header>
      {SECTIONS.map((s) => (
        <Reveal key={s} labelledBy={`inside-${s}`}>
          <h2 id={`inside-${s}`} className={styles.h2}>
            {t(`inside.${s}.title`)}
          </h2>
          <p className={styles.lead}>{t(`inside.${s}.lead`)}</p>
          {body[s]}
        </Reveal>
      ))}
    </div>
  );
}
