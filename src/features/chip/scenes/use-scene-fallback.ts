import { type RefObject, useEffect, useEffectEvent, useState } from "react";
import { useFrameLoop } from "@/lib/animation";
import type { StageStatus } from "@/ui/stage3d/use-stage";
import { frameBudget } from "./floorplan";

/**
 * Calls `onFallback` once when a scene should give way to its flat version: three.js or WebGL
 * failed, or a phone-sized viewport can't hold 20 ms frames (see frameBudget).
 */
export function useSceneFallback(
  box: RefObject<Element | null>,
  status: StageStatus,
  onFallback: () => void,
): void {
  const [judge] = useState(frameBudget);
  const [slow, setSlow] = useState(false);
  const fallBack = useEffectEvent(onFallback);
  useEffect(() => {
    if (status === "failed" || slow) fallBack();
  }, [status, slow]);
  useFrameLoop(
    box,
    ({ dt }) => {
      if (judge(dt, window.innerWidth)) setSlow(true);
    },
    status === "ready" && !slow,
  );
}
