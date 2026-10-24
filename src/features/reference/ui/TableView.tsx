import { useTranslation } from "react-i18next";
import { ScrollBox } from "@/ui/ScrollBox";
import type { Block } from "../schema";
import { InlineView } from "./InlineView";
import { useReader } from "./reader-context";
import { VizView } from "./VizView";
import styles from "./reader.module.css";

type TableBlock = Extract<Block, { t: "table" }>;

/**
 * A table of the reference. When its data has a shape (ranges, one value per item, addresses,
 * pins, timings) it is drawn with the chart kit and the source table is one tap away.
 */
export function TableView({ table }: { table: TableBlock }) {
  const { t } = useTranslation("chip");
  const caption = table.caption ?? t("reader.chart.untitled");
  if (!table.viz) return <SourceTable table={table} caption={table.caption} />;
  return (
    <div className={styles.viz}>
      <VizView viz={table.viz} caption={caption} />
      <details className={styles.details}>
        <summary>{t("reader.table.source")}</summary>
        <SourceTable table={table} caption={table.caption} />
      </details>
    </div>
  );
}

function SourceTable({ table, caption }: { table: TableBlock; caption: string | undefined }) {
  const { t } = useTranslation("chip");
  const { highlight } = useReader();
  return (
    <ScrollBox label={caption ?? t("reader.table.fallback")}>
      <table className={styles.table}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {table.head.map((h, i) => (
              <th key={i} scope="col">
                <InlineView nodes={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.n} data-n={row.n} className={highlight.has(row.n) ? styles.highlight : undefined}>
              {row.c.map((cell, i) => (
                <td key={i}>
                  <InlineView nodes={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollBox>
  );
}
