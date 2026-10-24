import type { Inline } from "./ast.ts";
import { type TagContext, tagText } from "./tag.ts";

// The inline Markdown the reference uses: `code`, **bold**, *italic*, [links](…), <br>, <sub>.
// Any other tag stays visible as text. Underscores never mean emphasis here: they are part of
// register and field names (UART_TX_SIZE).

export interface InlineContext extends TagContext {
  /** Heading anchors → section ids, for the file's own `(#262-features)` links. */
  readonly anchors: ReadonlyMap<string, string>;
}

const TOKEN = /`([^`]+)`|\*\*(.+?)\*\*|\*(?!\s)(.+?)\*|!?\[([^\]]*)\]\(([^)\s]*)\)|<br\s*\/?>|<sub>(.*?)<\/sub>|\\([*_`[\]\\<>#|])/g;

export function parseInline(md: string, ctx: InlineContext, tag = true): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  const text = (s: string) => {
    if (s) out.push(...(tag ? tagText(s, ctx) : [{ t: "text" as const, v: s }]));
  };
  for (const m of md.matchAll(TOKEN)) {
    text(md.slice(last, m.index));
    last = m.index + m[0].length;
    const [raw, code, bold, italic, label, href, sub, escaped] = m;
    if (code !== undefined) out.push(codeNode(code, ctx));
    else if (bold !== undefined) out.push({ t: "b", c: parseInline(bold, ctx, tag) });
    else if (italic !== undefined) out.push({ t: "i", c: parseInline(italic, ctx, tag) });
    else if (label !== undefined && href !== undefined) out.push(linkNode(label, href, ctx));
    else if (sub !== undefined) out.push({ t: "sub", v: sub });
    else if (escaped !== undefined) text(escaped);
    else if (raw.startsWith("<br")) out.push({ t: "br" });
  }
  text(md.slice(last));
  return merge(out);
}

function codeNode(code: string, ctx: InlineContext): Inline {
  if (/^[A-Z][A-Z0-9_]*_REG$/.test(code)) return { t: "reg", v: code };
  if (ctx.fields.has(code)) return { t: "field", v: code };
  return { t: "code", v: code };
}

function linkNode(label: string, href: string, ctx: InlineContext): Inline {
  const c = parseInline(label, ctx, false);
  if (href.startsWith("#")) {
    const id = ctx.anchors.get(href.slice(1));
    return id ? { t: "xref", id, c } : { t: "i", c };
  }
  return /^(?:https?:|mailto:)/.test(href) ? { t: "link", href, c } : { t: "i", c };
}

/** Adjacent text nodes as one. */
function merge(nodes: Inline[]): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    const prev = out.at(-1);
    if (n.t === "text" && prev?.t === "text") out[out.length - 1] = { t: "text", v: prev.v + n.v };
    else out.push(n);
  }
  return out;
}

/** The text of inlines, as read. */
export function plainOf(nodes: readonly Inline[]): string {
  return nodes
    .map((n) => {
      if (n.t === "br") return " ";
      if ("c" in n) return plainOf(n.c);
      return n.v;
    })
    .join("");
}

const ABBREVIATIONS = /\b(?:e\.g|i\.e|etc|vs|approx|Fig|No|Ref|Max|Min|Typ|Rev|Vol|cf)\.$/;

/**
 * A paragraph's Markdown cut into sentences: at ". ", "! " or "? " before a capital, a digit or
 * markup, never inside `code`, a link or emphasis, nor after an abbreviation.
 */
export function splitSentences(md: string): string[] {
  const out: string[] = [];
  let start = 0;
  let code = false;
  let bracket = 0;
  let stars = 0;
  for (let i = 0; i < md.length; i += 1) {
    const ch = md.charAt(i);
    if (ch === "`") code = !code;
    if (code) continue;
    if (ch === "[") bracket += 1;
    else if (ch === "]") bracket = Math.max(0, bracket - 1);
    else if (ch === "*") stars += 1;
    else if (
      (ch === "." || ch === "!" || ch === "?") &&
      bracket === 0 &&
      stars % 2 === 0 &&
      /^\s+[A-Z0-9(*[`]/.test(md.slice(i + 1, i + 3)) &&
      !ABBREVIATIONS.test(md.slice(Math.max(start, i - 8), i + 1))
    ) {
      out.push(md.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const rest = md.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}
