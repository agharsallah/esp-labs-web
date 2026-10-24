import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CHIP_PART_NAMES } from "./chip-registry";
import { ChipPartIcon } from "./ChipPartIcon";
import { PartIcon } from "./PartIcon";
import { PART_NAMES } from "./registry";

describe("PartIcon", () => {
  it.each(PART_NAMES)("draws %s", (name) => {
    const { container } = render(<PartIcon name={name} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 64 64");
    expect(svg?.querySelectorAll("path, ellipse, circle").length).toBeGreaterThan(2);
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each(CHIP_PART_NAMES)("draws the chip block %s", (name) => {
    const { container } = render(<ChipPartIcon name={name} />);
    expect(container.querySelector("svg")?.querySelectorAll("path, ellipse, circle").length).toBeGreaterThan(2);
  });

  it("names the part for screen readers when asked", () => {
    const { getByRole } = render(<PartIcon name="led" label />);
    expect(getByRole("img").getAttribute("aria-label")).toBe("LED");
  });

  it("never paints a raw colour: every fill and stroke comes from a token", () => {
    const { container } = render(
      <>
        {PART_NAMES.map((name) => (
          <PartIcon key={name} name={name} />
        ))}
        {CHIP_PART_NAMES.map((name) => (
          <ChipPartIcon key={name} name={name} />
        ))}
      </>,
    );
    const raw = /#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i;
    const styled = [...container.querySelectorAll<SVGElement>("[style]")].map(
      (el) => el.getAttribute("style") ?? "",
    );
    expect(styled.filter((s) => raw.test(s))).toEqual([]);
  });
});
