import type { Block, IndexEntry, SectionDoc } from "./ast.ts";
import { parseBlocks } from "./blocks.ts";
import { type RawSection, splitSections } from "./sections.ts";

// The whole reference, ready to serve: the index, then one document per section on demand.

export interface Reference {
  readonly index: readonly IndexEntry[];
  /** Parses one section (cached by the caller if it wants). Undefined for an unknown id. */
  section(id: string): SectionDoc | undefined;
}

const FIELD_ROW = /^\|\s*\d+(?::\d+)?\s*\|\s*`?([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)`?\s*\|/;

/** Field names of every register table: "UART_TX_SIZE" in "| 6:4 | UART_TX_SIZE | R/W | …". */
export function registerFields(markdown: string): Set<string> {
  const fields = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const m = FIELD_ROW.exec(line);
    if (m?.[1]) fields.add(m[1]);
  }
  return fields;
}

const wordCount = (lines: readonly string[]) =>
  lines.join(" ").replace(/[|#*`>-]/g, " ").split(/\s+/).filter(Boolean).length;

export function buildReference(markdown: string): Reference {
  const { sections, anchors } = splitSections(markdown);
  const fields = registerFields(markdown);
  const sectionIds = new Set(sections.keys());
  const toDoc = (raw: RawSection): SectionDoc => {
    const ctx = { doc: raw.doc, sectionIds, fields, anchors, seenBlocks: new Set<string>() };
    return {
      id: raw.id,
      doc: raw.doc,
      title: raw.title,
      words: wordCount(raw.body),
      blocks: parseBlocks(raw.body, ctx, { n: 0 }),
    };
  };
  return {
    index: [...sections.values()].map((s) => ({
      id: s.id,
      doc: s.doc,
      title: s.title,
      ...(s.parent ? { parent: s.parent } : {}),
      children: s.children,
      size: s.body.join("\n").length,
    })),
    section(id) {
      const raw = sections.get(id);
      return raw ? toDoc(raw) : undefined;
    },
  };
}

/** The image paths ("images/x.png") a section's blocks show. */
export function imagesOf(blocks: readonly Block[]): string[] {
  return blocks.flatMap((b): string[] => {
    if (b.t === "fig") return [b.src];
    if (b.t === "quote") return imagesOf(b.c);
    if (b.t === "list") return b.items.flatMap(imagesOf);
    return [];
  });
}
