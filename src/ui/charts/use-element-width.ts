import { useState } from "react";

/**
 * The content width of an element, kept current with a ResizeObserver. Returns a callback ref and
 * the width (0 until measured, and where ResizeObserver does not exist).
 */
export function useElementWidth<T extends Element>(): [(el: T | null) => (() => void) | undefined, number] {
  const [width, setWidth] = useState(0);
  const ref = (el: T | null) => {
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined) setWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  };
  return [ref, width];
}
