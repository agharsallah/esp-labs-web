import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useLocale } from "@/i18n/use-locale";
import { prefetchSection } from "../queries";
import { useSectionLink } from "../use-reader-nav";
import { useSectionTarget } from "./section-link-context";

/**
 * A link that opens another section in the reader, keeping the page under it (or, inside the book,
 * goes to that section's place in it). Pointing at it or focusing it starts loading that section,
 * so it shows without a wait.
 */
export function SectionLinkTo({
  id,
  className,
  opensDialog = false,
  title,
  children,
}: {
  id: string;
  className?: string;
  /** From outside the reader: announce that it opens a dialog. */
  opensDialog?: boolean;
  title?: string;
  children: ReactNode;
}) {
  const inBook = useSectionTarget();
  const drawer = useSectionLink()(id);
  const { to, preventScrollReset } = inBook?.(id) ?? drawer;
  const state = inBook ? undefined : drawer.state;
  const client = useQueryClient();
  const locale = useLocale();
  const warm = () => prefetchSection(client, id, locale);
  return (
    <Link
      to={to}
      state={state}
      preventScrollReset={preventScrollReset}
      className={className}
      aria-haspopup={opensDialog && !inBook ? "dialog" : undefined}
      title={title}
      onPointerEnter={warm}
      onFocus={warm}
    >
      {children}
    </Link>
  );
}
