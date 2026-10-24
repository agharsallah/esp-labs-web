import { chipContentQuery } from "@/content/queries";
import { currentLocale, i18n } from "@/i18n/i18n";
import { queryClient } from "./query-client";

// Nothing of the chip section ships with the first page. When the reader points at (or focuses)
// the Chip link, its route modules, its interface text and its content start downloading, so the
// click opens it without a wait. Each part loads once; later calls are free.
let started = false;

export function prefetchChip(): void {
  if (started) return;
  started = true;
  void import("./routes/chip/chip-layout-route");
  void import("./routes/chip/chip-home-route");
  void i18n.loadNamespaces("chip");
  void queryClient.prefetchQuery(chipContentQuery(currentLocale()));
}
