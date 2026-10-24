import type { PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { ChartFrame } from "./ChartFrame";
import { layoutFlowTree } from "./geometry/flow-tree-layout";
import { placeLabels } from "./geometry/label-place";
import { charsIn, clamp, textWidth, wrapLabel } from "./geometry/text-fit";
import { seriesStyle, type ColorToken } from "./series";
import styles from "./charts.module.css";

export interface FlowTreeNode {
  id: string;
  label: string;
  /** A second line, e.g. "40 MHz". */
  detail?: string;
  color?: ColorToken;
}

export interface FlowTreeEdge {
  from: string;
  to: string;
  /** Written on the edge, e.g. "÷ 2". */
  label?: string;
}

export interface FlowTreeProps {
  caption: string;
  nodes: readonly FlowTreeNode[];
  edges: readonly FlowTreeEdge[];
  color?: ColorToken;
}

const BOX = { min: 96, max: 152, padX: 8, line: 12, height: 50 };
const GAPS = { columnGap: 72, rowGap: 12, trunk: 14, laneGap: 10 };
const LABEL_H = 13;
const PAD = 4;

/** Natural box width for a node: its longest line, between the minimum and the maximum. */
const boxWidth = (n: FlowTreeNode) =>
  clamp(Math.max(textWidth(n.label), textWidth(n.detail ?? "")) + BOX.padX * 2, BOX.min, BOX.max);

/**
 * Nodes in layers left to right; dashes run along the edges to show the flow. Pointing at a node
 * lights its edges and dims the rest (CSS keyed on data attributes, no re-render). Edge labels
 * are drawn where they fit; the table always lists every edge with its label.
 */
export function FlowTree({ caption, nodes, edges, color }: FlowTreeProps) {
  const { t } = useTranslation();
  const layout = layoutFlowTree(
    nodes.map((n) => ({ id: n.id, width: boxWidth(n) })),
    edges,
    { nodeWidth: BOX.min, nodeHeight: BOX.height, ...GAPS },
  );
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const name = (id: string) => {
    const n = byId.get(id);
    return n ? (n.detail ? `${n.label} (${n.detail})` : n.label) : id;
  };
  const labelOf = new Map(edges.map((e) => [`${e.from}>${e.to}`, e.label]));
  const labelBoxes = placeLabels(
    layout.edges.map((e) => {
      const text = labelOf.get(`${e.from}>${e.to}`) ?? "";
      const width = textWidth(text) + 6;
      return { width, height: LABEL_H, spots: text ? e.spots.filter((s) => s.room >= width) : [] };
    }),
    layout.nodes,
  );
  const w = layout.width + PAD * 2;
  const h = layout.height + PAD * 2;
  return (
    <ChartFrame
      caption={caption}
      wide
      table={{
        columns: [t("charts.from"), t("charts.to"), t("charts.via")],
        rows: edges.map((e) => ({ key: `${e.from}>${e.to}`, cells: [name(e.from), name(e.to), e.label ?? ""] })),
      }}
    >
      <svg
        className={`${styles.svgWide} ${styles.flowTree}`}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={seriesStyle(color)}
        onPointerOver={spotlight}
        onPointerLeave={clearSpotlight}
      >
        <g transform={`translate(${PAD} ${PAD})`}>
          {layout.edges.map((e, i) => (
            <g key={`${e.from}>${e.to}`} className={styles.flowEdge} data-from={e.from} data-to={e.to} style={seriesStyle(byId.get(e.from)?.color, i)}>
              <path className={`${styles.edge} ${styles.draw}`} d={e.path} pathLength={100} />
              <path className={styles.flow} d={e.path} />
            </g>
          ))}
          {layout.edges.map((e, i) => {
            const box = labelBoxes[i];
            const text = labelOf.get(`${e.from}>${e.to}`);
            return box && text ? (
              <text
                key={`${e.from}>${e.to}`}
                className={`${styles.edgeLabel} ${styles.fade}`}
                data-from={e.from}
                data-to={e.to}
                x={box.x + box.width / 2}
                y={box.y + box.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {text}
              </text>
            ) : null;
          })}
          {layout.nodes.map((g, i) => {
            const n = byId.get(g.id);
            if (!n) return null;
            const room = charsIn(g.width - BOX.padX * 2);
            const lines = wrapLabel(n.label, room);
            const detail = n.detail ? wrapLabel(n.detail, room, 1) : [];
            const top = g.y + (g.height - (lines.length + detail.length) * BOX.line) / 2 + BOX.line - 3;
            return (
              <g key={g.id} className={`${styles.node} ${styles.fade}`} data-node={g.id} style={seriesStyle(n.color, i)}>
                <rect x={g.x} y={g.y} width={g.width} height={g.height} rx={6} />
                <text x={g.x + BOX.padX} y={top}>
                  {lines.map((line, k) => (
                    <tspan key={k} className={styles.strong} x={g.x + BOX.padX} dy={k === 0 ? 0 : BOX.line}>
                      {line}
                    </tspan>
                  ))}
                  {detail.map((line) => (
                    <tspan key="detail" x={g.x + BOX.padX} dy={BOX.line}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </ChartFrame>
  );
}

/** Marks the pointed node's edges `data-lit` and the drawing `data-spotlight`; CSS does the rest. */
function spotlight(event: PointerEvent<SVGSVGElement>) {
  const svg = event.currentTarget;
  const node = event.target instanceof Element ? event.target.closest("[data-node]") : null;
  const id = node?.getAttribute("data-node") ?? null;
  if (id === svg.getAttribute("data-spotlight")) return;
  if (id === null) {
    clearSpotlight(event);
    return;
  }
  svg.setAttribute("data-spotlight", id);
  const near = new Set([id]);
  for (const el of svg.querySelectorAll("[data-from]")) {
    const from = el.getAttribute("data-from");
    const to = el.getAttribute("data-to");
    const lit = from === id || to === id;
    el.toggleAttribute("data-lit", lit);
    if (lit && from && to) near.add(from).add(to);
  }
  for (const el of svg.querySelectorAll("[data-node]")) {
    el.toggleAttribute("data-lit", near.has(el.getAttribute("data-node") ?? ""));
  }
}

function clearSpotlight(event: PointerEvent<SVGSVGElement>) {
  const svg = event.currentTarget;
  svg.removeAttribute("data-spotlight");
  for (const el of svg.querySelectorAll("[data-lit]")) el.removeAttribute("data-lit");
}
