import { describe, expect, it } from "vitest";
import { isLocaleChoice, LOCALE_INFO, LOCALES, matchLocale, resolveLocale } from "./locales";

describe("matchLocale", () => {
  it("takes the first supported language, ignoring region and case", () => {
    expect(matchLocale(["pt-BR", "fr-CA", "de"])).toBe("fr");
    expect(matchLocale(["zh-CN"])).toBe("zh");
    expect(matchLocale(["ZH-tw"])).toBe("zh-TW");
    expect(matchLocale(["zh-Hant-HK"])).toBe("zh-TW");
    expect(matchLocale(["ja_JP"])).toBe("ja");
  });

  it("falls back to English", () => {
    expect(matchLocale([])).toBe("en");
    expect(matchLocale(["pt", "ko"])).toBe("en");
  });
});

describe("resolveLocale", () => {
  it("follows the browser only for auto", () => {
    expect(resolveLocale("auto", ["ar-EG"])).toBe("ar");
    expect(resolveLocale("it", ["ar-EG"])).toBe("it");
  });
});

describe("LOCALE_INFO", () => {
  it("describes every locale, and only Arabic is right to left", () => {
    expect(Object.keys(LOCALE_INFO).sort()).toEqual([...LOCALES].sort());
    expect(LOCALES.filter((l) => LOCALE_INFO[l].dir === "rtl")).toEqual(["ar"]);
  });

  it("rejects unknown choices", () => {
    expect(isLocaleChoice("auto")).toBe(true);
    expect(isLocaleChoice("pt")).toBe(false);
    expect(isLocaleChoice(3)).toBe(false);
  });
});
