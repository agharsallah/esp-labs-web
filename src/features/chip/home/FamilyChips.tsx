import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { BLOCK_FAMILIES, type ChipBlock } from "@/domain/chip";
import { Icon } from "@/ui/Icon";
import styles from "./home.module.css";

/** The seven families as chips, each opening the atlas filtered to it. */
export function FamilyChips({ blocks }: { blocks: readonly ChipBlock[] }) {
  const { t } = useTranslation("chip");
  return (
    <ul className={styles.families}>
      {BLOCK_FAMILIES.map((family) => (
        <li key={family}>
          <Link
            to={`/datasheet/blocks?family=${family}`}
            viewTransition
            className={styles.family}
            style={{ "--fam": `var(--fam-${family})` } as CSSProperties}
          >
            <Icon name={`fam-${family}`} size={20} />
            <span>{t(`scenes.families.${family}`)}</span>
            <span className={styles.familyCount}>
              {t("home.familyCount", { count: blocks.filter((b) => b.family === family).length })}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
