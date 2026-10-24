import { describe, expect, it } from "vitest";
import { easeInOut, layerAt, scenePosition, sectionProgress, span } from "./scroll-progress";

describe("sectionProgress", () => {
  it("is 0 before the section reaches the top and 1 once its bottom reaches the bottom", () => {
    expect(sectionProgress({ top: 200, height: 3000 }, 800)).toBe(0);
    expect(sectionProgress({ top: -1100, height: 3000 }, 800)).toBe(0.5);
    expect(sectionProgress({ top: -5000, height: 3000 }, 800)).toBe(1);
  });

  it("does not divide by zero for a section no taller than the viewport", () => {
    expect(sectionProgress({ top: 10, height: 600 }, 800)).toBe(0);
    expect(sectionProgress({ top: -10, height: 600 }, 800)).toBe(1);
  });
});

describe("layerAt", () => {
  it("cuts the progress into equal bands", () => {
    expect(layerAt(0, 5)).toEqual({ layer: 0, within: 0 });
    expect(layerAt(0.3, 5).layer).toBe(1);
    expect(layerAt(0.3, 5).within).toBeCloseTo(0.5);
  });

  it("keeps the end inside the last layer", () => {
    expect(layerAt(1, 5)).toEqual({ layer: 4, within: 1 });
    expect(layerAt(1.4, 5)).toEqual({ layer: 4, within: 1 });
    expect(layerAt(-1, 5)).toEqual({ layer: 0, within: 0 });
  });
});

describe("scenePosition", () => {
  it("holds the first keyframe through most of the first band", () => {
    expect(scenePosition(0, 5)).toBe(0);
    expect(scenePosition(0.1, 5)).toBe(0);
  });

  it("is half way through a move exactly where the caption switches band", () => {
    for (let border = 1; border < 5; border++) {
      expect(scenePosition(border / 5, 5)).toBeCloseTo(border - 0.5);
      expect(layerAt(border / 5, 5).layer).toBe(border);
    }
  });

  it("holds each keyframe in the middle of its band, and the last one to the end", () => {
    expect(scenePosition(0.3, 5)).toBe(1);
    expect(scenePosition(0.5, 5)).toBe(2);
    expect(scenePosition(0.9, 5)).toBe(4);
    expect(scenePosition(1, 5)).toBe(4);
  });

  it("never shows the scene on the old layer once the caption has moved on", () => {
    for (let p = 0; p <= 1; p += 0.005) expect(scenePosition(p, 5)).toBeGreaterThanOrEqual(layerAt(p, 5).layer - 0.5);
  });

  it("never runs backwards as the progress grows", () => {
    let last = 0;
    for (let p = 0; p <= 1; p += 0.01) {
      const s = scenePosition(p, 5);
      expect(s).toBeGreaterThanOrEqual(last);
      last = s;
    }
  });
});

describe("easeInOut and span", () => {
  it("eases from 0 to 1 through the middle", () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(2)).toBe(1);
  });

  it("measures a part of the motion", () => {
    expect(span(1.5, 1, 2)).toBe(0.5);
    expect(span(0, 1, 2)).toBe(0);
    expect(span(3, 1, 2)).toBe(1);
    expect(span(2, 2, 2)).toBe(1);
  });
});
