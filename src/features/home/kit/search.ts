// Matching a typed query against part names: case, accents and spacing never matter, so
// "max 98357", "Lecteur" and "lecteur" all find their part.

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[\s\-_.·]+/g, "");

/** True when every word of the query appears in one of the texts. */
export function matchesQuery(query: string, texts: readonly string[]): boolean {
  const words = query.split(/\s+/).map(fold).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = texts.map(fold).join(" ");
  return words.every((w) => haystack.includes(w));
}
