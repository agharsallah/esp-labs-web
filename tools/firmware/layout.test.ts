import { describe, expect, it } from "vitest";
import { groupOf } from "./layout.ts";

describe("groupOf", () => {
  it("files a lab's own code under the lab", () => {
    expect(groupOf("labs/02-led/src/main.cpp")).toEqual({ role: "lab", group: "02-led" });
  });

  it("files shared code under the include folder or its library", () => {
    expect(groupOf("kit/include/pins.h")).toEqual({ role: "shared", group: "include" });
    expect(groupOf("kit/lib/wifi-kit/src/pinger.h")).toEqual({ role: "shared", group: "wifi-kit" });
  });
});
