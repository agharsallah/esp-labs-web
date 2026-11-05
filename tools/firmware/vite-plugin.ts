import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { collectFirmware, type FirmwareEnv } from "./collect.ts";
import { detectLayout } from "./layout.ts";

// Ships the firmware sources next to the guide so the code reader always shows the code that is
// actually flashed, without copying it into this project:
//   firmware/index.json      every env with its file list and line counts (small, for overviews)
//   firmware/<env>.json      one env's files with their text (fetched when you open its code)
// Dev: served from memory and re-read on every request; edits in the checkout reload the page.
// Build: emitted as static assets into dist/firmware/.

const DIR = "firmware";

const indexOf = (envs: readonly FirmwareEnv[]) => ({
  envs: envs.map(({ env, about, files }) => ({
    env,
    about,
    files: files.map(({ path, role, group, lines }) => ({ path, role, group, lines })),
  })),
});

// `required`: fail the build when no firmware is found, instead of shipping an empty code reader.
export function firmwarePlugin(options: { root: string; required?: boolean }): Plugin {
  const root = resolve(options.root);
  const collect = () => {
    if (!detectLayout(root)) {
      console.warn(`[firmware] no labs/ folder in ${root}: the code reader will be empty`);
      return [];
    }
    return collectFirmware(root);
  };
  const documents = (envs: readonly FirmwareEnv[]) =>
    new Map<string, unknown>([
      ["index.json", indexOf(envs)],
      ...envs.map((e) => [`${e.env}.json`, e] as const),
    ]);

  return {
    name: "bench-firmware",
    configureServer(server) {
      for (const sub of ["labs", "kit", "src", "lib", "include", "platformio.ini"])
        server.watcher.add(join(root, sub));
      server.watcher.on("change", (file) => {
        if (file.startsWith(root)) server.ws.send({ type: "full-reload" });
      });
      server.middlewares.use(`/${DIR}/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? "").split("?")[0]?.replace(/^\//, "") ?? "");
        const doc = documents(collect()).get(name);
        if (doc === undefined) return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(doc));
      });
    },
    generateBundle() {
      const envs = collect();
      if (options.required && envs.length === 0) {
        this.error(
          `no firmware found in ${root}. The esp-labs checkout is not available here: build locally ` +
            "and upload it with `pnpm deploy:prod` / `pnpm deploy:preview` (see README, Deploy to Vercel).",
        );
      }
      for (const [name, doc] of documents(envs)) {
        this.emitFile({ type: "asset", fileName: `${DIR}/${name}`, source: JSON.stringify(doc) });
      }
      this.info(`${envs.length} firmware environments from ${root}`);
    },
  };
}
