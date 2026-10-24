export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** True when two boxes, each grown by `margin`, share any area. */
export function overlaps(a: Box, b: Box, margin = 0): boolean {
  return (
    a.x - margin < b.x + b.width + margin &&
    b.x - margin < a.x + a.width + margin &&
    a.y - margin < b.y + b.height + margin &&
    b.y - margin < a.y + a.height + margin
  );
}

/**
 * Places each label at the first of its spots (box centre) where it clears every obstacle and
 * every label placed before it; a label with no such spot gets `undefined` and is not drawn.
 */
export function placeLabels(
  labels: readonly { width: number; height: number; spots: readonly { x: number; y: number }[] }[],
  obstacles: readonly Box[],
  margin = 2,
): (Box | undefined)[] {
  const taken: Box[] = [...obstacles];
  return labels.map((label) => {
    for (const s of label.spots) {
      const box = { x: s.x - label.width / 2, y: s.y - label.height / 2, width: label.width, height: label.height };
      if (!taken.some((o) => overlaps(box, o, margin))) {
        taken.push(box);
        return box;
      }
    }
    return undefined;
  });
}
