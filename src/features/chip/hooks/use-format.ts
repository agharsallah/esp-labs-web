import { useLocale } from "@/i18n/use-locale";

/** Formats a number for the language on screen ("1 234,5" in French). */
export function useNumber() {
  const locale = useLocale();
  return (value: number, maximumFractionDigits = 3) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}
