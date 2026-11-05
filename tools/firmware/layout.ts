import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Where the esp-labs checkout keeps its PlatformIO projects and shared code:
//   labs/<lab>/platformio.ini + labs/<lab>/src, shared code in kit/include and kit/lib/<name>/src
// The collector only walks includes; this module answers "which ini, which src, where else to look".

export type FileRole = "lab" | "shared";

export interface PioProject {
  /** Absolute path of the project's platformio.ini. */
  readonly ini: string;
  /** Absolute src folder that the project's build_src_filter is relative to. */
  readonly srcDir: string;
}

export interface FirmwareLayout {
  readonly projects: readonly PioProject[];
  /** Folders a local `#include "x.h"` may land in, after the including file's own folder. */
  readonly searchPath: readonly string[];
}

const subdirs = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

const libSources = (libDir: string) =>
  subdirs(libDir)
    .map((name) => join(libDir, name, "src"))
    .filter(existsSync);

/** The layout of the checkout at `root`, or null when it has no labs/ folder. */
export function detectLayout(root: string): FirmwareLayout | null {
  const labsDir = join(root, "labs");
  if (!existsSync(labsDir)) return null;
  const projects = subdirs(labsDir)
    .map((lab) => join(labsDir, lab))
    .map((dir) => ({ ini: join(dir, "platformio.ini"), srcDir: join(dir, "src") }))
    .filter((p) => existsSync(p.ini));
  const kit = join(root, "kit");
  return { projects, searchPath: [join(kit, "include"), ...libSources(join(kit, "lib"))] };
}

/**
 * Who a file belongs to, from its "/"-separated path relative to the checkout: a lab's own file
 * (group = the lab folder) or shared code (group = "include" or the library name).
 */
export function groupOf(rel: string): { role: FileRole; group: string } {
  const parts = rel.split("/");
  const [top, second, third] = parts;
  if (top === "labs") return { role: "lab", group: second ?? top };
  if (second === "include") return { role: "shared", group: "include" };
  return { role: "shared", group: third ?? top ?? "kit" };
}
