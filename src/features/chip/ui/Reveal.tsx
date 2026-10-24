import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";
import styles from "../pages/page.module.css";

/** A page section that fades and rises in once scrolled into view (its CSS has a still form). */
export function Reveal({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const [ref, shown] = useInView<HTMLElement>(0.1);
  return (
    <section
      ref={ref}
      className={`${styles.reveal} ${className ?? ""}`}
      data-shown={shown || undefined}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
