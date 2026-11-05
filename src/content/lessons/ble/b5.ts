// ble lesson B5. Strings may carry the inline markup RichText understands:
// <b>, <i>, <code> and <span class="snd-parts|need|opt">.
import type { LessonEntry } from "@/domain/lesson";

export const b5 = {
  kind: "lesson",
  id: "B5",
  track: "ble",
  title: "Phone app",
  status: "built, not flashed",
  heading: "Your own app, straight to the board",
  goal: "nRF Connect is a screwdriver; now you build the tool. <b>esp-labs/apps/ble-app</b> is a small React app that uses <b>Web Bluetooth</b>: the browser itself becomes the GATT client, so a web page on your Mac or phone talks to the board with no Wi-Fi, no server and no app store. The firmware keeps B3's Bench service and adds four characteristics: a <b>Canvas</b> you draw on from the phone, <b>Sensors</b> that stream five times a second, a <b>Speed</b> test that pushes notifications as fast as the radio allows, and <b>Link</b> controls to change the connection while you watch the speed move.",
  goalLine:
    "Control and draw on the board from a web page, and measure how many bytes per second your link really carries.",
  goalCheck: [
    "The app's Connect tab lists the Bench service with LED … Uptime plus Canvas, Sensors, Speed and Link (ba5e0010-0013), and its byte log shows every operation.",
    "A stroke drawn in the Sketch tab appears on the board's <b>sketch</b> view within a fraction of a second.",
    "The Live tab charts four lines; touching a jumper wire on GPIO 1 makes the touch line jump.",
    "A 50 kB speed run ends with a kB/s figure in the app and the same run as a bar on the board's <b>speed</b> view; after <b>Fast interval</b> or <b>2M PHY</b> the next run is visibly faster (or you can say why not).",
  ],
  learn: [
    "Web Bluetooth",
    "GATT client in JavaScript",
    "write without response",
    "binary protocols",
    "notification streams",
    "throughput = MTU × packets ÷ interval",
    "2M PHY & long packets",
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
  cmd: "uv run pio run -d labs/ble-lab-b5 -e ble-lab-b5 -t upload",
  commands: [
    {
      command: "uv run pio run -d labs/ble-lab-b5 -e ble-lab-b5 -t upload",
      where: "mac",
      card: "bnone",
      does: "Builds lab B5 and writes it to the board.",
      see: "The <b>sketch</b> view: “Open the ble-app, connect”. The radio icon shows rings: advertising as <b>Bench B5</b>.",
      fix: "“Failed to connect”: hold BOOT, tap RST, release BOOT, run it again.",
    },
    {
      command: "cd esp-labs/apps/ble-app && pnpm install && pnpm dev",
      where: "mac",
      card: "bnone",
      does: "Installs the app once (React, Vite, TypeScript, exact versions) and serves it at <code>http://localhost:5177</code>. No server code: Vite only hands the page to the browser.",
      see: "<code>➜ Local: http://localhost:5177/</code>",
      fix: "Port busy: another lab's app runs; stop it or <code>pnpm dev --port 5178</code>.",
    },
    {
      command: "open http://localhost:5177 in Chrome → Connect",
      where: "app",
      card: "bscan",
      does: "The browser's own device chooser opens (a page can never connect by itself). It lists boards with the Bench service, names starting with “Bench”, or BLE-MIDI instruments.",
      see: "Pick <b>Bench B5</b>. The Connect tab shows the GATT explorer; the monitor prints <code>+ connected: …</code>. The first time, macOS asks to allow Chrome to use Bluetooth.",
      fix: "“Web Bluetooth isn't available here”: use Chrome or Edge, and localhost (not 127.0.0.1 or the Mac's IP).",
    },
    {
      command: "Control tab: drag the colour wheel, send a message",
      where: "app",
      card: "bconn",
      does: "Each move writes 3 bytes to LED (throttled to one write per 80 ms); Send writes up to 40 bytes of UTF-8 to Message.",
      see: "The LED follows your finger; <code>&lt; write LED 1F 5C 99</code> lines in the monitor and blue packets crossing the app's air strip.",
      fix: "LED stays put after <code>led auto</code>: move the wheel again, the board claims the LED back.",
    },
    {
      command: "Sketch tab: draw",
      where: "app",
      card: "bconn",
      does: "Strokes go to Canvas (ba5e0010) as <b>writes without response</b>: <code>02 cc cc w n</code> + 3 bytes per point, every 50 ms. The board queues them in the NimBLE task and draws them in loop().",
      see: "The same lines on the board's <b>sketch</b> view; at the bottom <code>412 cmds 96 writes 9120 B</code>.",
      fix: "<code>DROPPED</code> on the board: you drew faster than 16 queued writes; nothing breaks, a few strokes are missing. <code>sketch: a command was cut off</code>: the app fell back to 20-byte writes (MTU 23).",
    },
    {
      command: "Live tab (then touch the wire on GPIO 1)",
      where: "app",
      card: "bconn",
      does: "Subscribes to Sensors: 12 bytes every 200 ms (temperature, touch, free heap, RSSI, a sequence number).",
      see: "Four moving lines in the app and the same four sparklines on the board's <b>live</b> view; “notifying the app: 230 sent”. Touching the wire's free end makes the touch value jump by thousands.",
      fix: "Touch line flat: GPIO 1 has no wire; any jumper works, the bare metal end is the sensor.",
    },
    {
      command: "Speed tab: 50 kB → Run",
      where: "app",
      card: "bconn",
      does: "Subscribes to Speed and writes <code>01 50 C3 00 00</code>. A small task on the board notifies 50,000 bytes in (MTU − 3)-byte packets until the stack's buffers are full, waits, and continues; then a 15-byte summary.",
      see: "Monitor: <code>&lt; write Speed: start 50000 bytes</code> then <code>+ speed: 50000 B in 2310 ms = 21.6 kB/s</code>. The app shows a bar with the same order of magnitude.",
      fix: "<code>speed: subscribe to Speed (ba5e0012) first</code>: open the Speed tab once before running from serial.",
    },
    {
      command: "Speed tab: Fast interval, 2M PHY, Long packets → Run again",
      where: "app",
      card: "bconn",
      does: "Writes 1, 3 and 5 to Link: the board asks the central for a 7.5–15 ms interval, the 2M PHY and 251-byte radio packets.",
      see: "<code>- new params: 15.00 ms …</code>, <code>- PHY now 2M / 2M</code>; the next run is faster. The board's <b>speed</b> view keeps one bar per run with MTU, interval and PHY.",
      fix: "No change: the central decides. macOS often keeps 15 ms and allows 2M; some phones refuse 7.5 ms or 2M. That is the lesson: the peripheral can only ask.",
    },
    {
      command: "pnpm tunnel → open the https address on your phone",
      where: "mac",
      card: "bscan",
      does: "A cloudflared quick tunnel gives the app an <code>https://…trycloudflare.com</code> address, because phones only allow Web Bluetooth on https.",
      see: "Android: Chrome opens it and the same chooser appears. iPhone: open it in the free <b>Bluefy</b> browser (Safari has no Web Bluetooth).",
      fix: "Bluefy says the page isn't secure: use the https address, not http.",
    },
  ],
  panels: [
    {
      title: "One colour change, from JavaScript to the LED",
      widget: "b5Seq",
      intro:
        "What happens between <code>navigator.bluetooth.requestDevice()</code> in the app and the LED changing colour, and how a notification finds its way back into a chart. Each step shows the real call or the real bytes on air. Pick a flow, then step with ◀ ▶.",
    },
    {
      title: "How fast can it go?",
      widget: "b5Throughput",
      intro:
        "Throughput is decided by four numbers: how big each packet may be (MTU), how often the two radios meet (the connection interval), how many packets fit in one meeting, and how fast the bits fly (PHY). Move the sliders: the timeline shows three connection events with every packet drawn to scale, and the result is the same formula the Speed tab measures.",
    },
    {
      title: "What the screen shows",
      widget: "bleScreens",
      intro:
        "Six views. Click for the next one; double-click on sketch clears it, on speed it starts a 50 kB run, on gatt it sends a Button click. Every gesture also reaches the app as a Button notification, as in B3.",
    },
  ],
  steps: [
    "Same wiring as B1 (screen, button optional). Optional: one jumper wire in GPIO 1, free end loose: your touch sensor.",
    "Flash <code>ble-lab-b5</code>. <b>Checkpoint 1:</b> the sketch view and the advertising rings.",
    "Start the app (<code>pnpm install</code> once, then <code>pnpm dev</code>), open <code>http://localhost:5177</code> in Chrome and Connect to Bench B5. <b>Checkpoint 2:</b> the GATT explorer lists nine Bench characteristics.",
    "Colour wheel, message, then draw something in Sketch. <b>Checkpoint 3:</b> your drawing is on the board.",
    "Open Live and touch the wire. <b>Checkpoint 4:</b> the touch line jumps in the app and on the board.",
    "Speed: run 50 kB, then Fast interval + 2M PHY + Long packets and run again. <b>Checkpoint 5:</b> two bars; write down both kB/s figures and the interval each run used.",
    "Optional: <code>pnpm tunnel</code> and repeat from your phone (Chrome on Android, Bluefy on iPhone). Compare its speed with the Mac's.",
  ],
  note: "Still no pairing: anyone near can connect, draw and read the sensors. B4's lock works the same here if you combine them. The app only ever sees boards you pick in the browser's chooser, and the browser hides some standard services from web pages on purpose. iPhones and Macs cache a device's GATT table by its address: if the explorer shows B3's old rows, turn Bluetooth off and on. Throughput depends mostly on the central: the same board is often 2-4× faster with a Mac than with a phone.",
  preview: {
    widget: "ble",
  },
} as const satisfies LessonEntry;
