// ble lesson B7. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b7 = {
  kind: "lesson",
  id: "B7",
  track: "ble",
  title: "Music",
  status: "built, not flashed",
  heading: "A Bluetooth MIDI instrument",
  goal: "The board becomes a MIDI instrument over Bluetooth LE, using the standard BLE-MIDI service that GarageBand, Audio MIDI Setup, Android synth apps and Chrome all understand. MIDI carries notes, not sound: the synth on the other side makes the sound (and can send it to your JBL). Play with the button, five touch wires, serial commands and a 16-step drum machine; notes played on the other side light the board's piano strip and its LED. You see how notes are packed with timestamps, and why the connection interval sets the latency.",
  goalLine: "Play notes from the board into a synth, and see the synth's notes on the board.",
  goalCheck: [
    "GarageBand (or the ble-app Music tab) lists <b>Bench B7</b> and makes a sound when you click the button.",
    "<code>tune twinkle</code> plays the tune; <code>beat house</code> + <code>seq on</code> plays drums on channel 10.",
    "Notes you play on the synth's keyboard light the board's piano strip in blue, and the LED takes each note's colour.",
    "The link view shows your connection interval, and you can say how long a note may wait for the radio.",
  ],
  learn: [
    "MIDI messages",
    "BLE-MIDI packets",
    "timestamps",
    "running status",
    "connection interval = latency",
    "capacitive touch",
    "General MIDI drums",
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
  cmd: "uv run pio run -d labs/ble-lab-b7 -e ble-lab-b7 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b7 -e ble-lab-b7 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B7 and flashes it.",
      see: '<code>advertising as MIDI instrument "Bench B7"</code>, the command list, the keys view with five keys and a piano strip.',
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command:
        "Mac: Audio MIDI Setup → Window → Show MIDI Studio → Bluetooth icon → Bench B7 → Connect",
      where: "phone",
      card: "bhost",
      does: "macOS connects to the board as a MIDI device (it may ask to pair: accept). Then open GarageBand with a software instrument: it hears every MIDI device.",
      see: "<code>+ connected</code>, <code>asked for a 7.5-15 ms interval (low latency)</code>, <code>+ a synth is listening (subscribed)</code>. The keys view says “synth listening”.",
      fix: "iPhone/iPad: GarageBand → open a keyboard → settings (gear) → Advanced → Bluetooth MIDI Devices → Bench B7. Android: a BLE-MIDI app (e.g. “MIDI BLE Connect”) plus any synth. Chrome: the ble-app Music tab.",
    },
    {
      command: "(click the button)",
      where: "button",
      card: "bhost",
      does: "Plays the next note of the scale (300 ms). Double-click = a chord. Hold under 2 s = all notes off.",
      see: "A sound from GarageBand; the key lights violet on the piano strip; the roll draws a violet bar.",
      fix: "No sound but “synth listening”: in GarageBand, pick a software instrument track (not audio) and turn the volume up.",
    },
    {
      command: "tune twinkle (or ode, frere)",
      card: "bhost",
      does: "Schedules a whole public-domain tune at the current tempo. loop() sends each note when it's due.",
      see: "<code>tune twinkle: 14 notes, 8.4 s</code> and the tune from the synth.",
      fix: "",
    },
    {
      command: "beat house, then seq on",
      card: "bhost",
      does: "The drum machine: 4 drums x 16 steps on MIDI channel 10, where General MIDI keeps the drums (36 kick, 38 snare, 42 hi-hat, 39 clap).",
      see: "The sequencer view's playhead walks the grid; GarageBand plays drums (pick a drum kit track for the real sound).",
      fix: "Drums sound like piano notes: the track's instrument isn't a drum kit.",
    },
    {
      command: "touch on",
      card: "bhost",
      does: "Five jumper wires on GPIO 1, 2, 6, 13, 14 (loose ends) become keys of the pentatonic scale. Hands off while it measures the baseline.",
      see: "<code>touch on: 5 keys, pentatonic from C4</code>; touching a wire end lights its key and plays the note, a firmer touch = louder.",
      fix: "GPIO 13 and 14 are the RC522's wires from the RFID track: unplug the reader, or use the first three keys.",
    },
    {
      command: "(play the synth's own keyboard)",
      where: "app",
      card: "bhost",
      does: "GarageBand (or the ble-app piano) sends MIDI back to the board as writes.",
      see: "Blue keys on the piano strip, blue bars on the roll, the LED in the note's colour, <code>&lt; note E4 vel 96 ch 1</code> lines.",
      fix: "On a Mac, GarageBand doesn't send to MIDI devices: use the ble-app piano, or a DAW with MIDI output.",
    },
    {
      command: "(click to the link view)",
      where: "button",
      card: "bhost",
      does: "Explains the latency: notes wait for the next connection event.",
      see: "Your interval (7.5-15 ms if the host agreed, often 11.25 or 15 on Apple devices) and a press dropping to the next tick.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "One note, byte by byte",
      widget: "b7Packet",
      intro:
        "Play the little keyboard (click, or the keys A to K on your computer). Notes pressed within one connection event share one packet. Watch the header, the timestamps, the status byte and running status, the trick that drops repeated status bytes.",
    },
    {
      title: "Why notes wait: the connection interval",
      widget: "b7Latency",
      intro:
        "A connected device may only talk at connection events, one every interval. Pick an interval and play: each note waits for the next event. Then compare a synth that plays notes when they arrive with one that uses the timestamps.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Five views. On keys, sequencer and roll the button is the instrument (click a note, double-click a chord or start/stop the drums, hold for all notes off, hold 2 s to move on).",
    },
  ],
  steps: [
    "Same screen wiring. Optional: five jumper wires in GPIO 1, 2, 6, 13, 14 (unplug the RC522 first). Flash <code>ble-lab-b7</code>.",
    "Connect from GarageBand (iPhone/iPad), Audio MIDI Setup + GarageBand (Mac), a BLE-MIDI app (Android) or the ble-app Music tab (Chrome). <b>Checkpoint 1:</b> “synth listening” on the keys view.",
    "Click the button a few times, then double-click. <b>Checkpoint 2:</b> notes and a chord from the synth.",
    "<code>tune ode</code>, then <code>beat funk</code> and <code>seq on</code>. <b>Checkpoint 3:</b> a tune and a drum groove.",
    "Play the synth's keyboard. <b>Checkpoint 4:</b> blue keys and a coloured LED on the board.",
    "Open the link view and read your interval. Try <code>bpm 200</code> with the drums and listen: does it still feel tight?",
  ],
  note: "MIDI is instructions, not audio: the board never makes a sound itself (it has no speaker). The synth's audio can go anywhere it can play, your JBL included, through the phone or Mac's own Bluetooth. Apple hosts usually grant 11.25-15 ms connection intervals for MIDI, so a note waits up to one interval; the timestamps inside each packet let a good synth keep the rhythm anyway. If the Mac asks to pair, accept: the board allows Just Works bonding. Only public-domain tunes are built in.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
