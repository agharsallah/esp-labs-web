// Lessons of the "rfid" track, in reading order: one file per lesson.
import type { LessonEntry } from "@/domain/lesson";
import { r1 } from "./r1";
import { r2 } from "./r2";
import { r3 } from "./r3";
import { r4 } from "./r4";
import { r5 } from "./r5";
import { r6 } from "./r6";
import { r7 } from "./r7";
import { r8 } from "./r8";

export const rfidLessons = [
  r1, r2, r3, r4, r5, r6, r7, r8,
] as const satisfies readonly LessonEntry[];
