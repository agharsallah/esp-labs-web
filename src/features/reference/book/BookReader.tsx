import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { useActiveSection } from "@/lib/active-section";
import { Icon } from "@/ui/Icon";
import { scrollTopFor } from "../logic/progressive";
import { DOC_ICON } from "../ui/icons";
import { SectionLinkContext, type SectionTarget } from "../ui/section-link-context";
import { bookProgress, useReadSections } from "./book-store";
import { bookLink, domId } from "./book-url";
import { minutesOfSize, shareRead } from "./logic/book";
import type { BookData } from "./use-book";
import { BookChapter } from "./ui/BookChapter";
import { BookContents } from "./ui/BookContents";
import { ContentsSheet } from "./ui/ContentsSheet";
import { Meter } from "./ui/Meter";
import styles from "./book.module.css";
import reader from "../ui/reader.module.css";

// Inside the book, a cross-reference goes to its place in the book, not to the reader drawer.
const RELEASE_ON = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

const toBook: SectionTarget = (id) => ({ to: bookLink(id), preventScrollReset: true });

/**
 * The datasheet as one continuous read: the contents beside the text (a sheet on phones), a bar
 * with where you are, and chapter after chapter: reaching the end of one brings in the next.
 * The URL's `at` is where you jumped to; the section you are reading is marked read as you go.
 */
export function BookReader({ data, at }: { data: BookData; at: string }) {
  const { t } = useTranslation("chip");
  const { book, byId } = data;
  const { key } = useLocation();
  const read = useReadSections();
  const target = byId.has(at) ? at : (book.chapters[0]?.entry.id ?? at);
  const targetChapter = book.chapterOf.get(target) ?? 0;

  // The chapters on the page: from the one jumped to, growing as you read on.
  const [range, setRange] = useState({ start: targetChapter, end: targetChapter + 1 });
  if (targetChapter < range.start || targetChapter >= range.end) setRange({ start: targetChapter, end: targetChapter + 1 });
  const chapters = book.chapters.slice(range.start, range.end);
  const next = book.chapters[range.end];
  const previous = book.chapters[range.start - 1];

  const ids = chapters.flatMap((c) => c.sections.map((s) => domId(s.id)));
  const activeDom = useActiveSection(ids);
  const active = activeDom?.slice("book-".length) ?? target;
  const activeEntry = byId.get(active);
  const activeChapter = book.chapters[book.chapterOf.get(active) ?? targetChapter];

  // Every jump (a link, the contents, Back) lands on its section at once: a smooth scroll across a
  // long chapter would load every section on the way. While the sections around it load and grow,
  // it stays pinned, until you scroll or a moment has passed.
  const flow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.getElementById(domId(target));
    if (!el) return undefined;
    const pin = () => el.scrollIntoView({ block: "start" });
    pin();
    el.focus({ preventScroll: true });
    const grows = new ResizeObserver(pin);
    if (flow.current) grows.observe(flow.current);
    const release = () => {
      grows.disconnect();
      clearTimeout(timer);
      for (const type of RELEASE_ON) window.removeEventListener(type, release);
    };
    const timer = setTimeout(release, 2000);
    for (const type of RELEASE_ON) window.addEventListener(type, release, { passive: true });
    return release;
  }, [target, key]);

  useEffect(() => {
    bookProgress.markRead(active);
  }, [active]);

  // Keep the open entry of the contents in view as you read.
  const side = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pane = side.current;
    const el = pane?.querySelector('[aria-current="location"]');
    if (!pane || !el) return;
    const box = pane.getBoundingClientRect();
    const top = scrollTopFor({ top: box.top, scrollTop: pane.scrollTop, height: box.height }, el.getBoundingClientRect().top);
    pane.scrollTo({ top });
  }, [active]);

  // Near the end of the last chapter, the next one joins the page. The watch is keyed by the
  // range, so it looks again after each chapter joins (a short one may leave the end in reach).
  const total = book.chapters.length;
  const growWhenNear = (el: HTMLDivElement | null) => {
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setRange((r) => ({ ...r, end: Math.min(r.end + 1, total) }));
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  };
  const share = activeChapter ? shareRead(activeChapter.sections, read) : null;

  return (
    <SectionLinkContext value={toBook}>
      <div className={styles.reader}>
        <aside className={styles.side} ref={side}>
          <BookContents data={data} read={read} active={active} />
        </aside>
        <div className={styles.flow} ref={flow}>
          <div className={styles.bar}>
            <ContentsSheet data={data} read={read} active={active} />
            {activeChapter ? (
              <p className={styles.where} aria-live="polite">
                <span className={styles.whereDoc} data-doc={activeChapter.entry.doc}>
                  <Icon name={DOC_ICON[activeChapter.entry.doc]} size={14} />
                </span>
                <span className={styles.whereText}>
                  <span className={reader.secNum}>§{activeEntry?.id ?? active}</span> {activeEntry?.title}
                </span>
              </p>
            ) : null}
            {share ? <Meter share={share} /> : null}
          </div>
          {previous ? (
            <Link to={bookLink(previous.entry.id)} className={styles.previous}>
              <Icon name="up" size={14} />
              <span>{t("book.prev")}</span>
              <span>
                <span className={reader.secNum}>§{previous.entry.id}</span> {previous.entry.title}
              </span>
            </Link>
          ) : null}
          {chapters.map((chapter) => (
            <BookChapter key={chapter.entry.id} book={book} chapter={chapter} read={read} />
          ))}
          <div ref={next ? growWhenNear : undefined} key={range.end} className={styles.end}>
            {next ? (
              <Link to={bookLink(next.entry.id)} className={styles.nextCard}>
                <span className={styles.nextKicker}>
                  {t("book.next")} <Icon name="arrow" size={14} />
                </span>
                <span className={styles.nextTitle}>
                  <span className={reader.secNum}>§{next.entry.id}</span> {next.entry.title}
                </span>
                <span className={reader.minutes}>
                  <Icon name={DOC_ICON[next.entry.doc]} size={14} />
                  {t(`source.docs.${next.entry.doc}`)} · {t("reader.minutes", { count: minutesOfSize(next.size) })}
                </span>
              </Link>
            ) : (
              <p className={styles.theEnd}>
                <Icon name="flag" size={18} />
                {t("book.end")}
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionLinkContext>
  );
}
