import type { ChipPin, PinFunctionKind } from "@/domain/chip";

// Every GPIO the ESP32-S3 has (0-21 and 26-48), with what it can be. Sources, from the reference
// (docs-llm/esp32-s3): IO MUX functions C2.3.1 (Table 2-4), RTC functions C2.3.2 (Table 2-6),
// analog functions C2.3.3 (Table 2-8), strapping pins C3, the DevKitC-1 header A2.2.
// Function names stay as Espressif prints them; only the strapping role is reader-facing text.

type Fn = readonly [PinFunctionKind, string];

const fns = (...list: readonly Fn[]) => list.map(([kind, name]) => ({ kind, symbol: name }));

/** GPIO0-21 are RTC pins: RTC_GPIOn, plus touch (1-14) and ADC (1-20) on most of them. */
const rtc = (gpio: number): Fn[] => {
  const out: Fn[] = [["rtc", `RTC_GPIO${gpio}`]];
  if (gpio >= 1 && gpio <= 14) out.push(["touch", `TOUCH${gpio}`]);
  if (gpio >= 1 && gpio <= 10) out.push(["adc", `ADC1_CH${gpio - 1}`]);
  if (gpio >= 11 && gpio <= 20) out.push(["adc", `ADC2_CH${gpio - 11}`]);
  return out;
};

/** The pins on the DevKitC-1 header (A2.2): everything but the flash/PSRAM bus GPIO26-34. */
const OFF_HEADER = new Set([26, 27, 28, 29, 30, 31, 32, 33, 34]);

const pin = (
  gpio: number,
  extra: readonly Fn[] = [],
  more: Partial<Pick<ChipPin, "strapping" | "gotchas">> = {},
): ChipPin => ({
  gpio,
  functions: fns(...(gpio <= 21 ? rtc(gpio) : []), ...extra),
  onHeader: !OFF_HEADER.has(gpio),
  ...more,
});

export const CHIP_PINS: readonly ChipPin[] = [
  pin(0, [["rtc", "sar_i2c_scl_0"], ["strap", "GPIO0"]], {
    strapping: "Boot mode: high runs your firmware, low (with GPIO46 low) enters download mode",
    gotchas: ["strapping-pins"],
  }),
  pin(1, [["rtc", "sar_i2c_sda_0"]]),
  pin(2, [["rtc", "sar_i2c_scl_1"]]),
  pin(3, [["rtc", "sar_i2c_sda_1"], ["strap", "GPIO3"]], {
    strapping: "JTAG source, read only when the eFuses ask for it",
    gotchas: ["strapping-pins", "gpio3-floating"],
  }),
  pin(4),
  pin(5),
  pin(6),
  pin(7),
  pin(8, [["spi", "SUBSPICS1"]]),
  pin(9, [["spi", "SUBSPIHD"], ["spi", "FSPIHD"]]),
  pin(10, [["spi", "FSPIIO4"], ["spi", "SUBSPICS0"], ["spi", "FSPICS0"]]),
  pin(11, [["spi", "FSPIIO5"], ["spi", "SUBSPID"], ["spi", "FSPID"]]),
  pin(12, [["spi", "FSPIIO6"], ["spi", "SUBSPICLK"], ["spi", "FSPICLK"]]),
  pin(13, [["spi", "FSPIIO7"], ["spi", "SUBSPIQ"], ["spi", "FSPIQ"]]),
  pin(14, [["spi", "FSPIDQS"], ["spi", "SUBSPIWP"], ["spi", "FSPIWP"]]),
  pin(15, [["clock", "XTAL_32K_P"], ["uart", "U0RTS"]]),
  pin(16, [["clock", "XTAL_32K_N"], ["uart", "U0CTS"]]),
  pin(17, [["uart", "U1TXD"]]),
  pin(18, [["uart", "U1RXD"], ["clock", "CLK_OUT3"]]),
  pin(19, [["usb", "USB_D-"], ["uart", "U1RTS"], ["clock", "CLK_OUT2"]], {
    gotchas: ["usb-pins"],
  }),
  pin(20, [["usb", "USB_D+"], ["uart", "U1CTS"], ["clock", "CLK_OUT1"]], {
    gotchas: ["usb-pins"],
  }),
  pin(21),
  pin(26, [["spi", "SPICS1"]], { gotchas: ["flash-pins"] }),
  pin(27, [["spi", "SPIHD"]], { gotchas: ["flash-pins"] }),
  pin(28, [["spi", "SPIWP"]], { gotchas: ["flash-pins"] }),
  pin(29, [["spi", "SPICS0"]], { gotchas: ["flash-pins"] }),
  pin(30, [["spi", "SPICLK"]], { gotchas: ["flash-pins"] }),
  pin(31, [["spi", "SPIQ"]], { gotchas: ["flash-pins"] }),
  pin(32, [["spi", "SPID"]], { gotchas: ["flash-pins"] }),
  pin(33, [["spi", "FSPIHD"], ["spi", "SUBSPIHD"], ["spi", "SPIIO4"]]),
  pin(34, [["spi", "FSPICS0"], ["spi", "SUBSPICS0"], ["spi", "SPIIO5"]]),
  pin(35, [["spi", "FSPID"], ["spi", "SUBSPID"], ["spi", "SPIIO6"]], {
    gotchas: ["octal-psram-pins"],
  }),
  pin(36, [["spi", "FSPICLK"], ["spi", "SUBSPICLK"], ["spi", "SPIIO7"]], {
    gotchas: ["octal-psram-pins"],
  }),
  pin(37, [["spi", "FSPIQ"], ["spi", "SUBSPIQ"], ["spi", "SPIDQS"]], {
    gotchas: ["octal-psram-pins"],
  }),
  pin(38, [["spi", "FSPIWP"], ["spi", "SUBSPIWP"]], { gotchas: ["rgb-led-pin"] }),
  pin(39, [["jtag", "MTCK"], ["clock", "CLK_OUT3"], ["spi", "SUBSPICS1"]], {
    gotchas: ["jtag-pins"],
  }),
  pin(40, [["jtag", "MTDO"], ["clock", "CLK_OUT2"]], { gotchas: ["jtag-pins"] }),
  pin(41, [["jtag", "MTDI"], ["clock", "CLK_OUT1"]], { gotchas: ["jtag-pins"] }),
  pin(42, [["jtag", "MTMS"]], { gotchas: ["jtag-pins"] }),
  pin(43, [["uart", "U0TXD"], ["clock", "CLK_OUT1"]], { gotchas: ["uart0-boot-log"] }),
  pin(44, [["uart", "U0RXD"], ["clock", "CLK_OUT2"]], { gotchas: ["uart0-boot-log"] }),
  pin(45, [["strap", "GPIO45"]], {
    strapping: "Flash voltage (VDD_SPI): low gives 3.3 V, high gives 1.8 V",
    gotchas: ["strapping-pins"],
  }),
  pin(46, [["strap", "GPIO46"]], {
    strapping: "Boot mode (with GPIO0) and the ROM boot messages",
    gotchas: ["strapping-pins"],
  }),
  pin(47, [["spi", "SPICLK_P_DIFF"], ["spi", "SUBSPICLK_P_DIFF"]], {
    gotchas: ["r16v-1v8"],
  }),
  pin(48, [["spi", "SPICLK_N_DIFF"], ["spi", "SUBSPICLK_N_DIFF"]], {
    gotchas: ["r16v-1v8", "rgb-led-pin"],
  }),
];
