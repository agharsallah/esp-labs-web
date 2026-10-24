import { type RefObject, useEffect, useRef, useState } from "react";
import { layerAt, sectionProgress } from "./scroll-progress";

/**
 * Follows how far a tall section has scrolled (see scroll-progress.ts). The scroll is read at most
 * once per frame and only while the section is on screen; the progress goes into a ref for frame
 * loops to read, and the component re-renders only when the layer changes.
 *
 * @param section the tall section (its sticky child stays pinned while it scrolls past)
 * @param layers how many equal bands the progress is cut into
 * @param active false to stop following the scroll (reduced motion steps instead)
 */
export function useScrollProgress(
  section: RefObject<Element | null>,
  layers: number,
  active = true,
): { progress: RefObject<number>; layer: number } {
  const progress = useRef(0);
  const [layer, setLayer] = useState(0);

  useEffect(() => {
    const node = section.current;
    if (!active || !node) return;
    let frame = 0;
    let listening = false;

    const read = () => {
      frame = 0;
      const p = sectionProgress(node.getBoundingClientRect(), window.innerHeight);
      progress.current = p;
      const next = layerAt(p, layers).layer;
      setLayer((l) => (l === next ? l : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("scroll", onScroll, { passive: true });
      window[method]("resize", onScroll, { passive: true });
      if (on) onScroll();
    };

    if (typeof IntersectionObserver === "undefined") listen(true);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => listen(entry?.isIntersecting ?? false));
    observer?.observe(node);
    return () => {
      observer?.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, [section, layers, active]);

  return { progress, layer };
}
