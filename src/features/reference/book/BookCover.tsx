import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Reveal } from "@/features/chip/ui/Reveal";
import { Icon } from "@/ui/Icon";
import { DOC_ICON } from "../ui/icons";
import { useLastSection, useReadSections } from "./book-store";
import { bookLink } from "./book-url";
import { minutesOfSize, shareRead } from "./logic/book";
import type { BookData } from "./use-book";
import { BookContents } from "./ui/BookContents";
import { Meter } from "./ui/Meter";
import styles from "./book.module.css";
import page from "@/features/chip/pages/page.module.css";

const hoursOf = (size: number) => Math.max(1, Math.round(minutesOfSize(size) / 60));

/**
 * #/datasheet/read: the book's cover. Where you left off (or where to start), the five documents
 * as cards with their size and your progress, then the full contents to jump anywhere.
 */
export function BookCover({ data }: { data: BookData }) {
  const { t } = useTranslation("chip");
  const { book, byId } = data;
  const read = useReadSections();
  const last = useLastSection();
  const lastEntry = last === null ? undefined : byId.get(last);
  const first = book.chapters[0]?.entry;
  const all = book.chapters.flatMap((c) => c.sections);
  const total = shareRead(all, read);
  return (
    <div className={page.page}>
      <header className={page.hero}>
        <p className={page.kicker}>{t("book.kicker")}</p>
        <h1 className={page.title}>{t("pages.read")}</h1>
        <p className={page.lead}>{t("book.lead")}</p>
        <div className={styles.coverActions}>
          {lastEntry ? (
            <Link to={bookLink(lastEntry.id)} className={styles.cta}>
              <Icon name="arrow" size={16} />
              <span>
                {t("book.continue")}{" "}
                <span>
                  §{lastEntry.id} {lastEntry.title}
                </span>
              </span>
            </Link>
          ) : null}
          {first ? (
            <Link to={bookLink(first.id)} className={lastEntry ? styles.ctaQuiet : styles.cta}>
              <Icon name="book" size={16} />
              {t("book.start")}
            </Link>
          ) : null}
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>{t("book.stats.documents")}</dt>
            <dd>{book.parts.length}</dd>
          </div>
          <div>
            <dt>{t("book.stats.chapters")}</dt>
            <dd>{book.chapters.length}</dd>
          </div>
          <div>
            <dt>{t("book.stats.reading")}</dt>
            <dd>{t("book.hours", { count: hoursOf(book.chapters.reduce((s, c) => s + c.size, 0)) })}</dd>
          </div>
          <div>
            <dt>{t("book.stats.read")}</dt>
            <dd>
              <Meter share={total} />
            </dd>
          </div>
        </dl>
      </header>

      <Reveal labelledBy="book-parts">
        <h2 id="book-parts" className={page.h2}>
          {t("book.parts")}
        </h2>
        <ul className={styles.partCards}>
          {book.parts.map((part) => {
            const start = part.chapters[0]?.entry;
            const share = shareRead(part.chapters.flatMap((c) => c.sections), read);
            const size = part.chapters.reduce((s, c) => s + c.size, 0);
            return start ? (
              <li key={part.doc}>
                <Link to={bookLink(start.id)} className={styles.partCard} data-doc={part.doc}>
                  <span className={styles.partIcon}>
                    <Icon name={DOC_ICON[part.doc]} size={26} />
                  </span>
                  <span className={styles.partName}>{t(`source.docs.${part.doc}`)}</span>
                  <span className={styles.partAbout}>{t(`book.about.${part.doc}`)}</span>
                  <span className={styles.partSize}>
                    {t("book.chapters", { count: part.chapters.length })} · {t("book.hours", { count: hoursOf(size) })}
                  </span>
                  <Meter share={share} />
                </Link>
              </li>
            ) : null;
          })}
        </ul>
      </Reveal>

      <Reveal labelledBy="book-contents">
        <h2 id="book-contents" className={page.h2}>
          {t("book.contents")}
        </h2>
        <BookContents data={data} read={read} />
      </Reveal>
    </div>
  );
}
