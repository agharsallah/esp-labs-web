import type { OverlayIssue } from "./overlay";
import { checkOverlay } from "./overlay";

// Checks an interface catalogue (src/locales/<locale>/<namespace>.json) against the English one.
// Plural keys are i18next's: "count_one", "count_other"… one key per CLDR category the language
// has (Arabic has six, Japanese and Chinese one), so the key sets legitimately differ there.

type Tree = { readonly [key: string]: string | Tree };
const PLURAL = /^(.*)_(zero|one|two|few|many|other)$/;

/** "a.b.count_one" → string, flattened. */
export function flatten(tree: unknown, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof tree !== "object" || tree === null) return out;
  for (const [key, value] of Object.entries(tree as Tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else for (const [k, v] of flatten(value, path)) out.set(k, v);
  }
  return out;
}

export interface CatalogueIssue {
  readonly key: string;
  readonly problem: OverlayIssue["problem"] | "plural";
}

export function checkCatalogue(english: unknown, translated: unknown, locale: string) {
  const source = flatten(english);
  const target = flatten(translated);
  const categories = new Set<string>(new Intl.PluralRules(locale).resolvedOptions().pluralCategories);
  const issues: CatalogueIssue[] = [];
  const plurals = new Map<string, Set<string>>();

  for (const [key, text] of target) {
    const plural = PLURAL.exec(key);
    const base = plural?.[1];
    const category = plural?.[2];
    // A plural form: compare with the English "other" form, which every plural key has.
    const reference =
      source.get(key) ?? (base && category ? source.get(`${base}_other`) : undefined);
    if (reference === undefined) {
      issues.push({ key, problem: "unknown" });
      continue;
    }
    if (base && category && source.has(`${base}_other`)) {
      if (!categories.has(category)) issues.push({ key, problem: "plural" });
      plurals.set(base, (plurals.get(base) ?? new Set()).add(category));
    }
    // A plural form may spell its number out ("سطر واحد", "deux lignes") instead of {{count}},
    // formatted or not ({{count, number}}).
    const COUNT = /\{\{count(?:,[^}]*)?\}\}/g;
    const compared =
      base && category && !COUNT.test(text) ? reference.replace(COUNT, "") : reference;
    for (const issue of checkOverlay(compared, text))
      issues.push({ key, problem: issue.problem });
  }
  // A plural key the language translates needs every form the language uses.
  for (const [base, forms] of plurals)
    if ([...categories].some((c) => !forms.has(c))) issues.push({ key: base, problem: "plural" });
  return issues;
}
