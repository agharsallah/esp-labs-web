import { useTranslation } from "react-i18next";
import type { BlockFamily, ChipBlock, Coverage } from "@/domain/chip";
import { useInView } from "@/lib/use-in-view";
import { Icon } from "@/ui/Icon";
import { BlockTile } from "../ui/BlockTile";
import styles from "./atlas.module.css";

/** One family: a sticky header and its tiles, which stagger in when the group comes into view. */
export function FamilyGroup({
  family,
  blocks,
  coverage,
  gotchaBlocks,
}: {
  family: BlockFamily;
  blocks: readonly ChipBlock[];
  coverage: ReadonlyMap<string, Coverage>;
  gotchaBlocks: ReadonlySet<string>;
}) {
  const { t } = useTranslation("chip");
  const [ref, shown] = useInView<HTMLElement>(0.05);
  const id = `family-${family}`;
  return (
    <section ref={ref} className={styles.group} aria-labelledby={id} data-shown={shown || undefined}>
      <h2 id={id} className={styles.groupHead} style={{ color: `var(--fam-${family})` }}>
        <Icon name={`fam-${family}`} size={18} />
        <span>{t(`scenes.families.${family}`)}</span>
        <span className={styles.groupCount}>{t("atlas.count", { count: blocks.length })}</span>
      </h2>
      <ul className={styles.grid}>
        {blocks.map((b, i) => (
          <BlockTile key={b.id} block={b} coverage={coverage.get(b.id) ?? "none"} gotcha={gotchaBlocks.has(b.id)} index={i} />
        ))}
      </ul>
    </section>
  );
}
