import { BLOCK_FAMILIES, type BlockFamily, type ChipBlock, type Coverage } from "@/domain/chip";

// The atlas filters live in the URL (?family=timing&used=yes&q=pwm), so a filtered view can be
// shared and the home page's family chips can link straight into it.

export const USED_CHOICES = ["all", "yes", "no"] as const;
export type UsedChoice = (typeof USED_CHOICES)[number];

export interface AtlasFilter {
  readonly family: BlockFamily | "all";
  readonly used: UsedChoice;
  readonly query: string;
}

const isFamily = (v: string | null): v is BlockFamily =>
  v !== null && (BLOCK_FAMILIES as readonly string[]).includes(v);
const isUsed = (v: string | null): v is UsedChoice =>
  v !== null && (USED_CHOICES as readonly string[]).includes(v);

/** Reads the filter from search params; unknown values fall back to "all". */
export function parseAtlasFilter(params: URLSearchParams): AtlasFilter {
  const family = params.get("family");
  const used = params.get("used");
  return {
    family: isFamily(family) ? family : "all",
    used: isUsed(used) ? used : "all",
    query: (params.get("q") ?? "").trim().slice(0, 60),
  };
}

/** Writes one filter field into search params, dropping it when it is the default. */
export function withAtlasFilter(
  params: URLSearchParams,
  change: Partial<AtlasFilter>,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const set = (key: string, value: string | undefined, fallback: string) => {
    if (value === undefined) return;
    if (value === fallback || value === "") next.delete(key);
    else next.set(key, value);
  };
  set("family", change.family, "all");
  set("used", change.used, "all");
  set("q", change.query, "");
  return next;
}

/** The blocks a filter keeps, in content order. Search looks at the id, name and one-liner. */
export function filterBlocks(
  blocks: readonly ChipBlock[],
  coverage: ReadonlyMap<string, Coverage>,
  filter: AtlasFilter,
): ChipBlock[] {
  const q = filter.query.toLocaleLowerCase();
  return blocks.filter((b) => {
    if (filter.family !== "all" && b.family !== filter.family) return false;
    const used = (coverage.get(b.id) ?? "none") !== "none";
    if (filter.used === "yes" && !used) return false;
    if (filter.used === "no" && used) return false;
    if (!q) return true;
    return [b.id, b.name, b.short].some((s) => s.toLocaleLowerCase().includes(q));
  });
}

/** Blocks grouped by family, in family order, skipping empty families. */
export function groupByFamily(
  blocks: readonly ChipBlock[],
): { family: BlockFamily; blocks: ChipBlock[] }[] {
  return BLOCK_FAMILIES.map((family) => ({
    family,
    blocks: blocks.filter((b) => b.family === family),
  })).filter((g) => g.blocks.length > 0);
}
