import { describe, expect, it } from "vitest";
import { fitLabel, formatAddress, formatBytes, formatNumber, formatRatio } from "./format";

describe("chart formats", () => {
  it("formats numbers, addresses and byte sizes", () => {
    expect(formatNumber(3.14159, "en")).toBe("3.14");
    expect(formatAddress(0x3fc88000)).toBe("0x3FC88000");
    expect(formatAddress(0x10)).toBe("0x00000010");
    expect(formatBytes(384 * 1024, "en")).toBe("384 KB");
    expect(formatBytes(32 * 1024 * 1024, "en")).toBe("32 MB");
    expect(formatBytes(512, "en")).toBe("512 B");
  });
});

describe("fitLabel", () => {
  it("keeps short labels and shortens long ones to the limit", () => {
    expect(fitLabel("UART", 6)).toBe("UART");
    expect(fitLabel("USB Serial/JTAG", 6)).toBe("USB S…");
    expect([...fitLabel("USB Serial/JTAG", 6)]).toHaveLength(6);
  });
});

describe("formatRatio", () => {
  it("keeps 2 significant digits with grouping, and one decimal under 10", () => {
    expect(formatRatio(1416.667, "en")).toBe("1,400");
    expect(formatRatio(42317, "en")).toBe("42,000");
    expect(formatRatio(5.123, "en")).toBe("5.1");
    expect(formatRatio(9.96, "en")).toBe("10");
    expect(formatRatio(12.4, "en")).toBe("12");
    expect(formatRatio(1416.667, "de")).toBe("1.400");
  });
});
