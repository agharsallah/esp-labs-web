import type { ChipPin, Gotcha, PinFunctionKind } from "@/domain/chip";
import type { LessonEntry } from "@/domain/lesson";

// Pins page helpers: which gotchas bite a pin, and which GPIOs the labs wire up.

/** The gotchas that apply to a pin: those it lists and those that list it, without duplicates. */
export function gotchasForPin(pin: ChipPin, gotchas: readonly Gotcha[]): Gotcha[] {
  const named = new Set(pin.gotchas ?? []);
  return gotchas.filter((g) => named.has(g.id) || (g.pins ?? []).includes(pin.gpio));
}

/** GPIO numbers (as strings, "4") wired in any open lesson or its variants. */
export function pinsUsedByLessons(lessons: readonly LessonEntry[]): Set<string> {
  const used = new Set<string>();
  for (const l of lessons) {
    if (l.kind !== "lesson") continue;
    for (const p of [...(l.pins ?? []), ...(l.variants ?? []).flatMap((v) => v.pins ?? [])])
      if (/^\d+$/.test(p.pin)) used.add(p.pin);
  }
  return used;
}

/** A pin's function symbols of one kind, joined for a table cell ("ADC1_CH0 / TOUCH1"). */
export function functionsOfKind(pin: ChipPin, kind: PinFunctionKind): string {
  return pin.functions
    .filter((f) => f.kind === kind)
    .map((f) => f.symbol)
    .join(" / ");
}

/**
 * Whether a pin carries the warning mark: a header pin with a pin hazard. Off-header pins (the
 * flash bus) are out of reach anyway and are shown as such, so the mark stays rare and meaningful.
 */
export function pinWarns(pin: ChipPin): boolean {
  return pin.onHeader && (pin.gotchas?.length ?? 0) > 0;
}

/** Gotchas that name pins (pin hazards) and those about the whole chip, in content order. */
export function splitGotchas(gotchas: readonly Gotcha[]): { pins: Gotcha[]; chip: Gotcha[] } {
  return {
    pins: gotchas.filter((g) => (g.pins?.length ?? 0) > 0),
    chip: gotchas.filter((g) => (g.pins?.length ?? 0) === 0),
  };
}
