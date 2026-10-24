import { describe, expect, it } from "vitest";
import type { Block, Inline } from "./ast.ts";
import { parseBlocks, parseRegisterTitle, splitRow } from "./blocks.ts";
import { buildReference, imagesOf, registerFields } from "./build.ts";
import { classifyTable, parseAddress, parseNumber, unitOf } from "./classify.ts";
import { FIXTURE } from "./fixture.ts";
import { type InlineContext, parseInline, plainOf, splitSentences } from "./inline.ts";
import { docOf, normalizeFences, slugify, splitSections } from "./sections.ts";
import { isWarning, numKind, tagText } from "./tag.ts";

const ctx = (over: Partial<InlineContext> = {}): InlineContext => ({
  doc: "T",
  sectionIds: new Set(["26", "26.2", "26.4", "7", "C2.3.4"]),
  fields: new Set(["UART_SCLK_DIV_NUM", "UART_TX_SIZE"]),
  anchors: new Map([["262-features", "26.2"]]),
  seenBlocks: new Set(),
  ...over,
});
const kinds = (nodes: readonly Inline[]) => nodes.filter((n) => n.t !== "text").map((n) => n.t);

describe("section split", () => {
  const { sections, anchors } = splitSections(FIXTURE);

  it("ids are the heading numbers, Part T chapters bare", () => {
    expect([...sections.keys()]).toEqual(["C2", "C2.3", "C2.3.5", "26", "26.1", "26.2", "26.4"]);
    expect(sections.get("26")?.doc).toBe("T");
    expect(sections.get("C2.3.5")?.doc).toBe("C");
  });

  it("links parents and children by heading level", () => {
    expect(sections.get("26")?.children).toEqual(["26.1", "26.2", "26.4"]);
    expect(sections.get("26.2")?.parent).toBe("26");
    expect(sections.get("C2")?.parent).toBeUndefined();
  });

  it("a body stops at the first child heading; unnumbered headings stay in it", () => {
    expect(sections.get("26")?.body.join("").trim()).toBe("");
    expect(sections.get("26.4")?.body.some((l) => l.includes("Register 26.1."))).toBe(true);
  });

  it("maps GitHub anchors to ids", () => {
    expect(anchors.get("262-features")).toBe("26.2");
    expect(slugify("C2.3.5 Peripheral Pin Assignment")).toBe("c235-peripheral-pin-assignment");
  });

  it("keeps the first heading of a repeated number, and splits a fence opened mid-line", () => {
    const twice = splitSections("## 5 A\n### 5.5 Registers\nx\n##### 5.5 Registers again\ny\n");
    expect([...twice.sections.keys()]).toEqual(["5", "5.5"]);
    expect(twice.sections.get("5.5")?.body).toContain("##### 5.5 Registers again");
    expect(normalizeFences(["For example: ```text", "a"])).toEqual(["For example:", "```text", "a"]);
    expect(docOf("X1")).toBe("X");
    expect(docOf("39.0")).toBe("T");
  });
});

describe("tagging", () => {
  it("numbers with units, by kind", () => {
    const nodes = tagText("Runs at 240 MHz from 3.3 V, draws 7 µA, with 512 KB and 50 ns.", ctx());
    expect(nodes.flatMap((n) => (n.t === "num" ? [[n.v, n.k]] : []))).toEqual([
      ["240 MHz", "frequency"],
      ["3.3 V", "voltage"],
      ["7 µA", "current"],
      ["512 KB", "size"],
      ["50 ns", "time"],
    ]);
    expect(numKind("20.5 dBm")).toBe("power");
  });

  it("register and field names, pins, and blocks on their first mention", () => {
    const c = ctx();
    const nodes = tagText("Set UART_TX_SIZE in UART_MEM_CONF_REG; UART0 uses GPIO43 and IO44, like UART1. OTHER_NAME stays.", c);
    expect(kinds(nodes)).toEqual(["field", "reg", "block", "pin", "pin"]);
    expect(nodes.find((n) => n.t === "pin")).toEqual({ t: "pin", v: "GPIO43", n: 43 });
    expect(nodes.find((n) => n.t === "block")).toEqual({ t: "block", v: "UART0", id: "uart" });
  });

  it("cross-references resolve to sections that exist, preferring the current part", () => {
    const t = tagText("See Section 26.4 and Chapter 7, not Section 99.", ctx());
    expect(t.flatMap((n) => (n.t === "xref" ? [n.id] : []))).toEqual(["26.4", "7"]);
    const c = tagText("described in Section 2.3.4", ctx({ doc: "C" }));
    expect(c.flatMap((n) => (n.t === "xref" ? [n.id] : []))).toEqual(["C2.3.4"]);
  });

  it("warning sentences", () => {
    expect(isWarning("The pin must be pulled high.")).toBe(true);
    expect(isWarning("It is not recommended to reset it.")).toBe(true);
    expect(isWarning("Note: shared RAM.")).toBe(true);
    expect(isWarning("The UART has three clocks.")).toBe(false);
  });
});

describe("inline Markdown", () => {
  it("code, bold, italic, links, br and sub; never raw HTML", () => {
    const nodes = parseInline("**Bold** *it* `x = 1` [site](https://e.com) [§26.2](#262-features) a<br>b V<sub>ref</sub> <script>", ctx());
    expect(kinds(nodes)).toEqual(["b", "i", "code", "link", "xref", "br", "sub"]);
    expect(plainOf(nodes)).toContain("<script>");
    expect(parseInline("[bad](javascript:alert(1))", ctx())[0]?.t).toBe("i");
  });

  it("names in code spans become register and field chips", () => {
    expect(kinds(parseInline("`UART_CLKDIV_REG` and `UART_SCLK_DIV_NUM`", ctx()))).toEqual(["reg", "field"]);
  });

  it("sentences split at full stops, not after abbreviations or inside code", () => {
    expect(splitSentences("One at 1.5 V. Two, e.g. this. `a. B` stays. Three")).toEqual([
      "One at 1.5 V.",
      "Two, e.g. this.",
      "`a. B` stays.",
      "Three",
    ]);
  });
});

describe("blocks", () => {
  const parse = (md: string) => parseBlocks(md.split("\n"), ctx(), { n: 0 });

  it("paragraph sentences are numbered and warnings marked", () => {
    const [p] = parse("Clocks run. You must not reset the APB side.");
    expect(p).toMatchObject({ t: "p", s: [{ n: 1 }, { n: 2, warn: true }] });
  });

  it("nested lists, quotes, fences and figures with their caption line", () => {
    const blocks = parse("- a\n- b\n  - c\n\n> **Note:** shared.\n\n```text\nx = 1\n```\n\n![Figure 1. X](images/x.png)\n\n*Figure 1. X*\n");
    expect(blocks.map((b) => b.t)).toEqual(["list", "quote", "pre", "fig"]);
    const list = blocks[0];
    expect(list?.t === "list" && list.items[1]?.map((b) => b.t)).toEqual(["p", "list"]);
    expect(blocks[3]).toEqual({ t: "fig", src: "images/x.png", alt: "Figure 1. X", caption: "Figure 1. X" });
  });

  it("register tables in both conventions", () => {
    expect(parseRegisterTitle("Register 26.1. UART_CLKDIV_REG (0x0014)")).toEqual({ num: "26.1", name: "UART_CLKDIV_REG", offset: "0x0014" });
    expect(parseRegisterTitle("**Register 10.1. RTC_CNTL_RTC_OPTIONS0_REG** (offset `0x0000`)")).toEqual({
      num: "10.1",
      name: "RTC_CNTL_RTC_OPTIONS0_REG",
      offset: "0x0000",
    });
    const blocks = splitSections(FIXTURE).sections.get("26.4")?.body ?? [];
    const regs = parseBlocks(blocks, ctx(), { n: 0 }).filter((b): b is Extract<Block, { t: "register" }> => b.t === "register");
    expect(regs.map((r) => r.name)).toEqual(["UART_CLKDIV_REG", "UART_CONF0_REG"]);
    expect(regs[0]?.fields[1]).toMatchObject({ bits: "11:0", field: "UART_SCLK_DIV_NUM", access: "R/W", reset: "0x2b6" });
  });

  it("a bold table title becomes the table's caption", () => {
    const [table] = parse("**Table 1. Pins**\n\n| A | B (mA) |\n|---|---|\n| x | 1 |\n| y | 2 |\n| z | 3 |");
    expect(table).toMatchObject({ t: "table", caption: "Table 1. Pins", viz: { kind: "compare" } });
    expect(splitRow("| a | `b|c` | d |")).toEqual(["a", "`b|c`", "d"]);
  });
});

describe("table classifier", () => {
  it("parses only plain numbers and addresses", () => {
    expect(parseNumber("–0.3")).toBe(-0.3);
    expect(parseNumber("355 [1]")).toBe(355);
    expect(parseNumber("0.75 × VDD")).toBeNull();
    expect(parseNumber("—")).toBeNull();
    expect(parseAddress("0x3FC8_8000")).toBe(0x3fc88000);
    expect(unitOf("Peak (mA)")).toBe("mA");
  });

  it("spec tables → range bars per unit, log when they span decades", () => {
    const viz = classifyTable(
      ["Parameter", "Description", "Min", "Typ", "Max", "Unit"],
      [
        ["I_IH", "in", "—", "—", "50", "nA"],
        ["I_IL", "in", "—", "—", "50", "nA"],
        ["V_IL", "low", "–0.3", "—", "0.25 × VDD", "V"],
        ["C_IN", "cap", "—", "2", "—", "pF"],
      ],
    );
    expect(viz).toEqual({ kind: "range", groups: [{ unit: "nA", log: false, items: [{ label: "I_IH", min: 50, max: 50 }, { label: "I_IL", min: 50, max: 50 }] }] });
  });

  it("one numeric column with a unit → compare bars", () => {
    const viz = classifyTable(["Work Mode", "RF", "Peak (mA)"], [["TX", "b", "355"], ["TX", "g", "297"], ["RX", "n", "95"]]);
    expect(viz).toMatchObject({ kind: "compare", unit: "mA", items: [{ label: "TX · b", value: 355 }, { value: 297 }, { value: 95 }] });
  });

  it("address ranges → address map", () => {
    const viz = classifyTable(
      ["Bus Type", "Low Address", "High Address", "Size (KB)"],
      [["Data", "0x3FC8_8000", "0x3FCF_FFFF", "480"], ["Instruction", "0x4037_0000", "0x403D_FFFF", "448"]],
    );
    expect(viz).toEqual({ kind: "address", regions: [{ label: "Data", start: 0x3fc88000, end: 0x3fcfffff }, { label: "Instruction", start: 0x40370000, end: 0x403dffff }] });
  });

  it("pin tables → a pin grid, rows without functions dropped", () => {
    const { sections } = splitSections(FIXTURE);
    const table = parseBlocks(sections.get("C2.3.5")?.body ?? [], ctx({ doc: "C" }), { n: 0 })[0];
    expect(table?.t === "table" && table.viz).toEqual({
      kind: "pins",
      columns: ["ADC1", "UART0"],
      rows: [
        { label: "GPIO1", pin: 1, cells: ["ADC1_CH0 (P1)", null] },
        { label: "GPIO2", pin: 2, cells: ["ADC1_CH1 (P1)", null] },
        { label: "GPIO43", pin: 43, cells: [null, "U0TXD (P1)"] },
      ],
    });
  });

  it("timing parameters → a timeline; shapeless tables stay tables", () => {
    expect(classifyTable(["Parameter", "Description", "Min (µs)"], [["t_STBL", "a", "50"], ["t_RST", "b", "50"]])).toEqual({
      kind: "timing",
      unit: "µs",
      items: [{ label: "t_STBL", value: 50 }, { label: "t_RST", value: 50 }],
    });
    expect(classifyTable(["Name", "Description"], [["a", "b"], ["c", "d"], ["e", "f"]])).toBeUndefined();
  });
});

describe("the whole reference", () => {
  const ref = buildReference(FIXTURE);

  it("indexes every section with its family and size", () => {
    expect(ref.index.find((e) => e.id === "26.2")).toMatchObject({ doc: "T", title: "Features", parent: "26", children: [] });
    expect(ref.index.find((e) => e.id === "26")?.size).toBeLessThan(5);
  });

  it("builds a section with its tags, cross-references and figures", () => {
    const s = ref.section("26.1");
    expect(JSON.stringify(s)).toContain('"t":"xref","id":"26.2"');
    expect(JSON.stringify(s)).toContain('"t":"num","v":"80 MHz"');
    expect(imagesOf(ref.section("26.2")?.blocks ?? [])).toEqual(["images/trm-fig-26_3-1.png"]);
    expect(ref.section("nope")).toBeUndefined();
    expect([...registerFields(FIXTURE)]).toEqual(["UART_SCLK_DIV_NUM", "UART_PARITY"]);
  });
});
