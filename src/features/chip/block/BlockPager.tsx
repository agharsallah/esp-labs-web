import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { ChipBlock } from "@/domain/chip";
import { Icon } from "@/ui/Icon";
import styles from "./block.module.css";

/** Previous and next block, in atlas order. */
export function BlockPager({ prev, next }: { prev?: ChipBlock; next?: ChipBlock }) {
  const { t } = useTranslation("chip");
  return (
    <nav className={styles.pager} aria-label={t("block.pager")}>
      {prev ? (
        <Link to={`/datasheet/blocks/${prev.id}`} viewTransition rel="prev" className={styles.prev}>
          <Icon name="back" size={16} />
          <span>
            <small>{t("block.prev")}</small>
            {prev.name}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/datasheet/blocks/${next.id}`} viewTransition rel="next" className={styles.next}>
          <span>
            <small>{t("block.next")}</small>
            {next.name}
          </span>
          <Icon name="arrow" size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
