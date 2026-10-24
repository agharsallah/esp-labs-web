import type { PowerMode } from "@/domain/chip";

// Power modes, most to least hungry. Currents from the chip datasheet (C5.6: 3.3 V, 25 °C), in mA;
// what stays on from the TRM's predefined power modes (Table 10.4-2). The datasheet has no
// "hibernation" mode: below deep sleep it lists only power-off (CHIP_PU low).

export const POWER_MODES: readonly PowerMode[] = [
  {
    id: "active-wifi-tx",
    name: "Active, Wi-Fi sending",
    currentMa: { min: 283, typ: 340, max: 340 },
    keepsOn: ["CPU", "RF circuits", "Wi-Fi", "all peripherals"],
    note: "Peak current while transmitting non-stop: 340 mA for 802.11b at 21 dBm, about 285 mA for 802.11g/n.",
    source: { doc: "C", section: "C5.6.1" },
  },
  {
    id: "active-ble-tx",
    name: "Active, Bluetooth LE sending",
    currentMa: { min: 116, typ: 176, max: 335 },
    keepsOn: ["CPU", "RF circuits", "Bluetooth LE", "all peripherals"],
    note: "176 mA at 0 dBm; from 116 mA at -15 dBm up to 335 mA at 21 dBm.",
    source: { doc: "C", section: "C5.6.1" },
  },
  {
    id: "active-rx",
    name: "Active, listening",
    currentMa: { typ: 88, max: 93 },
    keepsOn: ["CPU", "RF circuits", "all peripherals"],
    note: "Wi-Fi receive takes 88 mA (91 mA on a 40 MHz channel), Bluetooth LE receive 93 mA, with the CPU idle.",
    source: { doc: "C", section: "C5.6.1" },
  },
  {
    id: "modem-sleep",
    name: "Modem-sleep",
    currentMa: { min: 32.9, typ: 66.2, max: 107.9 },
    keepsOn: ["CPU", "digital peripherals", "RTC"],
    note: "Radio off, CPU running at 240 MHz: 32.9 mA idle, 66.2 mA with both cores busy, up to 107.9 mA with every peripheral clock on. The chip starts in this mode after a reset.",
    source: { doc: "C", section: "C5.6.2" },
  },
  {
    id: "light-sleep",
    name: "Light-sleep",
    currentMa: { typ: 0.24 },
    keepsOn: ["RTC", "RAM contents", "digital peripherals (optional)"],
    note: "CPU paused, flash supply and Wi-Fi off. A timer, a pin, UART or the radio can wake it. Add about 0.14 mA for 8 MB of octal PSRAM.",
    source: { doc: "C", section: "C5.6.2" },
  },
  {
    id: "deep-sleep-ulp",
    name: "Deep-sleep with the ULP running",
    currentMa: { min: 0.018, typ: 0.17, max: 0.19 },
    keepsOn: ["RTC", "RTC memory", "ULP coprocessor"],
    note: "0.17 mA with the ULP-FSM on, 0.19 mA with the ULP-RISC-V; 18 µA if the ULP or a touch sensor only wakes now and then.",
    source: { doc: "C", section: "C5.6.2" },
  },
  {
    id: "deep-sleep",
    name: "Deep-sleep",
    currentMa: { min: 0.007, typ: 0.008 },
    keepsOn: ["RTC", "RTC memory"],
    note: "Only the RTC stays on: 8 µA with the RTC peripherals, 7 µA with RTC memory alone.",
    source: { doc: "C", section: "C5.6.2" },
  },
  {
    id: "power-off",
    name: "Power off",
    currentMa: { typ: 0.001 },
    keepsOn: [],
    note: "CHIP_PU (the EN pin) held low: the chip is shut down and draws about 1 µA.",
    source: { doc: "C", section: "C5.6.2" },
  },
];
