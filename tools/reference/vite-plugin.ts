import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Plugin } from "vite";
import type { SectionDoc } from "./ast.ts";
import { buildReference, imagesOf, type Reference } from "./build.ts";

// The reference reader's documents, built from Espressif's text at build time. That text is
// Espressif's: it is never bundled into the JS, only emitted when REFERENCE_FILE is present here.
//   reference/index.json             every section: title, parent, children, document, size
//   reference/sections/<id>.json     one section as a typed document (tools/reference/ast.ts)
//   reference/images/…               only the figures those sections show
// Dev: served from memory, re-read when the file changes. Build: emitted as static assets.
// Without the file, nothing is emitted and the app shows plain citations (VITE_REFERENCE_URL
// is set to "" so it doesn't even ask).

const DIR = "reference";

const MIME: Readonly<Record<string, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
};

/** "images/a.png" stays inside the images folder: no "..", no absolute paths. */
const safeImage = (path: string) => /^images\/[\w.-]+$/.test(path) && !path.includes("..");

export function referencePlugin(options: { file: string }): Plugin {
  const file = resolve(options.file);
  const root = dirname(file);
  let cache: { mtime: number; ref: Reference; sections: Map<string, SectionDoc> } | null = null;
  const load = () => {
    if (!existsSync(file)) return null;
    const mtime = statSync(file).mtimeMs;
    if (cache?.mtime !== mtime) {
      cache = { mtime, ref: buildReference(readFileSync(file, "utf8")), sections: new Map() };
    }
    return cache;
  };
  const sectionOf = (id: string) => {
    const c = load();
    if (!c) return undefined;
    const known = c.sections.get(id);
    if (known) return known;
    const doc = c.ref.section(id);
    if (doc) c.sections.set(id, doc);
    return doc;
  };

  return {
    name: "bench-reference",
    config() {
      // Vitest decides from its own fetch stubs; everywhere else an absent file turns the reader off.
      if (process.env.VITEST || existsSync(file)) return undefined;
      return { define: { "import.meta.env.VITE_REFERENCE_URL": JSON.stringify("") } };
    },
    configureServer(server) {
      if (!existsSync(file)) {
        console.warn(`[reference] ${file} is not here: chip citations stay plain citations`);
        return;
      }
      server.watcher.add(file);
      server.middlewares.use(`/${DIR}/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? "").split("?")[0]?.replace(/^\//, "") ?? "");
        const c = load();
        if (!c) return next();
        if (name.startsWith("images/")) {
          const path = join(root, name);
          if (!safeImage(name) || !existsSync(path)) return next();
          res.setHeader("Content-Type", MIME[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream");
          res.end(readFileSync(path));
          return;
        }
        const id = /^sections\/(.+)\.json$/.exec(name)?.[1];
        const doc = name === "index.json" ? { sections: c.ref.index } : id ? sectionOf(id) : undefined;
        if (doc === undefined) return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(doc));
      });
    },
    generateBundle() {
      const c = load();
      if (!c) {
        this.info(`no reference at ${file}: nothing emitted`);
        return;
      }
      const images = new Set<string>();
      this.emitFile({ type: "asset", fileName: `${DIR}/index.json`, source: JSON.stringify({ sections: c.ref.index }) });
      for (const { id } of c.ref.index) {
        const doc = sectionOf(id);
        if (!doc) continue;
        for (const img of imagesOf(doc.blocks)) images.add(img);
        this.emitFile({ type: "asset", fileName: `${DIR}/sections/${id}.json`, source: JSON.stringify(doc) });
      }
      let copied = 0;
      for (const img of images) {
        const path = join(root, img);
        if (!safeImage(img) || !existsSync(path)) continue;
        this.emitFile({ type: "asset", fileName: `${DIR}/${img}`, source: readFileSync(path) });
        copied += 1;
      }
      this.info(`${c.ref.index.length} reference sections and ${copied} figures from ${file}`);
    },
  };
}
