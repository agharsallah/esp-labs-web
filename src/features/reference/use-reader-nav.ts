import { useLocation, useNavigate, useSearchParams } from "react-router";
import { REF_PARAM, sectionOfParam, withRef } from "./ref-param";

// The reader's history: each section opened pushes an entry (Back goes to the previous one, then
// closes the reader), and "Back to where you were" pops them all. The entries carry how many
// sections deep they are and whether the reader was closed before the first.

interface ReaderState {
  readonly refDepth: number;
  readonly refFromClosed: boolean;
}

function readerState(state: unknown): ReaderState {
  if (typeof state === "object" && state !== null && "refDepth" in state && typeof state.refDepth === "number")
    return { refDepth: state.refDepth, refFromClosed: "refFromClosed" in state && state.refFromClosed === true };
  return { refDepth: 0, refFromClosed: false };
}

/** The section the URL opens, or null. */
export function useOpenSection(): string | null {
  const [params] = useSearchParams();
  return sectionOfParam(params.get(REF_PARAM));
}

/** A link target that opens a section in the reader, keeping the page and its other params. */
export function useSectionLink() {
  const { search, state } = useLocation();
  const { refDepth, refFromClosed } = readerState(state);
  const open = new URLSearchParams(search).has(REF_PARAM);
  return (id: string) => ({
    to: { search: withRef(search, id) },
    state: { refDepth: refDepth + 1, refFromClosed: open ? refFromClosed : true } satisfies ReaderState,
    preventScrollReset: true,
  });
}

/** Closes the reader, back to the page as it was before the first section opened. */
export function useCloseReader() {
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const { refDepth, refFromClosed } = readerState(state);
  return () => {
    if (refDepth > 0 && refFromClosed) void navigate(-refDepth);
    else void navigate({ search: withRef(search, null) }, { replace: true, preventScrollReset: true });
  };
}
