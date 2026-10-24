import { describe, expect, it } from "vitest";
import { LOCALES, SOURCE_LOCALE } from "@/i18n/locales";
import { checkOverlay, extractOverlay, type TextPolicy } from "@/i18n/overlay";
import { CHIP } from "./chip";
import { GLOSSARY, TOPIC_LABELS } from "./code/glossary";
import { TOURS } from "./code/tours";
import { bleLessons } from "./lessons/ble";
import { displayLessons } from "./lessons/display";
import { introLessons } from "./lessons/intro";
import { rfidLessons } from "./lessons/rfid";
import { soundLessons } from "./lessons/sound";
import { wifiLessons } from "./lessons/wifi";
import { CHIP_TEXT, GLOSSARY_TEXT, LESSON_TEXT, TOUR_TEXT } from "./text-policies";

// The English content catalogues (src/locales/en/content) are generated from the TypeScript
// source: `pnpm i18n:extract` rewrites them, and this test fails while they are out of date.
// Every translation is then checked against them: no text the source lacks, same shapes, same
// inline markup and placeholders.

const CATALOGUES: readonly { name: string; source: unknown; policy: TextPolicy }[] = [
  { name: "lessons/intro", source: introLessons, policy: LESSON_TEXT },
  { name: "lessons/display", source: displayLessons, policy: LESSON_TEXT },
  { name: "lessons/wifi", source: wifiLessons, policy: LESSON_TEXT },
  { name: "lessons/rfid", source: rfidLessons, policy: LESSON_TEXT },
  { name: "lessons/ble", source: bleLessons, policy: LESSON_TEXT },
  { name: "lessons/sound", source: soundLessons, policy: LESSON_TEXT },
  { name: "glossary", source: { entries: GLOSSARY, topics: TOPIC_LABELS }, policy: GLOSSARY_TEXT },
  { name: "tours", source: TOURS, policy: TOUR_TEXT },
  { name: "chip", source: CHIP, policy: CHIP_TEXT },
];

const translations = import.meta.glob<unknown>("../locales/*/content/**/*.json", {
  import: "default",
  eager: true,
});

describe.each(CATALOGUES)("content catalogue $name", ({ name, source, policy }) => {
  const english = extractOverlay(source, policy);

  it("the English catalogue is up to date (pnpm i18n:extract)", async () => {
    await expect(`${JSON.stringify(english, null, 2)}\n`).toMatchFileSnapshot(
      `../locales/${SOURCE_LOCALE}/content/${name}.json`,
    );
  });

  it.each(LOCALES.filter((l) => l !== SOURCE_LOCALE))("the %s translation fits it", (locale) => {
    const translated = translations[`../locales/${locale}/content/${name}.json`];
    if (translated === undefined) return;
    expect(checkOverlay(english, translated)).toEqual([]);
  });
});
