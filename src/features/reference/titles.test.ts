import { describe, expect, it } from "vitest";
import { LOCALES, SOURCE_LOCALE } from "@/i18n/locales";
import { withTitle } from "./titles";

describe("withTitle", () => {
  const entry = { id: "A1", title: "Getting Started", size: 10 };

  it("swaps in the catalogue's title and keeps the rest", () => {
    expect(withTitle(entry, { A1: "البدء" })).toEqual({ id: "A1", title: "البدء", size: 10 });
  });

  it("keeps English where the catalogue has nothing", () => {
    expect(withTitle(entry, { A2: "x" })).toBe(entry);
  });
});

const catalogues = import.meta.glob<Record<string, string>>("../../locales/*/content/reference-titles.json", {
  import: "default",
  eager: true,
});

describe.each(LOCALES.filter((l) => l !== SOURCE_LOCALE))("section titles in %s", (locale) => {
  it("has exactly the English ids, each with a non-empty title", () => {
    const english = catalogues[`../../locales/${SOURCE_LOCALE}/content/reference-titles.json`];
    const translated = catalogues[`../../locales/${locale}/content/reference-titles.json`];
    expect(Object.keys(translated ?? {}).sort()).toEqual(Object.keys(english ?? {}).sort());
    expect(Object.values(translated ?? {}).filter((t) => t.trim() === "")).toEqual([]);
  });
});
