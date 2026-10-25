import { useEffect, useState } from "react";
import { nextCount, weightOf } from "../logic/progressive";
import { passageRange } from "../logic/text";
import type { Block } from "../schema";
import { BlockView } from "./BlockView";
import styles from "./reader.module.css";

const idle = (run: () => void): (() => void) => {
  if (typeof requestIdleCallback === "function") {
    const handle = requestIdleCallback(run, { timeout: 400 });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(run, 30);
  return () => clearTimeout(handle);
};

/**
 * The section's blocks, rendered a slice at a time: the first screens (and the passage to
 * highlight) at once, the rest on idle, so a 100 KB register chapter opens without a jank.
 */
export function SectionBody({ blocks, target }: { blocks: readonly Block[]; target: number | null }) {
  const weights = blocks.map(weightOf);
  const targetIndex =
    target === null
      ? -1
      : blocks.findIndex((b) => {
          const range = passageRange(b);
          return range !== null && range[0] <= target && target <= range[1];
        });
  const [count, setCount] = useState(() => nextCount(weights, 0, targetIndex + 1));
  useEffect(() => {
    if (count >= weights.length) return undefined;
    return idle(() => setCount((c) => nextCount(weights, c)));
  }, [count, weights]);
  return (
    <div className={styles.body} lang="en" dir="ltr">
      {blocks.slice(0, count).map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}
