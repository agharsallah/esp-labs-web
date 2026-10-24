import type { ComponentType } from "react";
import { Bluetooth, Beacon, Chat, Keyboard, Mouse, Note, Padlock, Radar } from "./drawings/ble";
import {
  Antenna,
  Button,
  Cable,
  DevKit,
  Header,
  Knob,
  Module,
  RedLed,
  RgbLed,
  Sensor,
  UsbC,
} from "./drawings/board";
import { Showcase, Tft } from "./drawings/display";
import { Cloud, Notebook, PhoneBle, PhoneWifi, Router, Tower } from "./drawings/radio";
import { Card, Cards, Coins, KeyFob, KeyFobs, Memory, Range, Reader } from "./drawings/rfid";
import { Burst, Cassette, Equalizer, Gamepad, Meter, Mic, Speaker } from "./drawings/sound";

// Every part in the library, by name. The words a screen reader uses for each part live in the
// "parts" catalogue (names.<name>).
// A drawing is SVG content in a 64 × 64 box; <PartIcon> wraps it. `scale` enlarges the small
// parts so every part fills its box about as much as the others.
export const PARTS = {
devkit: { draw: DevKit, scale: 1.12 },
module: { draw: Module, scale: 1.15 },
usbc: { draw: UsbC, scale: 1.15 },
cable: { draw: Cable, scale: 1.1 },
button: { draw: Button, scale: 1.3 },
"rgb-led": { draw: RgbLed, scale: 1.4 },
led: { draw: RedLed },
header: { draw: Header, scale: 1.1 },
antenna: { draw: Antenna, scale: 1.1 },
sensor: { draw: Sensor, scale: 1.45 },
knob: { draw: Knob, scale: 1.25 },
tft: { draw: Tft, scale: 1.12 },
showcase: { draw: Showcase, scale: 1.12 },
router: { draw: Router },
"phone-wifi": { draw: PhoneWifi, scale: 1.15 },
"phone-ble": { draw: PhoneBle, scale: 1.15 },
cloud: { draw: Cloud },
tower: { draw: Tower },
notebook: { draw: Notebook },
reader: { draw: Reader, scale: 1.05 },
card: { draw: Card },
cards: { draw: Cards },
memory: { draw: Memory },
coins: { draw: Coins },
range: { draw: Range },
keyfob: { draw: KeyFob, scale: 1.35 },
keyfobs: { draw: KeyFobs, scale: 1.1 },
bluetooth: { draw: Bluetooth },
radar: { draw: Radar, scale: 1.15 },
beacon: { draw: Beacon, scale: 1.2 },
chat: { draw: Chat },
padlock: { draw: Padlock, scale: 1.3 },
keyboard: { draw: Keyboard },
note: { draw: Note },
mouse: { draw: Mouse, scale: 1.05 },
mic: { draw: Mic, scale: 1.3 },
meter: { draw: Meter, scale: 1.1 },
burst: { draw: Burst },
cassette: { draw: Cassette },
equalizer: { draw: Equalizer },
gamepad: { draw: Gamepad },
speaker: { draw: Speaker },
} as const satisfies Record<string, { draw: ComponentType; scale?: number }>;

export type PartName = keyof typeof PARTS;
export const PART_NAMES = Object.keys(PARTS) as PartName[];
