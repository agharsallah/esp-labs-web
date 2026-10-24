import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BlockFamily } from "@/domain/chip";
import { BusStage } from "./BusStage";
import styles from "./scenes.module.css";

export interface BlockBusProps {
  /** The block's own name ("UART"), the peripheral's label. */
  name: string;
  family: BlockFamily;
  /** Relative speed, 0-1: how fast the particles flow (UART slower than SPI). */
  rate: number;
  /** One to four signal lines, by name ("SCL", "SDA"). */
  lines: readonly string[];
}

/**
 * A block page's hero: the CPU, a bus and the peripheral with its pads, particles flowing along
 * the signal lines. The lines are also listed under it, which is all that stays without 3D.
 */
export function BlockBus({ name, family, rate, lines }: BlockBusProps) {
  const { t } = useTranslation("chip");
  const [flat, setFlat] = useState(false);
  return (
    <figure className={styles.bus}>
      {flat ? null : <BusStage name={name} family={family} rate={rate} lines={lines} onFallback={() => setFlat(true)} />}
      <ul className={styles.lines} aria-label={t("scenes.bus.lines")}>
        {lines.slice(0, 4).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </figure>
  );
}
