import { useSuspenseQuery } from "@tanstack/react-query";
import { chipContentQuery } from "@/content/queries";
import { useLocale } from "@/i18n/use-locale";

/** The chip content in the language on screen, from the query cache (suspends on first load). */
export function useChipContent() {
  return useSuspenseQuery(chipContentQuery(useLocale())).data;
}
