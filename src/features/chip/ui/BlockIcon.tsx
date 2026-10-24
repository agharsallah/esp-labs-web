import { PART_NAMES, type PartName } from "@/ui/parts/registry";
import { PartIcon } from "@/ui/parts/PartIcon";

const isPart = (name: string): name is PartName => (PART_NAMES as readonly string[]).includes(name);

/** A block's parts-library drawing (decorative); nothing if the content names an unknown part. */
export function BlockIcon({ icon, size }: { icon: string; size: number }) {
  return isPart(icon) ? <PartIcon name={icon} size={size} /> : null;
}
