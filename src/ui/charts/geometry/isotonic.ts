/**
 * Least-squares non-decreasing fit (pool adjacent violators): the closest sequence to `values`
 * that never goes down. Used to place items in a column as near their wanted heights as their
 * order allows.
 */
export function isotonic(values: readonly number[]): number[] {
  const blocks: { sum: number; count: number }[] = [];
  for (const v of values) {
    blocks.push({ sum: v, count: 1 });
    for (;;) {
      const last = blocks.at(-1);
      const prev = blocks.at(-2);
      if (!last || !prev || prev.sum / prev.count <= last.sum / last.count) break;
      blocks.pop();
      prev.sum += last.sum;
      prev.count += last.count;
    }
  }
  return blocks.flatMap((b) => Array.from({ length: b.count }, () => b.sum / b.count));
}
