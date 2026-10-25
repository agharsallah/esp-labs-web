import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router";
import { BOOK_PATH } from "@/features/reference/book/book-url";
import { useChipContent } from "./hooks/use-chip-content";
import { useChipCoverage } from "./hooks/use-chip-coverage";
import { ChipNav } from "./ui/ChipNav";
import { ModeSwitch } from "./ui/ModeSwitch";
import styles from "./pages/page.module.css";

/**
 * The chip section's frame: explore or read, then (exploring) the page pills with their coverage
 * meters, then the page.
 */
export function ChipSection() {
  const { t } = useTranslation();
  const { blocks } = useChipContent();
  const { coverage } = useChipCoverage(blocks);
  const reading = useLocation().pathname.startsWith(BOOK_PATH);
  return (
    <div className={styles.section}>
      <ModeSwitch />
      {reading ? null : <ChipNav blocks={blocks} coverage={coverage} />}
      <Suspense fallback={<p className="visually-hidden">{t("app.loading")}</p>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
