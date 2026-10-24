import type { ReactNode } from "react";
import { Link } from "react-router";
import { useSectionLink } from "../use-reader-nav";

/** A link that opens another section in the reader, keeping the page under it. */
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
  return (
    <Link
      to={to}
      state={state}
      preventScrollReset={preventScrollReset}
      className={className}
      aria-haspopup={opensDialog ? "dialog" : undefined}
      title={title}
    >
      {children}
    </Link>
  );
}
