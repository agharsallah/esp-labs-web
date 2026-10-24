import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { blockLessons } from "@/domain/chip";
import { BlockHero } from "../block/BlockHero";
import { BlockLabs } from "../block/BlockLabs";
import { BlockPager } from "../block/BlockPager";
import { useChipContent } from "../hooks/use-chip-content";
import { useChipCoverage } from "../hooks/use-chip-coverage";
import { neighbours } from "../logic/neighbours";
import { BlockIcon } from "../ui/BlockIcon";
import { CoverageGlyph } from "../ui/CoverageGlyph";
import { FactCard } from "../ui/FactCard";
import { GotchaCard } from "../ui/GotchaCard";
import { PageTitle } from "../ui/PageTitle";
import { RegisterStrip } from "../ui/RegisterStrip";
import { Reveal } from "../ui/Reveal";
import { SourceLink } from "../ui/SourceLink";
import { RichText } from "@/ui/RichText";
import cards from "../ui/cards.module.css";
import styles from "./page.module.css";
import blockStyles from "../block/block.module.css";

/** #/chip/blocks/:blockId: one block, most important first. Listed blocks get the short page. */
export function BlockPage() {
  const { t } = useTranslation("chip");
  const { blockId } = useLoaderData<{ blockId: string }>();
  const chip = useChipContent();
  const { lessons, coverage, ticks } = useChipCoverage(chip.blocks);
  const block = chip.blocks.find((b) => b.id === blockId);
  // The loader checked the id; the content cache is static, so the block is still there.
  if (!block) throw new Error(`Block ${blockId} vanished from the cache`);
  const full = block.depth === "full";
  const gotchas = chip.gotchas.filter((g) => g.blocks?.includes(block.id));
  const { prev, next } = neighbours(chip.blocks, block.id);

  return (
    <div className={styles.page}>
      <PageTitle page={block.name} />
      <Link to="/chip/blocks" viewTransition className={blockStyles.back}>
        {t("block.back")}
      </Link>
      <header className={blockStyles.hero} data-depth={block.depth}>
        <div className={blockStyles.heading}>
          <BlockIcon icon={block.icon} size={full ? 72 : 96} />
          <div>
            <p className={styles.kicker}>{t(`scenes.families.${block.family}`)}</p>
            <h1 className={styles.title}>{block.name}</h1>
            <p className={styles.lead}>
              <RichText text={block.short} />
            </p>
            <CoverageGlyph coverage={coverage.get(block.id) ?? "none"} />
          </div>
        </div>
        {full ? <BlockHero block={block} /> : <p className={styles.muted}>{t("block.listedNote")}</p>}
      </header>
      <Reveal labelledBy="block-facts">
        <h2 id="block-facts" className={styles.h2}>
          {t("block.facts")}
        </h2>
        <ul className={cards.facts}>
          {block.facts.map((f) => (
            <FactCard key={f.id} fact={f} />
          ))}
        </ul>
      </Reveal>
      {gotchas.length ? (
        <Reveal labelledBy="block-gotchas">
          <h2 id="block-gotchas" className={styles.h2}>
            {t("block.gotchas")}
          </h2>
          <div className={styles.cards}>
            {gotchas.map((g) => (
              <GotchaCard key={g.id} gotcha={g} />
            ))}
          </div>
        </Reveal>
      ) : null}
      <Reveal labelledBy="block-labs">
        <h2 id="block-labs" className={styles.h2}>
          {t("block.labs")}
        </h2>
        <BlockLabs lessons={blockLessons(block, lessons)} ticks={ticks} />
      </Reveal>
      {full && block.registers?.length ? (
        <Reveal labelledBy="block-registers">
          <h2 id="block-registers" className={styles.h2}>
            {t("block.registers")}
          </h2>
          <div className={blockStyles.registers}>
            {block.registers.map((r) => (
              <RegisterStrip key={r.symbol} register={r} />
            ))}
          </div>
        </Reveal>
      ) : null}
      <SourceLink source={block.chapter} />
      <BlockPager prev={prev} next={next} />
    </div>
  );
}
