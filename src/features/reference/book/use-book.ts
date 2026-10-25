import { useSuspenseQuery } from "@tanstack/react-query";
import { referenceIndexQuery } from "../queries";
import type { IndexEntry } from "../schema";
import { type Book, bookOf } from "./logic/book";

export interface BookData {
  readonly book: Book;
  readonly byId: ReadonlyMap<string, IndexEntry>;
}

/** The reference as a book, from its index (suspends while it loads; null without a reference). */
export function useBook(): BookData | null {
  const sections = useSuspenseQuery(referenceIndexQuery()).data?.sections;
  if (!sections) return null;
  return { book: bookOf(sections), byId: new Map(sections.map((s) => [s.id, s])) };
}
