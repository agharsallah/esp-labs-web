// The reference reader's document model: what tools/reference builds from the Markdown file and
// what the app renders (validated again by src/features/reference/schema.ts). Short keys keep the
// per-section JSON small; the app never receives raw Markdown or HTML.

/** "A" board, "M" module, "C" chip datasheet, "T" technical reference manual, "X" appendices. */
export type RefDoc = "A" | "M" | "C" | "T" | "X";

/** What a tagged number measures, from its unit: picks the icon of its "Key information" card. */
export type NumKind = "voltage" | "current" | "frequency" | "size" | "time" | "power" | "other";

export type Inline =
  | { readonly t: "text"; readonly v: string }
  | { readonly t: "b"; readonly c: readonly Inline[] }
  | { readonly t: "i"; readonly c: readonly Inline[] }
  | { readonly t: "code"; readonly v: string }
  | { readonly t: "sub"; readonly v: string }
  | { readonly t: "br" }
  /** An external link (http, https or mailto only). */
  | { readonly t: "link"; readonly href: string; readonly c: readonly Inline[] }
  /** A link to another section of the reference, opened inside the reader. */
  | { readonly t: "xref"; readonly id: string; readonly c: readonly Inline[] }
  | { readonly t: "num"; readonly v: string; readonly k: NumKind }
  | { readonly t: "reg"; readonly v: string }
  | { readonly t: "field"; readonly v: string }
  | { readonly t: "pin"; readonly v: string; readonly n: number }
  | { readonly t: "block"; readonly v: string; readonly id: string };

/** A sentence, numbered in document order (`n`) so the reader can highlight and scroll to it. */
export interface Sentence {
  readonly n: number;
  readonly c: readonly Inline[];
  readonly warn?: true;
}

export interface RegisterField {
  readonly bits: string;
  readonly field: string;
  readonly access: string;
  readonly reset: string;
  readonly desc: readonly Inline[];
}

/** The visual a table is drawn as, chosen from the shape of its data (tools/reference/classify.ts). */
export type TableViz =
  | {
      readonly kind: "range";
      readonly groups: readonly {
        readonly unit: string;
        readonly log: boolean;
        readonly items: readonly { readonly label: string; readonly min: number; readonly typ?: number; readonly max: number }[];
      }[];
    }
  | {
      readonly kind: "compare";
      readonly unit: string;
      readonly log: boolean;
      readonly items: readonly { readonly label: string; readonly value: number }[];
    }
  | {
      readonly kind: "address";
      readonly regions: readonly { readonly label: string; readonly start: number; readonly end: number }[];
    }
  | {
      readonly kind: "pins";
      readonly columns: readonly string[];
      readonly rows: readonly { readonly label: string; readonly pin?: number; readonly cells: readonly (string | null)[] }[];
    }
  | {
      readonly kind: "timing";
      readonly unit: string;
      readonly items: readonly { readonly label: string; readonly value: number }[];
    };

export interface TableRow {
  readonly n: number;
  readonly c: readonly (readonly Inline[])[];
}

export type Block =
  | { readonly t: "h"; readonly level: number; readonly c: readonly Inline[] }
  | { readonly t: "p"; readonly s: readonly Sentence[] }
  | { readonly t: "list"; readonly ordered: boolean; readonly start?: number; readonly items: readonly (readonly Block[])[] }
  | { readonly t: "quote"; readonly c: readonly Block[] }
  | { readonly t: "pre"; readonly v: string; readonly lang?: string }
  | { readonly t: "fig"; readonly src: string; readonly alt: string; readonly caption?: string }
  | {
      readonly t: "table";
      readonly caption?: string;
      readonly head: readonly (readonly Inline[])[];
      readonly rows: readonly TableRow[];
      readonly viz?: TableViz;
    }
  | {
      readonly t: "register";
      readonly n: number;
      readonly num: string;
      readonly name: string;
      readonly offset: string;
      readonly fields: readonly RegisterField[];
    };

/** One entry of reference/index.json. */
export interface IndexEntry {
  readonly id: string;
  readonly doc: RefDoc;
  readonly title: string;
  readonly parent?: string;
  readonly children: readonly string[];
  /** Characters of Markdown in the section's own body. */
  readonly size: number;
}

/** reference/sections/<id>.json */
export interface SectionDoc {
  readonly id: string;
  readonly doc: RefDoc;
  readonly title: string;
  readonly words: number;
  readonly blocks: readonly Block[];
}
