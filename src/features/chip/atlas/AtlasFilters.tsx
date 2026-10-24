import { useTranslation } from "react-i18next";
import { BLOCK_FAMILIES, type BlockFamily } from "@/domain/chip";
import { ChoiceGroup } from "@/ui/ChoiceGroup";
import { type AtlasFilter, USED_CHOICES } from "../logic/atlas-filter";
import styles from "./atlas.module.css";

/** Family, used / not yet, and a search box; the page keeps their values in the URL. */
export function AtlasFilters({
  filter,
  onChange,
}: {
  filter: AtlasFilter;
  onChange: (change: Partial<AtlasFilter>) => void;
}) {
  const { t } = useTranslation("chip");
  const families: { key: BlockFamily | "all"; label: string }[] = [
    { key: "all", label: t("atlas.all") },
    ...BLOCK_FAMILIES.map((f) => ({ key: f, label: t(`scenes.families.${f}`) })),
  ];
  return (
    <div className={styles.filters} role="search" aria-label={t("atlas.filters")}>
      <ChoiceGroup label={t("atlas.family")} choices={families} value={filter.family} onChange={(family) => onChange({ family })} />
      <ChoiceGroup
        label={t("atlas.usedLabel")}
        choices={USED_CHOICES.map((key) => ({ key, label: t(`atlas.used.${key}`) }))}
        value={filter.used}
        onChange={(used) => onChange({ used })}
      />
      <label className={styles.search}>
        <span className="visually-hidden">{t("atlas.search")}</span>
        <input
          type="search"
          value={filter.query}
          placeholder={t("atlas.search")}
          onChange={(e) => onChange({ query: e.target.value })}
        />
      </label>
    </div>
  );
}
