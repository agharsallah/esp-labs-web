import type { Block, Inline } from "../schema";

// Plain text out of the reader's document: for matching, the summary and the reading time.

/** The text of inlines, as read. */
export function textOf(nodes: readonly Inline[]): string {
  return nodes
    .map((n) => {
      if (n.t === "br") return " ";
      if ("c" in n) return textOf(n.c);
      return n.v;
    })
    .join("");
}

/** Something the reader can highlight: a sentence, a table row or a register, by its number. */
export interface Passage {
  readonly n: number;
  readonly text: string;
  readonly warn: boolean;
}

/** Every numbered passage of a section, in reading order. */
export function passagesOf(blocks: readonly Block[]): Passage[] {
  return blocks.flatMap((b): Passage[] => {
    switch (b.t) {
      case "p":
        return b.s.map((s) => ({ n: s.n, text: textOf(s.c), warn: s.warn === true }));
      case "list":
        return b.items.flatMap(passagesOf);
      case "quote":
        return passagesOf(b.c);
      case "table":
        return b.rows.map((r) => ({ n: r.n, text: r.c.map(textOf).join(" | "), warn: false }));
      case "register":
        return [{ n: b.n, text: `${b.name} ${b.fields.map((f) => `${f.field} ${textOf(f.desc)}`).join(" ")}`, warn: false }];
      default:
        return [];
    }
  });
}

/** The passage numbers a block holds, first and last (null when it holds none). */
export function passageRange(block: Block): readonly [number, number] | null {
  const ns = passagesOf([block]).map((p) => p.n);
  const first = ns[0];
  const last = ns.at(-1);
  return first === undefined || last === undefined ? null : [first, last];
}

/** Minutes to read a section at 220 words a minute, at least one. */
export const readingMinutes = (words: number): number => Math.max(1, Math.round(words / 220));

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Inlines → the guide's Rich markup (b, i, code), for components that take Rich text. */
export function richOf(nodes: readonly Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "b":
          return `<b>${richOf(n.c)}</b>`;
        case "i":
          return `<i>${richOf(n.c)}</i>`;
        case "code":
        case "reg":
        case "field":
          return `<code>${escape(n.v)}</code>`;
        case "br":
          return " ";
        case "link":
        case "xref":
          return richOf(n.c);
        default:
          return escape(n.v);
      }
    })
    .join("");
}
