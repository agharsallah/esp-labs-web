// rfid lesson R4. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const r4 = {
  kind: "lesson",
  id: "R4",
  track: "rfid",
  title: "Inside the card",
  status: "built, not flashed",
  heading: "Open the card's memory",
  goal: "A MIFARE Classic 1K holds 1,024 bytes: 16 sectors × 4 blocks × 16 bytes. Every sector has its own lock, the trailer: two keys plus access bits that say who may read or write each block. Open each sector of your own card with the factory key and dump it.",
  goalLine:
    "Dump your own card's whole memory and explain block 0 and one sector trailer byte by byte.",
  goalCheck: [
    "<code>dump</code> ends with <code>dump: 16 sectors read</code>, and the memory view is all coloured (no grey “closed” sectors).",
    "In the dump you can point to the UID in block 0 and to <code>FF 07 80 69</code> in a trailer, and the decoder above explains what FF 07 80 allows.",
  ],
  learn: [
    "sectors & blocks",
    "sector trailers",
    "access bits (stored twice)",
    "3-pass authentication",
    "encrypted frames",
    "manufacturer block",
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
  cmd: "uv run pio run -d labs/rfid-lab-r4 -e rfid-lab-r4 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/rfid-lab-r4 -e rfid-lab-r4 -t upload",
      where: "mac",
      card: "any",
      does: "Flashes lab R4's own firmware: everything from R3, plus the memory view, dump and read. <code>help</code> lists exactly this lab's commands.",
      see: "<code>rfid-lab-r4: reader task started</code>, then this lab's command list and views.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "dump (or double-click on the memory view)",
      card: "still",
      does: "For each of the 16 sectors: authenticate with the factory key A, read its 4 blocks, decode the trailer. About 1.5 s; keep the card still.",
      see: "64 lines (block, 16 bytes, ASCII, meaning), then <code>dump: 16 sectors read</code>. The memory view: block 0 amber, empty blocks dark, trailers coral.",
      fix: "Grey “closed” sectors: their key isn't the factory key (a card someone set up): the lab leaves those alone. “no card”: it moved; run it again.",
    },
    {
      command: "read 0",
      card: "on",
      does: "Authenticates sector 0 and reads block 0 only.",
      see: "UID (4 bytes), BCC, then 08 04 00 (SAK, ATQA), then the maker's bytes.",
      fix: "",
    },
    {
      command: "read 1 (with trace on)",
      card: "on",
      does: "The same for block 1, with the sniffer showing the frames.",
      see: "<code>AUTH key A</code> marked as done inside the chip, then <code>READ</code> and 16 bytes, both “[encrypted on air]”.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "The card's memory, in 3D",
      widget: "rfidMemory3d",
      intro:
        "Each cabinet is a sector, each slab a block, the top slab the trailer with its lock. Click a sector, then Authenticate: only then can its blocks be read.",
    },
    {
      title: "Access bits decoder",
      widget: "rfidAccess",
      intro:
        "Bytes 6–8 of every trailer decide who may do what in that sector. Tick the bits or type the three bytes from your dump.",
    },
    {
      title: "Authenticate and read, step by step",
      widget: "rfidSeq",
      flows: ["read"],
      intro: "What one <code>read 4</code> does on the bus and in the air.",
    },
    {
      title: "What the screen shows",
      widget: "rfidScreens",
      view: 3,
      intro:
        "The board's screen has six views. A click on the push button (or BOOT) goes to the next one, a double-click runs the action written at the bottom left, a long press pauses card polling. Pick a view to see what each part means; the numbers match the list below it.",
    },
  ],
  steps: [
    "Flash <code>rfid-lab-r4</code> with the command above (same wiring as R1). <code>help</code> shows this lab's commands.",
    "Hold the white card on the reader and keep it still. Type <code>dump</code> (or double-click on the memory view). <b>Checkpoint:</b> 16 sectors read.",
    "In the dump, read block 0: UID, BCC, SAK, ATQA, maker's bytes.",
    "Find a trailer (blocks 3, 7, 11…): key A reads as 00 (the card never reveals it), then <code>FF 07 80 69</code>, then key B.",
    "Type <code>FF 07 80</code> into the access-bits decoder above: data blocks 000, trailer 001.",
    "<code>read 1</code> with the trace view open: the AUTH and the encrypted READ.",
  ],
  note: "Authentication runs inside the MFRC522 (its MFAuthent command): the ESP32 hands over the key and never sees the handshake, and the key never goes into the trace. The firmware only uses the factory key, on cards you own, and never writes block 0 or a trailer: a trailer with broken access bits locks its sector for good.",
  preview: {
    widget: "rfid",
    view: 3,
  },
} as const satisfies LessonEntry;
