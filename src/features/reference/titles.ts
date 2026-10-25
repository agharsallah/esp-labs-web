import * as z from "zod/mini";
import { loadOverlay } from "@/content/localize";
import { type Locale, SOURCE_LOCALE } from "@/i18n/locales";

// Section titles are the one part of Espressif's reference that is translated: a flat
// id → title catalogue per language (src/locales/<locale>/content/reference-titles.json). The
// text of the sections stays English. A title the catalogue lacks shows in English.

export type Titles = Readonly<Record<string, string>>;

const TitlesSchema = z.record(z.string(), z.string());

const loaded = new Map<Locale, Promise<Titles>>();

/** A language's section titles (none for English, or when the language has no catalogue). */
export function loadTitles(locale: Locale): Promise<Titles> {
  if (locale === SOURCE_LOCALE) return Promise.resolve({});
  let titles = loaded.get(locale);
  if (!titles) {
    titles = loadOverlay(locale, "reference-titles").then((raw) => {
      const parsed = TitlesSchema.safeParse(raw);
      return parsed.success ? parsed.data : {};
    });
    loaded.set(locale, titles);
  }
  return titles;
}

/** The entry with its title in the catalogue's language, if the catalogue has one. */
export function withTitle<T extends { readonly id: string; readonly title: string }>(entry: T, titles: Titles): T {
  const title = titles[entry.id];
  return title === undefined ? entry : { ...entry, title };
}
