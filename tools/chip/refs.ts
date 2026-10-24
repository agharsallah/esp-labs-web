// The pure part of the chip reference check: which section ids a reference file has, which ones
// the chip content cites, and which citations point nowhere.

/** Heading numbers of the reference: "C2.3.5" in "#### C2.3.5 Peripheral Pin Assignment". */
export function headingIds(markdown: string): Set<string> {
  const ids = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const m = /^#{1,6}\s+([A-Z]?\d+[A-Z]?(?:\.\d+)*)\s/.exec(line);
    if (m?.[1]) ids.add(m[1]);
  }
  return ids;
}

/**
 * Section ids cited by a content file: `section: "26.2"`, and the short helpers
 * `C("C2.6")` / `T("4.3.2")` that blocks.ts uses to build a SourceRef.
 */
export function citedSections(source: string): string[] {
  return [...source.matchAll(/(?:\bsection:\s*|\b[ACMTX]\(\s*)"([^"]+)"/g)].flatMap((m) =>
    m[1] ? [m[1]] : [],
  );
}

/** The cited sections the reference lacks, each once, in citation order. */
export function missingSections(cited: readonly string[], known: ReadonlySet<string>): string[] {
  return [...new Set(cited)].filter((s) => !known.has(s));
}
