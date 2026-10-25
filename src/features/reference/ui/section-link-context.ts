import { createContext, useContext } from "react";
import type { To } from "react-router";

/** Where a link to a section goes: the reader drawer by default, a place in the book when reading it. */
export type SectionTarget = (id: string) => { to: To; preventScrollReset?: boolean };

export const SectionLinkContext = createContext<SectionTarget | null>(null);

export const useSectionTarget = () => useContext(SectionLinkContext);
