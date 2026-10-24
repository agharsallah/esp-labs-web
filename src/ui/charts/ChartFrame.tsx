import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "@/lib/use-in-view";
import { ScrollBox } from "@/ui/ScrollBox";
import { ChartTable, type ChartTableRow } from "./ChartTable";
import styles from "./charts.module.css";

export interface ChartTableData {
  columns: readonly string[];
  rows: readonly ChartTableRow[];
}

/**
 * What every chart shares: a <figure> named by its caption, the drawing (hidden from screen
 * readers, who get the table), the data table and its "Show as table" toggle, and `data-shown`
 * once the figure scrolls into view, which the CSS entry motion keys on.
 */
export function ChartFrame({
  caption,
  table,
  wide = false,
  className,
  children,
}: {
  caption: string;
  table: ChartTableData;
  /** Wide drawings scroll inside themselves on narrow screens. */
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const id = useId();
  const tableId = `${id}-table`;
  const captionId = `${id}-caption`;
  const [open, setOpen] = useState(false);
  const [ref, shown] = useInView<HTMLElement>();
  const drawing = <div aria-hidden="true">{children}</div>;
  return (
    <figure ref={ref} aria-labelledby={captionId} className={`${styles.frame} ${className ?? ""}`} data-shown={shown || undefined}>
      <figcaption className={styles.caption}>
        <span id={captionId}>{caption}</span>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={tableId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? t("charts.hideTable") : t("charts.showTable")}
        </button>
      </figcaption>
      {wide ? <ScrollBox label={caption}>{drawing}</ScrollBox> : drawing}
      <ChartTable id={tableId} caption={caption} columns={table.columns} rows={table.rows} visible={open} />
    </figure>
  );
}
