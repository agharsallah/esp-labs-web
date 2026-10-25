import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { env } from "@/config/env";
import type { Locale } from "@/i18n/locales";
import { fetchJson } from "@/lib/http";
import { ReferenceIndexSchema, SectionSchema } from "./schema";
import { loadTitles, withTitle } from "./titles";

const url = (base: string, file: string) => new URL(`${base}${file}`, document.baseURI).href;

/** Where a figure of the reference is served from ("images/x.png" → its URL). */
export const imageUrl = (src: string) => (env.referenceUrl ? url(env.referenceUrl, src) : "");

// Built with the guide (or absent): it never changes while the page is open. A missing index is
// an answer, not an error to retry: the reader is simply not part of this build.
export const referenceIndexQuery = (locale: Locale) =>
  queryOptions({
    queryKey: ["reference", "index", locale] as const,
    queryFn: async ({ signal }) => {
      const base = env.referenceUrl;
      if (!base) return null;
      try {
        const [index, titles] = await Promise.all([
          fetchJson(url(base, "index.json"), ReferenceIndexSchema, signal),
          loadTitles(locale),
        ]);
        return { ...index, sections: index.sections.map((s) => withTitle(s, titles)) };
      } catch {
        return null;
      }
    },
    staleTime: "static",
    gcTime: Infinity,
    retry: false,
  });

export const referenceSectionQuery = (id: string, locale: Locale) =>
  queryOptions({
    queryKey: ["reference", "section", id, locale] as const,
    queryFn: async ({ signal }) => {
      const [section, titles] = await Promise.all([
        fetchJson(url(env.referenceUrl ?? "./reference/", `sections/${encodeURIComponent(id)}.json`), SectionSchema, signal),
        loadTitles(locale),
      ]);
      return withTitle(section, titles);
    },
    staleTime: "static",
    gcTime: 10 * 60_000,
  });

/**
 * Is the reader part of this build? Known at build time (tools/reference turns the URL off when
 * the reference is absent), so no page asks the server: nothing of the reference downloads
 * until a citation is hovered, focused or opened.
 */
export const isReferenceBuilt = (): boolean => env.referenceUrl !== null;

/** Warm one section (and the index the reader needs) when its citation is pointed at. */
export function prefetchSection(client: QueryClient, id: string, locale: Locale): void {
  void client.prefetchQuery(referenceIndexQuery(locale));
  void client.prefetchQuery(referenceSectionQuery(id, locale));
}
