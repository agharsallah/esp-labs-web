import type { LessonKit } from "@/domain/kit";
import type { PartName } from "@/ui/parts/registry";

// The parts on the bench beyond the board and its USB-C cable, and what each lesson needs from
// them (from the lessons' wiring and steps). The kit finder on the labs map reads both; each
// part's name lives in the "home" catalogue (kit.items.<id>), and the content test checks every
// open lesson is listed here.

export const KIT_ITEMS = [
  { id: "led", part: "led" },
  { id: "tft", part: "tft" },
  { id: "button", part: "button" },
  { id: "rc522", part: "reader" },
  { id: "tags", part: "cards" },
  { id: "wifi", part: "router" },
  { id: "phone", part: "phone-ble" },
  { id: "ky037", part: "sensor" },
  { id: "inmp441", part: "mic" },
  { id: "amp", part: "speaker" },
  { id: "keyboard", part: "keyboard" },
] as const satisfies readonly { id: string; part: PartName }[];

export type KitItemId = (typeof KIT_ITEMS)[number]["id"];

const SCREEN = ["tft"] as const;
const READER = [SCREEN, ["rc522"], ["tags"]] as const;
const MIC = ["ky037", "inmp441"] as const;

export const LESSON_KIT: Readonly<Record<string, LessonKit<KitItemId>>> = {
  "00": { need: [] },
  "01": { need: [] },
  "02": { need: [["led"]] },
  "03": { need: [SCREEN] },
  "03b": { need: [SCREEN], optional: ["button"] },
  W1: { need: [SCREEN, ["wifi"]], optional: ["button"] },
  W2: { need: [SCREEN, ["wifi"], ["phone"]], optional: ["button"] },
  W3: { need: [SCREEN, ["wifi"]], optional: ["button"] },
  R1: { need: [SCREEN, ["rc522"]], optional: ["tags"] },
  R2: { need: READER },
  R3: { need: READER },
  R4: { need: READER },
  R5: { need: READER },
  R6: { need: READER },
  R7: { need: [...READER, ["wifi"]] },
  R8: { need: [...READER, ["wifi"]] },
  B1: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B2: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B3: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B4: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B5: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B6: { need: [SCREEN, ["phone"]], optional: ["button"] },
  B7: { need: [SCREEN], optional: ["button", "phone"] },
  B8: { need: [SCREEN, ["keyboard"]], optional: ["button"] },
  S1: { need: [SCREEN, MIC] },
  S2: { need: [SCREEN, MIC], optional: ["amp", "led"] },
  S3: { need: [SCREEN, MIC], optional: ["amp", "led"] },
  S4: { need: [SCREEN, MIC], optional: ["amp", "wifi"] },
  S5: { need: [SCREEN, MIC], optional: ["amp"] },
  S6: { need: [SCREEN, MIC], optional: ["amp", "led"] },
  S7: { need: [SCREEN, ["amp"]] },
  S8: { need: [SCREEN, ["inmp441"], ["amp"]] },
};

const NOTHING: LessonKit<KitItemId> = { need: [] };

/** A lesson's kit; a lesson missing from the list needs only the board. */
export const lessonKit = (id: string): LessonKit<KitItemId> => LESSON_KIT[id] ?? NOTHING;
