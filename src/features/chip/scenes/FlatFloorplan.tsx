import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Floorplan } from "./floorplan";
import styles from "./scenes.module.css";

interface FlatFloorplanProps {
  plan: Floorplan;
  /** The lit tile, if any (hovered or focused here or on the 3D die). */
  lit?: string | null;
  onPick?: (id: string) => void;
  onLight?: (id: string | null) => void;
  /** "grid": the floor plan itself (the fallback). "chips": a compact wrapped row beside the 3D die. */
  variant?: "grid" | "chips";
}

/**
 * The die as a flat floor plan of buttons, one per block in its family's colour: the way in when
 * 3D can't run or runs slow, and (as small chips) the keyboard's way in beside the 3D die.
 */
export function FlatFloorplan({ plan, lit = null, onPick, onLight, variant = "grid" }: FlatFloorplanProps) {
  const { t } = useTranslation("chip");
  return (
    <ul
      className={variant === "chips" ? styles.chips : styles.flat}
      aria-label={t("scenes.die.list")}
      style={{ "--cols": plan.cols } as CSSProperties}
    >
      {plan.tiles.map((tile) => (
        <li
          key={tile.id}
          style={{ "--col": tile.col + 1, "--row": tile.row + 1 } as CSSProperties}
        >
          <button
            type="button"
            className={styles.tile}
            data-family={tile.family}
            data-coverage={tile.coverage}
            data-on={lit === tile.id || undefined}
            style={{ "--h": tile.height } as CSSProperties}
            aria-label={t("scenes.die.pick", {
              name: tile.name,
              coverage: t(`scenes.coverage.${tile.coverage}`),
            })}
            onClick={() => onPick?.(tile.id)}
            onPointerEnter={() => onLight?.(tile.id)}
            onPointerLeave={() => onLight?.(null)}
            onFocus={() => onLight?.(tile.id)}
            onBlur={() => onLight?.(null)}
          >
            <span className={styles.tileName}>{tile.name}</span>
            <span className={styles.bar} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
