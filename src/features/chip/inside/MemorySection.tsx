import { useTranslation } from "react-i18next";
import type { MemoryRegion } from "@/domain/chip";
import { AddressMap } from "@/ui/charts";
import { RichText } from "@/ui/RichText";
import { parseAddress } from "../logic/numbers";
import { Marker } from "../ui/Marker";
import { SourceLink } from "../ui/SourceLink";
import page from "../pages/page.module.css";
import styles from "./inside.module.css";

/** The address map as a tower, with the regions your sketch lives in highlighted and explained. */
export function MemorySection({ regions }: { regions: readonly MemoryRegion[] }) {
  const { t } = useTranslation("chip");
  const tower = regions.flatMap((r) => {
    const start = parseAddress(r.start);
    const end = parseAddress(r.end);
    return Number.isNaN(start) || Number.isNaN(end)
      ? []
      : [{ id: r.id, label: r.name, start, end: end + 1, highlight: r.yours ?? false }];
  });
  const yours = regions.filter((r) => r.yours);
  return (
    <div className={page.split}>
      <AddressMap caption={t("inside.memory.caption")} regions={tower} color="--fam-memory" />
      <div className={styles.side}>
        <h3 className={styles.sideHead}>
          <Marker kind="key" />
          {t("inside.memory.yours")}
        </h3>
        <ul className={styles.notes}>
          {yours.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong>
              {r.note ? (
                <p>
                  <RichText text={r.note} />
                </p>
              ) : null}
              <SourceLink source={r.source} compact />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
