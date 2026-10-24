import type { Block, Inline, NumKind } from "../schema";
import { passagesOf, textOf } from "./text";

// "Key information": the tagged numbers and warning sentences of a section, collected for the
// cards at the top of the reader. Each card points back at its passage.

export interface KeyNumber {
  readonly v: string;
  readonly k: NumKind;
  readonly n: number;
  /** The sentence around it, for the card's caption. */
  readonly context: string;
}

export interface KeyInfo {
  readonly numbers: readonly KeyNumber[];
  readonly warnings: readonly { readonly n: number; readonly text: string }[];
}

const numsIn = (nodes: readonly Inline[]): { v: string; k: NumKind }[] =>
  nodes.flatMap((x) => (x.t === "num" ? [{ v: x.v, k: x.k }] : "c" in x ? numsIn(x.c) : []));

/** Sentences only: numbers in tables are already drawn by their visuals. */
function sentencesOf(blocks: readonly Block[]): { n: number; c: readonly Inline[] }[] {
  return blocks.flatMap((b) => {
    if (b.t === "p") return b.s.map((s) => ({ n: s.n, c: s.c }));
    if (b.t === "list") return b.items.flatMap(sentencesOf);
    if (b.t === "quote") return sentencesOf(b.c);
    return [];
  });
}

export function collectKeyInfo(blocks: readonly Block[], limits = { numbers: 8, warnings: 4 }): KeyInfo {
  const seen = new Set<string>();
  const numbers: KeyNumber[] = [];
  for (const s of sentencesOf(blocks)) {
    for (const num of numsIn(s.c)) {
      const key = num.v.replace(/\s+/g, " ");
      if (seen.has(key) || num.k === "other") continue;
      seen.add(key);
      numbers.push({ ...num, n: s.n, context: textOf(s.c) });
    }
  }
  const warnings = passagesOf(blocks)
    // A bare "Note:" before a list says nothing on a card of its own.
    .filter((p) => p.warn && p.text.length >= 24)
    .map((p) => ({ n: p.n, text: p.text }));
  return { numbers: numbers.slice(0, limits.numbers), warnings: warnings.slice(0, limits.warnings) };
}
