import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Share } from "../logic/book";
import styles from "../book.module.css";

/** A thin bar of how much has been read, its numbers beside it, named for screen readers. */
export function Meter({ share }: { share: Share }) {
  const { t } = useTranslation("chip");
  const ratio = share.total ? share.read / share.total : 0;
  return (
    <span className={styles.meter} role="img" aria-label={t("book.progress", { read: share.read, total: share.total })}>
      <span className={styles.meterBar} aria-hidden="true">
        <i style={{ "--share": ratio } as CSSProperties} />
      </span>
      <span className={styles.meterCount} aria-hidden="true">
        {share.read}/{share.total}
      </span>
    </span>
  );
}
