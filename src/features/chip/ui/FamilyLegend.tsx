import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { BLOCK_FAMILIES } from "@/domain/chip";
import { Icon } from "@/ui/Icon";
import styles from "./FamilyLegend.module.css";

/** The key to the die's colours: each family's icon, name and swatch, in the families' order. */
export function FamilyLegend({ className }: { className?: string }) {
  const { t } = useTranslation("chip");
  return (
    <ul className={[styles.legend, className].filter(Boolean).join(" ")} aria-label={t("scenes.die.legend")}>
      {BLOCK_FAMILIES.map((family) => (
        <li key={family} style={{ "--fam": `var(--fam-${family})` } as CSSProperties}>
          <span className={styles.swatch} aria-hidden="true" />
          <Icon name={`fam-${family}`} size={16} />
          <span>{t(`scenes.families.${family}`)}</span>
        </li>
      ))}
    </ul>
  );
}
