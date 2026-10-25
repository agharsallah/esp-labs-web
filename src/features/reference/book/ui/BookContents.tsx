import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Icon } from "@/ui/Icon";
import { DOC_ICON } from "../../ui/icons";
import { bookLink } from "../book-url";
import { minutesOfSize, shareRead, shownAncestor } from "../logic/book";
import type { BookData } from "../use-book";
import { Meter } from "./Meter";
import styles from "../book.module.css";
import reader from "../../ui/reader.module.css";

/**
 * The book's contents: its five documents, each with its chapters, reading time and what you have
 * read. While reading, the open chapter unfolds its sections and marks the one on screen.
 */
export function BookContents({
  data,
  read,
  active = null,
  onPick,
}: {
  data: BookData;
  read: ReadonlySet<string>;
  /** The section on screen; null on the cover, where every chapter stays folded. */
  active?: string | null;
  onPick?: () => void;
}) {
  const { t } = useTranslation("chip");
  const { book, byId } = data;
  const uid = useId();
  const openChapter = active === null ? -1 : (book.chapterOf.get(active) ?? -1);
  const current = active === null ? null : shownAncestor(book, byId, active, 2);
  return (
    <nav className={styles.contents} aria-label={t("book.contents")}>
      {book.parts.map((part) => {
        const share = shareRead(part.chapters.flatMap((c) => c.sections), read);
        return (
          <section key={part.doc} className={styles.part} aria-labelledby={`${uid}-${part.doc}`}>
            <h3 id={`${uid}-${part.doc}`} className={styles.partHead}>
              <span className={reader.badge} data-doc={part.doc}>
                <Icon name={DOC_ICON[part.doc]} size={15} />
                {t(`source.docs.${part.doc}`)}
              </span>
              <Meter share={share} />
            </h3>
            <ol className={styles.chapters}>
              {part.chapters.map((chapter) => {
                const index = book.chapterOf.get(chapter.entry.id) ?? -1;
                const done = shareRead(chapter.sections, read);
                const complete = done.total > 0 && done.read === done.total;
                const open = index === openChapter;
                return (
                  <li key={chapter.entry.id} data-open={open || undefined}>
                    <Link
                      to={bookLink(chapter.entry.id)}
                      className={styles.chapterLink}
                      aria-current={current === chapter.entry.id ? "location" : undefined}
                      onClick={onPick}
                    >
                      <span className={reader.secNum}>{chapter.entry.id}</span>{" "}
                      <span className={styles.chapterName} lang="en">
                        {chapter.entry.title}
                      </span>{" "}
                      {complete ? (
                        <span className={styles.readMark} title={t("book.read")}>
                          <Icon name="check" size={13} />
                          <span className="visually-hidden">{t("book.read")}</span>
                        </span>
                      ) : (
                        <span className={styles.chapterMinutes}>{t("book.min", { count: minutesOfSize(chapter.size) })}</span>
                      )}
                    </Link>
                    {open ? (
                      <ol className={styles.subsections}>
                        {chapter.sections
                          .filter((s) => book.depth.get(s.id) === 2)
                          .map((s) => (
                            <li key={s.id}>
                              <Link
                                to={bookLink(s.id)}
                                className={styles.subLink}
                                aria-current={current === s.id ? "location" : undefined}
                                data-read={read.has(s.id) || undefined}
                                onClick={onPick}
                              >
                                <span className={reader.secNum}>{s.id}</span>{" "}
                                <span lang="en">{s.title}</span>
                              </Link>
                            </li>
                          ))}
                      </ol>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}
