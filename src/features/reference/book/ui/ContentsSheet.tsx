import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/ui/Icon";
import { scrollTopFor } from "../../logic/progressive";
import type { BookData } from "../use-book";
import { BookContents } from "./BookContents";
import styles from "../book.module.css";
import reader from "../../ui/reader.module.css";

/** On phones and narrow screens, the contents open as a sheet from the reading bar. */
export function ContentsSheet({ data, read, active }: { data: BookData; read: ReadonlySet<string>; active: string }) {
  const { t } = useTranslation("chip");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => setOpen(false);
  const closeOnBackdrop = useEffectEvent(close);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      // Open on the chapter being read, not on the first document.
      const here = dialog.querySelector('[aria-current="location"]');
      if (here) {
        const box = dialog.getBoundingClientRect();
        dialog.scrollTop = scrollTopFor({ top: box.top, scrollTop: dialog.scrollTop, height: box.height }, here.getBoundingClientRect().top);
      }
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  // A click on the dimmed page around the sheet targets the dialog itself, outside its box.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
      if (!inside) closeOnBackdrop();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button type="button" className={styles.contentsButton} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Icon name="steps" size={16} />
        {t("book.contents")}
      </button>
      <dialog
        ref={ref}
        className={styles.sheet}
        aria-label={t("book.contents")}
        onClose={close}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <button type="button" className={`${reader.iconButton} ${reader.close}`} onClick={close} aria-label={t("book.closeContents")}>
          <Icon name="close" />
        </button>
        {open ? <BookContents data={data} read={read} active={active} onPick={close} /> : null}
      </dialog>
    </>
  );
}
