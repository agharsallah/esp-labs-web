// rfid lesson R3. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const r3 = {
  kind: "lesson",
  id: "R3",
  track: "rfid",
  title: "Who's there",
  status: "built, not flashed",
  heading: "Two cards at once: anticollision",
  goal: "Lay the card and the tag on the reader together. Both answer at the same instant, bit by bit, and where their UIDs differ the reader hears a collision. Anticollision walks down the bits like a binary tree: pick a branch, ask again with that prefix, select the card that's left, halt it, repeat until nobody answers.",
  goalLine: "Find both cards at once, and point to the exact bit where their UIDs collided.",
  goalCheck: [
    "<code>inventory</code> lists 2 cards with both UIDs.",
    "It names the collision bit, and the walk-through above lands on the same bit with your two UIDs.",
  ],
  learn: [
    "bit collisions",
    "binary tree walk",
    "NVB",
    "BCC",
    "cascade levels",
    "SAK",
    "HALT · WUPA",
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
      pin: "3V3",
      idx: 1,
      role: "RC 3.3V",
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
      pin: "15",
      role: "RC SDA",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "16",
      role: "RC SCK",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "17",
      role: "MOSI",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "18",
      role: "MISO",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "14",
      role: "RC RST",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "13",
      role: "IRQ",
      side: "L",
      kind: "rfid",
    },
    {
      pin: "GND",
      idx: 0,
      role: "RC GND",
      side: "R",
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
  cmd: "uv run pio run -d labs/rfid-lab-r3 -e rfid-lab-r3 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/rfid-lab-r3 -e rfid-lab-r3 -t upload",
      where: "mac",
      card: "any",
      does: "Flashes lab R3's own firmware: everything from R2, plus inventory (and a double-click on the card view runs it). <code>help</code> lists exactly this lab's commands.",
      see: "<code>rfid-lab-r3: reader task started</code>, then this lab's command list and views.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "lay the card and the tag together",
      where: "hands",
      card: "both",
      does: "Both cards wake on the same WUPA. The poll resolves the collision and selects one of them.",
      see: "The card view shows one UID (always the same one) and an amber line: <code>collision at bit 23</code> (your bit will differ).",
      fix: "Only one card found? Overlap them more: both must sit inside the antenna's loop.",
    },
    {
      command: "inventory (or double-click on the card view)",
      card: "both",
      does: "Switches the field off for 10 ms so every card restarts, then REQA → select → halt, again and again until nobody answers.",
      see: "<code>#1 9C:4F:6A:0D … collision at level 1 bit 23 -&gt; chose 1</code>, <code>#2 9C:4F:2A:1B …</code>, then <code>inventory: 2 cards in the field</code>.",
      fix: "<code>select failed (collision)</code>: move the cards a little and run it again.",
    },
    {
      command: "inventory with one card, then none",
      card: "move",
      does: "Same walk, nothing to resolve.",
      see: "<code>1 card</code> without a collision line, then <code>0 cards</code>.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "Anticollision: a walk down the bits",
      widget: "rfidAnticoll",
      intro:
        "The two rows are the UID bits of two cards, in the order they travel (least significant bit of byte 0 first). Step through: where the bits differ the reader hears a collision, picks 1, and only the matching card keeps answering. Type your own UIDs from the monitor.",
    },
    {
      title: "What the screen shows",
      widget: "rfidScreens",
      view: 1,
      intro:
        "The board's screen has six views. A click on the push button (or BOOT) goes to the next one, a double-click runs the action written at the bottom left, a long press pauses card polling. Pick a view to see what each part means; the numbers match the list below it.",
    },
  ],
  steps: [
    "Flash <code>rfid-lab-r3</code> with the command above (same wiring as R1). <code>help</code> shows this lab's commands.",
    "Lay the card and the tag on the reader together, overlapping.",
    "Watch the card view: one UID, and the collision bit in amber.",
    "Type <code>inventory</code> (or double-click on the card view). <b>Checkpoint:</b> 2 cards, and the collision bit.",
    "Type both UIDs into the walk-through above and step to step 2: the collision lands on the same bit.",
    "Leave both on the reader: the card view always shows the same card. The walk always picks 1 at a collision, so the same card wins every time.",
  ],
  note: "Bits travel least-significant first, so “bit 23” is bit 6 of the third UID byte. Our driver is tested for two cards at once: with three or more, the chip's collision position after the first branch is harder to trust. 7-byte UIDs take two cascade levels; the first part starts with 88h, the cascade tag.",
  preview: {
    widget: "rfid",
    view: 1,
  },
} as const satisfies LessonEntry;
