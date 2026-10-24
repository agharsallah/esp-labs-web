import type { Track } from "@/domain/track";

// "In our labs" on a block page: the lessons that use the block, grouped by track.

export interface TrackGroup<L> {
  readonly track: Track;
  readonly lessons: readonly L[];
}

/**
 * The lessons grouped by the track that lists them, in the tracks' order and each track's lesson
 * order. Tracks with none are left out, and so are lessons no track lists.
 */
export function groupByTrack<L extends { readonly id: string }>(
  lessons: readonly L[],
  tracks: readonly Track[],
): TrackGroup<L>[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return tracks.flatMap((track) => {
    const own = track.lessonIds.flatMap((id) => {
      const l = byId.get(id);
      return l ? [l] : [];
    });
    return own.length ? [{ track, lessons: own }] : [];
  });
}
