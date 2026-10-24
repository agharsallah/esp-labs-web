import type { Inline, NumKind, RefDoc } from "./ast.ts";

// Tags what matters in a run of plain text, at build time: numbers with units, register and field
// names, GPIO and pin mentions, peripheral blocks (mapped to the chip pages' block ids) and
// cross-references to other sections. Pure: the context says what exists.

export interface TagContext {
  readonly doc: RefDoc;
  /** Every section id of the reference. */
  readonly sectionIds: ReadonlySet<string>;
  /** Field names found in the reference's register tables. */
  readonly fields: ReadonlySet<string>;
  /** Block ids already tagged in this section: a block is a chip on its first mention only. */
  readonly seenBlocks: Set<string>;
}

/** Peripheral names as the reference writes them → chip block ids (src/content/chip/blocks.ts). */
export const BLOCK_WORDS: readonly (readonly [RegExp, string])[] = [
  [/^UART\d?$/, "uart"],
  [/^I2C\d?$/, "i2c"],
  [/^I2S\d?$/, "i2s"],
  [/^(?:SPI\d?|GP-SPI\d?)$/, "spi"],
  [/^(?:SAR ADC\d?|ADC\d?)$/, "adc"],
  [/^RMT$/, "rmt"],
  [/^(?:LEDC|LED PWM)$/, "ledc"],
  [/^MCPWM\d?$/, "mcpwm"],
  [/^PCNT$/, "pcnt"],
  [/^TWAI$/, "twai"],
  [/^GDMA$/, "gdma"],
  [/^eFuse$/, "efuse"],
  [/^ULP(?:-FSM|-RISC-V)?$/, "ulp"],
  [/^(?:SYSTIMER|Timer Group)$/, "timers"],
  [/^(?:RWDT|MWDT\d?)$/, "wdt"],
  [/^Wi-Fi$/, "wifi"],
  [/^(?:Bluetooth LE|BLE)$/, "ble"],
  [/^USB Serial\/JTAG$/, "usb-serial-jtag"],
  [/^USB OTG$/, "usb-otg"],
  [/^(?:SDMMC|SD\/MMC)$/, "sdmmc"],
  [/^LCD_CAM$/, "lcd-cam"],
  [/^touch sensors?$/i, "touch"],
  [/^temperature sensor$/i, "temp-sensor"],
  [/^RNG$/, "rng"],
  [/^PSRAM$/, "flash-psram"],
  [/^(?:SHA|AES|RSA|HMAC)$/, "crypto"],
];

const UNITS =
  "GHz|MHz|kHz|Hz|mA|µA|uA|nA|mV|V|KB|kB|MB|GB|Kbit|Mbit|Mbps|Kbps|kbps|bps|ns|µs|us|ms|°C|dBm|dB|mW|W|kΩ|Ω|pF|nF|µF|bytes|byte|-bit|%";

const PATTERN = new RegExp(
  [
    String.raw`(?<xref>(?:Section|Chapter|§)\s?(?<xid>[AMCX]?\d+(?:\.\d+)*))`,
    String.raw`(?<reg>\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_REG\b)`,
    String.raw`(?<pin>\b(?:GPIO|IO)(?<pn>\d{1,2})\b)`,
    String.raw`(?<name>\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b)`,
    String.raw`(?<num>(?<![\w.])(?:[-−–+±~]\s?)?\d+(?:[.,]\d+)?(?:\s?(?:~|–|to)\s?\d+(?:\.\d+)?)?\s?(?:${UNITS})(?![\w]))`,
    String.raw`(?<blk>\b(?:Bluetooth LE|USB Serial\/JTAG|USB OTG|SD\/MMC|LED PWM|SAR ADC\d?|Timer Group|[Tt]ouch sensors?|[Tt]emperature sensor|GP-SPI\d?|ULP-FSM|ULP-RISC-V|Wi-Fi|eFuse|[A-Z][A-Za-z0-9_]{1,6})\b)`,
  ].join("|"),
  "gu",
);

/** What a unit measures. */
export function numKind(text: string): NumKind {
  const unit = /[A-Za-zµΩ°%-]+$/.exec(text)?.[0] ?? "";
  if (/^m?V$/.test(unit)) return "voltage";
  if (/^[mµun]?A$/.test(unit)) return "current";
  if (/Hz$|bps$/.test(unit)) return "frequency";
  if (/^(?:[KkMG]B|[KM]bit|bytes?|-bit)$/.test(unit)) return "size";
  if (/^[nµum]?s$/.test(unit)) return "time";
  if (/^(?:m?W|dBm)$/.test(unit)) return "power";
  return "other";
}

/** "Section 26.5" in Part C means C26.5 when that exists; "Chapter 7" is the TRM's chapter 7. */
function resolveSection(raw: string, ctx: TagContext): string | null {
  if (/^[AMCX]/.test(raw)) return ctx.sectionIds.has(raw) ? raw : null;
  if (ctx.doc !== "T" && ctx.doc !== "X" && ctx.sectionIds.has(`${ctx.doc}${raw}`)) return `${ctx.doc}${raw}`;
  return ctx.sectionIds.has(raw) ? raw : null;
}

function blockOf(word: string): string | undefined {
  return BLOCK_WORDS.find(([re]) => re.test(word))?.[1];
}

/** Plain text → inlines, with what matters tagged. */
export function tagText(text: string, ctx: TagContext): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  const push = (node: Inline, start: number, end: number) => {
    if (start > last) out.push({ t: "text", v: text.slice(last, start) });
    out.push(node);
    last = end;
  };
  const tagBlock = (v: string, start: number, end: number) => {
    const id = blockOf(v);
    if (id && !ctx.seenBlocks.has(id)) {
      ctx.seenBlocks.add(id);
      push({ t: "block", v, id }, start, end);
    }
  };
  for (const m of text.matchAll(PATTERN)) {
    const g = m.groups ?? {};
    const v = m[0];
    const start = m.index;
    const end = start + v.length;
    if (g.xref && g.xid) {
      const id = resolveSection(g.xid, ctx);
      if (id) push({ t: "xref", id, c: [{ t: "text", v }] }, start, end);
    } else if (g.reg) {
      push({ t: "reg", v }, start, end);
    } else if (g.pin && g.pn !== undefined) {
      const n = Number(g.pn);
      if (n <= 48) push({ t: "pin", v, n }, start, end);
    } else if (g.name) {
      if (ctx.fields.has(v)) push({ t: "field", v }, start, end);
      else tagBlock(v, start, end);
    } else if (g.num) {
      push({ t: "num", v, k: numKind(v) }, start, end);
    } else if (g.blk) {
      tagBlock(v, start, end);
    }
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

const WARNING = /\b(?:must|do not|don't|cannot|can't|not recommended|should not|never)\b|\bNote:/i;

/** Does a sentence warn the reader? */
export const isWarning = (plain: string): boolean => WARNING.test(plain);
