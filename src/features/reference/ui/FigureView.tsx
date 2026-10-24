import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/ui/Icon";
import { imageUrl } from "../queries";
import styles from "./reader.module.css";

/** A figure of the reference with its caption; a tap opens it full size over the reader. */
export function FigureView({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const { t } = useTranslation("chip");
  const [large, setLarge] = useState(false);
  const label = caption ?? alt;
  return (
    <figure className={styles.figure}>
      <button type="button" className={styles.figButton} onClick={() => setLarge(true)}>
        <img src={imageUrl(src)} alt={alt} loading="lazy" decoding="async" />
        <span className="visually-hidden">{t("reader.figure.enlarge", { caption: label })}</span>
        <span className={styles.figZoom} aria-hidden="true">
          <Icon name="expand" size={16} />
        </span>
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}
      {large ? <Lightbox src={src} alt={alt} caption={label} onClose={() => setLarge(false)} /> : null}
    </figure>
  );
}

function Lightbox({ src, alt, caption, onClose }: { src: string; alt: string; caption: string; onClose: () => void }) {
  const { t } = useTranslation("chip");
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open && typeof dialog.showModal === "function") dialog.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={styles.lightbox}
      aria-label={caption}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button type="button" className={styles.iconButton} onClick={onClose} aria-label={t("reader.figure.close")}>
        <Icon name="close" />
      </button>
      <img src={imageUrl(src)} alt={alt} />
      <p>{caption}</p>
    </dialog>
  );
}
