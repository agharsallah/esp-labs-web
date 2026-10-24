import { useTranslation } from "react-i18next";

/** The document title of a chip page: "<page> · Chip · ESP32-S3 Bench Guide". */
export function PageTitle({ page }: { page: string }) {
  const { t } = useTranslation();
  return <title>{t("titles.chip", { page })}</title>;
}
