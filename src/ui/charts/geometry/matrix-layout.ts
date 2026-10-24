import { wrapLabel } from "./text-fit";

export interface MatrixGeometry {
  width: number;
  height: number;
  /** x of each column's left edge, in column order. */
  columns: number[];
  /** y of each row's top edge, in row order. */
  rows: number[];
  cell: number;
  /** Height of a row; the cell width when not given. */
  rowHeight: number;
}

/** A grid of cells after a row-header band (left) and a column-header band (top). */
export function layoutMatrix(
  rowCount: number,
  columnCount: number,
  opts: { cell: number; rowHeader: number; columnHeader: number; rowHeight?: number },
): MatrixGeometry {
  const rowHeight = opts.rowHeight ?? opts.cell;
  const columns = Array.from({ length: columnCount }, (_, i) => opts.rowHeader + i * opts.cell);
  const rows = Array.from({ length: rowCount }, (_, i) => opts.columnHeader + i * rowHeight);
  return {
    width: opts.rowHeader + columnCount * opts.cell,
    height: opts.columnHeader + rowCount * rowHeight,
    columns,
    rows,
    cell: opts.cell,
    rowHeight,
  };
}

/** Rows that have a cell in `column` (all rows when no column is given). */
export function filterRows<R extends { cells: Readonly<Record<string, unknown>> }>(
  rows: readonly R[],
  column: string | undefined,
): R[] {
  return column === undefined ? [...rows] : rows.filter((r) => r.cells[column] !== undefined);
}

export interface MatrixFit {
  cell: number;
  /** Rows stay compact however wide the cells grow. */
  rowHeight: number;
  rowHeader: number;
  columnHeader: number;
  /** Column headers set at an angle, because flat ones would not fit their cells. */
  rotated: boolean;
  /** Extra width after the last column for a rotated header that leans past it. */
  overhang: number;
  /** Each column header as its lines (one or two flat lines, or one rotated line). */
  headers: string[][];
}

/**
 * Sizes the matrix to `available` width: cells share what the row header leaves, between
 * `minCell` and `maxCell`. Column headers lie flat (wrapped to two lines if needed) when every
 * one fits its cell, else they are rotated. `available` 0 (not measured yet) gives the smallest grid.
 */
export function fitMatrix(
  available: number,
  columnLabels: readonly string[],
  rowLabels: readonly string[],
  opts: { minCell: number; maxCell: number; maxRow: number; charWidth: number; lineHeight: number; rowHeader: { min: number; max: number; lead: number } },
): MatrixFit {
  const longestRow = Math.max(0, ...rowLabels.map((l) => [...l].length));
  const rowHeader = Math.min(opts.rowHeader.max, Math.max(opts.rowHeader.min, opts.rowHeader.lead + longestRow * opts.charWidth + 6));
  const share = columnLabels.length > 0 ? (available - rowHeader) / columnLabels.length : opts.maxCell;
  const cell = Math.floor(Math.min(opts.maxCell, Math.max(opts.minCell, share)));
  const room = Math.max(1, Math.floor((cell - 4) / opts.charWidth));
  const flat = columnLabels.map((l) => wrapLabel(l, room));
  const fits = flat.every((lines, i) => lines.join(" ") === (columnLabels[i] ?? "").trim());
  if (fits) {
    const lines = Math.max(1, ...flat.map((l) => l.length));
    return { cell, rowHeader, columnHeader: lines * opts.lineHeight + 8, rowHeight: Math.min(cell, opts.maxRow), rotated: false, overhang: 0, headers: flat };
  }
  const headers = columnLabels.map((l) => wrapLabel(l, 12, 1));
  const length = Math.max(1, ...headers.map((h) => [...(h[0] ?? "")].length)) * opts.charWidth;
  // Text at -50°: it rises by length × sin 50° and leans right by length × cos 50°.
  const overhang = Math.ceil(length * 0.65);
  const tight = columnLabels.length > 0 ? (available - rowHeader - overhang) / columnLabels.length : opts.maxCell;
  const narrow = Math.floor(Math.min(cell, Math.max(opts.minCell, tight)));
  return {
    cell: narrow,
    rowHeight: Math.min(narrow, opts.maxRow),
    rowHeader,
    columnHeader: Math.ceil(length * 0.77 + 12),
    rotated: true,
    overhang,
    headers,
  };
}
