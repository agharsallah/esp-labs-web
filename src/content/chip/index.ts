import type {
  ChipBlock,
  ChipFact,
  ChipPin,
  ClockEdge,
  ClockNode,
  Gotcha,
  HeadlineNumber,
  MemoryRegion,
  PowerMode,
} from "@/domain/chip";
import { CHIP_BLOCKS } from "./blocks";
import { CLOCK_EDGES, CLOCK_NODES } from "./clocks";
import { HEADLINE_NUMBERS, HOME_FACTS } from "./facts";
import { CHIP_GOTCHAS } from "./gotchas";
import { CHIP_MEMORY } from "./memory";
import { CHIP_PINS } from "./pins";
import { POWER_MODES } from "./power";

// Everything the chip pages show, in one object: loaded lazily by chipContentQuery
// (src/content/queries.ts) and localized with the "chip" overlay.

export interface ChipContent {
  readonly headline: readonly HeadlineNumber[];
  readonly facts: readonly ChipFact[];
  readonly blocks: readonly ChipBlock[];
  readonly pins: readonly ChipPin[];
  readonly gotchas: readonly Gotcha[];
  readonly memory: readonly MemoryRegion[];
  readonly clocks: { readonly nodes: readonly ClockNode[]; readonly edges: readonly ClockEdge[] };
  readonly power: readonly PowerMode[];
}

export const CHIP: ChipContent = {
  headline: HEADLINE_NUMBERS,
  facts: HOME_FACTS,
  blocks: CHIP_BLOCKS,
  pins: CHIP_PINS,
  gotchas: CHIP_GOTCHAS,
  memory: CHIP_MEMORY,
  clocks: { nodes: CLOCK_NODES, edges: CLOCK_EDGES },
  power: POWER_MODES,
};
