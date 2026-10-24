import type { ChipBlock } from "@/domain/chip";
import type { IndexEntry } from "../schema";
import { sectionOfParam } from "../ref-param";

// What ties a reference section back to the guide: the chip content that cites it ("Why you're
// here"), the block it is about (its icon in the header) and its place in the reference tree.

/** The section id a `{ doc, section }` object names. */
const sectionIdOf = (source: { doc: string; section: string }) =>
  sectionOfParam(source.doc === "T" ? `T${source.section}` : source.section);

const isSource = (v: unknown): v is { doc: string; section: string } =>
  typeof v === "object" && v !== null && "doc" in v && "section" in v && typeof v.doc === "string" && typeof v.section === "string";

const str = (o: object, key: string): string | undefined => {
  const v: unknown = (o as Record<string, unknown>)[key];
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
};

/** What an item citing a section says, in one line: a fact's text, a number with its label… */
function sayingOf(item: object): string | null {
  const parts = [
    str(item, "title"),
    str(item, "text") ?? str(item, "note") ?? str(item, "does"),
    str(item, "value") !== undefined ? `${str(item, "value")} ${str(item, "unit") ?? ""} ${str(item, "label") ?? ""}`.trim() : undefined,
    str(item, "symbol"),
  ].filter((p): p is string => p !== undefined && p !== "");
  return parts.length > 0 ? parts.join(": ").replace(/<[^>]+>/g, "") : null;
}

/** The chip content that cites a section (by its `source`), each saying once, in content order. */
export function citingTexts(content: unknown, sectionId: string): string[] {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === "object" && v !== null) {
      const source: unknown = (v as Record<string, unknown>).source;
      if (isSource(source) && sectionIdOf(source) === sectionId) {
        const saying = sayingOf(v);
        if (saying) out.add(saying);
      }
      Object.values(v).forEach(walk);
    }
  };
  walk(content);
  return [...out];
}

/** The block whose chapter holds a section: the deepest chapter that is the section or its ancestor. */
export function relatedBlock(blocks: readonly ChipBlock[], sectionId: string): ChipBlock | undefined {
  let best: { block: ChipBlock; depth: number } | undefined;
  for (const block of blocks) {
    const chapter = sectionIdOf(block.chapter);
    if (!chapter || (sectionId !== chapter && !sectionId.startsWith(`${chapter}.`))) continue;
    const depth = chapter.split(".").length;
    if (!best || depth > best.depth) best = { block, depth };
  }
  return best?.block;
}

export interface Neighbours {
  readonly trail: readonly IndexEntry[];
  readonly prev?: IndexEntry;
  readonly next?: IndexEntry;
  readonly children: readonly IndexEntry[];
}

/** A section's parents (outermost first), its previous and next siblings, and its children. */
export function neighboursOf(index: readonly IndexEntry[], id: string): Neighbours {
  const byId = new Map(index.map((e) => [e.id, e]));
  const trail: IndexEntry[] = [];
  for (let p = byId.get(id)?.parent; p !== undefined; p = byId.get(p)?.parent) {
    const entry = byId.get(p);
    if (!entry) break;
    trail.unshift(entry);
  }
  const self = byId.get(id);
  const parent = self?.parent !== undefined ? byId.get(self.parent) : undefined;
  const siblings = parent
    ? parent.children
    : index.filter((e) => e.parent === undefined && e.doc === self?.doc).map((e) => e.id);
  const at = siblings.indexOf(id);
  const entry = (i: number) => (i >= 0 ? byId.get(siblings[i] ?? "") : undefined);
  const prev = at > 0 ? entry(at - 1) : undefined;
  const next = at >= 0 ? entry(at + 1) : undefined;
  return {
    trail,
    ...(prev ? { prev } : {}),
    ...(next ? { next } : {}),
    children: (self?.children ?? []).flatMap((c) => byId.get(c) ?? []),
  };
}
