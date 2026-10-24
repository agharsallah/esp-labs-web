import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Each chip page through the real router, query client and content (only the network and
// IntersectionObserver are faked; jsdom has no WebGL, so the scenes show their flat versions).
const LOAD = { timeout: 8000 };

async function openApp(hash: string) {
  window.location.hash = hash;
  await (await import("@/i18n/i18n")).initI18n();
  const { App } = await import("@/app/App");
  render(<App />);
}

describe("chip pages", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ overview: [], facts: [], entries: [] }))),
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("home: the headline, the progress and the section pills", async () => {
    await openApp("#/chip");
    expect(await screen.findByRole("heading", { level: 1, name: "Inside the ESP32-S3" }, LOAD)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Your progress through the chip" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Chip pages" })).toBeTruthy();
  });

  it("pins: the matrix and a pin card from the URL", async () => {
    await openApp("#/chip/pins?pin=0");
    expect(await screen.findByRole("heading", { level: 1, name: "Pins and power" }, LOAD)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GPIO0" })).toBeTruthy();
  });

  it("atlas: the filters narrow the tiles and land in the URL", async () => {
    await openApp("#/chip/blocks");
    expect(await screen.findByRole("heading", { level: 1, name: "Peripheral atlas" }, LOAD)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Radio/ })).toBeTruthy();
    const family = screen.getByRole("group", { name: "Family" });
    await userEvent.click(within(family).getByRole("button", { name: "Analog" }));
    expect(screen.queryByRole("heading", { name: /Radio/ })).toBeNull();
    expect(screen.getByRole("heading", { name: /Analog/ })).toBeTruthy();
    expect(window.location.hash).toContain("family=analog");
    await userEvent.type(screen.getByRole("searchbox"), "touch");
    expect(screen.getByText("1 block shown")).toBeTruthy();
  });

  it("atlas: opens filtered from a family link", async () => {
    await openApp("#/chip/blocks?family=radio");
    expect(await screen.findByRole("heading", { level: 1, name: "Peripheral atlas" }, LOAD)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Analog/ })).toBeNull();
  });

  it("block: a full block with its registers", async () => {
    await openApp("#/chip/blocks/uart");
    expect(await screen.findByRole("heading", { level: 1, name: "UART" }, LOAD)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Key registers" })).toBeTruthy();
  });

  it("block: an unknown id is a 404", async () => {
    await openApp("#/chip/blocks/flux-capacitor");
    expect(await screen.findByText("404", undefined, LOAD)).toBeTruthy();
  });

  it("inside: memory, clocks and power", async () => {
    await openApp("#/chip/inside");
    expect(await screen.findByRole("heading", { level: 1, name: "Memory, clocks and power modes" }, LOAD)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Where your sketch lives/ })).toBeTruthy();
  });
});
