// Number and address text for chart labels and tables, in the reader's locale.

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }).format(value);
}

/**
 * A "×N" ratio for reading, not computing: 2 significant digits with the locale's grouping
 * (1,416.667 → "1,400", 42,317 → "42,000"), and one decimal under 10 ("5.1").
 */
export function formatRatio(value: number, locale: string): string {
  const options: Intl.NumberFormatOptions =
    Math.abs(value) < 10 ? { maximumFractionDigits: 1 } : { maximumSignificantDigits: 2 };
  return new Intl.NumberFormat(locale, options).format(value);
}

/** 0x3FC88000 style, at least 8 hex digits. */
export function formatAddress(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(8, "0")}`;
}

const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const;

/** 384 KB, 32 MB: binary multiples, as datasheets write memory sizes. */
export function formatBytes(bytes: number, locale: string): string {
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < BYTE_UNITS.length - 1) {
    v /= 1024;
    u++;
  }
  return `${formatNumber(v, locale)} ${BYTE_UNITS[u] ?? "B"}`;
}

/** Shortens a label to `max` characters with an ellipsis, so it stays inside its column. */
export function fitLabel(label: string, max: number): string {
  const chars = [...label];
  return chars.length <= max ? label : `${chars.slice(0, Math.max(1, max - 1)).join("")}…`;
}
