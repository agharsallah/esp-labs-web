import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Icon } from "@/ui/Icon";
import type { Neighbours } from "../logic/citations";
import { OFFICIAL_DOCS } from "../docs-map";
import { bookLink } from "../book/book-url";
import type { RefDoc } from "../schema";
import { SectionLinkTo } from "./SectionLinkTo";
import styles from "./reader.module.css";

/**
 * Where to go next: the sections beside and under this one, back to the page, on through the whole
 * datasheet from here, or Espressif's PDF.
 */
export function ReaderFooter({
  id,
  doc,
  nav,
  onClose,
}: {
  id: string;
  doc: RefDoc;
  nav: Neighbours;
  onClose: () => void;
}) {
  const { t } = useTranslation("chip");
  return (
    <footer className={styles.footer}>
      {nav.children.length > 0 ? (
        <nav aria-labelledby="reader-children">
          <h3 id="reader-children" className={styles.boxTitle}>
            {t("reader.foot.children")}
          </h3>
          <ul className={styles.children}>
            {nav.children.map((c) => (
              <li key={c.id}>
                <SectionLinkTo id={c.id} className={styles.childLink}>
                  <span className={styles.secNum}>{c.id}</span>
                  <span>{c.title}</span>
                </SectionLinkTo>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {nav.prev || nav.next ? (
        <nav className={styles.pager} aria-label={t("reader.foot.nav")}>
          {nav.prev ? (
            <SectionLinkTo id={nav.prev.id} className={styles.pageLink}>
              <span className={styles.pageDir}>
                <Icon name="back" size={14} /> {t("reader.foot.prev")}
              </span>
              <span>
                <span className={styles.secNum}>{nav.prev.id}</span> {nav.prev.title}
              </span>
            </SectionLinkTo>
          ) : (
            <span />
          )}
          {nav.next ? (
            <SectionLinkTo id={nav.next.id} className={`${styles.pageLink} ${styles.pageNext}`}>
              <span className={styles.pageDir}>
                {t("reader.foot.next")} <Icon name="arrow" size={14} />
              </span>
              <span>
                <span className={styles.secNum}>{nav.next.id}</span> {nav.next.title}
              </span>
            </SectionLinkTo>
          ) : null}
        </nav>
      ) : null}
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onClose}>
          <Icon name="back" size={16} />
          {t("reader.foot.back")}
        </button>
        <Link className={styles.secondary} to={bookLink(id)}>
          <Icon name="book" size={16} />
          {t("reader.foot.book")}
        </Link>
        <a className={styles.secondary} href={OFFICIAL_DOCS[doc]} target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={16} />
          {t("reader.foot.pdf")}
          <span className="visually-hidden"> {t("reader.newTab")}</span>
        </a>
      </div>
    </footer>
  );
}
