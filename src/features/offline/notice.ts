// Which offline notice the reader sees, if any. Pure: the component feeds it the service
// worker's state, the browser's online flag and what the reader has already dismissed.

export type OfflineNotice = "update" | "offline" | "ready";

export interface OfflineState {
  /** A new version is installed and waits for a reload. */
  readonly needRefresh: boolean;
  /** The guide has just been saved on this device for the first time. */
  readonly offlineReady: boolean;
  readonly online: boolean;
  readonly dismissed: ReadonlySet<OfflineNotice>;
}

/** The most useful notice first: an update to apply, then "you are offline", then "saved". */
export function pickNotice(state: OfflineState): OfflineNotice | null {
  const candidates: readonly [OfflineNotice, boolean][] = [
    ["update", state.needRefresh],
    ["offline", !state.online],
    ["ready", state.offlineReady],
  ];
  const found = candidates.find(([kind, active]) => active && !state.dismissed.has(kind));
  return found ? found[0] : null;
}
