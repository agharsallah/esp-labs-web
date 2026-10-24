import { type RefObject, useEffect, useEffectEvent } from "react";

/** A pointer event's position on a canvas, in normalised device coordinates (-1 … 1). */
export function toDevice(e: { clientX: number; clientY: number }, canvas: Element) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / (r.width || 1)) * 2 - 1,
    y: -((e.clientY - r.top) / (r.height || 1)) * 2 + 1,
  };
}

/**
 * Follows the pointer over a canvas without re-rendering: `onHover` gets device coordinates on
 * every move (a frame's worth at most), and null-ish coordinates (NaN) when it leaves.
 */
export function useHoverPick(
  canvas: RefObject<HTMLCanvasElement | null>,
  onHover: (x: number, y: number) => void,
): void {
  const hover = useEffectEvent(onHover);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const move = (e: PointerEvent) => {
      const p = toDevice(e, node);
      hover(p.x, p.y);
    };
    const leave = () => hover(Number.NaN, Number.NaN);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [canvas]);
}
