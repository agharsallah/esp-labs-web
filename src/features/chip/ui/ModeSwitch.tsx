import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { BOOK_PATH } from "@/features/reference/book/book-url";
import { isReferenceBuilt, referenceIndexQuery } from "@/features/reference/queries";
import { Icon } from "@/ui/Icon";
import styles from "./ModeSwitch.module.css";

/**
 * Two ways through the datasheet: explore it (the 3D chip, pins, atlas and inside pages) or read it
 * as one book. Pointing at "Read" starts loading the book's contents. Without the reference in the
 * build there is nothing to read, so no switch.
 */
export function ModeSwitch() {
  const { t } = useTranslation("chip");
  const client = useQueryClient();
  const reading = useLocation().pathname.startsWith(BOOK_PATH);
  if (!isReferenceBuilt()) return null;
  const warm = () => void client.prefetchQuery(referenceIndexQuery());
  return (
    <nav className={styles.switch} aria-label={t("mode.label")}>
      <Link to="/datasheet" viewTransition className={styles.option} aria-current={reading ? undefined : "page"}>
        <Icon name="chip" size={16} />
        {t("mode.explore")}
      </Link>
      <Link
        to={BOOK_PATH}
        viewTransition
        className={styles.option}
        aria-current={reading ? "page" : undefined}
        onPointerEnter={warm}
        onFocus={warm}
      >
        <Icon name="book" size={16} />
        {t("mode.read")}
      </Link>
    </nav>
  );
}
