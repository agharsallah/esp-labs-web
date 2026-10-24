import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { ChipBlock, Coverage } from "@/domain/chip";
import { ChipDescent } from "../scenes/ChipDescent";
import { FamilyLegend } from "../ui/FamilyLegend";
import styles from "./home.module.css";

export const LAYERS = ["board", "module", "can", "package", "die"] as const;

/** The scroll descent from the board to the die, with a caption card for each layer
 * (the die's carries the family key). */
export function Descent({
  blocks,
  coverage,
}: {
  blocks: readonly ChipBlock[];
  coverage: ReadonlyMap<string, Coverage>;
}) {
  const { t } = useTranslation("chip");
  const navigate = useNavigate();
  const die = blocks.map((b) => ({
    id: b.id,
    family: b.family,
    name: b.name,
    coverage: coverage.get(b.id) ?? "none",
  }));
  return (
    <ChipDescent
      blocks={die}
      layerCaptions={LAYERS.map((l) => t(`home.layers.${l}.title`))}
      onBlockPick={(id) => void navigate(`/chip/blocks/${id}`, { viewTransition: true })}
    >
      {(layer) => {
        const id = LAYERS[layer] ?? "board";
        return (
          <article key={id} className={styles.layerCard}>
            <p className={styles.layerStep}>{t("home.layerStep", { n: layer + 1, count: LAYERS.length })}</p>
            <h2>{t(`home.layers.${id}.title`)}</h2>
            <p>{t(`home.layers.${id}.text`)}</p>
            {id === "die" ? <FamilyLegend className={styles.layerLegend} /> : null}
          </article>
        );
      }}
    </ChipDescent>
  );
}
