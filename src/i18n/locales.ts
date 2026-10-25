// The languages the guide speaks. Pure data and rules, no i18next: the rest of i18n builds on it.
// Adding a language = an entry here + a folder in src/locales/<code>/ (see docs/I18N.md).

export const LOCALES = ["en", "fr", "es", "it", "de", "pl", "zh", "zh-TW", "ja", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const SOURCE_LOCALE: Locale = "en";

export type Direction = "ltr" | "rtl";

export interface LocaleInfo {
  /** The language's name in itself, as the language picker shows it. */
  readonly nativeName: string;
  /** The name in English, for logs. */
  readonly englishName: string;
  /** A few characters for tight spots (the top bar's language button), in the language itself. */
  readonly short: string;
  /** BCP 47 tag for <html lang>, Intl and :lang() (script subtag where it matters). */
  readonly tag: string;
  readonly dir: Direction;
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = {
  en: { nativeName: "English", englishName: "English", short: "EN", tag: "en", dir: "ltr" },
  fr: { nativeName: "Français", englishName: "French", short: "FR", tag: "fr", dir: "ltr" },
  es: { nativeName: "Español", englishName: "Spanish", short: "ES", tag: "es", dir: "ltr" },
  it: { nativeName: "Italiano", englishName: "Italian", short: "IT", tag: "it", dir: "ltr" },
  de: { nativeName: "Deutsch", englishName: "German", short: "DE", tag: "de", dir: "ltr" },
  pl: { nativeName: "Polski", englishName: "Polish", short: "PL", tag: "pl", dir: "ltr" },
  zh: { nativeName: "简体中文", englishName: "Chinese (Simplified)", short: "中文", tag: "zh-Hans", dir: "ltr" },
  "zh-TW": { nativeName: "繁體中文", englishName: "Chinese (Traditional)", short: "繁中", tag: "zh-Hant", dir: "ltr" },
  ja: { nativeName: "日本語", englishName: "Japanese", short: "日本語", tag: "ja", dir: "ltr" },
  ar: { nativeName: "العربية", englishName: "Arabic", short: "عربي", tag: "ar", dir: "rtl" },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** What the reader picked: a language, or "auto" to follow the browser. */
export type LocaleChoice = Locale | "auto";

export const isLocaleChoice = (value: unknown): value is LocaleChoice =>
  value === "auto" || isLocale(value);

/** Region and script subtags that mean Traditional Chinese (zh-TW, zh-HK, zh-Hant-TW…). */
const TRADITIONAL_PARTS: ReadonlySet<string> = new Set(["tw", "hk", "mo", "hant"]);

/**
 * The first supported language among the browser's preferences ("fr-CA" → fr, "zh-CN" → zh, "zh-TW" → zh-TW),
 * else the source language.
 */
export function matchLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const [base, ...rest] = tag.toLowerCase().split(/[-_]/);
    // An explicit Simplified script wins over a region: zh-Hans-HK is still Simplified.
    if (base === "zh" && !rest.includes("hans") && rest.some((part) => TRADITIONAL_PARTS.has(part)))
      return "zh-TW";
    if (isLocale(base)) return base;
  }
  return SOURCE_LOCALE;
}

/** The language to show for a choice. */
export const resolveLocale = (choice: LocaleChoice, preferred: readonly string[]): Locale =>
  choice === "auto" ? matchLocale(preferred) : choice;
