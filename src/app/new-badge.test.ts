import { describe, expect, it } from "vitest";
import { isNewUntil } from "./new-badge";

describe("isNewUntil", () => {
  it("is new through the last day, local time, and gone after it", () => {
    expect(isNewUntil("2026-10-28", new Date(2026, 9, 25, 9))).toBe(true);
    expect(isNewUntil("2026-10-28", new Date(2026, 9, 28, 23, 59))).toBe(true);
    expect(isNewUntil("2026-10-28", new Date(2026, 9, 29, 0, 0))).toBe(false);
  });

  it("is never new for a malformed date", () => {
    expect(isNewUntil("soon", new Date(2026, 9, 25))).toBe(false);
  });
});
