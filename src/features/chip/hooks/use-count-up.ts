import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/media";
import { countUpValue } from "../logic/count-up";

const DURATION = 1100;

/** Counts from 0 to `target` once `start` turns true; reduced motion shows the target at once. */
export function useCountUp(target: number, start: boolean): number {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!start || reduced) return undefined;
    let frame = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - begin) / DURATION);
      setT(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, reduced]);
  return reduced ? target : countUpValue(target, t);
}
