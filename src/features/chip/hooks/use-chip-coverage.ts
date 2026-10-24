import { blockCoverage, type ChipBlock, chipProgress, type Coverage } from "@/domain/chip";
import type { LessonEntry } from "@/domain/lesson";
import { useTracks } from "@/features/navigation/use-tracks";
import { useTicks } from "@/features/progress/progress-store";

export interface ChipCoverage {
  /** Every lesson of every loaded track, in table-of-contents order. */
  readonly lessons: readonly LessonEntry[];
  /** Each block's most advanced lab state. */
  readonly coverage: ReadonlyMap<string, Coverage>;
  /** How many blocks sit at each coverage. */
  readonly tally: Record<Coverage, number>;
  readonly ticks: ReturnType<typeof useTicks>;
}

/**
 * How far the labs have taken each block, from your ticks and every track's lessons. Ticking a
 * step anywhere updates it live (the ticks store); tracks still loading count as no lessons yet.
 */
export function useChipCoverage(blocks: readonly ChipBlock[]): ChipCoverage {
  const ticks = useTicks();
  const lessons = useTracks().flatMap((t) => t.lessons ?? []);
  const coverage = new Map(blocks.map((b) => [b.id, blockCoverage(b, lessons, ticks)] as const));
  return { lessons, coverage, tally: chipProgress(blocks, lessons, ticks), ticks };
}
