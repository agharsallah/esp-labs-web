import type { KitItemId } from "@/content/kit";
import { createPersistentStore } from "@/lib/storage";

// The parts you said you have, remembered in this browser like your progress.
export const kitStore = createPersistentStore<readonly KitItemId[]>("esp-kit", []);

export function toggleKitItem(id: KitItemId) {
  kitStore.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
}
