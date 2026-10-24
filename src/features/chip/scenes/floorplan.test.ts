import { describe, expect, it } from "vitest";
import { COVERAGE_HEIGHT, type DieBlock, fitSlabWidth, floorplan, frameBudget, slabSize } from "./floorplan";

const blocks: DieBlock[] = [
  { id: "wifi", family: "radio", name: "Wi-Fi", coverage: "done" },
  { id: "uart", family: "connectivity", name: "UART", coverage: "planned" },
  { id: "cpu", family: "system", name: "CPU", coverage: "works" },
  { id: "adc", family: "analog", name: "ADC", coverage: "none" },
];

describe("floorplan", () => {
  it("groups the tiles in the families' order", () => {
    expect(floorplan(blocks).tiles.map((t) => t.id)).toEqual(["cpu", "uart", "adc", "wifi"]);
  });

  it("wraps into rows", () => {
    const plan = floorplan(blocks, 3);
    expect(plan).toMatchObject({ cols: 3, rows: 2 });
    expect(plan.tiles[3]).toMatchObject({ col: 0, row: 1 });
  });

  it("orders the heights done > works > built > planned > none", () => {
    const h = (coverage: DieBlock["coverage"]) =>
      floorplan([{ id: "x", family: "system", name: "X", coverage }]).tiles[0]?.height ?? 0;
    expect(h("done")).toBeGreaterThan(h("works"));
    expect(h("works")).toBeGreaterThan(h("built"));
    expect(h("built")).toBeGreaterThan(h("planned"));
    expect(h("planned")).toBeGreaterThan(h("none"));
    expect(h("none")).toBe(0);
  });

  it("steps the heights clearly apart, at least a sixth of the full height each", () => {
    const steps = (["none", "planned", "built", "works", "done"] as const).map((c) => COVERAGE_HEIGHT[c]);
    for (let i = 1; i < steps.length; i++) expect((steps[i] ?? 0) - (steps[i - 1] ?? 0)).toBeGreaterThanOrEqual(1 / 6);
  });
});

describe("slab framing", () => {
  it("sizes the slab from the grid, one unit wide", () => {
    expect(slabSize({ cols: 8, rows: 4 })).toEqual({ w: 1 + 0.3 / 8, d: 4 / 8 + 0.3 / 8 });
  });

  it("fits the wider of the screen width and the screen height times the aspect", () => {
    const top = { w: 4, d: 2, h: 0, az: Math.PI / 2, el: Math.PI / 2, margin: 1 };
    // Seen from straight above, facing along z: 4 across, 2 tall.
    expect(fitSlabWidth({ ...top, aspect: 1 })).toBeCloseTo(4);
    expect(fitSlabWidth({ ...top, aspect: 3 })).toBeCloseTo(6);
    expect(fitSlabWidth({ ...top, aspect: 1, margin: 1.5 })).toBeCloseTo(6);
  });

  it("makes room for taller tiles when seen from low down", () => {
    const view = { w: 4, d: 2, az: 1.15, el: 0.6, aspect: 1.6 };
    expect(fitSlabWidth({ ...view, h: 1.5 })).toBeGreaterThan(fitSlabWidth({ ...view, h: 0 }));
  });
});

describe("frameBudget", () => {
  it("trips only for slow frames on a phone-sized viewport, after warming up", () => {
    const slow = frameBudget(2, 3);
    const wide = frameBudget(2, 3);
    const fast = frameBudget(2, 3);
    const run = (judge: ReturnType<typeof frameBudget>, dt: number, w: number) =>
      Array.from({ length: 5 }, () => judge(dt, w));
    expect(run(slow, 0.04, 390)).toEqual([false, false, false, false, true]);
    expect(run(wide, 0.04, 1280)).not.toContain(true);
    expect(run(fast, 0.016, 390)).not.toContain(true);
  });
});
