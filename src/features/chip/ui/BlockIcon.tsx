import { CHIP_PART_NAMES, type ChipPartName } from "@/ui/parts/chip-registry";
import { ChipPartIcon } from "@/ui/parts/ChipPartIcon";

const isBlockPart = (name: string): name is ChipPartName =>
  (CHIP_PART_NAMES as readonly string[]).includes(name);

/** A block's drawing (decorative); nothing if the content names an unknown part. */
export function BlockIcon({ icon, size }: { icon: string; size: number }) {
  return isBlockPart(icon) ? <ChipPartIcon name={icon} size={size} /> : null;
}
