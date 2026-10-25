import { describe, expect, it } from "vitest";
import { bleWidgets } from "@/labs/ble/widgets";
import { displayWidgets } from "@/labs/display/widgets";
import { introWidgets } from "@/labs/intro/widgets";
import { rfidWidgets } from "@/labs/rfid/widgets";
import { soundWidgets } from "@/labs/sound/widgets";
import { wifiWidgets } from "@/labs/wifi/widgets";
import { LESSON_PART } from "./icons";
import { LESSON_KIT } from "./kit";
import { trackLessonsQuery } from "./queries";
import { TRACKS } from "./tracks";

describe("content", () => {
  it.each(TRACKS.filter((t) => !t.planned))(
    "the $id table of contents matches its lessons file",
    async (track) => {
      const lessons = await trackLessonsQuery(track.id, "en").queryFn!({} as never);
      expect(lessons.map((l) => l.id)).toEqual(track.lessonIds);
      expect(lessons.every((l) => l.track === track.id)).toBe(true);
    },
  );

  it("gives every lesson in the table of contents its own part, and no stray ones", () => {
    const ids = TRACKS.flatMap((t) => t.lessonIds);
    expect(ids.filter((id) => !LESSON_PART[id])).toEqual([]);
    expect(Object.keys(LESSON_PART).filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("lists the kit of every open lesson, and no stray ones", async () => {
    const lessons = await Promise.all(
      TRACKS.filter((t) => !t.planned).map((t) =>
        trackLessonsQuery(t.id, "en").queryFn!({} as never),
      ),
    );
    const open = lessons.flat().filter((l) => l.kind === "lesson").map((l) => l.id);
    expect(open.filter((id) => !LESSON_KIT[id])).toEqual([]);
    expect(Object.keys(LESSON_KIT).filter((id) => !open.includes(id))).toEqual([]);
  });

  it("has no widget id registered by two tracks", () => {
    const ids = [
      introWidgets,
      displayWidgets,
      wifiWidgets,
      rfidWidgets,
      bleWidgets,
      soundWidgets,
    ].flatMap((m) => Object.keys(m));
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("uses unique lesson ids across tracks", () => {
    const ids = TRACKS.flatMap((t) => t.lessonIds);
    expect(ids.length).toBe(new Set(ids).size);
  });
});
