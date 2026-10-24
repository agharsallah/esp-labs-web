import { isotonic } from "./isotonic";

export interface FlowNodeDatum {
  id: string;
  /** The box width this node would like; its column takes the widest of its nodes. */
  width?: number;
}
export interface FlowEdgeDatum {
  from: string;
  to: string;
}

export interface FlowNodeGeometry {
  id: string;
  layer: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
/** A place on an edge where its label may sit, centred on (x, y), with `room` of free width. */
export interface FlowLabelSpot {
  x: number;
  y: number;
  room: number;
}
export interface FlowEdgeGeometry {
  from: string;
  to: string;
  path: string;
  /** Label places, best first: straight runs through a column, then the curves between columns. */
  spots: FlowLabelSpot[];
}

export interface FlowTreeOptions {
  /** Width of a column with no wanted width, and of nodes that do not say. */
  nodeWidth: number;
  nodeHeight: number;
  columnGap: number;
  rowGap: number;
  /** The shared stub every edge leaving one node runs along before it fans out. */
  trunk?: number;
  /** Space between edges that pass through a column. */
  laneGap?: number;
  /** Ordering sweeps; each is one pass down and one pass up the layers. */
  sweeps?: number;
}

/**
 * Lays a directed acyclic graph in layers, left to right (a layered, Sugiyama-style drawing):
 * 1. a node's layer is the longest path from a root;
 * 2. an edge that skips layers gets a waypoint in each layer it crosses, so it runs between nodes;
 * 3. each layer is ordered by the barycentre of its neighbours, sweeping down and up, keeping the
 *    order with the fewest crossings (ties keep the input order, so the result is deterministic);
 * 4. each column is as wide as its widest node; in a column, items sit as close to the mean height
 *    of their neighbours as the order and spacing allow (a least-squares fit).
 * Edges leave a node along a shared trunk, then curve to their target through their waypoints.
 */
export function layoutFlowTree(nodes: readonly FlowNodeDatum[], edges: readonly FlowEdgeDatum[], opts: FlowTreeOptions) {
  const trunk = opts.trunk ?? Math.min(14, opts.columnGap / 4);
  const laneGap = opts.laneGap ?? 8;
  const ids = new Set(nodes.map((n) => n.id));
  const valid = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  const layer = assignLayers(nodes, valid);
  const layerOf = (id: string) => layer.get(id) ?? 0;

  // Items per layer (nodes and waypoints) and the links between adjacent layers.
  const order: string[][] = [];
  const real = new Set<string>();
  for (const n of nodes) {
    (order[layerOf(n.id)] ??= []).push(n.id);
    real.add(n.id);
  }
  const chains = valid.map((e, k) => {
    const chain = [e.from];
    for (let l = layerOf(e.from) + 1; l < layerOf(e.to); l++) {
      const id = `\u0000${k}:${l}`;
      (order[l] ??= []).push(id);
      chain.push(id);
    }
    chain.push(e.to);
    return chain;
  });
  const layers = Array.from({ length: Math.max(1, order.length) }, (_, l) => order[l] ?? []);
  const itemLayer = new Map<string, number>();
  layers.forEach((items, l) => items.forEach((id) => itemLayer.set(id, l)));
  const links = chains.flatMap((c) => c.slice(1).map((to, i) => ({ from: c[i] ?? to, to })));
  const preds = new Map<string, string[]>();
  const succs = new Map<string, string[]>();
  for (const { from, to } of links) {
    (succs.get(from) ?? succs.set(from, []).get(from))?.push(to);
    (preds.get(to) ?? preds.set(to, []).get(to))?.push(from);
  }

  const ordered = orderLayers(layers, preds, succs, opts.sweeps ?? 4);

  // Columns.
  const wanted = new Map(nodes.map((n) => [n.id, n.width ?? opts.nodeWidth]));
  const colWidth = ordered.map((items) => {
    const widths = items.flatMap((id) => (real.has(id) ? [wanted.get(id) ?? opts.nodeWidth] : []));
    return widths.length > 0 ? Math.max(...widths) : opts.nodeWidth;
  });
  const colX: number[] = [];
  colWidth.reduce((x, w, l) => {
    colX[l] = x;
    return x + w + opts.columnGap;
  }, 0);
  const width = colWidth.reduce((a, w) => a + w, 0) + opts.columnGap * Math.max(0, colWidth.length - 1);

  // Heights: centres, refined toward the neighbours' mean, keeping order and spacing.
  const size = (id: string) => (real.has(id) ? opts.nodeHeight : 0);
  const gapBetween = (a: string, b: string) =>
    size(a) / 2 + size(b) / 2 + (real.has(a) && real.has(b) ? opts.rowGap : laneGap);
  const cy = new Map<string, number>();
  for (const items of ordered) {
    let y = 0;
    items.forEach((id, i) => {
      const prev = items[i - 1];
      y = prev === undefined ? size(id) / 2 : y + gapBetween(prev, id);
      cy.set(id, y);
    });
  }
  const refine = (items: readonly string[], neighbours: Map<string, string[]>) => {
    if (items.length === 0) return;
    const want = items.map((id) => {
      const ns = neighbours.get(id) ?? [];
      return ns.length > 0 ? ns.reduce((a, n) => a + (cy.get(n) ?? 0), 0) / ns.length : (cy.get(id) ?? 0);
    });
    const offsets = items.map(() => 0);
    for (let i = 1; i < items.length; i++) {
      offsets[i] = (offsets[i - 1] ?? 0) + gapBetween(items[i - 1] ?? "", items[i] ?? "");
    }
    const fit = isotonic(want.map((w, i) => w - (offsets[i] ?? 0)));
    items.forEach((id, i) => cy.set(id, (fit[i] ?? 0) + (offsets[i] ?? 0)));
  };
  for (let round = 0; round < 4; round++) {
    for (let l = 1; l < ordered.length; l++) refine(ordered[l] ?? [], preds);
    for (let l = ordered.length - 2; l >= 0; l--) refine(ordered[l] ?? [], succs);
  }
  const tops = [...cy].map(([id, c]) => c - size(id) / 2);
  const shift = tops.length > 0 ? -Math.min(...tops) : 0;
  for (const [id, c] of cy) cy.set(id, c + shift);
  const height = Math.max(opts.nodeHeight, ...[...cy].map(([id, c]) => c + size(id) / 2));

  const placed: FlowNodeGeometry[] = nodes.map((n) => {
    const l = layerOf(n.id);
    const h = opts.nodeHeight;
    return { id: n.id, layer: l, x: colX[l] ?? 0, y: (cy.get(n.id) ?? 0) - h / 2, width: colWidth[l] ?? opts.nodeWidth, height: h };
  });

  const geometry: FlowEdgeGeometry[] = valid.map((e, k) => {
    const chain = chains[k] ?? [];
    const lf = layerOf(e.from);
    let x = (colX[lf] ?? 0) + (colWidth[lf] ?? 0);
    let y = cy.get(e.from) ?? 0;
    x += trunk;
    let path = `M${r(x - trunk)} ${r(y)}H${r(x)}`;
    const spots: FlowLabelSpot[] = [];
    const curves: FlowLabelSpot[] = [];
    for (const id of chain.slice(1)) {
      const l = itemLayer.get(id) ?? 0;
      const x1 = colX[l] ?? 0;
      const y1 = cy.get(id) ?? 0;
      const c = (x1 - x) / 2;
      path += `C${r(x + c)} ${r(y)} ${r(x1 - c)} ${r(y1)} ${r(x1)} ${r(y1)}`;
      curves.push({ x: r((x + x1) / 2), y: r((y + y1) / 2), room: x1 - x });
      x = x1;
      y = y1;
      if (!real.has(id)) {
        const w = colWidth[l] ?? 0;
        spots.push({ x: r(x + w / 2), y: r(y), room: w });
        x += w;
        path += `H${r(x)}`;
      }
    }
    return { from: e.from, to: e.to, path, spots: [...spots, ...curves] };
  });
  return { nodes: placed, edges: geometry, width, height };
}

/** Longest-path layering; throws on a cycle. */
export function assignLayers(nodes: readonly { id: string }[], edges: readonly FlowEdgeDatum[]): Map<string, number> {
  const layer = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  // Bellman-Ford style relaxation; a cycle would never settle, so stop after n rounds.
  for (let round = 0; round < nodes.length; round++) {
    let changed = false;
    for (const e of edges) {
      const next = (layer.get(e.from) ?? 0) + 1;
      if (next > (layer.get(e.to) ?? 0)) {
        if (round === nodes.length - 1) throw new Error("layoutFlowTree: the graph has a cycle");
        layer.set(e.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return layer;
}

/**
 * Barycentre ordering: each layer is sorted by the mean position of its neighbours in the layer
 * before (sweeping down) or after (sweeping up). Items with no neighbours there keep their place.
 * Returns the order with the fewest crossings seen, the input order when nothing beats it.
 */
export function orderLayers(
  layers: readonly (readonly string[])[],
  preds: ReadonlyMap<string, readonly string[]>,
  succs: ReadonlyMap<string, readonly string[]>,
  sweeps: number,
): string[][] {
  let current = layers.map((l) => [...l]);
  let best = current;
  let bestCount = countCrossings(current, succs);
  const sortBy = (items: readonly string[], ref: readonly string[], neighbours: ReadonlyMap<string, readonly string[]>) => {
    const at = new Map(ref.map((id, i) => [id, i]));
    const key = (id: string, i: number) => {
      const ns = (neighbours.get(id) ?? []).flatMap((n) => at.get(n) ?? []);
      // Scaled to the reference layer, so a lone item keeps its relative place.
      if (ns.length === 0) return items.length > 1 ? (i * Math.max(0, ref.length - 1)) / (items.length - 1) : 0;
      return ns.reduce((a, b) => a + b, 0) / ns.length;
    };
    return items
      .map((id, i) => ({ id, i, k: key(id, i) }))
      .sort((a, b) => a.k - b.k || a.i - b.i)
      .map((x) => x.id);
  };
  for (let s = 0; s < sweeps && bestCount > 0; s++) {
    const next = current.map((l) => [...l]);
    for (let l = 1; l < next.length; l++) next[l] = sortBy(next[l] ?? [], next[l - 1] ?? [], preds);
    for (let l = next.length - 2; l >= 0; l--) next[l] = sortBy(next[l] ?? [], next[l + 1] ?? [], succs);
    current = next;
    const count = countCrossings(current, succs);
    if (count < bestCount) {
      best = current;
      bestCount = count;
    }
  }
  return best;
}

/** Edge crossings between adjacent layers, for links given as successor lists. */
export function countCrossings(layers: readonly (readonly string[])[], succs: ReadonlyMap<string, readonly string[]>): number {
  let count = 0;
  for (let l = 0; l + 1 < layers.length; l++) {
    const next = new Map((layers[l + 1] ?? []).map((id, i) => [id, i]));
    const pairs = (layers[l] ?? []).flatMap((id, i) =>
      (succs.get(id) ?? []).flatMap((to) => {
        const j = next.get(to);
        return j === undefined ? [] : [[i, j] as const];
      }),
    );
    for (let a = 0; a < pairs.length; a++) {
      for (let b = a + 1; b < pairs.length; b++) {
        const [i1, j1] = pairs[a] ?? [0, 0];
        const [i2, j2] = pairs[b] ?? [0, 0];
        if ((i1 - i2) * (j1 - j2) < 0) count++;
      }
    }
  }
  return count;
}

const r = (v: number) => Math.round(v * 100) / 100;
