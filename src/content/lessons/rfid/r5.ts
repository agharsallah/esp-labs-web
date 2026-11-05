// rfid lesson R5. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const r5 = {
  kind: "lesson",
  id: "R5",
  track: "rfid",
  title: "Write & count",
  status: "built, not flashed",
  heading: "Write a label, keep a count",
  goal: "Write your own 16 bytes into a data block and read them back. Then use MIFARE's built-in arithmetic: a value block stores a number three times (once inverted) and the card itself adds or subtracts, then commits the result in one step. A backup block keeps the value from before.",
  goalLine:
    "Write text to your card and keep a credit counter on it that the card itself updates.",
  goalCheck: [
    "<code>write 4 hello bench</code> says “written and read back”.",
    "After <code>credits init 50</code> and <code>credits use 3</code>, the credits view shows 47 with backup 50.",
    "<code>dump</code> shows block 4 as data and blocks 8 and 9 as value blocks.",
  ],
  learn: [
    "block writes · ACK / NAK",
    "read-back checks",
    "value block format",
    "INCREMENT · DECREMENT · TRANSFER",
    "backup blocks",
    "guard rails",
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
  cmd: "uv run pio run -d labs/rfid-lab-r5 -e rfid-lab-r5 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/rfid-lab-r5 -e rfid-lab-r5 -t upload",
      where: "mac",
      card: "any",
      does: "Flashes lab R5's own firmware: everything from R4, plus the credits view, write and credits. <code>help</code> lists exactly this lab's commands.",
      see: "<code>rfid-lab-r5: reader task started</code>, then this lab's command list and views.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "write 4 hello bench",
      card: "on",
      does: "Opens sector 1, checks its access bits allow key A writes, writes 16 bytes (text padded with zeros), reads them back.",
      see: "Block 4's bytes, <code>|hello bench.....|</code> and <code>written and read back</code>.",
      fix: "<code>READ BACK DIFFERS</code>: the card moved mid-write; run it again.",
    },
    {
      command: "write 3 test",
      card: "any",
      does: "Tries to write a sector trailer.",
      see: "Refused before anything is sent: <code>not writable here (block 0 and trailers are off limits)</code>.",
      fix: "",
    },
    {
      command: "credits init 50",
      card: "on",
      does: "Writes 50 as a value block into block 8 and the same into the backup, block 9.",
      see: "The credits view: 50, backup 50, a coin stack.",
      fix: "",
    },
    {
      command: "credits use 3 (then credits add 10)",
      card: "on",
      does: "Copies the value into the backup, then the card subtracts (or adds) and commits with TRANSFER.",
      see: "47, backup 50; then 57, backup 47.",
      fix: "<code>no credits on this card yet</code>: run credits init first.",
    },
    {
      command: "credits use 999",
      card: "on",
      does: "The firmware checks the balance first.",
      see: "<code>only 57 credits, can't use 999</code>: nothing is sent to the card.",
      fix: "",
    },
    {
      command: "credits",
      card: "on",
      does: "Reads blocks 8 and 9 and decodes them.",
      see: "The current value and the backup.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "A value block, byte by byte",
      widget: "rfidValue",
      intro:
        "How the card stores a number so that it can check it itself. Change the value and watch which bytes move.",
    },
    {
      title: "credits use 3, step by step",
      widget: "rfidSeq",
      flows: ["credits"],
      intro: "The four card commands behind one <code>credits use 3</code>.",
    },
    {
      title: "What the screen shows",
      widget: "rfidScreens",
      view: 4,
      intro:
        "The board's screen has six views. A click on the push button (or BOOT) goes to the next one, a double-click runs the action written at the bottom left, a long press pauses card polling. Pick a view to see what each part means; the numbers match the list below it.",
    },
  ],
  steps: [
    "Flash <code>rfid-lab-r5</code> with the command above (same wiring as R1). <code>help</code> shows this lab's commands.",
    "Card on the reader. <code>write 4 hello bench</code>. <b>Checkpoint:</b> written and read back.",
    "<code>write 3 test</code>: refused, a trailer. So is block 0.",
    "<code>credits init 50</code>, then <code>credits use 3</code>. <b>Checkpoint:</b> 47, backup 50.",
    "<code>credits add 10</code>: 57, backup 47. Step through the diagram above to see the four card commands.",
    "<code>dump</code> again: block 4 is data, blocks 8 and 9 are value blocks.",
  ],
  note: "Credits on a MIFARE Classic are a learning toy, not money: anyone with the key can rewrite the block. Payment and transit systems use cards with modern cryptography (such as MIFARE DESFire) and check every transaction on a server.",
  preview: {
    widget: "rfid",
    view: 4,
  },
} as const satisfies LessonEntry;
