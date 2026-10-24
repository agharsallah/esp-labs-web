import { useTranslation } from "react-i18next";
import { Icon } from "@/ui/Icon";
import styles from "./scenes.module.css";

interface LayerStepperProps {
  captions: readonly string[];
  layer: number;
  onStep: (layer: number) => void;
}

/** Previous, a dot per layer, next: the descent without scrolling, for reduced motion. */
export function LayerStepper({ captions, layer, onStep }: LayerStepperProps) {
  const { t } = useTranslation("chip");
  const last = captions.length - 1;
  return (
    <nav className={styles.stepper} aria-label={t("scenes.descent.stepper")}>
      <button
        type="button"
        disabled={layer <= 0}
        onClick={() => onStep(layer - 1)}
        aria-label={t("scenes.descent.prev")}
      >
        <Icon name="back" size={16} />
      </button>
      <ol className={styles.dots}>
        {captions.map((caption, i) => (
          <li key={caption}>
            <button
              type="button"
              aria-current={i === layer ? "step" : undefined}
              aria-label={t("scenes.descent.layer", { n: i + 1, count: captions.length, caption })}
              onClick={() => onStep(i)}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={layer >= last}
        onClick={() => onStep(layer + 1)}
        aria-label={t("scenes.descent.next")}
      >
        <Icon name="arrow" size={16} />
      </button>
    </nav>
  );
}
