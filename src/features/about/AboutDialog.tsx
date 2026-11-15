import { type ReactNode, useEffect, useId, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { GithubMark } from "@/ui/GithubMark";
import { Icon } from "@/ui/Icon";
import { RichText } from "@/ui/RichText";
import { XMark } from "@/ui/XMark";
import { AUTHOR_LINKS, COFFEE_URL, ISSUES_URL, isOutside } from "./about-links";
import styles from "./AboutDialog.module.css";
import { Contributors } from "./Contributors";

/**
 * The top bar's "About" button and the modal it opens: what the guide is and is not, who made it,
 * and where to find them. A native <dialog>: focus is trapped, Escape closes, focus returns to the
 * button, and a click on the dimmed page around it closes it too.
 */
export function AboutDialog() {
  const { t } = useTranslation();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();

  // A click on the dimmed page around the box targets the dialog itself, outside its box.
  useEffect(() => {
    const box = dialog.current;
    if (!box) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === box && isOutside(box.getBoundingClientRect(), e.clientX, e.clientY)) {
        box.close();
      }
    };
    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="dialog"
        aria-label={t("about.open")}
        onClick={open}
      >
        <Icon name="info" size={17} />
        <span className={styles.buttonLabel}>{t("about.button")}</span>
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-tagline`}
      >
        <div className={styles.head}>
          <h2 id={`${id}-title`} className={styles.title}>
            {t("about.title")}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label={t("about.close")}
            onClick={close}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <p id={`${id}-tagline`} className={styles.tagline}>
          {t("about.tagline")}
        </p>
        <div className={styles.body}>
          <p>
            <RichText text={t("about.intro")} />
          </p>
          <p>{t("about.disclaimer")}</p>
          <p>
            <Trans
              t={t}
              i18nKey="about.feedback"
              components={{
                issues: <IssuesLink />,
              }}
            />
          </p>
        </div>
        <hr className={styles.rule} />
        <p className={styles.made}>
          <RichText text={t("about.madeBy")} />
        </p>
        <Contributors />
        <p className={styles.made}>{t("about.connect")}</p>
        <div className={styles.links}>
          {AUTHOR_LINKS.map((l) => (
            <a
              key={l.id}
              className={styles.link}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {l.id === "github" ? <GithubMark size={16} /> : null}
              {l.id === "x" ? <XMark size={14} /> : null}
              {t(`about.links.${l.id}`)}
              <Icon name="external" size={14} />
              <span className="visually-hidden">{t("about.newTab")}</span>
            </a>
          ))}
          <a className={styles.coffee} href={COFFEE_URL} target="_blank" rel="noreferrer noopener">
            <Icon name="coffee" size={18} stroke={2} />
            {t("about.links.coffee")}
            <span className="visually-hidden">{t("about.newTab")}</span>
          </a>
        </div>
      </dialog>
    </>
  );
}

/** The feedback sentence's link; <Trans> fills in its words. */
function IssuesLink({ children }: { children?: ReactNode }) {
  return (
    <a href={ISSUES_URL} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}
