import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import type { ChipBlock, Coverage } from "@/domain/chip";
import { CHIP_PAGES, pageCoverage } from "../logic/nav-pages";
import styles from "./ChipNav.module.css";

/** The chip section as a strip of pills, one per page, each with a meter of the blocks used. */
export function ChipNav({
  blocks,
  coverage,
}: {
  blocks: readonly ChipBlock[];
  coverage: ReadonlyMap<string, Coverage>;
}) {
  const { t } = useTranslation("chip");
  return (
    <nav className={styles.nav} aria-label={t("nav.label")}>
      <ul>
        {CHIP_PAGES.map((page) => {
          const { used, total } = pageCoverage(blocks, coverage, page.families);
          const share = total ? used / total : 0;
          const title = t(`pages.${page.id}`);
          return (
            <li key={page.id}>
              <NavLink
                to={page.to}
                end={page.id === "home" || page.id === "blocks"}
                viewTransition
                className={styles.pill}
                aria-label={t("nav.pill", { title, used, total })}
              >
                <span className={styles.title}>{title}</span>
                <span className={styles.meter} aria-hidden="true">
                  <i style={{ "--share": share } as CSSProperties} />
                </span>
                <span className={styles.count} aria-hidden="true">
                  {used}/{total}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
