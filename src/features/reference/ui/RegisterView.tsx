import { useTranslation } from "react-i18next";
import type { KeyRegister } from "@/domain/chip";
import { RegisterStrip } from "@/features/chip/ui/RegisterStrip";
import { ScrollBox } from "@/ui/ScrollBox";
import { richOf } from "../logic/text";
import { sourceOf } from "../ref-param";
import type { Block } from "../schema";
import { InlineView } from "./InlineView";
import { useReader } from "./reader-context";
import styles from "./reader.module.css";

type RegisterBlock = Extract<Block, { t: "register" }>;

const isReserved = (field: string) => /^\(?reserved\)?$/i.test(field.trim());

/** A register: the chip pages' bit-field strip, then every field with its access and reset value. */
export function RegisterView({ register }: { register: RegisterBlock }) {
  const { t } = useTranslation("chip");
  const { sectionId, highlight } = useReader();
  const key: KeyRegister = {
    symbol: register.name,
    offset: register.offset,
    fields: register.fields
      .filter((f) => !isReserved(f.field))
      .map((f) => ({ bits: f.bits, symbol: f.field, does: richOf(f.desc) })),
    source: sourceOf(sectionId),
  };
  return (
    <section
      data-n={register.n}
      className={`${styles.register} ${highlight.has(register.n) ? styles.highlight : ""}`}
      aria-label={register.name}
    >
      <RegisterStrip register={key} />
      <details className={styles.details}>
        <summary>{t("reader.register.fields")}</summary>
        <ScrollBox label={register.name}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t("reader.register.bits")}</th>
                <th scope="col">{t("reader.register.field")}</th>
                <th scope="col">{t("reader.register.access")}</th>
                <th scope="col">{t("reader.register.reset")}</th>
                <th scope="col">{t("reader.register.description")}</th>
              </tr>
            </thead>
            <tbody>
              {register.fields.map((f) => (
                <tr key={`${f.bits}-${f.field}`}>
                  <td className={styles.mono}>{f.bits}</td>
                  <th scope="row" className={styles.mono}>
                    {f.field}
                  </th>
                  <td className={styles.mono}>{f.access}</td>
                  <td className={styles.mono}>{f.reset}</td>
                  <td>
                    <InlineView nodes={f.desc} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollBox>
      </details>
    </section>
  );
}
