import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useChipContent } from "../hooks/use-chip-content";
import { useChipCoverage } from "../hooks/use-chip-coverage";
import { parsePinParams, withPinParams } from "../logic/pin-params";
import { gotchasForPin, pinsUsedByLessons, splitGotchas } from "../logic/pins";
import { PinDetail } from "../pins/PinDetail";
import { PinPicker } from "../pins/PinPicker";
import { PinTable } from "../pins/PinTable";
import { StrappingPanel } from "../pins/StrappingPanel";
import { GotchaCard } from "../ui/GotchaCard";
import { PageTitle } from "../ui/PageTitle";
import { Reveal } from "../ui/Reveal";
import styles from "./page.module.css";

/** #/chip/pins: which pin can do what, which our labs used, and which pins bite. */
export function PinsPage() {
  const { t } = useTranslation("chip");
  const chip = useChipContent();
  const { lessons } = useChipCoverage(chip.blocks);
  const used = pinsUsedByLessons(lessons);
  const [params, setParams] = useSearchParams();
  const { pin, kind } = parsePinParams(params, chip.pins.map((p) => p.gpio));
  const picked = chip.pins.find((p) => p.gpio === pin);
  const groups = splitGotchas(chip.gotchas);

  const change = (next: Parameters<typeof withPinParams>[1]) =>
    setParams((p) => withPinParams(p, next), { replace: true, preventScrollReset: true });

  return (
    <div className={styles.page}>
      <PageTitle page={t("pages.pins")} />
      <header className={styles.hero}>
        <p className={styles.kicker}>{t("pins.kicker")}</p>
        <h1 className={styles.title}>{t("pages.pins")}</h1>
        <p className={styles.lead}>{t("pins.lead", { count: chip.pins.length, used: used.size })}</p>
      </header>
      <section className={styles.pickStrip} aria-labelledby="pins-pick">
        <div className={styles.pickList}>
          <h2 id="pins-pick" className={styles.h3}>
            {t("pins.pick")}
          </h2>
          <PinPicker pins={chip.pins} picked={pin} used={used} onPick={(p) => change({ pin: p })} />
          <p className={styles.note}>{t("pins.pickLegend")}</p>
        </div>
        <div className={styles.pickCard} aria-live="polite">
          {picked ? (
            <PinDetail pin={picked} gotchas={gotchasForPin(picked, chip.gotchas)} used={used.has(String(picked.gpio))} />
          ) : (
            <p className={styles.muted}>{t("pins.pickHint")}</p>
          )}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="pins-matrix">
        <div className={styles.sectionIntro}>
          <h2 id="pins-matrix" className={styles.h2}>
            {t("pins.matrixTitle")}
          </h2>
          <p className={styles.muted}>{t("pins.legend")}</p>
        </div>
        <PinTable pins={chip.pins} used={used} kind={kind} onKind={(k) => change({ kind: k })} />
      </section>
      <Reveal labelledBy="pins-straps">
        <h2 id="pins-straps" className={styles.h2}>
          {t("pins.strappingTitle")}
        </h2>
        <p className={styles.lead}>{t("pins.strappingLead")}</p>
        <StrappingPanel pins={chip.pins} />
      </Reveal>
      <Reveal labelledBy="pins-gotchas">
        <h2 id="pins-gotchas" className={styles.h2}>
          {t("pins.gotchasTitle")}
        </h2>
        <p className={styles.lead}>{t("pins.gotchasLead")}</p>
        <h3 className={styles.h3}>{t("pins.gotchasPins")}</h3>
        <div className={styles.cards}>
          {groups.pins.map((g) => (
            <GotchaCard key={g.id} gotcha={g} linked={false} />
          ))}
        </div>
        <h3 className={styles.h3}>{t("pins.gotchasChip")}</h3>
        <div className={styles.cards}>
          {groups.chip.map((g) => (
            <GotchaCard key={g.id} gotcha={g} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
