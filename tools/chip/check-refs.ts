import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { citedSections, headingIds, missingSections } from "./refs.ts";

// `pnpm chip:refs`: checks that every SourceRef.section in src/content/chip names a heading of
// docs-llm/esp32-s3/ESP32-S3_REFERENCE.md. docs-llm/ is git-ignored, so where it is absent (CI)
// the check skips with a warning instead of failing.

const ROOT = join(import.meta.dirname, "..", "..");
const REFERENCE = join(ROOT, "docs-llm", "esp32-s3", "ESP32-S3_REFERENCE.md");
const CONTENT = join(ROOT, "src", "content", "chip");

if (!existsSync(REFERENCE)) {
  console.warn(`chip:refs skipped: ${REFERENCE} is not here (docs-llm/ is not in the repository).`);
  process.exit(0);
}

const known = headingIds(readFileSync(REFERENCE, "utf8"));
const files = readdirSync(CONTENT).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

let failures = 0;
let checked = 0;
for (const file of files) {
  const cited = citedSections(readFileSync(join(CONTENT, file), "utf8"));
  checked += cited.length;
  for (const section of missingSections(cited, known)) {
    console.error(`${file}: section "${section}" is not a heading of the reference`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`chip:refs: ${failures} missing section(s).`);
  process.exit(1);
}
console.log(`chip:refs: ${checked} citations in ${files.length} files, all found (${known.size} headings).`);
