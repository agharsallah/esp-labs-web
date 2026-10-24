import { useTranslation } from "react-i18next";
import type { ChipPin, Gotcha } from "@/domain/chip";
import { GotchaCard } from "../ui/GotchaCard";
import { Marker } from "../ui/Marker";
import styles from "./pins.module.css";

/** The picked pin: its functions by kind, its strapping role and the gotchas that bite it. */
export function PinDetail({ pin, gotchas, used }: { pin: ChipPin; gotchas: readonly Gotcha[]; used: boolean }) {
  const { t } = useTranslation("chip");
  return (
    <article className={styles.detail} aria-labelledby="pin-detail">
      <h3 id="pin-detail" className={styles.detailTitle}>
        {t("pins.pin", { n: pin.gpio })}
        {used ? (
          <span className={styles.used}>
            <Marker kind="used" />
            {t("pins.used")}
          </span>
        ) : null}
      </h3>
      {pin.onHeader ? null : <p className={styles.note}>{t("pins.offHeader")}</p>}
      <dl className={styles.functions}>
        {pin.functions.map((f) => (
          <div key={`${f.kind}-${f.symbol}`}>
            <dt>{t(`pins.kinds.${f.kind}`)}</dt>
            <dd>
              <code>{f.symbol}</code>
            </dd>
          </div>
        ))}
      </dl>
      {pin.strapping ? (
        <p>
          <strong>{t("pins.strapping")}</strong> {pin.strapping}
        </p>
      ) : null}
      {gotchas.map((g) => (
        <GotchaCard key={g.id} gotcha={g} linked={false} />
      ))}
    </article>
  );
}
