// Text sizing for SVG labels, which cannot wrap by themselves. Chart text is the monospace face
// at 10px, so a character is a fixed advance and a line's width is its length times that.

/** Advance of one character of 10px chart text, bold included, with a little slack. */
export const CHAR_WIDTH = 6.2;

/** Width of `text` set as one line of chart text. */
export function textWidth(text: string, charWidth = CHAR_WIDTH): number {
  return [...text].length * charWidth;
}

/** How many characters fit in `width`, at least one. */
export function charsIn(width: number, charWidth = CHAR_WIDTH): number {
  return Math.max(1, Math.floor(width / charWidth));
}

/**
 * Breaks `label` into at most `maxLines` lines of at most `maxChars` characters, at spaces when
 * it can. Only what still does not fit is shortened, with an ellipsis on the last line.
 */
export function wrapLabel(label: string, maxChars: number, maxLines = 2): string[] {
  const limit = Math.max(1, maxChars);
  const lines: string[] = [];
  let rest = label.trim();
  while (rest.length > 0 && lines.length < maxLines) {
    const chars = [...rest];
    if (chars.length <= limit) {
      lines.push(rest);
      break;
    }
    if (lines.length === maxLines - 1) {
      lines.push(`${chars.slice(0, Math.max(1, limit - 1)).join("").trimEnd()}…`);
      break;
    }
    const cut = chars.slice(0, limit + 1).lastIndexOf(" ");
    const take = cut > 0 ? cut : limit;
    lines.push(chars.slice(0, take).join("").trimEnd());
    rest = chars.slice(take).join("").trimStart();
  }
  return lines;
}

/** Clamps `value` into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
