import type { ChipFact, HeadlineNumber } from "@/domain/chip";

// The chip at a glance, for the home page. Numbers from the chip datasheet's feature list (C0.1)
// and the current tables (C5.6).

export const HEADLINE_NUMBERS: readonly HeadlineNumber[] = [
  { id: "cores", value: 2, unit: "cores", label: "Xtensa LX7 cores", source: { doc: "C", section: "C0.1" } },
  { id: "cpu-mhz", value: 240, unit: "MHz", label: "Top CPU clock", source: { doc: "C", section: "C0.1" } },
  { id: "sram", value: 512, unit: "KB", label: "On-chip SRAM", source: { doc: "C", section: "C0.1" } },
  { id: "rom", value: 384, unit: "KB", label: "Boot ROM", source: { doc: "C", section: "C0.1" } },
  { id: "gpio", value: 45, unit: "GPIOs", label: "Programmable pins", source: { doc: "C", section: "C0.1" } },
  { id: "adc-channels", value: 20, unit: "channels", label: "12-bit ADC inputs", source: { doc: "C", section: "C0.1" } },
  { id: "wifi-rate", value: 150, unit: "Mbps", label: "Top Wi-Fi data rate", source: { doc: "C", section: "C0.1" } },
  { id: "deep-sleep", value: 7, unit: "µA", label: "Deep-sleep current", source: { doc: "C", section: "C0.1" } },
];

export const HOME_FACTS: readonly ChipFact[] = [
  {
    id: "home-dual-core",
    text: "Two 32-bit Xtensa LX7 cores at up to 240 MHz, with a floating-point unit, a 128-bit data bus and SIMD instructions.",
    importance: "key",
    source: { doc: "C", section: "C0.1" },
  },
  {
    id: "home-radio",
    text: "Wi-Fi (802.11b/g/n, 2.4 GHz) and Bluetooth 5 LE share one antenna, with a built-in coexistence mechanism.",
    importance: "key",
    source: { doc: "C", section: "C0.1" },
  },
  {
    id: "home-matrix",
    text: "Almost any peripheral signal can go to almost any pin: the GPIO matrix routes 175 inputs and 184 outputs.",
    importance: "key",
    source: { doc: "T", section: "6.2" },
  },
  {
    id: "home-psram",
    text: "Up to 32 MB of external flash or PSRAM is mapped straight into the CPU's address space through the caches.",
    importance: "detail",
    source: { doc: "T", section: "4.3.3.1" },
  },
  {
    id: "home-ulp",
    text: "Two tiny coprocessors (ULP-RISC-V and ULP-FSM) keep reading sensors while the main cores sleep.",
    importance: "detail",
    source: { doc: "T", section: "2.0" },
  },
  {
    id: "home-3v3",
    text: "It runs from 3.0-3.6 V. Its pins are not 5 V tolerant.",
    importance: "gotcha",
    source: { doc: "C", section: "C5.2" },
  },
];
