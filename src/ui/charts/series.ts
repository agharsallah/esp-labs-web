import type { CSSProperties } from "react";

/** A colour token's name, e.g. "--fam-analog". Charts never take a raw colour. */
export type ColorToken = `--${string}`;

const TOKEN = /^--[a-z][a-z0-9-]*$/;

/** Sets --series from a token name; anything that is not a token name is ignored. */
export function seriesStyle(token: ColorToken | undefined, index?: number): CSSProperties {
  const style: Record<string, string> = {};
  if (token !== undefined && TOKEN.test(token)) style["--series"] = `var(${token})`;
  if (index !== undefined) style["--i"] = String(index);
  return style;
}
