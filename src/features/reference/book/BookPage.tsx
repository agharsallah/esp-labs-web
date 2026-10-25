import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { PageTitle } from "@/features/chip/ui/PageTitle";
import { BookCover } from "./BookCover";
import { BookReader } from "./BookReader";
import { sectionAt } from "./book-url";
import { useBook } from "./use-book";
import page from "@/features/chip/pages/page.module.css";

/** #/datasheet/read: the cover, or the book open at `?at=`. */
export function BookPage() {
  const { t } = useTranslation("chip");
  const data = useBook();
  const at = sectionAt(useLocation().search);
  if (!data)
    return (
      <div className={page.page}>
        <PageTitle page={t("pages.read")} />
        <h1 className={page.title}>{t("pages.read")}</h1>
        <p className={page.lead}>{t("reader.unavailable")}</p>
      </div>
    );
  return (
    <>
      <PageTitle page={t("pages.read")} />
      {at === null ? (
        <BookCover data={data} />
      ) : (
        <>
          <h1 className="visually-hidden">{t("pages.read")}</h1>
          <BookReader data={data} at={at} />
        </>
      )}
    </>
  );
}
