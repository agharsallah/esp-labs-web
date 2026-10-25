import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useChipContent } from "@/features/chip/hooks/use-chip-content";
import { useLocale } from "@/i18n/use-locale";
import { prefersReducedMotion } from "@/lib/media";
import { useInView } from "@/lib/use-in-view";
import { ErrorBoundary } from "@/ui/ErrorBoundary";
import { Icon } from "@/ui/Icon";
import { collectKeyInfo } from "../../logic/key-info";
import { referenceSectionQuery } from "../../queries";
import type { IndexEntry } from "../../schema";
import { KeyInfo } from "../../ui/KeyInfo";
import { ReaderContext } from "../../ui/reader-context";
import { SectionBody } from "../../ui/SectionBody";
import { bookLink, domId } from "../book-url";
import { BlockBridge } from "./BlockBridge";
import { placeholderHeight } from "../logic/book";
import styles from "../book.module.css";
import reader from "../../ui/reader.module.css";

const NO_HIGHLIGHT: ReadonlySet<number> = new Set();

/**
 * One section of the book: its heading at once, its text (key numbers, tables, charts, figures,
 * registers, as in the reader) only when it comes near the screen. Until then a placeholder about
 * its height keeps the page from jumping.
 */
export function BookSection({
  entry,
  depth,
  read,
  heading = true,
}: {
  entry: IndexEntry;
  depth: number;
  read: boolean;
  /** False for a chapter's own text: the chapter header already titles it. */
  heading?: boolean;
}) {
  const { t } = useTranslation("chip");
  const [ref, near] = useInView<HTMLElement>(0, "1200px 0px");
  const Heading = depth <= 2 ? "h3" : "h4";
  return (
    <section
      ref={ref}
      id={domId(entry.id)}
      tabIndex={-1}
      className={styles.section}
      data-depth={Math.min(depth, 4)}
      aria-label={`§${entry.id} ${entry.title}`}
    >
      {heading ? (
        <Heading className={styles.sectionTitle}>
          <Link to={bookLink(entry.id)} className={styles.anchor} preventScrollReset aria-label={t("book.link", { section: entry.id })}>
            <span className={reader.secNum}>§{entry.id}</span>
          </Link>{" "}
          {entry.title}
          {read ? (
            <span className={styles.readMark} title={t("book.read")}>
              <Icon name="check" size={14} />
              <span className="visually-hidden">{t("book.read")}</span>
            </span>
          ) : null}
        </Heading>
      ) : null}
      {heading ? <BlockBridge sectionId={entry.id} /> : null}
      {entry.size === 0 ? null : near ? (
        <Suspense fallback={<Placeholder size={entry.size} />}>
          <ErrorBoundary name={`Book ${entry.id}`} resetKey={entry.id}>
            <SectionText id={entry.id} />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <Placeholder size={entry.size} />
      )}
    </section>
  );
}

function Placeholder({ size }: { size: number }) {
  return <div className={styles.placeholder} style={{ minBlockSize: `${placeholderHeight(size)}px` }} aria-hidden="true" />;
}

/** The section's text, laid out by the reader's own parts, in its own reader context. */
function SectionText({ id }: { id: string }) {
  const locale = useLocale();
  const section = useSuspenseQuery(referenceSectionQuery(id, locale)).data;
  const content = useChipContent();
  const box = useRef<HTMLDivElement>(null);
  // "Key information" cards scroll the page to their passage, numbered within this section.
  const jumpTo = (n: number) => {
    const el = box.current?.querySelector(`[data-n="${n}"]`);
    el?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const context = {
    sectionId: id,
    pins: new Set(content.pins.map((p) => p.gpio)),
    blocks: new Set(content.blocks.map((b) => b.id)),
    highlight: NO_HIGHLIGHT,
    jumpTo,
  };
  return (
    <ReaderContext value={context}>
      <div ref={box} className={styles.text}>
        <KeyInfo info={collectKeyInfo(section.blocks)} />
        <SectionBody blocks={section.blocks} target={null} />
      </div>
    </ReaderContext>
  );
}
