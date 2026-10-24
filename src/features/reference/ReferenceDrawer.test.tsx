import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildReference } from "../../../tools/reference/build";
import { FIXTURE } from "../../../tools/reference/fixture";

// The reader through the real router and chip content, with the reference documents built from
// a fixture (never from docs-llm/) and served by a fake fetch.
const LOAD = { timeout: 8000 };
const ref = buildReference(FIXTURE);

function serve(withReference: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("/reference/")) {
        if (!withReference) return new Response("not found", { status: 404 });
        if (url.endsWith("/index.json")) return new Response(JSON.stringify({ sections: ref.index }));
        const id = decodeURIComponent(/sections\/(.+)\.json$/.exec(url)?.[1] ?? "");
        const doc = ref.section(id);
        return doc ? new Response(JSON.stringify(doc)) : new Response("not found", { status: 404 });
      }
      return new Response(JSON.stringify({ overview: [], facts: [], entries: [] }));
    }),
  );
}

async function openApp(hash: string) {
  window.location.hash = hash;
  await (await import("@/i18n/i18n")).initI18n();
  const { App } = await import("@/app/App");
  render(<App />);
}

describe("reference reader", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("opens the section named in the URL, with why you came, the key numbers and the way back", async () => {
    serve(true);
    await openApp("#/chip/blocks/uart?ref=T26.2");
    const dialog = await screen.findByRole("dialog", { name: "§26.2 Features" }, LOAD);
    expect(within(dialog).getByRole("heading", { name: "Why you're here" })).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: "Key information" })).toBeTruthy();
    expect(within(dialog).getByText("Stop bits of 1, 1.5, or 2 bits").closest(".highlight")).not.toBeNull();
    expect(within(dialog).getByRole("link", { name: /26\s+UART Controller/ })).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: /Next.*26\.4/ })).toBeTruthy();

    await userEvent.click(within(dialog).getByRole("button", { name: "Back to where you were" }));
    expect(window.location.hash).not.toContain("ref=");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // The page's citations now open the reader.
    expect(screen.getAllByRole("link", { name: /Technical reference §26\.2/ }).length).toBeGreaterThan(0);
  });

  it("closes on a click on the dimmed page around it, not on a click inside it", async () => {
    serve(true);
    await openApp("#/chip/blocks/uart?ref=T26.2");
    const dialog = await screen.findByRole("dialog", { name: "§26.2 Features" }, LOAD);
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(new DOMRect(700, 0, 560, 900));
    fireEvent.click(dialog, { clientX: 900, clientY: 300 });
    expect(window.location.hash).toContain("ref=");
    fireEvent.click(dialog, { clientX: 200, clientY: 300 });
    expect(window.location.hash).not.toContain("ref=");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("follows a cross-reference inside the reader", async () => {
    serve(true);
    await openApp("#/chip?ref=T26.1");
    const dialog = await screen.findByRole("dialog", { name: "§26.1 Overview" }, LOAD);
    await userEvent.click(within(dialog).getByRole("link", { name: "§26.2 Features" }));
    expect(await screen.findByRole("dialog", { name: "§26.2 Features" }, LOAD)).toBeTruthy();
    expect(window.location.hash).toContain("ref=T26.2");
  });

  it("without the reference, citations stay citations with a link to Espressif's PDF", async () => {
    serve(false);
    await openApp("#/chip/blocks/uart");
    expect(await screen.findByRole("heading", { level: 1, name: "UART" }, LOAD)).toBeTruthy();
    expect(screen.queryAllByRole("link", { name: /Technical reference §26\.2/ })).toEqual([]);
    expect(screen.getAllByRole("link", { name: /Open the Technical reference on Espressif's site/ }).length).toBeGreaterThan(0);
  });
});
