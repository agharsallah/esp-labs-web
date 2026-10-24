import { queryOptions, useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/http";
import { ReferenceIndexSchema, SectionSchema } from "./schema";

const url = (base: string, file: string) => new URL(`${base}${file}`, document.baseURI).href;

/** Where a figure of the reference is served from ("images/x.png" → its URL). */
export const imageUrl = (src: string) => (env.referenceUrl ? url(env.referenceUrl, src) : "");

// Built with the guide (or absent): it never changes while the page is open. A missing index is
// an answer, not an error to retry: the reader is simply not part of this build.
export const referenceIndexQuery = () =>
  queryOptions({
    queryKey: ["reference", "index"] as const,
    queryFn: async ({ signal }) => {
      const base = env.referenceUrl;
      if (!base) return null;
      try {
        return await fetchJson(url(base, "index.json"), ReferenceIndexSchema, signal);
      } catch {
        return null;
      }
    },
    staleTime: "static",
    gcTime: Infinity,
    retry: false,
  });

export const referenceSectionQuery = (id: string) =>
  queryOptions({
    queryKey: ["reference", "section", id] as const,
    queryFn: ({ signal }) =>
      fetchJson(url(env.referenceUrl ?? "./reference/", `sections/${encodeURIComponent(id)}.json`), SectionSchema, signal),
    staleTime: "static",
    gcTime: 10 * 60_000,
  });

/** Is the reader part of this build? False until its index has loaded. */
export function useReferenceAvailable(): boolean {
  return useQuery({ ...referenceIndexQuery(), select: (index) => index !== null }).data ?? false;
}
