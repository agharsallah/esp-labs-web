# Brief for agents building the chip pages

You are one of several agents building `docs/CHIP_PAGES_PLAN.md` in parallel, in the same working tree (branch `feat/chip-pages`). Read, in order:
1. `CLAUDE.md`, the repository rules.
2. `docs/CHIP_PAGES_PLAN.md`, the plan.
3. `docs/ARCHITECTURE.md`, the existing architecture.
4. `src/domain/chip.ts`, the shared contract. **Do not change it.** If you need a change, say so in your final report.

## Decisions already taken
- **Placement:** Chip is a top-level section (done: nav item, `#/chip` routes with stub pages in `src/app/routes/chip/`).
- **Progress:** progress comes from the labs only (`blockCoverage` and `chipProgress` in `domain/chip.ts`).
- **Registers:** each fully written block shows its 3–6 key registers.
- **Block depth:** all 32 blocks are listed. These 12 are `depth: "full"`: `gpio`, `uart`, `i2c`, `spi`, `ledc`, `adc`, `touch`, `i2s`, `rmt`, `wifi`, `ble`, `usb-serial-jtag`. The rest are `"listed"`.
- **Languages:** the `chip` namespace is written in English first; translations come in a later phase.
- **Family colours:** `--fam-<family>` tokens are in `src/styles/tokens.css`.

## Shared names (all agents use exactly these)
Block ids, with their icon `PartName`s. Each icon is `blk-<id>`, except that `flash-psram` uses `blk-flash`:

`cpu, ulp, gdma, sram, rom, flash-psram, cache, efuse, gpio, rtc, timers, wdt, crypto, rng, uart, i2c, i2s, spi, lcd-cam, twai, usb-otg, usb-serial-jtag, sdmmc, ledc, mcpwm, rmt, pcnt, adc, touch, temp-sensor, wifi, ble`

Families:
| Family | Blocks |
| --- | --- |
| system | cpu, ulp, gdma, gpio, rtc |
| memory | sram, rom, flash-psram, cache, efuse |
| security | crypto, rng |
| connectivity | uart, i2c, i2s, spi, lcd-cam, twai, usb-otg, usb-serial-jtag, sdmmc |
| timing | timers, wdt, ledc, mcpwm, rmt, pcnt |
| analog | adc, touch, temp-sensor |
| radio | wifi, ble |

## File ownership: touch only your files
Each agent owns the files its task lists. If you need a change in a file you don't own, don't make it: describe it in your report.

## Quality bar (every agent)
- Strict TypeScript. No `any`, no unchecked `!`, no disabled lint rules.
- React Compiler: no hand-written `useMemo`/`useCallback`.
- Pure logic goes in `.ts` with Vitest tests. Components stay small, one job per file. Match the surrounding code's comment density, naming and idiom.
- Colour tokens only, no raw colours. Logical CSS (`inline-start`, `margin-inline`…). Reduced motion respected (`useReducedMotion`, `:root[data-motion="reduced"]`, `prefers-reduced-motion`). Accessible names and roles. No horizontal scroll at 390 px.
- No inline user-visible text: use `t()` from the `chip` namespace (`src/locales/en/chip.json`), or content data that goes through the overlay system.
- Use pnpm, never npm. Don't add dependencies.
- Before reporting, run `pnpm typecheck`, `pnpm lint` and the tests for your files (`pnpm vitest run <paths>`). If a test seems stale, delete `node_modules/.vitest-cache` and rerun. Do not commit.
- Final report: the files you created or changed, the public API (exports and props), the checks you ran and their results, anything left open, and any change you need in files you don't own.
