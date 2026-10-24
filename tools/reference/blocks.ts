import type { Block, Inline, RegisterField, Sentence } from "./ast.ts";
import { classifyTable } from "./classify.ts";
import { type InlineContext, parseInline, plainOf, splitSentences } from "./inline.ts";
import { isWarning } from "./tag.ts";

// The block Markdown the reference uses: headings, paragraphs, lists (nested), block quotes,
// fenced code, GFM tables, images with their caption line, and its register convention: a
// "Register 26.1. NAME (0x…)" heading or bold line followed by a Bits | Field | Access | Reset |
// Description table.

/** Numbers sentences, table rows and registers in document order across one section. */
export interface Counter {
  n: number;
}

const FENCE = /^\s*```\s*(\w*)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const TABLE_CAPTION = /^\*\*(Table\s[^*]+)\*\*\s*$/;
const REGISTER_HEAD = ["bits", "field", "access", "reset", "description"];

const indentOf = (line: string) => /^\s*/.exec(line)?.[0].length ?? 0;
const isBlank = (line: string | undefined) => line === undefined || line.trim() === "";

/** "Register 26.1. UART_FIFO_REG (0x0000)" or "**Register 10.1. NAME** (offset `0x0000`)". */
export function parseRegisterTitle(line: string): { num: string; name: string; offset: string } | null {
  const s = line.replace(/[*`]/g, "").trim();
  const m = /^Register\s+(\d+(?:\.\d+)+)\.?\s+(.+?)\s*\(\s*(?:offset\s*)?(0x[^()]*?)\s*\)\s*$/.exec(s);
  return m?.[1] && m[2] && m[3] ? { num: m[1], name: m[2], offset: m[3] } : null;
}

/** "| a | `b|c` | d |" → ["a", "`b|c`", "d"]. */
export function splitRow(line: string): string[] {
  const s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  let code = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s.charAt(i);
    if (ch === "\\" && s.charAt(i + 1) === "|") {
      cell += "|";
      i += 1;
    } else if (ch === "`") {
      code = !code;
      cell += ch;
    } else if (ch === "|" && !code) {
      cells.push(cell.trim());
      cell = "";
    } else cell += ch;
  }
  cells.push(cell.trim());
  return cells;
}

const startsBlock = (line: string, next: string | undefined) =>
  FENCE.test(line) ||
  HEADING.test(line) ||
  IMAGE.test(line.trim()) ||
  LIST.test(line) ||
  line.trimStart().startsWith(">") ||
  (line.trimStart().startsWith("|") && next !== undefined && TABLE_RULE.test(next));

export function parseBlocks(lines: readonly string[], ctx: InlineContext, counter: Counter): Block[] {
  const out: Block[] = [];
  let register: { num: string; name: string; offset: string } | null = null;
  let caption: string | undefined;
  const sentences = (md: string): Sentence[] =>
    splitSentences(md).map((s) => {
      const c = parseInline(s, ctx);
      counter.n += 1;
      return { n: counter.n, c, ...(isWarning(plainOf(c)) ? { warn: true as const } : {}) };
    });

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const next = lines[i + 1];
    if (isBlank(line)) {
      i += 1;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i] ?? "")) body.push(lines[i++] ?? "");
      i += 1;
      out.push({ t: "pre", v: body.join("\n"), ...(fence[1] ? { lang: fence[1] } : {}) });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading?.[1] && heading[2] !== undefined) {
      i += 1;
      register = parseRegisterTitle(heading[2]);
      if (!register) out.push({ t: "h", level: heading[1].length, c: parseInline(heading[2], ctx) });
      continue;
    }
    if (line.trimStart().startsWith("|") && next !== undefined && TABLE_RULE.test(next)) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").trimStart().startsWith("|")) rows.push(splitRow(lines[i++] ?? ""));
      out.push(tableBlock(head, rows, register, caption, ctx, counter));
      register = null;
      caption = undefined;
      continue;
    }
    const image = IMAGE.exec(line.trim());
    if (image?.[2] !== undefined && image[1] !== undefined) {
      i += 1;
      while (isBlank(lines[i]) && i < lines.length) i += 1;
      const after = (lines[i] ?? "").trim().replace(/^\*(.*)\*$/, "$1");
      const captioned = after !== "" && /^(?:Figure|Fig\.)\s/.test(after);
      if (captioned) i += 1;
      out.push({ t: "fig", src: image[2], alt: image[1], ...(captioned ? { caption: after } : {}) });
      continue;
    }
    if (line.trimStart().startsWith(">")) {
      const quoted: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trimStart().startsWith(">"))
        quoted.push((lines[i++] ?? "").trimStart().replace(/^>\s?/, ""));
      out.push({ t: "quote", c: parseBlocks(quoted, ctx, counter) });
      continue;
    }
    const item = LIST.exec(line);
    if (item?.[1] !== undefined && item[2] !== undefined) {
      const [list, end] = listBlock(lines, i, ctx, counter);
      out.push(list);
      i = end;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i]) && (para.length === 0 || !startsBlock(lines[i] ?? "", lines[i + 1])))
      para.push((lines[i++] ?? "").trim());
    const md = para.join(" ");
    const reg = parseRegisterTitle(md);
    const cap = TABLE_CAPTION.exec(md);
    if (reg) register = reg;
    else if (cap?.[1]) caption = cap[1];
    else out.push({ t: "p", s: sentences(md) });
  }
  return out;
}

function listBlock(lines: readonly string[], from: number, ctx: InlineContext, counter: Counter): [Block, number] {
  const first = LIST.exec(lines[from] ?? "");
  const base = first?.[1]?.length ?? 0;
  const ordered = /\d/.test(first?.[2] ?? "");
  const items: Block[][] = [];
  let i = from;
  while (i < lines.length) {
    const m = LIST.exec(lines[i] ?? "");
    if (!m || (m[1]?.length ?? 0) !== base || /\d/.test(m[2] ?? "") !== ordered) break;
    const content = base + (m[2]?.length ?? 1) + 1;
    const body = [m[3] ?? ""];
    i += 1;
    while (i < lines.length) {
      const l = lines[i] ?? "";
      if (isBlank(l)) {
        const nextLine = lines.slice(i).find((x) => !isBlank(x));
        if (nextLine === undefined || indentOf(nextLine) <= base) break;
        body.push("");
      } else if (indentOf(l) > base) {
        body.push(l.slice(Math.min(content, indentOf(l))));
      } else break;
      i += 1;
    }
    items.push(parseBlocks(body, ctx, counter));
    while (isBlank(lines[i]) && i < lines.length) {
      const nextLine = lines.slice(i).find((x) => !isBlank(x));
      const nm = nextLine === undefined ? null : LIST.exec(nextLine);
      if (!nm || (nm[1]?.length ?? 0) !== base) break;
      i += 1;
    }
  }
  const start = ordered ? Number.parseInt(first?.[2] ?? "1", 10) : 1;
  return [{ t: "list", ordered, ...(ordered && start !== 1 ? { start } : {}), items }, i];
}

function tableBlock(
  head: readonly string[],
  rows: readonly string[][],
  register: { num: string; name: string; offset: string } | null,
  caption: string | undefined,
  ctx: InlineContext,
  counter: Counter,
): Block {
  const isRegister = REGISTER_HEAD.every((h, k) => head[k]?.toLowerCase() === h);
  if (register && isRegister) {
    counter.n += 1;
    const fields: RegisterField[] = rows.map((r) => ({
      bits: r[0] ?? "",
      field: (r[1] ?? "").replace(/[*`]/g, ""),
      access: r[2] ?? "",
      reset: r[3] ?? "",
      desc: parseInline(r[4] ?? "", ctx),
    }));
    return { t: "register", n: counter.n, ...register, fields };
  }
  const width = head.length;
  const cells = (r: readonly string[]): Inline[][] =>
    Array.from({ length: width }, (_, k) => parseInline(r[k] ?? "", ctx));
  const viz = classifyTable(head, rows);
  return {
    t: "table",
    ...(caption ? { caption } : {}),
    head: head.map((h) => parseInline(h, ctx, false)),
    rows: rows.map((r) => {
      counter.n += 1;
      return { n: counter.n, c: cells(r) };
    }),
    ...(viz ? { viz } : {}),
  };
}
