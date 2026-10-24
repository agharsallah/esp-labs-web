import { queryOptions } from "@tanstack/react-query";
import type { LessonEntry, TrackId } from "@/domain/lesson";
import type { Locale } from "@/i18n/locales";
import { localize } from "./localize";
import { CHIP_TEXT, LESSON_TEXT } from "./text-policies";

type LessonLoader = () => Promise<readonly LessonEntry[]>;

// One chunk per track: opening a Wi-Fi lesson never downloads the sound track's text.
const LOADERS: Partial<Record<TrackId, LessonLoader>> = {
  intro: () => import("./lessons/intro").then((m) => m.introLessons),
  display: () => import("./lessons/display").then((m) => m.displayLessons),
  wifi: () => import("./lessons/wifi").then((m) => m.wifiLessons),
  rfid: () => import("./lessons/rfid").then((m) => m.rfidLessons),
  ble: () => import("./lessons/ble").then((m) => m.bleLessons),
  sound: () => import("./lessons/sound").then((m) => m.soundLessons),
};

/**
 * A track's lessons in one language: the English source with that language's text laid over it
 * (src/locales/<locale>/content/lessons/<track>.json). Bundled content never changes: static.
 */
export const trackLessonsQuery = (track: TrackId, locale: Locale) =>
  queryOptions({
    queryKey: ["content", "lessons", track, locale] as const,
    queryFn: async () => {
      const lessons = (await LOADERS[track]?.()) ?? [];
      return localize(lessons, locale, `lessons/${track}`, LESSON_TEXT);
    },
    staleTime: "static",
    gcTime: Infinity,
  });

/**
 * The chip pages' content (blocks, pins, memory, clocks, power) in one language, as one lazy
 * chunk with the "chip" overlay (src/locales/<locale>/content/chip.json) laid over it.
 */
export const chipContentQuery = (locale: Locale) =>
  queryOptions({
    queryKey: ["content", "chip", locale] as const,
    queryFn: async () => {
      const { CHIP } = await import("./chip");
      return localize(CHIP, locale, "chip", CHIP_TEXT);
    },
    staleTime: "static",
    gcTime: Infinity,
  });
