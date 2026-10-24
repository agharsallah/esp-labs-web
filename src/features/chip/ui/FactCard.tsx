import type { ChipFact } from "@/domain/chip";
import { RichText } from "@/ui/RichText";
import { Marker } from "./Marker";
import { SourceLink } from "./SourceLink";
import styles from "./cards.module.css";

/** One fact: its marker (key or gotcha; details have none), the sentence and its source. */
export function FactCard({ fact }: { fact: ChipFact }) {
  return (
    <li className={styles.fact} data-importance={fact.importance}>
      {fact.importance === "detail" ? <span className={styles.dot} aria-hidden="true" /> : <Marker kind={fact.importance} />}
      <div className={styles.body}>
        <p>
          <RichText text={fact.text} />
        </p>
        <SourceLink source={fact.source} compact />
      </div>
    </li>
  );
}
