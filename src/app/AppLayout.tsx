/* eslint-disable i18next/no-literal-string -- literal text here is the repository name, not interface text. */
import { Trans, useTranslation } from "react-i18next";
import { Link, Outlet, ScrollRestoration, useLocation, useNavigation } from "react-router";
import { BenchPill } from "@/features/bench/BenchPill";
import { LanguageMenu } from "@/features/language/LanguageMenu";
import { BackToTop } from "@/ui/BackToTop";
import { Icon, type IconName } from "@/ui/Icon";
import styles from "./AppLayout.module.css";
import { isNewUntil } from "./new-badge";
import { prefetchChip } from "./prefetch-chip";

const SECTIONS = [
  { to: "/", key: "labs", icon: "board", match: /^\/($|lessons|tracks)/ },
  // Shipped 25 Oct 2026: marked new for three days.
  { to: "/datasheet", key: "chip", icon: "chip", match: /^\/datasheet/, newUntil: "2026-10-28" },
  { to: "/log", key: "bench", icon: "log", match: /^\/log/ },
  { to: "/settings", key: "settings", icon: "sliders", match: /^\/settings/ },
] as const satisfies readonly {
  to: string;
  key: string;
  icon: IconName;
  match: RegExp;
  newUntil?: string;
}[];

/** A slim top bar, the page, and a footnote. Shared by every route. */
export function AppLayout() {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  return (
    <div className={styles.wrap}>
      {/* The hash router owns location.hash, so the skip link moves focus itself. */}
      <a
        className={styles.skip}
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t("layout.skip")}
      </a>
      {navigation.state !== "idle" ? (
        <div className={styles.progress} role="progressbar" aria-label={t("layout.loading")} />
      ) : null}
      <header className={styles.top}>
        <Link to="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <Icon name="chip" size={20} />
          </span>
          <span>
            <span className={styles.eyebrow}>esp-labs</span>
            <span className={styles.name}>
              <Trans
                t={t}
                i18nKey="layout.brand"
                components={{ part: <span className={styles.part} /> }}
              />
            </span>
          </span>
        </Link>
        <BenchPill />
        <nav aria-label={t("layout.sections")} className={styles.sections}>
          {SECTIONS.map((s) => {
            const here = s.match.test(pathname);
            return (
              <Link
                key={s.to}
                to={s.to}
                onPointerEnter={s.key === "chip" ? prefetchChip : undefined}
                onFocus={s.key === "chip" ? prefetchChip : undefined}
                aria-current={here ? (pathname === s.to ? "page" : "true") : undefined}
              >
                <Icon name={s.icon} size={17} />
                <span className={styles.navLabel}>{t(`layout.nav.${s.key}`)}</span>
                {"newUntil" in s && isNewUntil(s.newUntil) ? (
                  <span className={styles.newBadge}>{t("layout.new")}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <LanguageMenu />
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <p className={styles.foot}>
        {t("layout.footnote")} <Link to="/parts">{t("layout.partsLink")}</Link>
      </p>
      <BackToTop />
      <ScrollRestoration />
    </div>
  );
}
