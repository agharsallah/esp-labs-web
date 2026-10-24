import { Suspense, useEffect, useEffectEvent, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/ui/ErrorBoundary";
import { Icon } from "@/ui/Icon";
import { isReferenceBuilt } from "./queries";
import { ReaderSection } from "./ui/ReaderSection";
import { useCloseReader, useOpenSection } from "./use-reader-nav";
import styles from "./ui/reader.module.css";

/**
 * The reference reader: opens over any chip page when the URL has `?ref=`, as a modal dialog (a
 * side sheet on wide screens, a bottom sheet on phones). Esc, a click on the dimmed page, the close
 * button, Back or "Back to where you were" close it, and focus returns to the citation that opened it.
 */
export function ReferenceDrawer() {
  const id = useOpenSection();
  // A shared `?ref=` link on a build without the reference simply shows the page.
  const available = isReferenceBuilt();
  return id === null || !available ? null : <ReaderDialog id={id} />;
}

function ReaderDialog({ id }: { id: string }) {
  const { t } = useTranslation("chip");
  const close = useCloseReader();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeOnBackdrop = useEffectEvent(close);

  // A modal dialog's backdrop belongs to the dialog: a click there targets the dialog itself, at a
  // point outside its box. (Keyboard clicks on the buttons inside target the buttons.)
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const inside =
        e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
      if (!inside) closeOnBackdrop();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const opener = document.activeElement;
    const dialog = ref.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <button type="button" className={`${styles.iconButton} ${styles.close}`} onClick={close} aria-label={t("reader.close")}>
        <Icon name="close" />
      </button>
      <Suspense
        fallback={
          <div className={styles.status} role="status">
            {t("reader.loading")}
          </div>
        }
      >
        <ErrorBoundary name={`Reference ${id}`} resetKey={id}>
          <ReaderSection key={id} id={id} titleId={titleId} onClose={close} />
        </ErrorBoundary>
      </Suspense>
    </dialog>
  );
}
