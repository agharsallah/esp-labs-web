import { useTranslation } from "react-i18next";
import type { PowerMode } from "@/domain/chip";
import { Ladder } from "@/ui/charts";
import { gainOver } from "../logic/numbers";
import { useNumber } from "../hooks/use-format";
import { Marker } from "../ui/Marker";
import styles from "./inside.module.css";

/** Power modes as a ladder on a log axis, with what each keeps on and the gain of the last rung. */
export function PowerSection({ modes }: { modes: readonly PowerMode[] }) {
  const { t } = useTranslation("chip");
  const num = useNumber();
  const first = modes[0];
  const last = modes.at(-1);
  const gain = first && last ? gainOver(first.currentMa.typ, last.currentMa.typ) : 0;
  return (
    <>
      {first && last && gain > 1 ? (
        <p className={styles.gain}>
          <Marker kind="key" />
          {t("inside.power.gain", { last: last.name, first: first.name, gain: num(gain, 0) })}
        </p>
      ) : null}
      <Ladder
        caption={t("inside.power.caption")}
        rungs={modes.map((m) => ({ id: m.id, label: m.name, value: m.currentMa.typ, items: m.keepsOn }))}
        unit="mA"
        color="--fam-radio"
        format={(v) => num(v)}
      />
    </>
  );
}
