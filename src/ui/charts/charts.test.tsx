import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { AddressMap } from "./AddressMap";
import { CompareBars } from "./CompareBars";
import { CoverageRing } from "./CoverageRing";
import { FlowTree } from "./FlowTree";
import { Ladder } from "./Ladder";
import { PinMatrix } from "./PinMatrix";
import { RangeBar } from "./RangeBar";
import { Spark } from "./Spark";

/** Each figure is named by its caption, its table carries `expected`, and the toggle shows the table. */
async function checkChart(ui: ReactElement, caption: string, expected: readonly string[]) {
  render(ui);
  const figure = screen.getByRole("figure", { name: caption });
  expect(figure.hasAttribute("data-shown")).toBe(true);
  const table = within(figure).getByRole("table", { name: caption });
  for (const text of expected) expect(table.textContent).toContain(text);
  const holder = table.parentElement;
  expect(holder?.className).toBe("visually-hidden");
  const toggle = within(figure).getByRole("button", { name: "Show as table" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await userEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(toggle.textContent).toBe("Hide table");
  expect(holder?.className).not.toBe("visually-hidden");
  return figure;
}

describe("chart kit", () => {
  it("RangeBar", async () => {
    await checkChart(
      <RangeBar caption="Supply voltage" unit="V" items={[{ id: "vdd", label: "VDD3P3", min: 3, typ: 3.3, max: 3.6 }]} />,
      "Supply voltage",
      ["VDD3P3", "3", "3.3", "3.6", "Min (V)"],
    );
  });

  it("Ladder", async () => {
    await checkChart(
      <Ladder
        caption="Power modes"
        unit="mA"
        rungs={[
          { id: "active", label: "Active", value: 100, items: ["CPU", "Wi-Fi"] },
          { id: "deep", label: "Deep sleep", value: 0.01, items: ["RTC timer"] },
        ]}
      />,
      "Power modes",
      ["Deep sleep", "RTC timer", "×10,000 less"],
    );
  });

  it("AddressMap", async () => {
    const figure = await checkChart(
      <AddressMap
        caption="Memory map"
        regions={[
          { id: "dram", label: "Internal SRAM", start: 0x3fc88000, end: 0x3fd00000 },
          { id: "flash", label: "Flash cache", start: 0x42000000, end: 0x44000000, highlight: true },
        ]}
      />,
      "Memory map",
      ["Internal SRAM", "0x3FC88000", "0x43FFFFFF", "32 MB", "Yes"],
    );
    expect(figure.querySelector("[data-highlight]")).not.toBeNull();
  });

  it("FlowTree", async () => {
    const figure = await checkChart(
      <FlowTree
        caption="Clock tree"
        nodes={[
          { id: "xtal", label: "XTAL", detail: "40 MHz" },
          { id: "cpu", label: "CPU" },
        ]}
        edges={[{ from: "xtal", to: "cpu", label: "PLL" }]}
      />,
      "Clock tree",
      ["XTAL (40 MHz)", "CPU", "PLL"],
    );
    expect(within(figure).getByRole("region", { name: "Clock tree" })).toBeTruthy();
  });

  it("CoverageRing", async () => {
    await checkChart(
      <CoverageRing caption="Blocks your labs used" counts={{ done: 3, built: 1, none: 28 }} center="4 / 32" />,
      "Blocks your labs used",
      ["Not yet used", "28", "3"],
    );
  });

  it("PinMatrix filters rows and marks warned and highlighted ones", async () => {
    const rows = [
      { id: "g0", label: "GPIO0", warn: true, cells: { strap: { label: "Boot mode" } } },
      { id: "g4", label: "GPIO4", cells: { adc: { label: "ADC1_CH3" } } },
    ];
    const columns = [
      { id: "adc", label: "ADC" },
      { id: "strap", label: "Strapping" },
    ];
    const figure = await checkChart(
      <PinMatrix caption="Pin functions" columns={columns} rows={rows} highlighted={new Set(["g0"])} />,
      "Pin functions",
      ["GPIO0", "Boot mode", "ADC1_CH3"],
    );
    expect(figure.querySelector("[data-highlight]")).not.toBeNull();
    render(<PinMatrix caption="ADC pins" columns={columns} rows={rows} filter="adc" />);
    const table = screen.getByRole("table", { name: "ADC pins" });
    expect(table.textContent).toContain("GPIO4");
    expect(table.textContent).not.toContain("GPIO0");
  });

  it("CompareBars", async () => {
    await checkChart(
      <CompareBars
        caption="Max clock"
        unit="MHz"
        color="--fam-connectivity"
        items={[
          { id: "uart", label: "UART", value: 5 },
          { id: "spi", label: "SPI", value: 80 },
        ]}
      />,
      "Max clock",
      ["UART", "80", "Value (MHz)"],
    );
  });

  it("Spark is a named image", () => {
    render(<Spark caption="Up to 5 Mbps" value={5} max={80} color="--fam-connectivity" />);
    expect(screen.getByRole("img", { name: "Up to 5 Mbps" })).toBeTruthy();
  });
});
