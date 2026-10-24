import { useTranslation } from "react-i18next";
import styles from "./Marker.module.css";

export type MarkerKind = "key" | "gotcha" | "used";

/**
 * What matters, by shape and not colour alone: a solid copper pad (key fact), a warning triangle
 * (gotcha), a ring with a dot (used in our labs). Each carries its name for screen readers.
 */
export function Marker({ kind }: { kind: MarkerKind }) {
  const { t } = useTranslation("chip");
  return (
    <svg className={styles.marker} data-kind={kind} viewBox="0 0 16 16" role="img" aria-label={t(`markers.${kind}`)}>
      {kind === "key" ? <rect x="3" y="3" width="10" height="10" rx="2" /> : null}
      {kind === "gotcha" ? (
        <>
          <path d="M8 1.8 15 14H1z" />
          <path className={styles.mark} d="M8 6v4M8 11.6v.4" />
        </>
      ) : null}
      {kind === "used" ? (
        <>
          <circle cx="8" cy="8" r="5.5" className={styles.ring} />
          <circle cx="8" cy="8" r="2.2" />
        </>
      ) : null}
    </svg>
  );
}
