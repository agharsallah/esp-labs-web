import { useTranslation } from "react-i18next";
import type { ChipBlock } from "@/domain/chip";
import { BlockIcon } from "@/features/chip/ui/BlockIcon";
import { Icon } from "@/ui/Icon";
import type { IndexEntry, SectionDoc } from "../schema";
import { readingMinutes } from "../logic/text";
import { DOC_ICON } from "./icons";
import { SectionLinkTo } from "./SectionLinkTo";
import styles from "./reader.module.css";

/** The document badge, where the section sits, its title, its block's drawing and the reading time. */
export function ReaderHeader({
  section,
  trail,
  block,
  titleId,
}: {
  section: SectionDoc;
  trail: readonly IndexEntry[];
  block: ChipBlock | undefined;
  titleId: string;
}) {
  const { t } = useTranslation("chip");
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <span className={styles.badge} data-doc={section.doc}>
          <Icon name={DOC_ICON[section.doc]} size={15} />
          {t(`source.docs.${section.doc}`)}
        </span>
        <span className={styles.minutes}>
          <Icon name="time" size={14} />
          {t("reader.minutes", { count: readingMinutes(section.words) })}
        </span>
      </div>
      {trail.length > 0 ? (
        <nav aria-label={t("reader.breadcrumb")}>
          <ol className={styles.trail}>
            {trail.map((e) => (
              <li key={e.id}>
                <SectionLinkTo id={e.id} className={styles.trailLink}>
                  <span className={styles.secNum}>{e.id}</span> {e.title}
                </SectionLinkTo>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className={styles.titleRow}>
        {block ? (
          <span className={styles.blockIcon} title={t("reader.related", { block: block.name })}>
            <BlockIcon icon={block.icon} size={44} />
          </span>
        ) : null}
        <h2 id={titleId} className={styles.title} lang="en">
          <span className={styles.secNum}>§{section.id}</span> {section.title}
        </h2>
      </div>
    </header>
  );
}
