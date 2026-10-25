import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { AtlasFilters } from "../atlas/AtlasFilters";
import { FamilyGroup } from "../atlas/FamilyGroup";
import { useChipContent } from "../hooks/use-chip-content";
import { useChipCoverage } from "../hooks/use-chip-coverage";
import { type AtlasFilter, filterBlocks, groupByFamily, parseAtlasFilter, withAtlasFilter } from "../logic/atlas-filter";
import { DieFloorplan } from "../scenes/DieFloorplan";
import { PageTitle } from "../ui/PageTitle";
import styles from "./page.module.css";

/** #/datasheet/blocks: every block on the die, as tiles grouped by family, with filters in the URL. */
export function AtlasPage() {
  const { t } = useTranslation("chip");
  const chip = useChipContent();
  const { coverage } = useChipCoverage(chip.blocks);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = parseAtlasFilter(params);
  const shown = filterBlocks(chip.blocks, coverage, filter);
  const gotchaBlocks = new Set(chip.gotchas.flatMap((g) => g.blocks ?? []));

  function change(next: Partial<AtlasFilter>) {
    setParams((p) => withAtlasFilter(p, next), { replace: true, preventScrollReset: true });
  }

  return (
    <div className={styles.page}>
      <PageTitle page={t("pages.blocks")} />
      <header className={styles.hero}>
        <p className={styles.kicker}>{t("atlas.kicker")}</p>
        <h1 className={styles.title}>{t("pages.blocks")}</h1>
        <p className={styles.lead}>{t("atlas.lead", { count: chip.blocks.length })}</p>
      </header>
      <DieFloorplan
        blocks={chip.blocks.map((b) => ({ id: b.id, family: b.family, name: b.name, coverage: coverage.get(b.id) ?? "none" }))}
        onBlockPick={(id) => void navigate(`/datasheet/blocks/${id}`, { viewTransition: true })}
      />
      <div className={styles.tight}>
        <AtlasFilters filter={filter} onChange={change} />
        <p className={styles.note} role="status">
          {t("atlas.results", { count: shown.length })}
        </p>
      </div>
      {groupByFamily(shown).map((g) => (
        <FamilyGroup key={g.family} family={g.family} blocks={g.blocks} coverage={coverage} gotchaBlocks={gotchaBlocks} />
      ))}
    </div>
  );
}
