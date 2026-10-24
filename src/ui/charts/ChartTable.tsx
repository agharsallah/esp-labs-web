import styles from "./charts.module.css";

export interface ChartTableRow {
  key: string;
  /** The first cell heads the row. */
  cells: readonly string[];
}

/** The chart's data as a real table: what screen readers read, and what "Show as table" reveals. */
export function ChartTable({
  id,
  caption,
  columns,
  rows,
  visible,
}: {
  id: string;
  caption: string;
  columns: readonly string[];
  rows: readonly ChartTableRow[];
  visible: boolean;
}) {
  return (
    <div id={id} className={visible ? styles.tableWrap : "visually-hidden"}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              {r.cells.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={i}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
