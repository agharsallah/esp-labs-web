import type { Passage } from "./text";

// "Why you're here": which sentence of the section the guide's fact came from, found by the
// numbers they share (worth most) and their keywords. Null when nothing matches well enough.

const STOP = new Set(
  "the and for with that this from are can its has have into when which will not one two all any each their than then they you your our was were per via set use used also only more most such may".split(
    " ",
  ),
);

const numbersOf = (text: string) => new Set(text.replace(/[–−]/g, "-").match(/\d+(?:\.\d+)?/g) ?? []);

const wordsOf = (text: string) =>
  new Set(
    (text.toLowerCase().match(/[\p{L}][\p{L}\p{N}_-]*/gu) ?? [])
      .map((w) => w.replace(/(?:es|s)$/, ""))
      .filter((w) => w.length >= 3 && !STOP.has(w)),
  );

const overlap = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>) => [...a].filter((x) => b.has(x)).length;

/** The best-matching passage for a fact's text, or null. */
export function matchPassage(fact: string, passages: readonly Passage[]): number | null {
  const plain = fact.replace(/<[^>]+>/g, "");
  const nums = numbersOf(plain);
  const words = wordsOf(plain);
  let best: { n: number; score: number } | null = null;
  for (const p of passages) {
    const shared = overlap(words, wordsOf(p.text));
    const score = 3 * overlap(nums, numbersOf(p.text)) + shared;
    if (shared >= 1 && score >= 3 && (best === null || score > best.score)) best = { n: p.n, score };
  }
  return best?.n ?? null;
}
