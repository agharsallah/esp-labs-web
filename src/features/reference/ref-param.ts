import type { SourceRef } from "@/domain/chip";

// The open section lives in the URL as `?ref=<doc><section>`: "T26.2" for the TRM's §26.2, and
// "C2.3.5", "M3.3", "A1.1", "X1" for the others, whose section ids already start with their letter.

export const REF_PARAM = "ref";

/** A SourceRef → its `ref` value. */
export function refParam(source: SourceRef): string {
  return source.doc === "T" ? `T${source.section}` : source.section;
}

/** A `ref` value → the section id it opens ("T26.2" → "26.2"), or null when it is not one. */
export function sectionOfParam(param: string | null): string | null {
  if (!param) return null;
  const m = /^T?(\d+(?:\.\d+)*)$/.exec(param);
  if (m?.[1] && param.startsWith("T")) return m[1];
  return /^[AMCX]\d+(?:\.\d+)*$/.test(param) ? param : null;
}

/** A section id → its `ref` value ("26.2" → "T26.2"). */
export const paramOfSection = (id: string): string => (/^\d/.test(id) ? `T${id}` : id);

/** The current search with `ref` set (or removed with null), other params kept. */
export function withRef(search: string, id: string | null): string {
  const params = new URLSearchParams(search);
  if (id === null) params.delete(REF_PARAM);
  else params.set(REF_PARAM, paramOfSection(id));
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** A section id → the SourceRef that names it. */
export function sourceOf(id: string): SourceRef {
  const first = id.charAt(0);
  const doc = first === "A" || first === "M" || first === "C" || first === "X" ? first : "T";
  return { doc, section: id };
}
