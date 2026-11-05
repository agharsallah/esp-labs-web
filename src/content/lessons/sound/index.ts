// Lessons of the "sound" track, in reading order: one file per lesson.
import type { LessonEntry } from "@/domain/lesson";
import { s1 } from "./s1";
import { s2 } from "./s2";
import { s3 } from "./s3";
import { s4 } from "./s4";
import { s5 } from "./s5";
import { s6 } from "./s6";
import { s7 } from "./s7";
import { s8 } from "./s8";

export const soundLessons = [
  s1, s2, s3, s4, s5, s6, s7, s8,
] as const satisfies readonly LessonEntry[];
