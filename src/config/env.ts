import * as z from "zod/mini";

// Configuration comes from the environment at build time (Vite's import.meta.env), validated
// once at start-up so a typo fails loudly instead of as a 404 three screens later.
// zod/mini: the tree-shakable build, so validation adds a few kB, not the whole library.
const EnvSchema = z.object({
  VITE_BENCH_DATA_URL: z._default(z.string().check(z.minLength(1)), "./data/"),
  VITE_FIRMWARE_URL: z._default(z.string().check(z.minLength(1)), "./firmware/"),
  // "" turns the reference reader off (set by tools/reference when REFERENCE_FILE is absent).
  VITE_REFERENCE_URL: z._default(z.string(), "./reference/"),
  VITE_LABS_SOURCE_URL: z._default(
    z.string().check(z.minLength(1)),
    "https://github.com/agharsallah/esp-labs/tree/main/labs/",
  ),
  VITE_ON_VERCEL: z._default(z.string(), ""),
  VITE_LOG_LEVEL: z._default(z.enum(["debug", "info", "warn", "error", "silent"]), "info"),
  DEV: z.boolean(),
  MODE: z.string(),
});

const parsed = EnvSchema.parse(import.meta.env);

export const env = {
  /** Base URL of the bench data JSON (status + log), always ending in "/". */
  benchDataUrl: parsed.VITE_BENCH_DATA_URL.endsWith("/")
    ? parsed.VITE_BENCH_DATA_URL
    : `${parsed.VITE_BENCH_DATA_URL}/`,
  /** Base URL of the bundled lab code (firmware/index.json + one JSON per environment). */
  firmwareUrl: parsed.VITE_FIRMWARE_URL.endsWith("/")
    ? parsed.VITE_FIRMWARE_URL
    : `${parsed.VITE_FIRMWARE_URL}/`,
  /** Base URL of the reference reader's documents, ending in "/"; null when the guide is built without them. */
  referenceUrl:
    parsed.VITE_REFERENCE_URL === ""
      ? null
      : parsed.VITE_REFERENCE_URL.endsWith("/")
        ? parsed.VITE_REFERENCE_URL
        : `${parsed.VITE_REFERENCE_URL}/`,
  /** Where each lab's PlatformIO project lives online, always ending in "/" (append the lab folder). */
  labsSourceUrl: parsed.VITE_LABS_SOURCE_URL.endsWith("/")
    ? parsed.VITE_LABS_SOURCE_URL
    : `${parsed.VITE_LABS_SOURCE_URL}/`,
  /** Built for a Vercel deployment (set by vite.config.ts, not an env file). */
  onVercel: parsed.VITE_ON_VERCEL === "1",
  logLevel: parsed.VITE_LOG_LEVEL,
  isDev: parsed.DEV,
  mode: parsed.MODE,
} as const;

export type LogLevel = typeof env.logLevel;
