import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { KeyRegister } from "@/domain/chip";
import { RichText } from "@/ui/RichText";
import { layoutRegister, REGISTER_BITS } from "../logic/register-layout";
import { SourceLink } from "./SourceLink";
import styles from "./RegisterStrip.module.css";

/**
 * A key register as a bit-field strip: its fields placed by bit range across 32 bits, reserved
 * bits greyed. The strip is a picture; the table under it carries the same fields for everyone.
 */
export function RegisterStrip({ register }: { register: KeyRegister }) {
  const { t } = useTranslation("chip");
  const strip = layoutRegister(register.fields);
  const named = strip.filter((s) => s.field !== null);
  return (
    <figure className={styles.register}>
      <figcaption className={styles.caption}>
        <code>{register.symbol}</code>
        <span>{t("block.offset", { offset: register.offset })}</span>
      </figcaption>
      <div className={styles.strip} aria-hidden="true" style={{ "--bits": REGISTER_BITS } as CSSProperties}>
        {strip.map((s) => (
          <span
            key={`${s.hi}-${s.lo}`}
            className={styles.segment}
            data-reserved={s.field === null || undefined}
            style={{ gridColumn: `${s.start + 1} / span ${s.width}` }}
            title={s.field?.symbol}
          >
            <span className={styles.bits}>{s.hi === s.lo ? s.hi : `${s.hi}:${s.lo}`}</span>
            {s.field ? <span className={styles.field}>{s.field.symbol}</span> : null}
          </span>
        ))}
      </div>
      <table className={styles.table}>
        <caption className="visually-hidden">{register.symbol}</caption>
        <thead>
          <tr>
            <th scope="col">{t("block.bits")}</th>
            <th scope="col">{t("block.field")}</th>
            <th scope="col">{t("block.does")}</th>
          </tr>
        </thead>
        <tbody>
          {named.map((s) => (
            <tr key={`${s.hi}-${s.lo}`}>
              <td>{s.field?.bits}</td>
              <th scope="row">
                <code>{s.field?.symbol}</code>
              </th>
              <td>{s.field ? <RichText text={s.field.does} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SourceLink source={register.source} compact />
    </figure>
  );
}
