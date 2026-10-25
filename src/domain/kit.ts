// What a lesson needs on the bench, and which lessons a given kit can build. Pure: the parts
// themselves and each lesson's list live in src/content/kit.ts.

/** One requirement: any one of these parts will do (KY-037 or INMP441). */
export type KitNeed<Id extends string = string> = readonly Id[];

export interface LessonKit<Id extends string = string> {
  /** Every requirement must be met; the board and its USB cable are always assumed. */
  readonly need: readonly KitNeed<Id>[];
  /** Parts that add to the lab but are not required. */
  readonly optional?: readonly Id[];
}

export type KitFit = "ready" | "near" | "far";

export interface KitMatch<Id extends string = string> {
  readonly fit: KitFit;
  /** The requirements the kit does not meet, in the lesson's order. */
  readonly missing: readonly KitNeed<Id>[];
}

/** How far a kit is from a lesson: ready, one part away (near), or further (far). */
export function matchKit<Id extends string>(
  kit: LessonKit<Id>,
  have: ReadonlySet<Id>,
): KitMatch<Id> {
  const missing = kit.need.filter((need) => !need.some((id) => have.has(id)));
  const fit = missing.length === 0 ? "ready" : missing.length === 1 ? "near" : "far";
  return { fit, missing };
}

/** Every part a lesson can use, required or optional. */
export const kitParts = <Id extends string>(kit: LessonKit<Id>): ReadonlySet<Id> =>
  new Set([...kit.need.flat(), ...(kit.optional ?? [])]);
