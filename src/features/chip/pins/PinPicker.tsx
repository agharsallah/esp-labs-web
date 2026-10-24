import { useTranslation } from "react-i18next";
import type { ChipPin } from "@/domain/chip";
import { pinWarns } from "../logic/pins";
import styles from "./pins.module.css";

/** Every GPIO as a small toggle: pick one to open its card. Used and hazard pins are marked by shape; off-header pins are dashed. */
export function PinPicker({
  pins,
  picked,
  used,
  onPick,
}: {
  pins: readonly ChipPin[];
  picked: number | null;
  used: ReadonlySet<string>;
  onPick: (gpio: number | null) => void;
}) {
  const { t } = useTranslation("chip");
  return (
    <div className={styles.picker} role="group" aria-label={t("pins.pick")}>
      {pins.map((p) => (
        <button
          key={p.gpio}
          type="button"
          aria-pressed={picked === p.gpio}
          data-used={used.has(String(p.gpio)) || undefined}
          data-warn={pinWarns(p) || undefined}
          data-off={!p.onHeader || undefined}
          onClick={() => onPick(picked === p.gpio ? null : p.gpio)}
        >
          {p.gpio}
        </button>
      ))}
    </div>
  );
}
