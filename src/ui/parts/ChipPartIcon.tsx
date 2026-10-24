import { CHIP_PARTS, type ChipPartName } from "./chip-registry";
import { PartFrame, type PartIconProps } from "./PartIcon";

/** A chip-block drawing, in the same frame as every part (see chip-registry.ts). */
export function ChipPartIcon(props: PartIconProps<ChipPartName>) {
  return <PartFrame {...props} part={CHIP_PARTS[props.name]} />;
}
