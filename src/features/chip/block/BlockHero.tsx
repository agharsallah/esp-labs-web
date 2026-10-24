import { useTranslation } from "react-i18next";
import type { ChipBlock } from "@/domain/chip";
import { BlockBus } from "../scenes/BlockBus";

/**
 * The full block page's hero: the CPU talking to the block, particles flowing at the block's
 * speed relative to its fastest peer. Signal names come from the chip catalogue (block.lines).
 */
export function BlockHero({ block }: { block: ChipBlock }) {
  const { t } = useTranslation("chip");
  const all: Readonly<Partial<Record<string, readonly string[]>>> = t("block.lines", { returnObjects: true });
  const lines = all[block.id] ?? all.default ?? [];
  const rate = block.spark ? Math.min(1, Math.max(0.1, block.spark.value / block.spark.max)) : 0.4;
  return <BlockBus name={block.name} family={block.family} rate={rate} lines={lines} />;
}
