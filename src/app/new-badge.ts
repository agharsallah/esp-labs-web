// A "New" sign on a top-bar section for a few days after it ships, then gone on its own.

/** Shown until the end of `until` (YYYY-MM-DD), in the reader's own time zone. */
export function isNewUntil(until: string, now: Date = new Date()): boolean {
  const [y, m, d] = until.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) return false;
  return now < new Date(y, m - 1, d + 1);
}
