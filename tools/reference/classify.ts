import type { TableViz } from "./ast.ts";

// Picks the visual a table is drawn as, from the shape of its data. Every value is the number
// printed in the source (footnote marks dropped); a table with no clear shape stays a table.

/** "355", "–0.3", "2.4 [1]" → the number; anything else (ranges, "0.75 × VDD", "—") → null. */
export function parseNumber(cell: string): number | null {
  const s = cell
    .replace(/\[\d+\]|[*¹²³]/g, "")
    .replace(/^[–−]/, "-")
    .trim();
  return /^[-+]?\d+(?:\.\d+)?$/.test(s) ? Number(s) : null;
}

/** "0x3FC8_8000" → the address; anything else → null. */
export function parseAddress(cell: string): number | null {
  const s = cell.replace(/[*`_\s]/g, "");
  return /^0x[0-9a-f]{1,8}$/i.test(s) ? Number.parseInt(s.slice(2), 16) : null;
}

/** The unit in a column header: "Peak (mA)" → "mA". */
export function unitOf(header: string): string | null {
  return /\(([^()]+)\)\s*(?:\[\d+\]\s*)?$/.exec(header)?.[1]?.trim() ?? null;
}

const clean = (cell: string) => cell.replace(/\[\d+\]/g, "").replace(/\*/g, "").trim();
const spansDecades = (values: readonly number[]) => {
  const positive = values.filter((v) => v > 0);
  return positive.length === values.length && positive.length > 1 && Math.max(...positive) / Math.min(...positive) > 100;
};

const PIN = /^(?:GPIO|IO)(\d{1,2})$/;
const COUNTER = /^(?:no\.?|#|bits?|pin no\.?|version|number|register number)$/i;

export function classifyTable(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  if (rows.length < 2) return undefined;
  return timing(head, rows) ?? address(head, rows) ?? spec(head, rows) ?? pins(head, rows) ?? compare(head, rows);
}

/** Timing parameters: every row a t_XXX with one number (Min (µs)). */
function timing(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  const last = head.length - 1;
  const unit = unitOf(head[last] ?? "");
  if (!unit || !rows.every((r) => /^t_\w+/.test(clean(r[0] ?? "")))) return undefined;
  const items = rows.map((r) => ({ label: clean(r[0] ?? ""), value: parseNumber(r[last] ?? "") }));
  if (items.some((i) => i.value === null)) return undefined;
  return { kind: "timing", unit, items: items.map((i) => ({ label: i.label, value: i.value ?? 0 })) };
}

/** Address ranges: a low/start column followed by a high/end column, in hex. */
function address(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  const lo = head.findIndex((h) => /(?:low|start(?:ing)?)\s*address/i.test(h));
  const hi = lo + 1;
  if (lo < 0 || !/(?:high|end(?:ing)?)\s*address/i.test(head[hi] ?? "")) return undefined;
  const labelCol = head.findIndex((_, i) => i !== lo && i !== hi);
  const regions = rows.flatMap((r) => {
    const start = parseAddress(r[lo] ?? "");
    const end = parseAddress(r[hi] ?? "");
    const label = clean(r[labelCol] ?? "");
    return start !== null && end !== null && end >= start && label ? [{ label, start, end }] : [];
  });
  return regions.length >= 2 ? { kind: "address", regions } : undefined;
}

/** Specification rows: Min / Typ / Max columns, with a Unit column or units in the headers. */
function spec(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  const col = (re: RegExp) => head.findIndex((h) => re.test(clean(h)));
  const min = col(/^min\b/i);
  const typ = col(/^typ\b/i);
  const max = col(/^(?:max|limit)\b/i);
  if (min < 0 && max < 0) return undefined;
  const unitCol = col(/^units?$/i);
  const headerUnit = unitOf(head[min >= 0 ? min : max] ?? "");
  const groups = new Map<string, { label: string; min: number; typ?: number; max: number }[]>();
  for (const r of rows) {
    const at = (i: number) => (i >= 0 ? parseNumber(r[i] ?? "") : null);
    const [lo, mid, hi] = [at(min), at(typ), at(max)];
    const unit = unitCol >= 0 ? clean(r[unitCol] ?? "") : headerUnit;
    const first = lo ?? mid ?? hi;
    const last = hi ?? mid ?? lo;
    if (first === null || last === null || !unit) continue;
    const item = { label: clean(r[0] ?? ""), min: first, ...(mid !== null ? { typ: mid } : {}), max: last };
    groups.set(unit, [...(groups.get(unit) ?? []), item]);
  }
  // A unit with a single row makes a chart of one bar: those rows stay in the source table.
  const out = [...groups].filter(([, items]) => items.length >= 2).map(([unit, items]) => ({
    unit,
    log: spansDecades(items.flatMap((i) => [i.min, i.max])),
    items,
  }));
  return out.reduce((n, g) => n + g.items.length, 0) >= 2 ? { kind: "range", groups: out } : undefined;
}

/** Pin tables: a column of GPIOn / IOn names with function columns beside it. */
function pins(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  const labelCol = head.findIndex((_, i) => rows.filter((r) => PIN.test(clean(r[i] ?? ""))).length >= 3);
  if (labelCol < 0) return undefined;
  const cols = head
    .map((h, i) => ({ h: clean(h), i }))
    .filter(({ h, i }) => i !== labelCol && !COUNTER.test(h) && rows.some((r) => clean(r[i] ?? "") !== "" && parseNumber(r[i] ?? "") === null));
  if (cols.length === 0) return undefined;
  return {
    kind: "pins",
    columns: cols.map((c) => c.h),
    // Rows with no function at all (power, crystal) say nothing in a grid.
    rows: rows.flatMap((r) => {
      const label = clean(r[labelCol] ?? "");
      const pin = PIN.exec(label)?.[1];
      const cells = cols.map((c) => clean(r[c.i] ?? "") || null);
      return cells.some((c) => c !== null) ? [{ label, ...(pin !== undefined ? { pin: Number(pin) } : {}), cells }] : [];
    }),
  };
}

/** One numeric column with a unit across items: compared as bars. */
function compare(head: readonly string[], rows: readonly (readonly string[])[]): TableViz | undefined {
  if (rows.length < 3) return undefined;
  const numeric = head
    .map((h, i) => ({ h, i }))
    .filter(({ h, i }) => i > 0 && !COUNTER.test(clean(h)) && rows.every((r) => parseNumber(r[i] ?? "") !== null));
  const only = numeric.length === 1 ? numeric[0] : undefined;
  const unit = only ? unitOf(only.h) : null;
  if (!only || !unit) return undefined;
  const text = head.map((_, i) => i).filter((i) => i !== only.i && rows.every((r) => parseNumber(r[i] ?? "") === null)).slice(0, 2);
  const items = rows.map((r) => ({
    label: text.map((i) => clean(r[i] ?? "")).filter(Boolean).join(" · "),
    value: parseNumber(r[only.i] ?? "") ?? 0,
  }));
  return { kind: "compare", unit, log: spansDecades(items.map((i) => i.value)), items };
}
