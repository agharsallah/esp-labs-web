// Prev/next navigation along a list, by id.

export function neighbours<T extends { readonly id: string }>(
  list: readonly T[],
  id: string,
): { prev: T | undefined; next: T | undefined } {
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return { prev: undefined, next: undefined };
  return { prev: list[i - 1], next: list[i + 1] };
}
