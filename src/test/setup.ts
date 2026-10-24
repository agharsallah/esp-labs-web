import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";
import { initI18n } from "@/i18n/i18n";

// jsdom has no layout: give the few browser APIs the app calls a harmless stand-in.
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
Element.prototype.scrollTo ??= function scrollTo() {};
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => cleanup());

// Route tests wait for lazily loaded pages; on a cold run (CI, a cleared cache) the first
// transform of a page and its chunks takes longer than testing-library's 1 s default.
configure({ asyncUtilTimeout: 5000 });

// Components read their text through i18next; tests see the English source.
await initI18n();
