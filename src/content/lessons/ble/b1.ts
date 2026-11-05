// ble lesson B1. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b1 = {
  kind: "lesson",
  id: "B1",
  track: "ble",
  title: "Listen",
  status: "built, not flashed",
  heading: "Hear every Bluetooth device around you",
  goal: "Phones, watches, earbuds, speakers, keyboards and beacons announce themselves all day: short <b>advertising</b> packets on three radio channels, many times a second, whether anyone listens or not. B1 turns the board into a listener. It draws them on a radar, guesses what each one is, and takes a packet apart byte by byte. The radio uses NimBLE, a lightweight Bluetooth stack; the firmware is its own (<code>ble-lab-b1</code>), with shared code in <code>kit/lib/ble-kit</code>.",
  goalLine:
    "Find your own phone among the devices around you, read its packets byte by byte, and measure how often it advertises.",
  goalCheck: [
    "The <b>radar</b> view shows blips and the monitor's <code>list</code> prints a table of devices with a kind (phone, audio, keyboard…).",
    "You picked your own phone (bring it close: it becomes the strongest) and <code>bytes</code> shows its AD structures: Flags, then manufacturer data (Apple, Samsung, Google…).",
    "<code>watch</code> prints one line per packet of your phone, and you can read its advertising interval from the <code>+… ms</code> gaps.",
    "Switching <code>mode passive</code> makes the scan responses (and some names) disappear; <code>mode active</code> brings them back.",
  ],
  learn: [
    "advertising",
    "channels 37 · 38 · 39",
    "AD structures",
    "active vs passive scan",
    "RSSI → distance",
    "private addresses",
    "scan duty cycle",
  ],
  pins: [
    {
      pin: "3V3",
      idx: 0,
      role: "VCC",
      side: "L",
      kind: "power",
    },
    {
      pin: "7",
      role: "BLK",
      side: "L",
    },
    {
      pin: "8",
      role: "RES",
      side: "L",
    },
    {
      pin: "9",
      role: "DC",
      side: "L",
    },
    {
      pin: "10",
      role: "CS",
      side: "L",
    },
    {
      pin: "11",
      role: "SDA",
      side: "L",
    },
    {
      pin: "12",
      role: "SCL",
      side: "L",
    },
    {
      pin: "GND",
      idx: 21,
      role: "GND",
      side: "L",
      kind: "gnd",
    },
    {
      pin: "5",
      role: "BTN",
      side: "L",
      kind: "btn",
    },
    {
      pin: "0",
      role: "BOOT",
      side: "R",
    },
  ],
  boot: true,
  cmd: "uv run pio run -d labs/ble-lab-b1 -e ble-lab-b1 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b1 -e ble-lab-b1 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B1 and writes it to the board. The first build downloads NimBLE-Arduino 2.5.1 (the Bluetooth stack).",
      see: "<code>Hard resetting via RTS pin…</code>. The screen shows the radar with a sweeping line.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "uv run pio device monitor",
      where: "mac",
      card: "bnone",
      does: "Opens the serial monitor (the board restarts).",
      see: "<code>ble-lab-b1: NimBLE 2.5.1 up, address …</code>, <code>+ active scan, 100/100 ms (100% listening)</code>, then the command list.",
      fix: "No <code>NimBLE … up</code> line: the stack didn't start; unplug and replug the board.",
    },
    {
      command: "list",
      card: "bscan",
      does: "Prints every device heard in the last 30 s, strongest first: RSSI, a distance guess, kind, address and its type, packets, name or maker.",
      see: "A table such as <code>1  -46  0.6  phone  5A:3C:…  private (RPA)  412  Apple</code>. Ten to fifty rows in a flat, fewer in a house.",
      fix: "Empty: is Bluetooth on around you? Phones often advertise only when their screen is on or an app wants them to.",
    },
    {
      command: "(hold your phone next to the board)",
      where: "hands",
      card: "bscan",
      does: "Your phone becomes the strongest device. Unlock it: iPhones advertise more often with the screen on.",
      see: "On the <b>radar</b>, one blip moves to the centre; on <b>list</b> it jumps to row 1 with about −40 dBm.",
      fix: "Android phones may stay silent: open nRF Connect and use its Advertiser tab, or switch on Nearby Share / Quick Share for a moment.",
    },
    {
      command: "pick 1, then bytes",
      card: "bscan",
      does: "Picks row 1 for the <b>inspect</b> view and prints its advertisement and scan response, structure by structure.",
      see: "<code>[02 01 | 1A] Flags</code>, <code>[0A FF | 4C 00 10 …] Manufacturer data</code> (Apple: Nearby info), maybe <code>[02 0A | 0C] TX power</code>.",
      fix: "<code>no scan response</code>: some devices don't send one; in passive mode nobody asks for it.",
    },
    {
      command: "watch",
      card: "bscan",
      does: "Prints one line per packet of the picked device, with the time since the previous one.",
      see: "<code>&lt; +  182 ms  -47 dBm  31 B</code> lines. Some gaps are missed packets (your phone sent it on a channel the board wasn't listening on); the shortest repeating gap is its interval.",
      fix: "<code>watch off</code> stops it. Too many lines: <code>near -60</code> first.",
    },
    {
      command: "mode passive, then mode active",
      card: "bscan",
      does: "Passive: the board only listens. Active: it also sends a scan request to every scannable device and gets a second packet back, the scan response.",
      see: "In passive mode the <b>inspect</b> view loses its <i>scan rsp</i> row and some names turn into makers. The air view shows the mode.",
      fix: "",
    },
    {
      command: "timing 100 30",
      card: "bscan",
      does: "Listen 30 ms out of every 100 (30 % duty cycle) instead of all the time.",
      see: "Packets per second on the <b>air</b> view drop to about a third. Phones scan like this to save battery. <code>timing 100 100</code> goes back.",
      fix: "Window must be ≤ interval.",
    },
    {
      command: "calib (phone 1 m away)",
      card: "bscan",
      does: "Takes the picked device's average RSSI as the 1 m reference for the distance guesses.",
      see: "<code>+ 1 m = -58 dBm now: distances use it</code>. Walk away: the blip drifts outwards.",
      fix: "Distances jump by ±1 m: that's RSSI. Bodies, walls and the phone's orientation move it by 5–10 dB.",
    },
  ],
  panels: [
    {
      title: "The Bluetooth track, from listening to hosting",
      widget: "bleJourney",
      intro:
        "Eight labs, each its own firmware. The board starts as a pure listener and ends up hosting your keyboard. Pick a lab to see the board's role and which way the data flows; the lock marks the labs where pairing and encryption matter.",
    },
    {
      title: "Three channels, many shouts",
      widget: "bleRadio",
      intro:
        "Bluetooth LE splits the 2.4 GHz band into 40 channels of 2 MHz. Advertising uses only three of them, 37, 38 and 39, placed in the gaps between the usual Wi-Fi channels 1, 6 and 11. Every advertising event sends the same packet on all three, one after the other. The scanner listens on one channel at a time: a packet counts only if it lands inside a listening window on its channel. Move the window slider and watch how many packets the board catches; switch to active to see the scan request and response.",
    },
    {
      title: "One advertising packet, byte by byte",
      widget: "bleAnatomy",
      intro:
        "What a radio actually sends, from the first bit to the checksum. Pick a device, then step through the fields with ◀ ▶. The AD structures in the middle are exactly what the <b>inspect</b> view and the <code>bytes</code> command show.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Four views. A click on the push button (or BOOT) goes to the next one, a double-click runs the action written at the bottom left, a long press pauses or resumes the scan. The icon at the top right is the radio: a sweeping radar while it scans.",
    },
  ],
  steps: [
    "Keep the screen wired as in lesson 03 (push button optional). Flash <code>ble-lab-b1</code> and open the monitor. <b>Checkpoint 1:</b> <code>NimBLE 2.5.1 up</code> and the radar sweeping.",
    "Type <code>list</code>. <b>Checkpoint 2:</b> a table of devices with kinds; look for <i>audio</i> (your JBL advertises for its app), <i>keyboard/mouse</i> and Apple or Microsoft makers.",
    "Hold your unlocked phone next to the board, <code>pick 1</code>, click to <b>inspect</b>. <b>Checkpoint 3:</b> its bytes in coloured AD structures, the address type is <i>private (RPA)</i>.",
    "Type <code>watch</code> for ten seconds, then <code>watch off</code>. <b>Checkpoint 4:</b> you can name your phone's advertising interval.",
    "Try <code>mode passive</code> / <code>mode active</code> and <code>timing 100 30</code> / <code>timing 100 100</code> while looking at the <b>air</b> view.",
    "Optional: <code>calib</code> with the phone 1 m away, then walk to the other side of the room and watch the radar.",
  ],
  note: "Everything here is what devices broadcast to anyone; the board never connects to them. Still, the list is your neighbours' gadgets: don't post their addresses (they stay out of the committed logs). Phones change their private address about every 15 minutes, so the same phone can show up twice. Distances are guesses from signal strength, good to a factor of two. The ESP32-S3 has Bluetooth LE only: Classic Bluetooth (most audio streaming, older keyboards) is invisible to it.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
