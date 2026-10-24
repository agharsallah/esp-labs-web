import * as z from "zod/mini";
import type { Block, IndexEntry, Inline, SectionDoc, TableViz } from "../../../tools/reference/ast";

// The reference documents written by tools/reference/vite-plugin.ts, validated when fetched.
// The types are the build's own (tools/reference/ast.ts), so the two sides cannot drift apart.

export type { Block, IndexEntry, Inline, NumKind, RefDoc, SectionDoc, Sentence, TableRow, TableViz } from "../../../tools/reference/ast";

const Doc = z.enum(["A", "M", "C", "T", "X"]);
const Kind = z.enum(["voltage", "current", "frequency", "size", "time", "power", "other"]);
const leaf = <T extends string>(t: T) => z.object({ t: z.literal(t), v: z.string() });

export const InlineSchema: z.ZodMiniType<Inline> = z.lazy(() =>
  z.discriminatedUnion("t", [
    leaf("text"),
    leaf("code"),
    leaf("sub"),
    leaf("reg"),
    leaf("field"),
    z.object({ t: z.literal("br") }),
    z.object({ t: z.literal("b"), c: z.array(InlineSchema) }),
    z.object({ t: z.literal("i"), c: z.array(InlineSchema) }),
    z.object({ t: z.literal("link"), href: z.string().check(z.regex(/^(?:https?:|mailto:)/)), c: z.array(InlineSchema) }),
    z.object({ t: z.literal("xref"), id: z.string(), c: z.array(InlineSchema) }),
    z.object({ t: z.literal("num"), v: z.string(), k: Kind }),
    z.object({ t: z.literal("pin"), v: z.string(), n: z.number() }),
    z.object({ t: z.literal("block"), v: z.string(), id: z.string() }),
  ]),
);

const Inlines = z.array(InlineSchema);
const Sentence = z.object({ n: z.number(), c: Inlines, warn: z.optional(z.literal(true)) });

const VizSchema: z.ZodMiniType<TableViz> = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("range"),
    groups: z.array(
      z.object({
        unit: z.string(),
        log: z.boolean(),
        items: z.array(z.object({ label: z.string(), min: z.number(), typ: z.optional(z.number()), max: z.number() })),
      }),
    ),
  }),
  z.object({
    kind: z.literal("compare"),
    unit: z.string(),
    log: z.boolean(),
    items: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
  z.object({
    kind: z.literal("address"),
    regions: z.array(z.object({ label: z.string(), start: z.number(), end: z.number() })),
  }),
  z.object({
    kind: z.literal("pins"),
    columns: z.array(z.string()),
    rows: z.array(z.object({ label: z.string(), pin: z.optional(z.number()), cells: z.array(z.nullable(z.string())) })),
  }),
  z.object({
    kind: z.literal("timing"),
    unit: z.string(),
    items: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
]);

export const BlockSchema: z.ZodMiniType<Block> = z.lazy(() =>
  z.discriminatedUnion("t", [
    z.object({ t: z.literal("h"), level: z.number(), c: Inlines }),
    z.object({ t: z.literal("p"), s: z.array(Sentence) }),
    z.object({
      t: z.literal("list"),
      ordered: z.boolean(),
      start: z.optional(z.number()),
      items: z.array(z.array(BlockSchema)),
    }),
    z.object({ t: z.literal("quote"), c: z.array(BlockSchema) }),
    z.object({ t: z.literal("pre"), v: z.string(), lang: z.optional(z.string()) }),
    z.object({
      t: z.literal("fig"),
      src: z.string().check(z.regex(/^images\/[\w.-]+$/)),
      alt: z.string(),
      caption: z.optional(z.string()),
    }),
    z.object({
      t: z.literal("table"),
      caption: z.optional(z.string()),
      head: z.array(Inlines),
      rows: z.array(z.object({ n: z.number(), c: z.array(Inlines) })),
      viz: z.optional(VizSchema),
    }),
    z.object({
      t: z.literal("register"),
      n: z.number(),
      num: z.string(),
      name: z.string(),
      offset: z.string(),
      fields: z.array(
        z.object({ bits: z.string(), field: z.string(), access: z.string(), reset: z.string(), desc: Inlines }),
      ),
    }),
  ]),
);

export const ReferenceIndexSchema: z.ZodMiniType<{ sections: readonly IndexEntry[] }> = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      doc: Doc,
      title: z.string(),
      parent: z.optional(z.string()),
      children: z.array(z.string()),
      size: z.number(),
    }),
  ),
});

export const SectionSchema: z.ZodMiniType<SectionDoc> = z.object({
  id: z.string(),
  doc: Doc,
  title: z.string(),
  words: z.number(),
  blocks: z.array(BlockSchema),
});
