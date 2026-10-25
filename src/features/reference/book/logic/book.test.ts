import { describe, expect, it } from "vitest";
import { buildReference } from "../../../../../tools/reference/build";
import { FIXTURE } from "../../../../../tools/reference/fixture";
import type { IndexEntry } from "../../schema";
import { bookOf, minutesOfSize, placeholderHeight, shareRead, shownAncestor } from "./book";

const index = buildReference(FIXTURE).index;
const byId = new Map(index.map((e) => [e.id, e]));

describe("the reference as a book", () => {
  it("groups chapters by document, in index order, each with its sections in reading order", () => {
    const book = bookOf(index);
    expect(book.parts.map((p) => p.doc)).toEqual(["C", "T"]);
    expect(book.chapters.map((c) => c.entry.id)).toEqual(["C2", "26"]);
    expect(book.chapters[1]?.sections.map((s) => s.id)).toEqual(["26", "26.1", "26.2", "26.4"]);
    expect(book.chapterOf.get("26.2")).toBe(1);
    expect(book.chapterOf.get("C2.3.5")).toBe(0);
    expect(book.depth.get("26")).toBe(1);
    expect(book.depth.get("C2.3.5")).toBe(3);
    expect(book.chapters[1]?.size).toBe(book.chapters[1]?.sections.reduce((s, e) => s + e.size, 0));
  });

  it("shows a deep section under its ancestor at the contents' depth", () => {
    const book = bookOf(index);
    expect(shownAncestor(book, byId, "C2.3.5", 2)).toBe("C2.3");
    expect(shownAncestor(book, byId, "26.2", 2)).toBe("26.2");
    expect(shownAncestor(book, byId, "26", 2)).toBe("26");
  });

  it("counts what was read, leaving out headings without text", () => {
    const entry = (id: string, size: number): IndexEntry => ({ id, doc: "T", title: id, children: [], size });
    const sections = [entry("1", 0), entry("1.1", 300), entry("1.2", 500)];
    expect(shareRead(sections, new Set())).toEqual({ read: 0, total: 2 });
    expect(shareRead(sections, new Set(["1", "1.2"]))).toEqual({ read: 1, total: 2 });
  });

  it("estimates reading time and placeholder heights from the text's size", () => {
    expect(minutesOfSize(0)).toBe(1);
    expect(minutesOfSize(6 * 220 * 10)).toBe(10);
    expect(placeholderHeight(0)).toBe(72);
    expect(placeholderHeight(900)).toBe(72 + 10 * 24);
    expect(placeholderHeight(10_000_000)).toBe(2400);
  });
});
