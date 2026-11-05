// Lessons of the "ble" track, in reading order: one file per lesson.
import type { LessonEntry } from "@/domain/lesson";
import { b1 } from "./b1";
import { b2 } from "./b2";
import { b3 } from "./b3";
import { b4 } from "./b4";
import { b5 } from "./b5";
import { b6 } from "./b6";
import { b7 } from "./b7";
import { b8 } from "./b8";

export const bleLessons = [
  b1, b2, b3, b4, b5, b6, b7, b8,
] as const satisfies readonly LessonEntry[];
