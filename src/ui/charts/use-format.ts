import { useTranslation } from "react-i18next";
import { formatNumber } from "./format";

/** The chart's number formatter: the caller's, else the reader's locale with 3 significant digits. */
export function useFormat(format?: (value: number) => string): (value: number) => string {
  const { i18n } = useTranslation();
  return format ?? ((v: number) => formatNumber(v, i18n.language));
}
