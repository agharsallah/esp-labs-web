import { useTranslation } from "react-i18next";
import { AddressMap, CompareBars, PinMatrix, RangeBar } from "@/ui/charts";
import type { TableViz } from "../schema";
import { PinChip } from "./InlineView";
import { TimingDiagram } from "./TimingDiagram";
import styles from "./reader.module.css";

/** A table's data drawn as the visual its shape asked for (tools/reference/classify.ts). */
export function VizView({ viz, caption }: { viz: TableViz; caption: string }) {
  const { t } = useTranslation("chip");
  switch (viz.kind) {
    case "range":
      return viz.groups.map((g) => (
        <RangeBar
          key={g.unit}
          caption={viz.groups.length > 1 ? t("reader.chart.unit", { caption, unit: g.unit }) : caption}
          unit={g.unit}
          log={g.log}
          items={g.items.map((item, i) => ({ id: `r${i}`, ...item }))}
        />
      ));
    case "compare":
      return (
        <CompareBars
          caption={caption}
          unit={viz.unit}
          log={viz.log}
          items={viz.items.map((item, i) => ({ id: `c${i}`, ...item }))}
        />
      );
    case "address":
      return <AddressMap caption={caption} regions={viz.regions.map((r, i) => ({ id: `a${i}`, ...r }))} />;
    case "pins": {
      const pins = viz.rows.flatMap((r) => (r.pin !== undefined ? [{ pin: r.pin, label: r.label }] : []));
      return (
        <>
          <PinMatrix
            caption={caption}
            columns={viz.columns.map((label, i) => ({ id: `c${i}`, label }))}
            rows={viz.rows.map((r, i) => ({
              id: `p${i}`,
              label: r.label,
              cells: Object.fromEntries(r.cells.flatMap((cell, c) => (cell ? [[`c${c}`, { label: cell }]] : []))),
            }))}
          />
          {pins.length > 0 ? (
            <nav className={styles.pinLinks} aria-label={t("reader.pins")}>
              <span>{t("reader.pins")}</span>
              {[...new Map(pins.map((p) => [p.pin, p])).values()].map((p) => (
                <PinChip key={p.pin} n={p.pin} text={p.label} />
              ))}
            </nav>
          ) : null}
        </>
      );
    }
    case "timing":
      return <TimingDiagram caption={caption} unit={viz.unit} items={viz.items} />;
  }
}
