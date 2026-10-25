import { useState } from "react";

/**
 * True once the element has scrolled into view, and stays true (it observes once).
 * Without IntersectionObserver (old browsers, tests) the element counts as shown at once.
 * Attach the returned callback as `ref`. A `rootMargin` ("1200px 0px") fires that far ahead.
 */
export function useInView<T extends Element>(
  threshold = 0.2,
  rootMargin = "0px",
): [ref: (el: T | null) => (() => void) | undefined, shown: boolean] {
  const [shown, setShown] = useState(false);
  const ref = (el: T | null) => {
    if (!el || shown) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  };
  return [ref, shown];
}
