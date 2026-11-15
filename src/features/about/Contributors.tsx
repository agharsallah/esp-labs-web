import contributors from "virtual:contributors";
import { useTranslation } from "react-i18next";
import { CONTRIBUTORS_URL } from "./about-links";
import styles from "./AboutDialog.module.css";

/**
 * The people who contributed on GitHub, each linking to their profile, then the repo's full
 * contributors page. The list is bundled at build time (tools/contributors), so nothing is fetched
 * here; with nobody to list yet, the section is left out.
 */
export function Contributors() {
  const { t } = useTranslation();
  if (contributors.length === 0) return null;
  return (
    <>
      <p className={styles.made}>{t("about.thanks")}</p>
      <ul className={styles.people}>
        {contributors.map((c) => (
          <li key={c.login}>
            <a href={c.url} target="_blank" rel="noreferrer noopener" className={styles.person}>
              <bdi dir="ltr">@{c.login}</bdi>
              <span className="visually-hidden">{t("about.newTab")}</span>
            </a>
          </li>
        ))}
        <li>
          <a
            href={CONTRIBUTORS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.everyone}
          >
            {t("about.allContributors")}
            <span className="visually-hidden">{t("about.newTab")}</span>
          </a>
        </li>
      </ul>
    </>
  );
}
