import { paramOfSection, sectionOfParam } from "../ref-param";

// A place in the book lives in the URL as `#/datasheet/read?at=T26.2` (same values as `?ref=`).

export const BOOK_PATH = "/datasheet/read";
export const AT_PARAM = "at";

/** The link to a section's place in the book. */
export const bookLink = (id: string) => ({ pathname: BOOK_PATH, search: `?${AT_PARAM}=${paramOfSection(id)}` });

/** The section an `at` value names, or null. */
export const sectionAt = (search: string): string | null => sectionOfParam(new URLSearchParams(search).get(AT_PARAM));

/** A section's DOM id in the book. */
export const domId = (id: string) => `book-${id}`;
