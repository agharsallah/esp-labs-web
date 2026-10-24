import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
// Type-only: the chip-block drawings stay in their own chunk (chip-registry.ts).
import type { ChipPartName } from "./chip-registry";
import { PARTS, type PartName } from "./registry";
import styles from "./parts.module.css";

export interface PartIconProps<N extends string> {
  name: N;
  size?: number;
  label?: string | true;
  className?: string;
}

/**
 * A part from the library: a small isometric illustration in the design's colours. Decorative
 * unless given a label; `label` true uses the part's own name.
 */
export function PartIcon(props: PartIconProps<PartName>) {
  return <PartFrame {...props} part={PARTS[props.name]} />;
}

/** Draws any registered part (the main library or the chip blocks) in the shared 64 × 64 frame. */
export function PartFrame({
  name,
  part,
  size = 64,
  label,
  className,
}: PartIconProps<PartName | ChipPartName> & { part: { draw: () => ReactNode; scale?: number } }) {
  const { t } = useTranslation("parts");
  const { draw: Draw, scale = 1 } = part;
  const name_ = label === true ? t(`names.${name}`) : label;
  return (
    <svg
      className={`${styles.icon} ${className ?? ""}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={name_ ? "img" : undefined}
      aria-label={name_}
      aria-hidden={name_ ? undefined : true}
      focusable="false"
    >
      <g
        transform={scale === 1 ? undefined : `translate(32 38) scale(${scale}) translate(-32 -38)`}
      >
        <Draw />
      </g>
    </svg>
  );
}
