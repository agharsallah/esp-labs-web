import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { prefetchSection } from "../queries";
import { useSectionLink } from "../use-reader-nav";

/**
 * A link that opens another section in the reader, keeping the page under it. Pointing at it or
 * focusing it starts loading that section, so the reader opens without a wait.
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
  const { to, state, preventScrollReset } = useSectionLink()(id);
  const client = useQueryClient();
  const warm = () => prefetchSection(client, id);
  return (
    <Link
      to={to}
      state={state}
      preventScrollReset={preventScrollReset}
      className={className}
      aria-haspopup={opensDialog ? "dialog" : undefined}
      title={title}
      onPointerEnter={warm}
      onFocus={warm}
    >
      {children}
    </Link>
  );
}
