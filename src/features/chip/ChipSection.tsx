import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useChipContent } from "./hooks/use-chip-content";
import { useChipCoverage } from "./hooks/use-chip-coverage";
import { ChipNav } from "./ui/ChipNav";
import styles from "./pages/page.module.css";

/** The chip section's frame: the page pills with their coverage meters, then the page. */
export function ChipSection() {
  const { t } = useTranslation();
  const { blocks } = useChipContent();
  const { coverage } = useChipCoverage(blocks);
  return (
    <div className={styles.section}>
      <ChipNav blocks={blocks} coverage={coverage} />
      <Suspense fallback={<p className="visually-hidden">{t("app.loading")}</p>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
