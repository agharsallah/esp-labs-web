import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useChipContent } from "@/features/chip/hooks/use-chip-content";
import { BlockIcon } from "@/features/chip/ui/BlockIcon";
import { Icon } from "@/ui/Icon";
import { blocksAt } from "../../logic/citations";
import styles from "../book.module.css";

/** From a block's chapter in the book to its page in the explorer, with the block's own drawing. */
export function BlockBridge({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation("chip");
  const blocks = blocksAt(useChipContent().blocks, sectionId);
  return blocks.length > 0 ? (
    <ul className={styles.bridges}>
      {blocks.map((block) => (
        <li key={block.id}>
          <Link to={`/datasheet/blocks/${block.id}`} viewTransition className={styles.explore}>
            <BlockIcon icon={block.icon} size={36} />
            <span>{t("book.explore", { block: block.name })}</span>
            <Icon name="arrow" size={14} />
          </Link>
        </li>
      ))}
    </ul>
  ) : null;
}
