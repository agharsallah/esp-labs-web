import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Gotcha } from "@/domain/chip";
import { RichText } from "@/ui/RichText";
import { Marker } from "./Marker";
import { SourceLink } from "./SourceLink";
import styles from "./cards.module.css";

/** A pitfall, always with the warning triangle, linking to its first pin or block. */
export function GotchaCard({ gotcha, linked = true }: { gotcha: Gotcha; linked?: boolean }) {
  const { t } = useTranslation("chip");
  const pin = gotcha.pins?.[0];
  const block = gotcha.blocks?.[0];
  const to =
    pin !== undefined ? `/datasheet/pins?pin=${pin}` : block !== undefined ? `/datasheet/blocks/${block}` : null;
  return (
    <article className={styles.gotcha}>
      <h3 className={styles.gotchaTitle}>
        <Marker kind="gotcha" />
        {gotcha.title}
      </h3>
      <p>
        <RichText text={gotcha.text} />
      </p>
      <footer className={styles.gotchaFoot}>
        <SourceLink source={gotcha.source} compact />
        {linked && to ? (
          <Link to={to} viewTransition className={styles.more}>
            {pin !== undefined ? t("gotchas.seePin", { n: pin }) : t("gotchas.seeBlock")}
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
