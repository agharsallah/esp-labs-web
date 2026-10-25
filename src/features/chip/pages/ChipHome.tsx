import { useTranslation } from "react-i18next";
import { Descent } from "../home/Descent";
import { FamilyChips } from "../home/FamilyChips";
import { Headline } from "../home/Headline";
import { ProgressPanel } from "../home/ProgressPanel";
import { useChipContent } from "../hooks/use-chip-content";
import { useChipCoverage } from "../hooks/use-chip-coverage";
import { FactCard } from "../ui/FactCard";
import { GotchaCard } from "../ui/GotchaCard";
import { PageTitle } from "../ui/PageTitle";
import { Reveal } from "../ui/Reveal";
import cards from "../ui/cards.module.css";
import styles from "./page.module.css";

const TOP_GOTCHAS = 5;

/** #/datasheet: the chip at a glance, the descent, your progress, the families and what bites. */
export function ChipHome() {
  const { t } = useTranslation("chip");
  const chip = useChipContent();
  const { lessons, coverage, tally, ticks } = useChipCoverage(chip.blocks);
  return (
    <div className={styles.page}>
      <PageTitle page={t("pages.home")} />
      <Headline numbers={chip.headline} />
      <ul className={cards.facts}>
        {chip.facts.map((f) => (
          <FactCard key={f.id} fact={f} />
        ))}
      </ul>
      <Descent blocks={chip.blocks} coverage={coverage} />
      <Reveal labelledBy="chip-progress">
        <h2 id="chip-progress" className={styles.h2}>
          {t("home.progress")}
        </h2>
        <ProgressPanel blocks={chip.blocks} lessons={lessons} ticks={ticks} tally={tally} />
      </Reveal>
      <Reveal labelledBy="chip-families">
        <h2 id="chip-families" className={styles.h2}>
          {t("home.families")}
        </h2>
        <FamilyChips blocks={chip.blocks} />
      </Reveal>
      <Reveal labelledBy="chip-gotchas">
        <h2 id="chip-gotchas" className={styles.h2}>
          {t("home.gotchas")}
        </h2>
        <div className={styles.cards}>
          {chip.gotchas.slice(0, TOP_GOTCHAS).map((g) => (
            <GotchaCard key={g.id} gotcha={g} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
