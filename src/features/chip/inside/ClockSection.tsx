import { useTranslation } from "react-i18next";
import type { ClockEdge, ClockNode } from "@/domain/chip";
import { FlowTree } from "@/ui/charts";
import { useNumber } from "../hooks/use-format";

/** The clock tree: sources, the PLL and dividers down to the blocks they clock. */
export function ClockSection({ nodes, edges }: { nodes: readonly ClockNode[]; edges: readonly ClockEdge[] }) {
  const { t } = useTranslation("chip");
  const num = useNumber();
  const mhz = (values: readonly number[]) => t("inside.clocks.mhz", { value: values.map((v) => num(v)).join(" / ") });
  return (
    <FlowTree
      caption={t("inside.clocks.caption")}
      nodes={nodes.map((n) => ({ id: n.id, label: n.name, detail: n.mhz ? mhz(n.mhz) : undefined }))}
      edges={edges}
      color="--fam-timing"
    />
  );
}
