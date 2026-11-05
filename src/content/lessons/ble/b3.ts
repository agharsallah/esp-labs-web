// ble lesson B3. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b3 = {
  kind: "lesson",
  id: "B3",
  track: "ble",
  title: "Connect & talk",
  status: "built, not flashed",
  heading: "Your phone connects, reads and writes",
  goal: "Advertising is shouting; a <b>connection</b> is a private conversation. The phone (the <i>central</i>) connects to the board (the <i>peripheral</i>), and from then on they meet on a fixed beat, the connection interval, hopping over 37 data channels. On the board sits a small database, the <b>GATT</b> table: the Bench service with LED, Message, Button, Temperature and Uptime. From nRF Connect or LightBlue you write the LED's colour, put a message on the screen, read the chip's temperature and subscribe to the button.",
  goalLine:
    "Control the board from your phone over Bluetooth, and see every operation arrive on the gatt view.",
  goalCheck: [
    "nRF Connect (or LightBlue) shows <b>Bench B3</b>, connects, and lists the Bench service with five named characteristics plus Device Information and Battery.",
    "Writing <code>FF5000</code> to <b>LED</b> turns the on-board LED orange, and the LED row flashes blue on the gatt view.",
    "Writing text to <b>Message</b> shows it big on the message view.",
    "After you subscribe to <b>Button</b>, every click on the board arrives on the phone as a notification; the Temperature notifies every 2 s.",
    "The <b>link</b> view shows the connection interval, MTU and RSSI, and <code>params slow</code> visibly changes the interval.",
  ],
  learn: [
    "central & peripheral",
    "GATT: services & characteristics",
    "UUIDs (16 & 128-bit)",
    "read · write · notify",
    "CCCD (subscribing)",
    "MTU",
    "connection interval",
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
  cmd: "uv run pio run -d labs/ble-lab-b3 -e ble-lab-b3 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b3 -e ble-lab-b3 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B3 and writes it to the board.",
      see: "The <b>gatt</b> view with five rows; the radio icon shows rings: advertising.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "uv run pio device monitor",
      where: "mac",
      card: "bnone",
      does: "Opens the serial monitor.",
      see: '<code>- advertising as "Bench B3"</code>, then the command list.',
      fix: "",
    },
    {
      command: "nRF Connect → Scanner → Bench B3 → Connect",
      where: "phone",
      card: "bscan",
      does: "Your phone connects. Install nRF Connect for Mobile (Nordic, free; iPhone and Android) or LightBlue. On iPhone, never connect from Settings → Bluetooth: apps do it.",
      see: "Monitor: <code>+ connected: 5A:3C:…</code> and <code>- interval 30.00 ms …</code>, soon <code>- MTU 255: 252 bytes of data per packet</code>. The radio icon turns into two rings, the LED steady blue.",
      fix: "Bench B3 not listed: scroll, or filter by name “Bench”. Still nothing: <code>adv on</code>.",
    },
    {
      command: "LED → write → 0xFF5000 (byte array)",
      where: "phone",
      card: "bconn",
      does: "Writes 3 bytes: red FF, green 50, blue 00.",
      see: "<code>&lt; write LED FF 50 00</code>; the on-board LED glows orange; the LED row flashes blue and shows the colour swatch.",
      fix: "<code>LED wants 3 bytes, got 1</code>: choose Byte Array, not Text or UINT8.",
    },
    {
      command: "Message → write → Text “hello bench”",
      where: "phone",
      card: "bconn",
      does: "Writes UTF-8 text (up to 40 bytes).",
      see: '<code>&lt; write Message "hello bench"</code>; click to the <b>message</b> view: big text, “written 3s ago”.',
      fix: "Accents show as boxes: the screen font is plain ASCII.",
    },
    {
      command: "Button → subscribe (the ↓↓↓ / bell icon), then click the board's button",
      where: "phone",
      card: "bconn",
      does: "Subscribing writes 01 00 into the Button's CCCD. Each gesture then pushes a 3-byte value: gesture, count (2 bytes).",
      see: "<code>&lt; subscribe Button (CCCD = 1)</code>, then per click <code>&gt; notify Button: click #3</code>; the phone shows <code>01-03-00</code>. A bell appears on the Button row.",
      fix: "<code>(nobody subscribed)</code> in the monitor: subscribe first.",
    },
    {
      command: "Temperature → read, then subscribe",
      where: "phone",
      card: "bconn",
      does: "Reads 2 bytes (°C × 100, little-endian). The 2904 descriptor tells apps how to show it.",
      see: "nRF Connect shows <code>41.42 °C</code> (raw <code>2E-10</code>); subscribed, it updates every 2 s.",
      fix: "",
    },
    {
      command: "params slow, then params fast",
      card: "bconn",
      does: "Asks the phone for a 100-200 ms interval (and to let the board skip 4 events), then for 15-30 ms. The phone decides.",
      see: "<code>- new params: 112.50 ms, latency 4</code>; the dot on the <b>link</b> view slows down. Notifications now arrive in bursts.",
      fix: "<code>params</code> rejected or ignored: iPhones refuse some values; try again after a few seconds.",
    },
    {
      command: "disconnect",
      card: "bconn",
      does: "Hangs up. The board advertises again by itself.",
      see: "<code>! disconnected 0x16: we hung up</code>; the link view keeps the reason.",
      fix: "",
    },
  ],
  panels: [
    {
      title: "From advert to conversation, step by step",
      widget: "b3Seq",
      intro:
        "What happens when you tap Connect in nRF Connect, and when you write the LED or the board notifies a click. Each step shows the real ATT bytes: the first byte is the opcode, the next two the handle (the row number in the board's table), the rest the value.",
    },
    {
      title: "The Bench service, live",
      widget: "b3Table",
      intro:
        "The board's GATT table as nRF Connect shows it. Press an operation to send it: the packet crosses over, the board's row lights like on the gatt view, and the bytes are decoded underneath.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Four views. A click goes to the next view; every gesture (click, double-click, long press) is also sent to a subscribed phone as a Button notification. A double-click on the gatt and message views sends an extra click.",
    },
  ],
  steps: [
    'Same wiring as B1. Flash <code>ble-lab-b3</code>, open the monitor. <b>Checkpoint 1:</b> <code>advertising as "Bench B3"</code>.',
    "On your phone, install nRF Connect (or LightBlue), find <b>Bench B3</b> and connect. <b>Checkpoint 2:</b> <code>connected</code> in the monitor and the Bench service with LED, Message, Button, Temperature and Uptime on the phone.",
    "Write <code>FF5000</code> to LED and a text to Message. <b>Checkpoint 3:</b> the LED is orange, the message is on the screen.",
    "Subscribe to Button and Temperature, then click the board's button. <b>Checkpoint 4:</b> the values arrive on the phone; bells on the gatt view.",
    "Click to the <b>link</b> view and try <code>params slow</code> / <code>params fast</code> and <code>phy 2m</code>. <b>Checkpoint 5:</b> the interval changes on screen.",
    "Type <code>led auto</code> to give the LED back to the radio status, then <code>disconnect</code>.",
  ],
  note: "Anyone nearby can connect to Bench B3 and change the LED: there is no pairing yet, everything travels in plain text. That's B4. iPhones cache a device's GATT table: if a later lab changes the table and the iPhone shows old rows, turn Bluetooth off and on. The ESP32-S3 has one radio: B3 doesn't use Wi-Fi, so there is no coexistence to worry about.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
