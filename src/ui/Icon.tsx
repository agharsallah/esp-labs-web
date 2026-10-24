// The interface's line icons: small drawings on a 24-unit grid in currentColor, so an icon takes
// the colour and size of the text around it (controls, section headings, navigation). The
// colourful parts of the bench (boards, LEDs, readers, mics) are in the parts library,
// src/ui/parts. Decorative by default: the label next to an icon carries the meaning.

/** A circle as path data, so every icon stays one <path>. */
const o = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const PATHS = {
  // Interface
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  up: "M12 19V5M6 11l6-6 6 6",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  globe: `${o(12, 12, 9)}M3.5 9h17M3.5 15h17M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9`,
  check: "M5 12.5l4.5 4.5L19 7.5",
  sliders: "M4 6h9M17 6h3M15 4v4M4 12h3M11 12h9M9 10v4M4 18h11M19 18h1M17 16v4",
  log: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  rotateLeft: "M4 4v5h5M4.6 13a8 8 0 1 0 1.8-7.4L4 9",
  rotateRight: "M20 4v5h-5M19.4 13a8 8 0 1 1-1.8-7.4L20 9",
  zoomIn: `${o(11, 11, 7)}M21 21l-5-5M8 11h6M11 8v6`,
  zoomOut: `${o(11, 11, 7)}M21 21l-5-5M8 11h6`,
  recenter: `${o(12, 12, 3)}M12 2v4M12 18v4M2 12h4M18 12h4`,

  // Sections of a lesson
  flag: "M5 21V4M5 4h11l-2.5 4L16 12H5",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3",
  wire: "M3 3h4v5H3zM5 8c0 7 14 1 14 8M17 16h4v5h-4z",
  terminal: "M3 5h18v14H3zM7 10l3 2-3 2M12 15h5",
  steps: "M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9",
  scope: "M3 4h18v14H3zM6 13c1.5-6 3-6 4.5 0s3 6 4.5 0c.8-3 2-3.5 3-2",

  // The board, in the navigation
  board:
    "M7 2h10v20H7zM9.5 4h5v6h-5zM4 6h3M4 9h3M4 12h3M4 15h3M4 18h3M17 6h3M17 9h3M17 12h3M17 15h3M17 18h3M10 19h4",
  // The chip's block families, for small sizes in text (the parts library draws the blocks)
  "fam-system": "M6 6h12v12H6zM9 9h6v6H9zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3",
  "fam-memory": "M4 6h16v12H4zM8 9v6M12 9v6M16 9v6M7 18v3M17 18v3",
  "fam-security": "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2",
  "fam-connectivity": `${o(5, 12, 2)}${o(19, 12, 2)}M7 12h10M10 8l-3 4 3 4M14 8l3 4-3 4`,
  "fam-timing": `${o(12, 13, 8)}M12 13V9M12 13h3M10 2h4M12 2v3`,
  "fam-analog": "M3 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0",
  "fam-radio": "M12 20v-6M8.5 10.5a5 5 0 0 1 7 0M5.5 7.5a9 9 0 0 1 13 0M12 13h0",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",

  // The reference reader: its documents, its controls and the kinds of number it tags
  module: "M5 3h14v18H5zM8 6h8v5H8zM5 15h-2M5 18h-2M19 15h2M19 18h2M9 15h6",
  book: "M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 1h13v-3M8 7h7M8 10h5",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  close: "M6 6l12 12M18 6L6 18",
  expand: "M4 10V4h6M20 14v6h-6M4 4l6 6M20 20l-6-6",
  volt: "M13 3L6 13h5l-1 8 7-10h-5z",
  current: `${o(12, 12, 8)}M8 12h8M13 9l3 3-3 3`,
  frequency: "M2 12h3l2-6 3 12 3-12 3 12 2-6h4",
  size: "M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4",
  time: `${o(12, 12, 9)}M12 7v5l3 2`,
  power: "M12 3v8M7 6.5a7 7 0 1 0 10 0",
  pin: "M9 3h6v4H9zM12 7v14M8 21h8",
  warning: "M12 3l10 18H2zM12 10v5M12 18v.5",
} as const;

export type IconName = keyof typeof PATHS;

/** Icons that point along the reading direction: mirrored in right-to-left languages. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(["arrow", "back"]);

export function Icon({
  name,
  size = 18,
  label,
  stroke = 1.8,
}: {
  name: IconName;
  size?: number;
  label?: string;
  /** Line weight in grid units; big tiles read better a little lighter. */
  stroke?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-directional={DIRECTIONAL.has(name) || undefined}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
