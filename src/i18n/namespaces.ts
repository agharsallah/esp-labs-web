// Interface text is split by feature into namespaces, one JSON file per language and namespace:
// src/locales/<locale>/<namespace>.json. The app shell's namespaces load before the first paint;
// a lab's namespace loads with its simulators (react-i18next suspends inside WidgetSlot).

/** Loaded up front: the shell and every screen outside the simulators. */
export const CORE_NAMESPACES = [
  "common",
  "home",
  "lesson",
  "code",
  "settings",
  "bench",
  "parts",
] as const;

/** Loaded on demand, with the lab widgets that use them. */
export const LAB_NAMESPACES = [
  "labs-shared",
  "labs-intro",
  "labs-display",
  "labs-wifi",
  "labs-rfid",
  "labs-ble",
  "labs-sound",
] as const;

/** Loaded on demand, with the lazily loaded pages that use them. */
export const PAGE_NAMESPACES = ["chip"] as const;

export const NAMESPACES = [...CORE_NAMESPACES, ...LAB_NAMESPACES, ...PAGE_NAMESPACES] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE = "common" satisfies Namespace;
