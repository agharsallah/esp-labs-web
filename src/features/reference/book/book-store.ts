import { createPersistentStore, useStore } from "@/lib/storage";

// What you have read of the datasheet, in this browser only: the sections you scrolled through
// and the one you were on, to pick up where you left off.
const read = createPersistentStore<readonly string[]>("esp-datasheet-read", []);
const last = createPersistentStore<string | null>("esp-datasheet-last", null);

export const bookProgress = {
  markRead(id: string) {
    if (!read.get().includes(id)) read.set((prev) => [...prev, id]);
    if (last.get() !== id) last.set(id);
  },
};

export const useReadSections = (): ReadonlySet<string> => new Set(useStore(read));
export const useLastSection = () => useStore(last);
