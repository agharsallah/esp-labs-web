import { useTranslation } from "react-i18next";
import { StageBox } from "@/ui/stage3d/StageBox";
import { useStage3d } from "@/ui/stage3d/use-stage";
import type { BlockBusProps } from "./BlockBus";
import { BUS_STAGE, buildBusScene } from "./bus-scene";
import { useSceneFallback } from "./use-scene-fallback";

/** The bus's 3D stage. */
export function BusStage({ name, family, rate, lines, onFallback }: BlockBusProps & { onFallback: () => void }) {
  const { t } = useTranslation("chip");
  const { boxRef, canvasRef, labelsRef, stageRef, status } = useStage3d(BUS_STAGE, (T, S) =>
    buildBusScene(T, S, {
      family,
      rate,
      lines,
      cpuLabel: t("scenes.bus.cpu"),
      peripheralLabel: name,
    }),
  );
  useSceneFallback(boxRef, status, onFallback);
  return (
    <StageBox
      boxRef={boxRef}
      canvasRef={canvasRef}
      labelsRef={labelsRef}
      stageRef={stageRef}
      status={status}
      label={t("scenes.bus.model", { name })}
      fallback={t("scenes.bus.fallback")}
    />
  );
}
