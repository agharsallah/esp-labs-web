import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { BlockBus } from "./BlockBus";
import { ChipDescent } from "./ChipDescent";
import { DieFloorplan } from "./DieFloorplan";
import type { DieBlock } from "./floorplan";

// jsdom has no WebGL: every scene must fall back to its flat, keyboard-usable version.
const blocks: DieBlock[] = [
  { id: "cpu", family: "system", name: "CPU", coverage: "done" },
  { id: "uart", family: "connectivity", name: "UART", coverage: "works" },
  { id: "wifi", family: "radio", name: "Wi-Fi", coverage: "none" },
];
const captions = ["Board", "Module", "Can", "Package", "Die"];

describe("scene fallbacks without WebGL", () => {
  it("the descent swaps the 3D stage for the flat floor plan, and its tiles pick blocks", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const pick = vi.fn();
    render(
      <Suspense>
        <ChipDescent blocks={blocks} layerCaptions={captions} onBlockPick={pick}>
          {(layer) => <p>caption {layer}</p>}
        </ChipDescent>
      </Suspense>,
    );
    const list = await screen.findByRole("list", { name: "Blocks on the die" }, { timeout: 5000 });
    expect(document.querySelector("canvas")).toBeNull();
    expect(screen.getByText("caption 0")).toBeTruthy();
    const tiles = within(list).getAllByRole("button");
    expect(tiles.map((b) => b.textContent)).toEqual(["CPU", "UART", "Wi-Fi"]);
    await userEvent.click(within(list).getByRole("button", { name: /UART, works/ }));
    expect(pick).toHaveBeenCalledWith("uart");
  });

  it("the die keeps its list of blocks and drops the canvas", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Suspense>
        <DieFloorplan blocks={blocks} />
      </Suspense>,
    );
    await screen.findByRole("list", { name: "Blocks on the die" });
    await vi.waitFor(() => expect(document.querySelector("canvas")).toBeNull(), { timeout: 5000 });
  });

  it("the bus keeps its signal lines and drops the canvas", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Suspense>
        <BlockBus name="I2C" family="connectivity" rate={0.3} lines={["SCL", "SDA"]} />
      </Suspense>,
    );
    const list = await screen.findByRole("list", { name: "Signal lines" });
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["SCL", "SDA"]);
    await vi.waitFor(() => expect(document.querySelector("canvas")).toBeNull(), { timeout: 5000 });
  });
});
