import { useTranslation } from "react-i18next";
import type { ChipPin } from "@/domain/chip";
import { Marker } from "../ui/Marker";
import styles from "./pins.module.css";

/** The pins read at reset, with what each one picks. */
export function StrappingPanel({ pins }: { pins: readonly ChipPin[] }) {
  const { t } = useTranslation("chip");
  const straps = pins.filter((p) => p.strapping);
  return (
    <ul className={styles.straps}>
      {straps.map((p) => (
        <li key={p.gpio}>
          <Marker kind="gotcha" />
          <strong>{t("pins.pin", { n: p.gpio })}</strong>
          <span>{p.strapping}</span>
        </li>
      ))}
    </ul>
  );
}
