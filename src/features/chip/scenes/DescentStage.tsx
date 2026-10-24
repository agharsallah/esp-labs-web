import { type RefObject, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { scenePosition } from "@/lib/scroll-progress";
import { StageBox } from "@/ui/stage3d/StageBox";
import { useStage3d } from "@/ui/stage3d/use-stage";
import { buildDescentScene, DESCENT_LAYERS, DESCENT_STAGE, type DescentScene } from "./descent-scene";
import type { Floorplan } from "./floorplan";
import styles from "./scenes.module.css";
import { toDevice, useHoverPick } from "./use-hover-pick";
import { useSceneFallback } from "./use-scene-fallback";

interface DescentStageProps {
  plan: Floorplan;
  /** The scroll progress (0-1), read every frame while scrubbing. */
  progress: RefObject<number>;
  /** A layer to show instead of following the scroll (the stepper, with reduced motion). */
  step: number | null;
  onBlockPick?: (id: string) => void;
  onFallback: () => void;
}

/** The descent's 3D stage: builds the scene once and points it at the scroll or the stepper. */
export function DescentStage({ plan, progress, step, onBlockPick, onFallback }: DescentStageProps) {
  const { t } = useTranslation("chip");
  const scene = useRef<DescentScene | null>(null);
  const { boxRef, canvasRef, labelsRef, stageRef, status } = useStage3d(DESCENT_STAGE, (T, S) => {
    scene.current = buildDescentScene(T, S, plan);
  });
  useSceneFallback(boxRef, status, onFallback);

  useEffect(() => {
    scene.current?.follow(() => step ?? scenePosition(progress.current, DESCENT_LAYERS));
  }, [step, progress, status]);
  useHoverPick(canvasRef, (x, y) => scene.current?.lift(scene.current.pick(x, y)));

  const at = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const p = toDevice(e, canvas);
    return scene.current?.pick(p.x, p.y) ?? null;
  };

  return (
    <StageBox
      boxRef={boxRef}
      canvasRef={canvasRef}
      labelsRef={labelsRef}
      stageRef={stageRef}
      status={status}
      className={styles.fill}
      label={t("scenes.descent.model")}
      fallback={t("scenes.descent.fallback")}
      onClick={(e) => {
        const id = stageRef.current?.wasClick() ? at(e) : null;
        if (id) onBlockPick?.(id);
      }}
    />
  );
}
