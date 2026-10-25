import type { IndexEntry, RefDoc } from "../../schema";

// The whole reference as one book: its five documents in index order, each cut into chapters
// (the top-level sections), each chapter read as one continuous page of its sections in order.

export interface Chapter {
  readonly entry: IndexEntry;
  /** The chapter and every section under it, in reading order. */
  readonly sections: readonly IndexEntry[];
  /** Bytes of text, for the reading time and the placeholders' height. */
  readonly size: number;
}

export interface Part {
  readonly doc: RefDoc;
  readonly chapters: readonly Chapter[];
}

export interface Book {
  readonly parts: readonly Part[];
  /** Every chapter, across documents, in reading order. */
  readonly chapters: readonly Chapter[];
  /** Section id → the index of its chapter in `chapters`. */
  readonly chapterOf: ReadonlyMap<string, number>;
  /** Section id → its depth (a chapter is 1). */
  readonly depth: ReadonlyMap<string, number>;
}

/** The book an index makes: parts by document, chapters, and where each section sits. */
export function bookOf(index: readonly IndexEntry[]): Book {
  const byId = new Map(index.map((e) => [e.id, e]));
  const chapters: Chapter[] = [];
  const chapterOf = new Map<string, number>();
  const depth = new Map<string, number>();
  for (const top of index.filter((e) => e.parent === undefined)) {
    const sections: IndexEntry[] = [];
    const walk = (entry: IndexEntry, level: number) => {
      sections.push(entry);
      chapterOf.set(entry.id, chapters.length);
      depth.set(entry.id, level);
      for (const child of entry.children) {
        const next = byId.get(child);
        if (next) walk(next, level + 1);
      }
    };
    walk(top, 1);
    chapters.push({ entry: top, sections, size: sections.reduce((sum, s) => sum + s.size, 0) });
  }
  const parts: { doc: RefDoc; chapters: Chapter[] }[] = [];
  for (const chapter of chapters) {
    const last = parts.at(-1);
    if (last?.doc === chapter.entry.doc) last.chapters.push(chapter);
    else parts.push({ doc: chapter.entry.doc, chapters: [chapter] });
  }
  return { parts, chapters, chapterOf, depth };
}

/** Minutes to read some bytes of reference text: about six bytes a word, 220 words a minute. */
export const minutesOfSize = (size: number): number => Math.max(1, Math.round(size / 6 / 220));

/**
 * The section a contents entry stands for while another is being read: the section itself, or
 * its ancestor at `depth` (the contents list a chapter's sections two levels deep).
 */
export function shownAncestor(book: Book, index: ReadonlyMap<string, IndexEntry>, id: string, depth: number): string {
  let current = id;
  while ((book.depth.get(current) ?? 1) > depth) {
    const parent = index.get(current)?.parent;
    if (parent === undefined) break;
    current = parent;
  }
  return current;
}

export interface Share {
  readonly read: number;
  readonly total: number;
}

/** How many of some sections have been read. Empty sections (headings only) count as read. */
export function shareRead(sections: readonly IndexEntry[], read: ReadonlySet<string>): Share {
  const real = sections.filter((s) => s.size > 0);
  return { read: real.filter((s) => read.has(s.id)).length, total: real.length };
}

/** A placeholder's height before its section loads, in pixels: about a line per 90 bytes. */
export const placeholderHeight = (size: number): number => Math.min(2400, 72 + Math.round(size / 90) * 24);
