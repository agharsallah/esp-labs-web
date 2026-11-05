// ble lesson B6. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b6 = {
  kind: "lesson",
  id: "B6",
  track: "ble",
  title: "Keyboard & media",
  status: "built, not flashed",
  heading: "A Bluetooth keyboard and a remote for your music",
  goal: "The board becomes a real Bluetooth keyboard: the same HID service every wireless keyboard has, so phones, Macs and PCs use it with their own driver. Its button turns into a remote: play/pause and skip the music on your phone (which can be playing on your JBL speaker), change the volume, click through slides, or type text you send from the serial monitor. You write the Report Map that tells the computer what our bytes mean, and you see why a keyboard never sends letters, only key numbers.",
  goalLine:
    "Pair the board as a keyboard, control your music with the button, and type text in the right layout.",
  goalCheck: [
    "Your phone or Mac lists <b>Bench B6</b> as a connected keyboard, and the screen's status bar shows the lock (encrypted) and the key (bonded).",
    "A click on the media view pauses and resumes your music; a double-click skips the track; touching GPIO 2 turns it up.",
    "<code>type yes</code> types “yes”, not “zes”: <code>layout</code> matches the computer's keyboard setting.",
    "On the keys view you can read a press as bytes: modifier bits, key number, and the all-zero release after it.",
  ],
  learn: [
    "HID over GATT",
    "report map",
    "key numbers vs characters",
    "keyboard layouts",
    "consumer control",
    "bonding",
    "media remote",
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
  cmd: "uv run pio run -d labs/ble-lab-b6 -e ble-lab-b6 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b6 -e ble-lab-b6 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B6 and flashes it (no new downloads: NimBLE came with B1).",
      see: '<code>ble-lab-b6: NimBLE 2.5.1 up</code>, <code>advertising as keyboard "Bench B6"</code>, the command list. The screen opens on the media view: “pair me: Bluetooth settings &gt; Bench B6”.',
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "Bluetooth settings → Bench B6 → Connect / Pair",
      where: "phone",
      card: "bpair",
      does: "Your phone or Mac connects, reads the Report Map, asks to pair (HID needs encryption), and stores a bond so it reconnects by itself next time.",
      see: "<code>+ connected</code>, then <code>+ secured: Just Works, bonded, key 16 B</code>. The status bar shows the linked rings, a violet lock and a key. A Mac may open the Keyboard Setup Assistant: close it, or press the key it asks for and pick ISO (German) or ANSI (US).",
      fix: "Listed but won't connect: <code>forget</code> here AND “Forget This Device” on the phone, then pair again. A bond kept on only one side is the usual cause.",
    },
    {
      command: "(media view) click · double-click · touch GPIO 2",
      where: "button",
      card: "bhost",
      does: "Start music on the phone (to its speaker, earbuds or your JBL). Click = play/pause, double-click = next track, hold under 2 s = mute, touch the wire on GPIO 2 / 1 (after <code>touch on</code>) = volume up / down.",
      see: "The icon ripples, a dot runs board → phone → speaker, and the music reacts. The monitor prints <code>&gt; media key: play/pause (usage 0CD)</code>.",
      fix: "Nothing happens? The app must have audio focus: play something first. On a Mac, Music/Spotify react; a browser tab may not.",
    },
    {
      command: "type hello bench",
      card: "bhost",
      does: "Open Notes (or any text field) on the paired device, then type this in the monitor. The board queues 2 reports per character (press, release) and sends 6 per frame, 8 ms apart.",
      see: "“hello bench” appears on the phone or Mac. The typer view fills its progress bar, then says <code>typed 11 keys</code>.",
      fix: "Only the line says <code>not paired yet</code>? Pair first. Letters come out wrong: see <code>layout</code>.",
    },
    {
      command: "layout de (or layout us)",
      card: "bhost",
      does: "Tells the board which layout the COMPUTER is set to, so it picks the right key for each character. Saved in NVS.",
      see: "<code>layout German (QWERTZ) (saved)</code>. Now <code>type yes</code> gives “yes” on a German Mac. Characters the layout needs AltGr/Option for (@ [ ] { } \\ | ~) are skipped with a warning.",
      fix: "Still y/z swapped: the computer's layout is the other one. Check the input menu in the Mac's menu bar.",
    },
    {
      command: "key cmd+space",
      card: "bhost",
      does: "One key or a combo: modifiers (cmd, ctrl, alt, shift) plus a key (enter, tab, esc, arrows, f1-f12, a letter).",
      see: "Spotlight opens on the Mac (on an iPhone with a keyboard, the search too). The keys view shows modifier byte <code>08</code> (left GUI) and key <code>2C</code> (space).",
      fix: "Windows: <code>key win+r</code> opens Run, <code>key ctrl+alt+delete</code> the security screen.",
    },
    {
      command: "snippet my@mail.example (then double-click on typer)",
      card: "bhost",
      does: "Saves a text in NVS; a double-click on the typer view (or <code>snippet</code> alone) types it. A tiny macro pad.",
      see: "<code>snippet saved</code>, and the text on the typer view.",
      fix: "",
    },
    {
      command: "(hold the button 2 s) → slides view",
      where: "button",
      card: "bhost",
      does: "Open a presentation (Keynote, PowerPoint, Google Slides in present mode). Click = right arrow (next), double-click = left arrow, hold under 2 s = b (black screen).",
      see: "The slide on the screen slides in from the side you moved to; the deck on the computer follows.",
      fix: "",
    },
    {
      command: "(click to the keys view)",
      where: "button",
      card: "bhost",
      does: "The last reports, byte by byte: the modifier bits, the key numbers, and what each press types with the board's layout.",
      see: "<code>down mod 02 key 04 types 'A'</code> then <code>up all zero</code> for a capital A.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "A key press, from button to letter",
      widget: "b6Report",
      intro:
        "Type in the box or press a key below and follow it: the board turns the character into a key number with ITS layout setting, sends 8 bytes, and the computer turns the number back into a character with ITS layout. Set the two layouts differently and type <code>yes</code>: that's the bug <code>layout de</code> fixes.",
    },
    {
      title: "Why the board can't play to your speaker",
      widget: "b6Sound",
      intro:
        "Your JBL plays music over Classic Bluetooth audio. The ESP32-S3 only has Bluetooth LE, so it can't stream to it, but it can be the remote for the phone that does. Press a media key to follow it, or try the direct path to see where it fails.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Six views. Media and slides are modes: there the button is the remote (click, double-click, hold), and a 2-second hold moves on. On the other views a click moves on as usual.",
    },
  ],
  steps: [
    "Same screen wiring. Optional: two jumper wires in GPIO 1 and GPIO 2 with the other ends loose (touch keys for volume). Flash <code>ble-lab-b6</code>.",
    "On your phone or Mac, open Bluetooth settings and pair <b>Bench B6</b>. <b>Checkpoint 1:</b> lock and key in the status bar, <code>secured: Just Works, bonded</code> in the monitor.",
    "Play music on the phone (to your JBL if you like). On the media view: click, double-click. <b>Checkpoint 2:</b> the music pauses, resumes and skips.",
    "Type <code>touch on</code> (hands off the wires), then touch the GPIO 2 wire. <b>Checkpoint 3:</b> the volume goes up.",
    "Open Notes, set <code>layout</code> to match the computer, and <code>type yes, this is the bench</code>. <b>Checkpoint 4:</b> exactly that text appears.",
    "Hold the button 2 s to reach slides, open a presentation, click through it.",
    "Click to the keys view and read one press: modifier bits, key number, then the release.",
  ],
  note: "While an iPhone or iPad is connected to a hardware keyboard, its on-screen keyboard hides: disconnect the board (or switch Bluetooth off) to get it back. To unpair, forget the board on both sides (<code>forget</code> here, “Forget This Device” there). The ESP32-S3 has Bluetooth LE only: it can't stream audio to a speaker or headphones (that's Classic Bluetooth, A2DP), so the board controls the phone and the phone plays to your JBL. Volume and track keys go to whichever app has audio focus. Hosts disagree on what Option/AltGr characters live where, so the German table only types what it can type the same way on Mac and Windows.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
