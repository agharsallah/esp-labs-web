import { describe, expect, it } from "vitest";
import { type OfflineNotice, type OfflineState, pickNotice } from "./notice";

const state = (over: Partial<OfflineState> = {}): OfflineState => ({
  needRefresh: false,
  offlineReady: false,
  online: true,
  dismissed: new Set<OfflineNotice>(),
  ...over,
});

describe("pickNotice", () => {
  it("shows nothing while online with nothing new", () => {
    expect(pickNotice(state())).toBeNull();
  });

  it("puts a waiting update before the offline and saved notices", () => {
    expect(pickNotice(state({ needRefresh: true, online: false, offlineReady: true }))).toBe(
      "update",
    );
    expect(pickNotice(state({ online: false, offlineReady: true }))).toBe("offline");
    expect(pickNotice(state({ offlineReady: true }))).toBe("ready");
  });

  it("skips a notice the reader dismissed and falls through to the next", () => {
    const dismissed = new Set<OfflineNotice>(["update"]);
    expect(pickNotice(state({ needRefresh: true, online: false, dismissed }))).toBe("offline");
    expect(pickNotice(state({ needRefresh: true, dismissed }))).toBeNull();
  });
});
