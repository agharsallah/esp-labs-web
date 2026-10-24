import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OFFICIAL_DOCS } from "./docs-map";

// The PDF links must be the ones the reference itself lists (§X4.5). The reference is not in the
// repository, so this runs only where it is present (a local checkout with docs-llm/).
const FILE = join(process.cwd(), "docs-llm", "esp32-s3", "ESP32-S3_REFERENCE.md");

describe("official documents", () => {
  it.skipIf(!existsSync(FILE))("the datasheet and TRM links are those of §X4.5", () => {
    const text = readFileSync(FILE, "utf8");
    const x45 = text.slice(text.indexOf("### X4.5"), text.indexOf("## X5"));
    expect(x45).toContain(`(${OFFICIAL_DOCS.C})`);
    expect(x45).toContain(`(${OFFICIAL_DOCS.T})`);
  });

  it("every document has an https link", () => {
    for (const url of Object.values(OFFICIAL_DOCS)) expect(url).toMatch(/^https:\/\//);
  });
});
