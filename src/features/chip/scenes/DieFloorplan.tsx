import { useState } from "react";
import { FamilyLegend } from "../ui/FamilyLegend";
import { DieStage } from "./DieStage";
import { FlatFloorplan } from "./FlatFloorplan";
import { type DieBlock, floorplan } from "./floorplan";
import styles from "./scenes.module.css";

export interface DieFloorplanProps {
  blocks: readonly DieBlock[];
  onBlockPick?: (id: string) => void;
}

/**
 * The die alone, for the atlas header: block tiles in 3D raised by coverage, with the same tiles
 * as a key of families and a compact row of buttons under it (hovering or focusing one lifts its tile), so 3D is never the only
 * way in. The list alone stays when 3D can't run or is too slow.
 */
export function DieFloorplan({ blocks, onBlockPick }: DieFloorplanProps) {
  const [flat, setFlat] = useState(false);
  const [lit, setLit] = useState<string | null>(null);
  const plan = floorplan(blocks);
  return (
    <div className={styles.die}>
      {flat ? null : (
        <DieStage
          plan={plan}
          lit={lit}
          onLight={setLit}
          onBlockPick={onBlockPick}
          onFallback={() => setFlat(true)}
        />
      )}
      <FamilyLegend />
      <FlatFloorplan plan={plan} lit={lit} onPick={onBlockPick} onLight={setLit} variant={flat ? "grid" : "chips"} />
    </div>
  );
}
