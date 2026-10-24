import type { IconName } from "@/ui/Icon";
import type { NumKind, RefDoc } from "../schema";

/** Each document's badge icon. */
export const DOC_ICON: Readonly<Record<RefDoc, IconName>> = {
  A: "board",
  M: "module",
  C: "chip",
  T: "book",
  X: "book",
};

/** Each kind of number's card icon. */
export const NUM_ICON: Readonly<Record<NumKind, IconName>> = {
  voltage: "volt",
  current: "current",
  frequency: "frequency",
  size: "size",
  time: "time",
  power: "power",
  other: "sliders",
};
