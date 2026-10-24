import { describe, expect, it } from "vitest";
import { checkCatalogue, flatten } from "./catalogue-check";

const en = {
  nav: { labs: "Labs" },
  ticked_one: "{{count}} step ticked",
  ticked_other: "{{count}} steps ticked",
  hint: "Press <b>Next</b>",
};

describe("flatten", () => {
  it("joins nested keys with dots", () => {
    expect([...flatten(en).keys()]).toEqual(["nav.labs", "ticked_one", "ticked_other", "hint"]);
  });
});

describe("checkCatalogue", () => {
  it("accepts the language's own plural forms", () => {
    const ar = {
      ticked_zero: "لا خطوات {{count}}",
      ticked_one: "خطوة واحدة {{count}}",
      ticked_two: "خطوتان {{count}}",
      ticked_few: "{{count}} خطوات",
      ticked_many: "{{count}} خطوة",
      ticked_other: "{{count}} خطوة",
    };
    expect(checkCatalogue(en, ar, "ar")).toEqual([]);
    expect(checkCatalogue(en, { ...ar, ticked_one: "خطوة واحدة", ticked_two: "خطوتان" }, "ar")).toEqual(
      [],
    );
    expect(checkCatalogue(en, { ticked_other: "已勾选 {{count}} 步" }, "zh")).toEqual([]);
    const formatted = { files_one: "{{count, number}} file", files_other: "{{count, number}} files" };
    expect(checkCatalogue(formatted, { files_zero: "لا ملفات", files_one: "ملف واحد", files_two: "ملفان", files_few: "{{count, number}} ملفات", files_many: "{{count, number}} ملفًا", files_other: "{{count, number}} ملف" }, "ar")).toEqual([]);
  });

  it("reports missing plural forms, foreign forms, unknown keys and broken text", () => {
    expect(
      checkCatalogue(
        en,
        { ticked_few: "{{count}}", ticked_other: "{{count}}", extra: "?", hint: "Appuyez sur Suivant" },
        "fr",
      ),
    ).toEqual([
      { key: "ticked_few", problem: "plural" },
      { key: "extra", problem: "unknown" },
      { key: "hint", problem: "markup" },
      { key: "ticked", problem: "plural" },
    ]);
  });
});
