import type { TextPolicy } from "@/i18n/overlay";

// Which content fields are reader-facing text. Everything else (ids, pins, commands, widget ids,
// code anchors, C++ terms and examples) is structure: it is never sent to translators and never
// read from a translation. See src/i18n/overlay.ts.

export const LESSON_TEXT: TextPolicy = {
  text: new Set([
    "title",
    "heading",
    "goal",
    "goalLine",
    "goalCheck",
    "learn",
    "role",
    "head",
    "rows",
    "does",
    "see",
    "fix",
    "intro",
    "steps",
    "note",
    "label",
    "short",
  ]),
  itemKey: ["id", "key"],
};

export const GLOSSARY_TEXT: TextPolicy = {
  text: new Set(["short", "simple", "deep", "title", "blurb"]),
  itemKey: ["id"],
};

export const TOUR_TEXT: TextPolicy = {
  text: new Set(["bigPicture", "title", "say", "deep", "question", "options", "why"]),
  itemKey: ["env", "path"],
};

/** The chip pages (src/content/chip). Register and pin-function symbols stay structure. */
export const CHIP_TEXT: TextPolicy = {
  text: new Set([
    "name",
    "short",
    "text",
    "title",
    "label",
    "note",
    "unit",
    "keepsOn",
    "strapping",
    "does",
  ]),
  itemKey: ["id"],
};
