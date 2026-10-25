import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useChipContent } from "@/features/chip/hooks/use-chip-content";
import { useLocale } from "@/i18n/use-locale";
import { useReducedMotion } from "@/lib/media";
import { citingTexts, neighboursOf, relatedBlock } from "../logic/citations";
import { collectKeyInfo } from "../logic/key-info";
import { scrollTopFor } from "../logic/progressive";
import { matchPassage } from "../logic/match";
import { passagesOf } from "../logic/text";
import { referenceIndexQuery, referenceSectionQuery } from "../queries";
import { KeyInfo } from "./KeyInfo";
import { ReaderContext } from "./reader-context";
import { ReaderFooter } from "./ReaderFooter";
import { ReaderHeader } from "./ReaderHeader";
import { SectionBody } from "./SectionBody";
import { WhyHere } from "./WhyHere";
import styles from "./reader.module.css";

/** Scrolls the reader's own pane to a passage: scrollIntoView would also move the dialog and the page. */
function scrollPane(pane: HTMLElement | null, n: number, smooth: boolean) {
  const el = pane?.querySelector(`[data-n="${n}"]`);
  if (!pane || !el) return;
  const box = pane.getBoundingClientRect();
  const top = scrollTopFor({ top: box.top, scrollTop: pane.scrollTop, height: box.height }, el.getBoundingClientRect().top);
  pane.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
}

/** One open section: loads it, finds why the reader came, and lays out header, body and footer. */
export function ReaderSection({ id, titleId, onClose }: { id: string; titleId: string; onClose: () => void }) {
  const locale = useLocale();
  const section = useSuspenseQuery(referenceSectionQuery(id, locale)).data;
  const index = useSuspenseQuery(referenceIndexQuery(locale)).data?.sections ?? [];
  const content = useChipContent();
  const reduced = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);

  const cited = citingTexts(content, id);
  const passages = passagesOf(section.blocks);
  const matches = cited.flatMap((text) => matchPassage(text, passages) ?? []);
  const target = matches[0] ?? null;
  const nav = neighboursOf(index, id);
  const block = relatedBlock(content.blocks, id);

  const jumpTo = (n: number) => scrollPane(scroller.current, n, !reduced);

  // Bring the matching passage into view once, when the section opens.
  useEffect(() => {
    if (target !== null) scrollPane(scroller.current, target, false);
  }, [target]);

  const context = {
    sectionId: id,
    pins: new Set(content.pins.map((p) => p.gpio)),
    blocks: new Set(content.blocks.map((b) => b.id)),
    highlight: new Set(matches),
    jumpTo,
  };
  return (
    <ReaderContext value={context}>
      <ReaderHeader section={section} trail={nav.trail} block={block} titleId={titleId} />
      <div ref={scroller} className={styles.scroller}>
        <div className={styles.measure}>
          {cited.length > 0 ? <WhyHere texts={cited} target={target} /> : null}
          <KeyInfo info={collectKeyInfo(section.blocks)} />
          <SectionBody blocks={section.blocks} target={target} />
          <ReaderFooter id={id} doc={section.doc} nav={nav} onClose={onClose} />
        </div>
      </div>
    </ReaderContext>
  );
}
