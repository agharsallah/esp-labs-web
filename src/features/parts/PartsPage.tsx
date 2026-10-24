import { Trans, useTranslation } from "react-i18next";
import { PartIcon } from "@/ui/parts/PartIcon";
import { CHIP_PART_NAMES } from "@/ui/parts/chip-registry";
import { ChipPartIcon } from "@/ui/parts/ChipPartIcon";
import { PART_NAMES } from "@/ui/parts/registry";
import styles from "./PartsPage.module.css";

/** The parts library at a glance: every illustration, its name in code and what it shows. */
export function PartsPage() {
  const { t } = useTranslation("parts");
  return (
    <section className={styles.page} aria-labelledby="parts-title">
      <header>
        <h2 id="parts-title">{t("page.title")}</h2>
        <p>
          <Trans
            t={t}
            i18nKey="page.intro"
            values={{ example: '<PartIcon name="led" size={64} />' }}
            components={{ code: <code /> }}
          />
        </p>
      </header>
      <ul className={styles.grid}>
        {PART_NAMES.map((name) => (
          <li key={name}>
            <PartIcon name={name} size={96} />
            <code>{name}</code>
            <span>{t(`names.${name}`)}</span>
          </li>
        ))}
        {CHIP_PART_NAMES.map((name) => (
          <li key={name}>
            <ChipPartIcon name={name} size={96} />
            <code>{name}</code>
            <span>{t(`names.${name}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
