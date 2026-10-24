import type { RefDoc } from "./ast.ts";

// Splits the reference into sections by its numbered headings. A section id is the heading number
// as written ("C2.3.5", "26.4", "M3.3", "A1.1", "X1", and "26" for a Part T chapter). A section's
// body runs up to the next numbered heading, so it stops at its first child; headings without a
// number ("Register 26.1. …", "Features") stay inside the body. A number seen twice keeps its
// first heading; the repeat is body text.

export interface RawSection {
  readonly id: string;
  readonly doc: RefDoc;
  readonly title: string;
  readonly level: number;
  readonly parent?: string;
  readonly children: string[];
  readonly body: string[];
}

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const NUMBERED = /^([AMCX]?\d+(?:\.\d+)*)\s+(\S.*)$/;

/** The document a section id belongs to: its letter, or T for bare numbers. */
export function docOf(id: string): RefDoc {
  const first = id.charAt(0);
  return first === "A" || first === "M" || first === "C" || first === "X" ? first : "T";
}

/** GitHub's heading anchor: "26.2 Features" → "262-features". */
export function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

export interface SplitResult {
  readonly sections: ReadonlyMap<string, RawSection>;
  /** Heading anchors ("262-features") → section id, for the file's own links. */
  readonly anchors: ReadonlyMap<string, string>;
}

/** A fence opened at the end of a text line ("For example: ```text") moves to a line of its own. */
export function normalizeFences(lines: readonly string[]): string[] {
  return lines.flatMap((line) => {
    if (!line.includes("```")) return [line];
    const m = /^(.*\S.*?)\s*(```\w*)\s*$/.exec(line);
    return m?.[1] && m[2] && !/^\s*```/.test(line) && (line.match(/```/g) ?? []).length % 2 === 1 ? [m[1], m[2]] : [line];
  });
}

export function splitSections(markdown: string): SplitResult {
  const sections = new Map<string, RawSection>();
  const anchors = new Map<string, string>();
  const stack: RawSection[] = [];
  let current: RawSection | null = null;
  let fence = false;
  for (const line of normalizeFences(markdown.split(/\r?\n/))) {
    if (/^\s*```/.test(line)) fence = !fence;
    const h = fence ? null : HEADING.exec(line);
    const m = h?.[2] ? NUMBERED.exec(h[2]) : null;
    const id = m?.[1];
    if (h?.[1] && h[2] && m?.[2] && id && !sections.has(id)) {
      const level = h[1].length;
      while ((stack.at(-1)?.level ?? 0) >= level) stack.pop();
      const parent = stack.at(-1);
      const section: RawSection = {
        id,
        doc: docOf(id),
        title: m[2].replace(/\*/g, ""),
        level,
        ...(parent ? { parent: parent.id } : {}),
        children: [],
        body: [],
      };
      parent?.children.push(id);
      sections.set(id, section);
      anchors.set(slugify(h[2]), id);
      stack.push(section);
      current = section;
      continue;
    }
    // Part headings ("# Part T: …") end the open sections without starting one.
    if (h?.[1] && h[1].length === 1) {
      stack.length = 0;
      current = null;
      continue;
    }
    current?.body.push(line);
  }
  return { sections, anchors };
}
