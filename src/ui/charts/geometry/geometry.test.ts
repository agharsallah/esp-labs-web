import { describe, expect, it } from "vitest";
import { layoutAddressMap, spreadLabels } from "./address-map-layout";
import { layoutBars, share } from "./bar-layout";
import { layoutFlowTree } from "./flow-tree-layout";
import { layoutLadder } from "./ladder-layout";
import { filterRows, fitMatrix, layoutMatrix } from "./matrix-layout";
import { layoutRanges } from "./range-layout";
import { arc, layoutRing } from "./ring-layout";
import { linearScale, logScale, logTicks, niceStep, niceTicks } from "./scale";

describe("scales", () => {
  it("maps linearly and clamps outside the domain", () => {
    const s = linearScale(0, 10, 100, 200);
    expect(s(5)).toBe(150);
    expect(s(-3)).toBe(100);
    expect(s(99)).toBe(200);
    expect(linearScale(3, 3, 7, 9)(3)).toBe(7);
  });

  it("maps decades evenly on a log scale and rejects a non-positive domain", () => {
    const s = logScale(1, 1000, 0, 300);
    expect(s(10)).toBeCloseTo(100);
    expect(s(100)).toBeCloseTo(200);
    expect(s(0)).toBe(0);
    expect(() => logScale(0, 10, 0, 1)).toThrow(RangeError);
  });

  it("picks 1-2-5 steps and nice ticks", () => {
    expect(niceStep(10, 5)).toBe(2);
    expect(niceStep(0.3, 3)).toBeCloseTo(0.1);
    expect(niceTicks(0, 240, 4)).toEqual({ domain: [0, 300], ticks: [0, 100, 200, 300] });
    expect(niceTicks(0.1, 0.3, 2).ticks).toEqual([0.1, 0.2, 0.3]);
    expect(niceTicks(5, 5).ticks.length).toBeGreaterThan(1);
  });

  it("lists powers of ten for log ticks", () => {
    expect(logTicks(0.007, 240)).toEqual({ domain: [0.001, 1000], ticks: [0.001, 0.01, 0.1, 1, 10, 100, 1000] });
    expect(logTicks(10, 10).ticks).toEqual([10, 100]);
  });
});

describe("range layout", () => {
  it("puts every row on one shared axis", () => {
    const { rows, height } = layoutRanges(
      [
        { min: 3, typ: 3.3, max: 3.6 },
        { min: 1.8, max: 3.6 },
      ],
      { x0: 0, x1: 100, rowHeight: 20, top: 10, log: false },
    );
    expect(height).toBe(50);
    expect(rows[1]?.y).toBe(30);
    expect(rows[0]?.x1).toBe(rows[1]?.x1);
    expect(rows[1]?.xTyp).toBeNull();
    const first = rows[0];
    expect(first && first.xTyp !== null && first.x0 < first.xTyp && first.xTyp < first.x1).toBe(true);
  });
});

describe("ladder layout", () => {
  it("draws each rung on a log axis and reports the gain against the first", () => {
    const { rungs } = layoutLadder([100, 10, 0.01], { x0: 0, x1: 100, rowHeight: 10, top: 0 });
    expect(rungs.map((r) => r.ratio)).toEqual([1, 10, 10000]);
    const [a, b, c] = rungs.map((r) => r.length);
    expect(a !== undefined && b !== undefined && c !== undefined && a > b && b > c).toBe(true);
  });
});

describe("address map layout", () => {
  it("sizes regions by log2 length with a floor, stacked in order", () => {
    const { regions, height } = layoutAddressMap(
      [
        { start: 0, end: 1024 },
        { start: 1024, end: 1024 + 2 ** 25 },
        { start: 0, end: 2 },
      ],
      { unit: 2, minHeight: 14, labelGap: 12 },
    );
    expect(regions.map((r) => r.height)).toEqual([20, 50, 14]);
    expect(regions.map((r) => r.y)).toEqual([0, 20, 70]);
    expect(height).toBe(84);
  });

  it("never lets labels overlap and keeps them inside the tower", () => {
    const out = spreadLabels([5, 6, 7, 95], 10, 0, 100);
    for (let i = 1; i < out.length; i++) expect((out[i] ?? 0) - (out[i - 1] ?? 0)).toBeGreaterThanOrEqual(10);
    expect(out[0]).toBeGreaterThanOrEqual(5);
    expect(out.at(-1)).toBeLessThanOrEqual(95);
  });
});

describe("flow tree layout", () => {
  const opts = { nodeWidth: 50, nodeHeight: 20, columnGap: 30, rowGap: 10 };

  it("puts each node one layer after its deepest parent", () => {
    const { nodes, edges, width } = layoutFlowTree(
      [{ id: "xtal" }, { id: "pll" }, { id: "cpu" }, { id: "apb" }],
      [
        { from: "xtal", to: "pll" },
        { from: "pll", to: "cpu" },
        { from: "xtal", to: "cpu" },
        { from: "pll", to: "apb" },
        { from: "pll", to: "missing" },
      ],
      opts,
    );
    expect(Object.fromEntries(nodes.map((n) => [n.id, n.layer]))).toEqual({ xtal: 0, pll: 1, cpu: 2, apb: 2 });
    expect(width).toBe(3 * 50 + 2 * 30);
    expect(edges).toHaveLength(4);
    expect(edges[0]?.path.startsWith("M50 ")).toBe(true);
  });

  it("refuses a cycle", () => {
    expect(() =>
      layoutFlowTree(
        [{ id: "a" }, { id: "b" }],
        [
          { from: "a", to: "b" },
          { from: "b", to: "a" },
        ],
        opts,
      ),
    ).toThrow(/cycle/);
  });
});

describe("ring layout", () => {
  it("splits by value, drops zeros and keeps the order", () => {
    const segs = layoutRing(
      [
        { key: "done", value: 1 },
        { key: "built", value: 0 },
        { key: "none", value: 3 },
      ],
      { cx: 10, cy: 10, radius: 8, gapDeg: 4 },
    );
    expect(segs.map((s) => [s.key, s.share])).toEqual([
      ["done", 0.25],
      ["none", 0.75],
    ]);
    expect(layoutRing([], { cx: 0, cy: 0, radius: 1, gapDeg: 0 })).toEqual([]);
  });

  it("draws a full turn as two half arcs", () => {
    expect(arc(10, 10, 8, 0, 360).match(/A/g)).toHaveLength(2);
    expect(arc(10, 10, 8, 0, 90)).toBe("M10 2A8 8 0 0 1 18 10");
  });
});

describe("matrix and bars", () => {
  it("lays the grid after its header bands", () => {
    const g = layoutMatrix(2, 3, { cell: 10, rowHeader: 40, columnHeader: 20 });
    expect(g.columns).toEqual([40, 50, 60]);
    expect(g.rows).toEqual([20, 30]);
    expect([g.width, g.height]).toEqual([70, 40]);
  });

  it("filters rows by column", () => {
    const rows = [{ cells: { adc: 1 } }, { cells: {} }];
    expect(filterRows(rows, "adc")).toHaveLength(1);
    expect(filterRows(rows, undefined)).toHaveLength(2);
  });

  it("gives bar lengths and clamped shares", () => {
    expect(layoutBars([0, 50, 100], { x0: 10, x1: 110, log: false }).lengths).toEqual([0, 50, 100]);
    expect(share(5, 10)).toBe(0.5);
    expect(share(20, 10)).toBe(1);
    expect(share(1, 0)).toBe(0);
  });
});

describe("fitMatrix", () => {
  const fit = { minCell: 24, maxCell: 44, maxRow: 32, charWidth: 6, lineHeight: 12, rowHeader: { min: 72, max: 160, lead: 22 } };

  it("fills the width up to the largest cell and lays short headers flat", () => {
    const m = fitMatrix(800, ["ADC", "Touch", "UART"], ["GPIO1"], fit);
    expect(m.cell).toBe(44);
    expect(m.rowHeight).toBe(32);
    expect(m.rotated).toBe(false);
    expect(m.headers).toEqual([["ADC"], ["Touch"], ["UART"]]);
  });

  it("shares the width between the columns", () => {
    const m = fitMatrix(72 + 10 * 30, Array.from({ length: 10 }, () => "AB"), ["G"], fit);
    expect(m.cell).toBe(30);
  });

  it("wraps a flat header to two lines, and rotates headers that still do not fit", () => {
    expect(fitMatrix(800, ["Strap pin"], ["G"], fit).headers).toEqual([["Strap", "pin"]]);
    const narrow = fitMatrix(300, ["Analog input", "Capacitive touch", "UART"], ["G"], fit);
    expect(narrow.rotated).toBe(true);
    expect(narrow.overhang).toBeGreaterThan(0);
    expect(narrow.cell).toBeGreaterThanOrEqual(24);
  });
});
