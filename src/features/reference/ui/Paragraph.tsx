import { Marker } from "@/features/chip/ui/Marker";
import type { Sentence } from "../schema";
import { InlineView } from "./InlineView";
import { useReader } from "./reader-context";
import styles from "./reader.module.css";

/**
 * A paragraph, sentence by sentence (each can be highlighted and scrolled to). A warning sentence
 * leaves the flow as a callout with the gotcha triangle.
 */
export function Paragraph({ sentences }: { sentences: readonly Sentence[] }) {
  const runs: Sentence[][] = [];
  for (const s of sentences) {
    const last = runs.at(-1);
    if (s.warn || !last || last[0]?.warn) runs.push([s]);
    else last.push(s);
  }
  return runs.map((run) =>
    run[0]?.warn ? (
      <aside key={run[0].n} className={styles.callout}>
        <Marker kind="gotcha" />
        <p>
          <Passage sentence={run[0]} />
        </p>
      </aside>
    ) : (
      <p key={run[0]?.n} className={styles.para}>
        {run.map((s, i) => (
          <span key={s.n}>
            {i > 0 ? " " : null}
            <Passage sentence={s} />
          </span>
        ))}
      </p>
    ),
  );
}

function Passage({ sentence }: { sentence: Sentence }) {
  const { highlight } = useReader();
  return (
    <span data-n={sentence.n} className={highlight.has(sentence.n) ? styles.highlight : undefined}>
      <InlineView nodes={sentence.c} />
    </span>
  );
}
