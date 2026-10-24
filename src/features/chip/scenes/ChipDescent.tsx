import { type CSSProperties, type ReactNode, useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/lib/media";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { DESCENT_LAYERS } from "./descent-scene";
import { DescentStage } from "./DescentStage";
import { FlatFloorplan } from "./FlatFloorplan";
import { type DieBlock, floorplan } from "./floorplan";
import { LayerStepper } from "./LayerStepper";
import styles from "./scenes.module.css";

export interface ChipDescentProps {
  blocks: readonly DieBlock[];
  /** One caption per layer (board, module, can, package, die), for the stepper and screen readers. */
  layerCaptions: readonly string[];
  onBlockPick?: (id: string) => void;
  /** Called when the layer changes. */
  onLayerChange?: (layer: number) => void;
  /** The page's caption card for a layer, drawn under the pinned stage. */
  children?: (layer: number) => ReactNode;
}

/**
 * From the board down to the die. Scrolling through the tall section scrubs the camera through
 * five layers; with reduced motion it is one screen with a layer stepper instead. Falls back to
 * the flat floor plan when 3D can't run or is too slow on a phone.
 */
export function ChipDescent({
  blocks,
  layerCaptions,
  onBlockPick,
  onLayerChange,
  children,
}: ChipDescentProps) {
  const { t } = useTranslation("chip");
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [flat, setFlat] = useState(false);
  const [step, setStep] = useState(0);
  const scrubbing = !reduced && !flat;
  const { progress, layer: scrolled } = useScrollProgress(section, DESCENT_LAYERS, scrubbing);
  const layer = scrubbing ? scrolled : step;
  const plan = floorplan(blocks);

  const changed = useEffectEvent((l: number) => onLayerChange?.(l));
  useEffect(() => changed(layer), [layer]);

  return (
    <section
      ref={section}
      className={styles.descent}
      data-mode={scrubbing ? "scroll" : "step"}
      style={{ "--layers": DESCENT_LAYERS } as CSSProperties}
    >
      <div className={styles.pinned}>
        {flat ? (
          <FlatFloorplan plan={plan} onPick={onBlockPick} />
        ) : (
          <DescentStage
            plan={plan}
            progress={progress}
            step={scrubbing ? null : step}
            onBlockPick={onBlockPick}
            onFallback={() => setFlat(true)}
          />
        )}
        <div className={styles.caption}>
          {children?.(layer)}
          {!scrubbing && !flat ? (
            <LayerStepper captions={layerCaptions} layer={step} onStep={setStep} />
          ) : null}
          <p className="visually-hidden" aria-live="polite">
            {t("scenes.descent.layer", {
              n: layer + 1,
              count: DESCENT_LAYERS,
              caption: layerCaptions[layer] ?? "",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
