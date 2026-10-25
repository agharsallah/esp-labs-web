import { useTranslation } from "react-i18next";
import { Icon } from "@/ui/Icon";
import { DOC_ICON } from "../../ui/icons";
import type { Book, Chapter } from "../logic/book";
import { minutesOfSize, shareRead } from "../logic/book";
import { BlockBridge } from "./BlockBridge";
import { BookSection } from "./BookSection";
import { Meter } from "./Meter";
import styles from "../book.module.css";
import reader from "../../ui/reader.module.css";

/**
 * A chapter as one continuous page: a header with its document, reading time, progress and (for a
 * peripheral's chapter) the way to its 3D page, then its own text and every section under it.
 */
export function BookChapter({ book, chapter, read }: { book: Book; chapter: Chapter; read: ReadonlySet<string> }) {
  const { t } = useTranslation("chip");
  const { entry } = chapter;
  const share = shareRead(chapter.sections, read);
  return (
    <article className={styles.chapter} data-doc={entry.doc} aria-labelledby={`${entry.id}-title`}>
      <header className={styles.chapterHead}>
        <div className={styles.chapterMeta}>
          <span className={reader.badge} data-doc={entry.doc}>
            <Icon name={DOC_ICON[entry.doc]} size={15} />
            {t(`source.docs.${entry.doc}`)}
          </span>
          <span className={reader.minutes}>
            <Icon name="time" size={14} />
            {t("reader.minutes", { count: minutesOfSize(chapter.size) })}
          </span>
          <Meter share={share} />
        </div>
        <h2 id={`${entry.id}-title`} className={styles.chapterTitle}>
          <span className={reader.secNum}>§{entry.id}</span> {entry.title}
        </h2>
        <BlockBridge sectionId={entry.id} />
      </header>
      <BookSection entry={entry} depth={1} read={read.has(entry.id)} heading={false} />
      {chapter.sections.slice(1).map((s) => (
        <BookSection key={s.id} entry={s} depth={book.depth.get(s.id) ?? 2} read={read.has(s.id)} />
      ))}
    </article>
  );
}
