import { describe, expect, it } from "vitest";
import { countCrossings, layoutFlowTree, orderLayers } from "./flow-tree-layout";
import { isotonic } from "./isotonic";
import { overlaps, placeLabels } from "./label-place";
import { wrapLabel } from "./text-fit";

const opts = { nodeWidth: 50, nodeHeight: 20, columnGap: 30, rowGap: 10 };

describe("layer ordering", () => {
  // a→y, b→x drawn in input order [a, b] / [x, y] crosses once; [x, y] → [y, x] untangles it.
  const succs = new Map([
    ["a", ["y"]],
    ["b", ["x"]],
  ]);
  const preds = new Map([
    ["y", ["a"]],
    ["x", ["b"]],
  ]);

  it("counts crossings between adjacent layers", () => {
    expect(countCrossings([["a", "b"], ["x", "y"]], succs)).toBe(1);
    expect(countCrossings([["a", "b"], ["y", "x"]], succs)).toBe(0);
  });

  it("removes the crossing by barycentre sweeps", () => {
    expect(orderLayers([["a", "b"], ["x", "y"]], preds, succs, 4)).toEqual([["a", "b"], ["y", "x"]]);
  });

  it("keeps the input order when there is nothing to fix, and is deterministic", () => {
    const layers = [["a", "b"], ["y", "x"]];
    expect(orderLayers(layers, preds, succs, 4)).toEqual(layers);
    expect(orderLayers([["a", "b"], ["x", "y"]], preds, succs, 4)).toEqual(orderLayers([["a", "b"], ["x", "y"]], preds, succs, 4));
  });

  it("routes a layer-skipping edge between nodes, with no crossings on a planar graph", () => {
    const { nodes, edges } = layoutFlowTree(
      [{ id: "s" }, { id: "m" }, { id: "t" }, { id: "u" }],
      [
        { from: "s", to: "m" },
        { from: "m", to: "t" },
        { from: "s", to: "u" },
      ],
      opts,
    );
    const u = nodes.find((n) => n.id === "u");
    const t = nodes.find((n) => n.id === "t");
    expect(u?.layer).toBe(1);
    expect(t?.layer).toBe(2);
    expect(edges.map((e) => e.spots.length)).toEqual([1, 1, 1]);
  });

  it("gives a skipping edge a straight run through the column it crosses, as its first label spot", () => {
    const { edges } = layoutFlowTree(
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "a", to: "c" },
      ],
      opts,
    );
    const skip = edges.find((e) => e.from === "a" && e.to === "c");
    expect(skip?.spots[0]).toMatchObject({ x: 80 + 25, room: 50 });
    expect(skip?.path).toMatch(/H130/);
  });
});

describe("flow tree columns and trunks", () => {
  it("makes a column as wide as its widest node and starts every edge of a node on one trunk", () => {
    const { nodes, edges, width } = layoutFlowTree(
      [{ id: "a", width: 70 }, { id: "b" }, { id: "c", width: 90 }],
      [
        { from: "a", to: "b" },
        { from: "a", to: "c" },
      ],
      { ...opts, trunk: 10 },
    );
    expect(nodes.map((n) => n.width)).toEqual([70, 90, 90]);
    expect(width).toBe(70 + 30 + 90);
    const starts = edges.map((e) => /^M[\d.]+ [\d.]+H[\d.]+/.exec(e.path)?.[0]);
    expect(new Set(starts).size).toBe(1);
    expect(starts[0]).toMatch(/^M70 [\d.]+H80$/);
  });

  it("keeps nodes in a column apart", () => {
    const { nodes } = layoutFlowTree(
      [{ id: "r" }, { id: "a" }, { id: "b" }, { id: "c" }],
      ["a", "b", "c"].map((to) => ({ from: "r", to })),
      opts,
    );
    const ys = nodes.filter((n) => n.layer === 1).map((n) => n.y).sort((p, q) => p - q);
    for (let i = 1; i < ys.length; i++) expect((ys[i] ?? 0) - (ys[i - 1] ?? 0)).toBeGreaterThanOrEqual(30);
  });
});

describe("isotonic", () => {
  it("pools values that go down into their mean", () => {
    expect(isotonic([1, 3, 2, 4])).toEqual([1, 2.5, 2.5, 4]);
    expect(isotonic([5, 1])).toEqual([3, 3]);
    expect(isotonic([])).toEqual([]);
  });
});

describe("label placement", () => {
  it("detects overlap, touching edges included only with a margin", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(overlaps(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    expect(overlaps(a, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(overlaps(a, { x: 11, y: 0, width: 10, height: 10 }, 1)).toBe(true);
    expect(overlaps(a, { x: 0, y: 20, width: 10, height: 10 }, 2)).toBe(false);
  });

  it("uses the first free spot, skips taken ones and drops labels with none", () => {
    const node = { x: 0, y: 0, width: 20, height: 20 };
    const placed = placeLabels(
      [
        { width: 10, height: 4, spots: [{ x: 10, y: 10 }, { x: 50, y: 10 }] },
        { width: 10, height: 4, spots: [{ x: 52, y: 10 }] },
        { width: 10, height: 4, spots: [{ x: 52, y: 30 }] },
      ],
      [node],
      0,
    );
    expect(placed[0]).toEqual({ x: 45, y: 8, width: 10, height: 4 });
    expect(placed[1]).toBeUndefined();
    expect(placed[2]).toEqual({ x: 47, y: 28, width: 10, height: 4 });
  });
});

describe("wrapLabel", () => {
  it("wraps at spaces to two lines before it shortens", () => {
    expect(wrapLabel("UART", 10)).toEqual(["UART"]);
    expect(wrapLabel("Wi-Fi and Bluetooth LE", 14)).toEqual(["Wi-Fi and", "Bluetooth LE"]);
    expect(wrapLabel("External memory, data side", 16)).toEqual(["External memory,", "data side"]);
    expect(wrapLabel("RC_FAST_DIV_CLK (RC_FAST ÷ 256)", 16)).toEqual(["RC_FAST_DIV_CLK", "(RC_FAST ÷ 256)"]);
    expect(wrapLabel("RTC: power manager, RTC watchdog", 12)).toEqual(["RTC: power", "manager, RT…"]);
    expect(wrapLabel("ABCDEFGHIJ", 4)).toEqual(["ABCD", "EFG…"]);
    expect(wrapLabel("Wi-Fi and Bluetooth LE", 14, 1)).toEqual(["Wi-Fi and Blu…"]);
  });
});
