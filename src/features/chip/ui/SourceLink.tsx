import { useTranslation } from "react-i18next";
import type { SourceRef } from "@/domain/chip";
import { OFFICIAL_DOCS } from "@/features/reference/docs-map";
import { isReferenceBuilt } from "@/features/reference/queries";
import { refParam, sectionOfParam } from "@/features/reference/ref-param";
import { useReader } from "@/features/reference/ui/reader-context";
import { SectionLinkTo } from "@/features/reference/ui/SectionLinkTo";
import { useOpenSection } from "@/features/reference/use-reader-nav";
import { Icon } from "@/ui/Icon";
import cite from "@/features/reference/ui/cite.module.css";
import styles from "./SourceLink.module.css";

/**
 * "Read the full section": a citation chip naming the document and section of the reference.
 * When the guide was built with the reference, the chip opens that section in the reader
 * (`?ref=`); otherwise it stays a citation, with a link to Espressif's official document.
 */
export function SourceLink({ source, compact = false }: { source: SourceRef; compact?: boolean }) {
  const { t } = useTranslation("chip");
  const available = isReferenceBuilt();
  // The section on screen (in the reader or the book) is cited as text, not as a link to itself.
  const open = useOpenSection();
  const { sectionId: reading } = useReader();
  const id = sectionOfParam(refParam(source));
  const doc = t(`source.docs.${source.doc}`);
  const label = t("source.cite", { doc, section: source.section });
  return (
    <p className={styles.source} data-compact={compact || undefined}>
      {compact ? null : <span className={styles.lead}>{t("source.read")}</span>}
      {available && id !== null && id !== open && id !== reading ? (
        <SectionLinkTo
          id={id}
          opensDialog
          className={`${styles.chip} ${cite.live}`}
          title={t("reader.cite.open", { doc, section: source.section })}
        >
          {label}
        </SectionLinkTo>
      ) : (
        <cite className={styles.chip} title={t("source.note")}>
          {label}
        </cite>
      )}
      {available ? null : (
        <a
          className={cite.pdf}
          href={OFFICIAL_DOCS[source.doc]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("reader.cite.pdfLabel", { doc })}
        >
          {t("reader.cite.pdf")}
          <Icon name="external" size={12} />
        </a>
      )}
    </p>
  );
}
