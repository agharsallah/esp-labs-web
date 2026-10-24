import { createContext, useContext } from "react";

/** What every part of the open section needs: what the chip pages can link to, and what to highlight. */
export interface ReaderContextValue {
  readonly sectionId: string;
  /** GPIO numbers the pins page knows. */
  readonly pins: ReadonlySet<number>;
  /** Block ids the atlas knows. */
  readonly blocks: ReadonlySet<string>;
  /** Passage numbers that match the fact that brought the reader here. */
  readonly highlight: ReadonlySet<number>;
  /** Scrolls a passage into view (the "Key information" cards). */
  readonly jumpTo: (n: number) => void;
}

export const ReaderContext = createContext<ReaderContextValue>({
  sectionId: "",
  pins: new Set(),
  blocks: new Set(),
  highlight: new Set(),
  jumpTo: () => {},
});

export const useReader = () => useContext(ReaderContext);
