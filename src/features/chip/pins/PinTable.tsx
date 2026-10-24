import { useTranslation } from "react-i18next";
import { type ChipPin, PIN_FUNCTION_KINDS, type PinFunctionKind } from "@/domain/chip";
import { PinMatrix } from "@/ui/charts";
import { ChoiceGroup } from "@/ui/ChoiceGroup";
import { functionsOfKind, pinWarns } from "../logic/pins";

/** The GPIO × function matrix, with a filter by function and the pins our labs used emphasised. */
export function PinTable({
  pins,
  used,
  kind,
  onKind,
}: {
  pins: readonly ChipPin[];
  used: ReadonlySet<string>;
  kind: PinFunctionKind | "all";
  onKind: (kind: PinFunctionKind | "all") => void;
}) {
  const { t } = useTranslation("chip");
  const columns = PIN_FUNCTION_KINDS.map((k) => ({ id: k, label: t(`pins.kinds.${k}`) }));
  const rows = pins.map((p) => ({
    id: String(p.gpio),
    label: t("pins.pin", { n: p.gpio }),
    warn: pinWarns(p),
    cells: Object.fromEntries(
      PIN_FUNCTION_KINDS.flatMap((k) => {
        const label = functionsOfKind(p, k);
        return label ? [[k, { label }]] : [];
      }),
    ),
  }));
  return (
    <>
      <ChoiceGroup
        label={t("pins.filter")}
        choices={[{ key: "all" as const, label: t("pins.all") }, ...columns.map((c) => ({ key: c.id, label: c.label }))]}
        value={kind}
        onChange={onKind}
      />
      <PinMatrix
        caption={t("pins.matrix")}
        columns={columns}
        rows={rows}
        filter={kind === "all" ? undefined : kind}
        highlighted={used}
      />
    </>
  );
}
