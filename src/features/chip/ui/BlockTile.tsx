import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { ChipBlock, Coverage } from "@/domain/chip";
import { Spark } from "@/ui/charts";
import { RichText } from "@/ui/RichText";
import { useNumber } from "../hooks/use-format";
import { BlockIcon } from "./BlockIcon";
import { CoverageGlyph } from "./CoverageGlyph";
import { Marker } from "./Marker";
import styles from "./BlockTile.module.css";

/** One block in the atlas: icon, name, one line, its number, how far the labs took it. */
export function BlockTile({
  block,
  coverage,
  gotcha,
  index,
}: {
  block: ChipBlock;
  coverage: Coverage;
  gotcha: boolean;
  /** Position in the grid, for the entry stagger. */
  index: number;
}) {
  const { t } = useTranslation("chip");
  const num = useNumber();
  const style = { "--fam": `var(--fam-${block.family})`, "--i": Math.min(index, 12) } as CSSProperties;
  return (
    <li className={styles.tile} data-depth={block.depth} style={style}>
      <Link to={`/datasheet/blocks/${block.id}`} viewTransition className={styles.link}>
        <span className={styles.icon}>
          <BlockIcon icon={block.icon} size={56} />
        </span>
        <span className={styles.name}>
          {block.name}
          {gotcha ? <Marker kind="gotcha" /> : null}
        </span>
        <span className={styles.short}>
          <RichText text={block.short} />
        </span>
        {block.spark ? (
          <span className={styles.spark}>
            <Spark
              caption={t("atlas.spark", { value: num(block.spark.value), unit: block.spark.unit })}
              value={block.spark.value}
              max={block.spark.max}
              color={`--fam-${block.family}`}
            />
            <span aria-hidden="true">
              {num(block.spark.value)} {block.spark.unit}
            </span>
          </span>
        ) : null}
        <CoverageGlyph coverage={coverage} />
      </Link>
    </li>
  );
}
