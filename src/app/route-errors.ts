// Loaders throw a reason, not a sentence: RouteError translates it at display time, so the
// loaders stay free of the i18n instance.

export type RouteErrorReason =
  | { readonly reason: "noPage" }
  | { readonly reason: "noTheme"; readonly id: string }
  | { readonly reason: "noLesson"; readonly id: string }
  | { readonly reason: "plannedLesson"; readonly id: string }
  | { readonly reason: "noBlock"; readonly id: string };

const REASONS = new Set<string>(["noPage", "noTheme", "noLesson", "plannedLesson", "noBlock"]);

export function isRouteErrorReason(value: unknown): value is RouteErrorReason {
  return (
    typeof value === "object" &&
    value !== null &&
    "reason" in value &&
    typeof value.reason === "string" &&
    REASONS.has(value.reason)
  );
}
