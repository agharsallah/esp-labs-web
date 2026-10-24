import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StageBox } from "@/ui/stage3d/StageBox";
import { useStage3d } from "@/ui/stage3d/use-stage";
import { buildDieScene, dieStage, type DieScene } from "./die-scene";
import type { Floorplan } from "./floorplan";
import styles from "./scenes.module.css";
import { toDevice, useHoverPick } from "./use-hover-pick";
import { useSceneFallback } from "./use-scene-fallback";

interface DieStageProps {
  plan: Floorplan;
  lit: string | null;
  onLight: (id: string | null) => void;
  onBlockPick?: (id: string) => void;
  onFallback: () => void;
}

/** The standalone die's 3D stage; the lit tile is shared with the list beside it. */
export function DieStage({ plan, lit, onLight, onBlockPick, onFallback }: DieStageProps) {
  const { t } = useTranslation("chip");
  const scene = useRef<DieScene | null>(null);
  const { boxRef, canvasRef, labelsRef, stageRef, status } = useStage3d(dieStage(plan), (T, S) => {
    scene.current = buildDieScene(T, S, plan);
  });
  useSceneFallback(boxRef, status, onFallback);
  useHoverPick(canvasRef, (x, y) => onLight(scene.current?.pick(x, y) ?? null));
  useEffect(() => scene.current?.lift(lit), [lit, status]);

  return (
    <StageBox
      boxRef={boxRef}
      canvasRef={canvasRef}
      labelsRef={labelsRef}
      stageRef={stageRef}
      status={status}
      className={styles.dieStage}
      label={t("scenes.die.model")}
      fallback={t("scenes.die.fallback")}
      onClick={(e) => {
        const canvas = canvasRef.current;
        if (!canvas || !stageRef.current?.wasClick()) return;
        const p = toDevice(e, canvas);
        const id = scene.current?.pick(p.x, p.y);
        if (id) onBlockPick?.(id);
      }}
    />
  );
}
