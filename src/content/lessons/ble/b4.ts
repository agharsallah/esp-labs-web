// ble lesson B4. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b4 = {
  kind: "lesson",
  id: "B4",
  track: "ble",
  title: "Pair & trust",
  status: "built, not flashed",
  heading: "Make the link private, and remember who's allowed",
  goal: "In B3 anyone nearby could connect and read every byte. B4 adds a <b>Vault</b> characteristic that the board only serves over an <b>encrypted, authenticated</b> link. Touch it from the phone and <b>pairing</b> starts: the passkey appears big on the TFT, or both screens show the same six digits and you confirm with the button. Afterwards the board <b>bonds</b>: it keeps the keys in flash, recognises your phone behind its changing private address, and can refuse everyone else.",
  goalLine:
    "Pair your phone with each of the three methods, read the Vault, and lock the board to your phone.",
  goalCheck: [
    "With <code>pair passkey</code>, reading the Vault on the phone brings up a code prompt, the TFT shows six digits, and after typing them the phone reads <b>the bench's secret: 42</b>.",
    "The <b>ceremony</b> view fills phase by phase up to <b>bonded</b>, and the header shows a violet lock and an amber key.",
    "With <code>pair justworks</code> (after <code>forget all</code> and forgetting the board on the phone) the link is encrypted but the Vault is still refused: you can explain why.",
    "With <code>pair compare</code> you accept the matching numbers with a click on the board and a tap on the phone.",
    "After <code>allow bonded</code>, your phone still connects, and a second phone (or the same phone after forgetting the board) can't.",
  ],
  learn: [
    "pairing vs bonding",
    "IO capabilities",
    "Just Works · Passkey · Numeric Comparison",
    "LE Secure Connections (ECDH)",
    "MITM protection",
    "LTK & IRK",
    "private addresses",
    "filter accept list",
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
  cmd: "uv run pio run -d labs/ble-lab-b4 -e ble-lab-b4 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b4 -e ble-lab-b4 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B4 and writes it to the board.",
      see: "The <b>ceremony</b> view: “Waiting for a phone to connect...” and eight grey phases.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "uv run pio device monitor",
      where: "mac",
      card: "bnone",
      does: "Opens the serial monitor.",
      see: "<code>- pairing: Passkey · lock off · anyone may connect</code>, then the command list. The method is saved in flash: it survives a reflash of B4.",
      fix: "",
    },
    {
      command: "nRF Connect → Bench B4 → Connect → Vault → read",
      where: "phone",
      card: "bconn",
      does: "The Vault refuses a plain-text link with “Insufficient Authentication”; the phone reacts by starting pairing.",
      see: "The phone asks for a code; the TFT shows <b>PASSKEY ENTRY</b> and six digits; the monitor <code>! passkey 482915: type it on the other device</code>. The ceremony view's phases 1-5 fill, “check” pulses amber.",
      fix: "No prompt on iPhone: read the Vault again. On Android the prompt may be a notification.",
    },
    {
      command: "type the six digits on the phone",
      where: "phone",
      card: "bconn",
      does: "Both sides check the passkey bit by bit (20 rounds of confirm and random values), then encrypt and swap keys.",
      see: "<code>+ secured: authenticated, bonded, key 16 B</code>, <code>- identity: 4C:…</code>; the phone reads <b>the bench's secret: 42</b>. Lock and key icons in the header; the ceremony track is complete.",
      fix: "<code>x … confirm failed: wrong passkey</code>: a typo. Read the Vault again for a new code.",
    },
    {
      command: "disconnect, then connect again and read the Vault",
      where: "phone",
      card: "bpair",
      does: "A bonded phone has the keys: no ceremony, encryption starts straight away.",
      see: "The ceremony view says <b>stored keys: bonded before, no ceremony</b> and jumps from connect to encrypted.",
      fix: "",
    },
    {
      command: "bonds",
      card: "bpair",
      does: "Lists the bonded devices by identity address (the IRK resolves the phone's private address to it).",
      see: "<code>1 bonded device …</code> and <code>1  4C:…  random static</code> (iPhones and most Androids use a random static identity). The <b>bonds</b> view marks it “&lt;- here”.",
      fix: "",
    },
    {
      command: "forget all, then forget Bench B4 on the phone",
      card: "bpair",
      does: "Deletes the bonds on the board. The phone still has its half: forget the device in Settings → Bluetooth (iPhone: ⓘ → Forget This Device; Android: the gear → Unpair; macOS: right-click → Forget).",
      see: '<code>! forgot every bond</code>, <code>- now forget "Bench B4" on the phone too</code>. If you skip the phone part: <code>x ENC_CHANGE failed 0x206: key missing: one side forgot the bond</code>.',
      fix: "",
    },
    {
      command: "pair justworks, then read the Vault",
      card: "bconn",
      does: "The board now says “no input, no output”: nobody can check anything. The link gets encrypted, but not authenticated.",
      see: "<code>+ secured: Just Works, bonded</code>, a violet lock, but the Vault read fails again with Insufficient Authentication: the Vault demands MITM protection.",
      fix: "That's the lesson: Just Works stops eavesdroppers, not a man in the middle.",
    },
    {
      command: "pair compare (forget first), read the Vault, then click",
      where: "button",
      card: "bconn",
      does: "Both screens show the same six digits. A click on the board says yes, a long press no; the phone has its own button.",
      see: "<b>NUMERIC COMPARISON</b> on the TFT, the same number on the phone; after both yes: <code>+ secured: authenticated, bonded</code>.",
      fix: "A long press (no) ends with <code>numbers didn't match: said no</code>.",
    },
    {
      command: "allow bonded",
      card: "bpair",
      does: "Only bonded identities go on the filter accept list; the controller resolves each private address with the stored IRKs and refuses the rest.",
      see: "<code>+ only bonded phones may connect (saved)</code>. Your phone connects; another one (or yours after forgetting) gets no connection at all.",
      fix: "Locked yourself out: <code>allow anyone</code> over serial.",
    },
    {
      command: "lock on",
      card: "bnone",
      does: "LED and Message also need an encrypted link. Permissions are part of the GATT table, built once at start-up, so the board saves the setting and restarts.",
      see: "<code>lock on saved. … the board restarts now...</code>; afterwards writing the LED from a non-paired phone triggers pairing too.",
      fix: "iPhone shows old permissions: turn Bluetooth off and on (it caches the table).",
    },
  ],
  panels: [
    {
      title: "Which pairing method? It depends on both sides",
      widget: "b4Matrix",
      intro:
        "At the start of pairing each side says what it can do: show a number, type one, press yes or no, or nothing at all. The two answers decide the method. Pick the phone's and the board's capabilities (the board's are what <code>pair</code> sets) and see who shows and who types.",
    },
    {
      title: "One pairing, packet by packet",
      widget: "b4Seq",
      intro:
        "The Security Manager Protocol (SMP) messages that cross the air when the phone reads the Vault, with their real bytes. Each method differs only in the middle: how a person proves nobody sits in between.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Five views. A click goes to the next one; a double-click runs the action in the footer (secure, bonds, press). While numbers wait for comparison, the button answers instead: click = yes, long press = no.",
    },
  ],
  steps: [
    "Same wiring as B3. Flash <code>ble-lab-b4</code> and open the monitor. <b>Checkpoint 1:</b> <code>pairing: Passkey</code> in the start-up lines.",
    "Connect from nRF Connect and read the <b>Vault</b>. Type the six digits from the TFT. <b>Checkpoint 2:</b> the phone reads the secret; the ceremony view is complete; lock and key in the header.",
    "Disconnect and reconnect. <b>Checkpoint 3:</b> “stored keys”: no passkey this time.",
    "<code>forget all</code> and forget the board on the phone. <code>pair justworks</code>, read the Vault. <b>Checkpoint 4:</b> encrypted, yet refused. Why?",
    "Forget on both sides again, <code>pair compare</code>, read the Vault and click to confirm. <b>Checkpoint 5:</b> authenticated and bonded.",
    "<code>allow bonded</code>. <b>Checkpoint 6:</b> your phone connects; after forgetting it on the phone, it can't. Finish with <code>allow anyone</code>.",
  ],
  note: "Pairing has two halves: whenever you <code>forget</code> on the board, forget the board on the phone too (iPhone: Settings → Bluetooth → ⓘ → Forget This Device; Android: Bluetooth → gear → Unpair; macOS: System Settings → Bluetooth → right-click → Forget), or the next connection fails with “key missing”. If only the phone forgot, NimBLE accepts the new pairing and replaces the old bond by itself (repeat pairing). The method, lock and allow settings are saved in flash (namespace b4) and survive restarts. NimBLE doesn't report the features, method and key-exchange phases one by one: the ceremony view draws them as inferred (a ring) once a later phase proves they happened. The board ships with the secret “the bench's secret: 42”; <code>vault &lt;text&gt;</code> changes it until the next restart.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
