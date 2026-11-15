import { describe, expect, it } from "vitest";
import { AUTHOR_LINKS, COFFEE_URL, ISSUES_URL, isOutside } from "./about-links";

describe("about links", () => {
  it("are all https", () => {
    for (const href of [...AUTHOR_LINKS.map((l) => l.href), COFFEE_URL, ISSUES_URL]) {
      expect(new URL(href).protocol).toBe("https:");
    }
  });
});

describe("isOutside", () => {
  const box = { left: 100, right: 300, top: 100, bottom: 200 };
  it("is false inside the box and on its edge", () => {
    expect(isOutside(box, 150, 150)).toBe(false);
    expect(isOutside(box, 100, 200)).toBe(false);
  });
  it("is true beyond any edge", () => {
    expect(isOutside(box, 99, 150)).toBe(true);
    expect(isOutside(box, 301, 150)).toBe(true);
    expect(isOutside(box, 150, 99)).toBe(true);
    expect(isOutside(box, 150, 201)).toBe(true);
  });
});
