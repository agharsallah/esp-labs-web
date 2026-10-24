# Plan: the chip pages ("Inside the ESP32-S3")

Turn `docs-llm/esp32-s3/ESP32-S3_REFERENCE.md` (2.3 MB, 431 sections, 444 registers) into a few pages of the guide. The pages should be easy to read, use the 3D board language the home page already has, move a lot without getting in the way, use our own icons and charts, mark what matters most, and show how far the labs have taken us through the chip.

## 1. What we are building

A new top-level section, **Chip**, next to Labs / Bench / Settings, with five pages under `#/chip`:

| Route | Page | The question it answers | Hero |
| --- | --- | --- | --- |
| `#/chip` | **Inside the ESP32-S3** | What is on this board, and how much of it have we used? | Scroll-driven 3D "exploded" descent: board, module, can lifted, chip, die blocks |
| `#/chip/pins` | **Pins and power** | Which pin can do what, and which pins bite? | The board in 3D with the header pins as hotspots, and a 2D pin matrix |
| `#/chip/blocks` | **Peripheral atlas** | What can each block do, with which pins, in which lab? | A grid of block tiles with our icons, coloured by family, with progress |
| `#/chip/blocks/:id` | **One block** | The essentials of UART, I2C, SPI, ADC, RMT and the rest | The block's own isometric drawing with signals flowing |
| `#/chip/inside` | **Memory, clocks and power modes** | Where code and data live, what clocks what, what sleep costs | An address-map tower, an animated clock tree and a power-mode ladder |

The reference stays the source of truth. The pages show the **curated 10%** a maker needs and link each fact back to its section of the reference.

**Assumptions** (change any of them before phase 1):
- **"A few pages"** means these five, inside this app, not a separate site.
- **"Our advancement"** means the labs' progress, using the four states in `domain/progress.ts`: done, works, built, planned.
- **"The graphic charter"** means `src/styles/tokens.css`, the parts library (`ui/parts/`), `ui/stage3d` and the visual language in `ARCHITECTURE.md`.

## 2. Principles

1. **Most important first, always.** Every page and card has four layers:
   - **L0**: one headline number or sentence.
   - **L1**: three to five key facts.
   - **L2**: the detail table or chart.
   - **L3**: "Read the full section", a link to the reference section.

   L0 and L1 read in ten seconds. L2 opens on demand.
2. **Three markers, by shape and not colour alone** (the same rule as `StateGlyph`):
   - **Key fact**: a solid copper pad.
   - **Gotcha**: a warning triangle in `--warn`, for things that break boards or waste a day. Examples: the strapping pins, ADC2 being unusable while Wi-Fi is on, GPIO35–37 being taken by octal PSRAM, GPIO47/48 running at 1.8 V on R16V modules, and the chip not tolerating 5 V.
   - **Used in our labs**: the lesson's state glyph plus its id.

   A test checks that every Gotcha has a source reference.
3. **Motion explains; it doesn't decorate.** Every animation shows something real: data moving on a bus, a clock dividing, the camera going one level deeper, a bar growing to its value. Calm mode and `prefers-reduced-motion` get the same information as static end states.
4. **We draw everything ourselves.** No Espressif figures and no logo. Every diagram is redrawn with our iso engine, our charts and our 3D. This keeps the charter consistent, and it matters legally (see §10).
5. **The house rules hold:**
   - tokens only
   - i18n for every string
   - logical CSS (RTL)
   - no horizontal scroll at 390 px
   - accessible controls, with a table fallback for every chart
   - pure logic in `.ts` with tests
   - lazy chunks

## 3. Content: from the reference to typed data

The reference is in `docs-llm/`, which is git-ignored and never shipped. The app gets a small curated data set instead.

```
src/content/chip/
  facts.ts        headline numbers (cores, MHz, SRAM, GPIO count…), each with a source ref
  blocks.ts       one entry per peripheral block (≈ 30): id, family, icon, key facts, limits, pins, labs
  pins.ts         per GPIO: functions (IO MUX, RTC, analog, touch), strapping role, warnings
  memory.ts       address-map regions (start, end, kind, note)
  clocks.ts       clock-tree nodes and edges with frequencies
  power.ts        power modes with current figures (min/typ/max) and what stays on
  gotchas.ts      the "Gotcha" list, each tied to pins/blocks
  sources.ts      SourceRef = { doc: "C" | "M" | "T" | "A", section: "C2.3.5", anchor }
```

- **Domain model** (`src/domain/chip.ts`, pure):
  - Types: `ChipBlock`, `BlockFamily` (system, memory, security, connectivity, timing, analog, radio), `Importance` (key, gotcha, detail), `SourceRef`.
  - `blockCoverage(blocks, lessons, ticks)` gives each block's most advanced lab state, reusing `lessonState`. "Used by a lab" is found from the lesson content: pins, track, and the widgets that name a block. This works like `partLessons` in `features/home/board3d/parts.ts`, so a new lesson lights up its blocks without anyone editing chip data.
  - `chipProgress(...)` gives the share of blocks touched, by state.
  - Unit-tested.
- **Text**: titles and sentences go in a new `chip` i18n namespace (`src/locales/<lang>/chip.json`) through `t()`. Numbers and units stay in the data. Long explanations go through the content overlay path (`pnpm i18n:extract`), as lessons do.
- **Content test** (`src/content/chip/chip-content.test.ts`) fails when:
  - a fact has no `SourceRef`, or a ref names a section missing from the reference index;
  - a block has no icon;
  - a pin in `pins.ts` is not in `domain/board.ts`;
  - a gotcha points at an unknown pin or block.
- **Extraction**: done by hand, block by block, with Claude reading the matching reference section and quoting the section id. No script dumps the reference into the bundle. A small build-time tool, `tools/chip/check-refs.ts`, reads the reference when it is present and checks that every `SourceRef.section` exists. When `docs-llm/` is absent, as in CI, the tool skips with a warning.

## 4. The 3D concept, extended

The base is the existing `ui/stage3d` (eased orbit camera, `fitWidth`, ink outlines, `toon()` materials, labels and leader lines) and `features/home/board3d/esp32-scene.ts`.

New scenes (`src/features/chip/scenes/`), each a builder on a `Stage3d`:

| Scene | What it shows | Motion |
| --- | --- | --- |
| `descent-scene.ts` | The DevKitC from the home page. Scrolling down: the camera dives to the module, the shield can lifts off and away, the QFN56 package splits open and the die rises out as a slab of coloured block tiles in a floor plan grouped by family | Scroll-scrubbed. Each layer is a keyframe and labels fade in per layer |
| `package-scene.ts` | The QFN56 with its 56 pads. A pad lights when you hover its pin in the matrix | Pad glow and a leader line to the label |
| `die-scene.ts` | The die floor plan: block tiles extruded by "how much we used it", topped with our iso icon decals | Tiles rise to their coverage height on entry; hover lifts a tile |
| `bus-scene.ts` | For one block, the CPU, a bus and the peripheral pads | Particles flow along the bus at a rate that tells relative speed (UART slower than SPI) |

- **Scroll scrubbing.** A new `lib/scroll-progress.ts` holds the pure mapping from scroll position to a 0–1 value and the layer index. A hook, `use-scroll-progress.ts`, reads the scroll once per frame, like `use-scroll-chrome`. Scenes interpolate their camera and object transforms between keyframes from that value. Frame work stays in refs, following the three simulator rules.
- **Reduced motion.** The descent becomes five tappable layers with snap transitions. Nothing is scrubbed.
- **Budget.**
  - three.js is already its own lazy chunk.
  - Scenes use low-poly geometry and stay under about 30k triangles.
  - The frame loop pauses off screen through `useFrameLoop`.
  - On phones, the die scene falls back to an iso SVG floor plan below 480 px if a frame takes longer than 20 ms.

## 5. Our icons: the "block" family

Extend the parts library rather than adding a second icon system.

- **New drawings** go in `src/ui/parts/drawings/chip.tsx`: one small isometric illustration per block family member, using the same light (lit top, base left face, shaded right face, ink outline, contact shadow) and `--part-*` tokens. The family is 30–34 icons:
  - CPU
  - ULP
  - GDMA
  - SRAM
  - ROM
  - flash/PSRAM
  - cache
  - eFuse
  - IO MUX / GPIO matrix
  - RTC
  - timers
  - watchdog
  - SHA / AES / RSA / HMAC / DS
  - RNG
  - UART
  - I2C
  - I2S
  - SPI
  - LCD_CAM
  - TWAI
  - USB OTG
  - USB Serial/JTAG
  - SD/MMC
  - LEDC
  - MCPWM
  - RMT
  - PCNT
  - SAR ADC
  - touch
  - temperature sensor
  - Wi-Fi
  - BLE
- **Shared visual grammar**: a chip base slab with the block's metaphor on top. UART is two stacked FIFOs with a bit-train; I2C is two lines with a clock tick; ADC is a staircase; RMT is a pulse ribbon; and so on.
- **Family colour band** on the slab's front face, so families read at a glance. The colour is never the only cue: the band carries a family glyph as well.
- **Registration**: one line in `ui/parts/registry.ts` per icon. The gallery at `#/parts` shows them automatically. The existing test that no raw colour is painted covers them.
- **Small sizes**: for 16–24 px inside text, add a line-icon twin of each family to `ui/Icon.tsx` (`currentColor`).

## 6. Our charts: `ui/charts`

A small SVG chart kit with no library, coloured from tokens, with motion through CSS transitions. Every chart takes typed data and an accessible `caption`, and renders `ChartTable`, a visually hidden table that a "Show as table" toggle can reveal.

| Component | Used for |
| --- | --- |
| `RangeBar` | min/typ/max ranges (supply voltage, current, frequency), with a log scale option |
| `Ladder` | power modes: rungs from Active to Hibernation, with current on a log axis; each rung lists what stays on |
| `AddressMap` | the memory map as a vertical tower; regions sized by log length, labelled with start/end |
| `FlowTree` | the clock tree: nodes and edges with divider labels; animated dashes show the flow |
| `CoverageRing` | blocks touched by state (done / works / built / planned); the same segments as the home progress ring |
| `PinMatrix` | GPIO × function grid; cells are icons; filters by function; gotcha pins carry the triangle |
| `Spark` | tiny inline numbers, e.g. "up to 5 Mbps" drawn as a bar against the fastest peer |
| `CompareBars` | the same metric across blocks, e.g. max clock of UART, I2C, SPI, I2S |

The pure geometry (scales, log ticks, layout of the tower and tree) lives in `.ts` modules with unit tests. The `.tsx` files only draw. Entry motion uses `stroke-dashoffset` and `transform: scale` on a `--t` custom property. A shared `useInView` sets `data-shown`, and Calm mode sets the end state directly.

## 7. Page by page

### 7.1 Inside the ESP32-S3 (`#/chip`)
- **L0**: "A dual-core 240 MHz computer with Wi-Fi and Bluetooth, on a board the size of a finger". The headline numbers count up on entry: 2 cores, 240 MHz, 512 KB SRAM, 45 GPIO, 2.4 GHz.
- **The descent** (scene §4): five layers, each with one caption card (Board, Module, Package, Die, Blocks). At the Blocks layer the die tiles take their coverage height.
- **Your progress through the chip**:
  - A `CoverageRing` (blocks touched by state).
  - A sentence such as "Your labs have used 9 of 31 blocks. Next: I2S in S1."
  - Three "next block to unlock" cards that link to the lesson.
- **Families strip**: seven family chips. Each scrolls to the atlas filtered to its family.
- **Top 5 gotchas**: cards with the triangle, each linking to the pin or block.

### 7.2 Pins and power (`#/chip/pins`)
- The board in 3D with header pins as hotspots: hover or focus a pin to light it, and a card opens with its functions and gotchas. This reuses the home scene and the `domain/board.ts` header.
- `PinMatrix`: filter by function (UART, I2C, SPI, ADC, touch, RTC, strapping), "show only safe pins" or "pins our labs used". The used pins come from lesson `pins`, so the advancement is visible here too.
- **Strapping pins panel**: GPIO0/3/45/46, their default levels and the boot-mode table as a small truth-table chart.
- **Power**: the power-domain diagram redrawn as a `FlowTree` (VDD3P3, VDD_SPI, RTC), a `RangeBar` for supply voltages, and the power-up timing as an animated timeline.

### 7.3 Peripheral atlas (`#/chip/blocks`)
- A grid of block tiles. Each tile has:
  - the iso icon;
  - the name and one line;
  - one `Spark`;
  - the state glyph of the most advanced lab using it, or "not yet";
  - a Gotcha marker if any applies.
- Filters: family, "used / not yet", search. Grouped by family with a sticky family header.
- Motion: tiles stagger in, and lift on hover/focus with the 3D tilt of the part icons.

### 7.4 One block (`#/chip/blocks/:id`)
- **Hero**: `bus-scene` or the iso icon at 160 px with an animated signal. For example, UART shows a frame drawn bit by bit (start, data, parity, stop) from `lib`-level pure frame maths.
- **L1 key facts**: count of instances, max speed, FIFO depth, DMA, pins (via the GPIO matrix or fixed IO MUX pins).
- **Gotchas** for this block.
- **In our labs**: lessons using it, with state glyphs and a link to each.
- **L2**: a compact "how it works" diagram (our redraw), a mode or feature table, and the 3–6 registers a maker actually touches, as a bit-field strip, not all of them.
- **L3**: "Full chapter in the reference", using the section id (`T26` and so on).

### 7.5 Memory, clocks and power modes (`#/chip/inside`)
- `AddressMap` of internal and external memory, with "where your sketch lives" highlighted (flash cache, IRAM, DRAM).
- `FlowTree` of the clock tree (XTAL 40 MHz, PLL, CPU 80/160/240, APB, RTC slow and fast). An animated pulse shows the dividers.
- `Ladder` of power modes, with currents from Part C §C5 and what each mode keeps on. It shows the deep-sleep gain as "×N less than active".

## 8. Code layout

```
src/app/routes/chip-route.tsx            lazy route; loaders prefetch the chip content chunk
src/features/chip/
  ChipHome.tsx, PinsPage.tsx, AtlasPage.tsx, BlockPage.tsx, InsidePage.tsx
  ChipNav.tsx                            section pills (like TrackNav), each with a coverage meter
  Marker.tsx                             KeyFact / Gotcha / UsedIn
  FactCard.tsx, BlockTile.tsx, SourceLink.tsx
  scenes/                                descent, package, die, bus (§4)
  use-chip-coverage.ts                   ticks store + domain/chip.ts
src/ui/charts/                           §6
src/ui/parts/drawings/chip.tsx           §5
src/lib/scroll-progress.ts (+ test), use-scroll-progress.ts
src/domain/chip.ts (+ test)
src/content/chip/* (+ chip-content.test.ts)
src/locales/<lang>/chip.json
```

- **Router**: a `chip` branch in `app/router.tsx` with `lazy` children, like `parts` and `log`, so none of it loads until opened.
- **Top bar**: a "Chip" link in `AppLayout` with an i18n label.
- **Home**: the "Meet the board" card gets a "Go inside" link to `#/chip`.
- **`ARCHITECTURE.md`**: a "Chip pages" section once phase 2 lands.

## 9. Phases

Each phase ends with:
- `pnpm check`;
- `pnpm build`;
- a browser run of the new pages at desktop and 390 px in light, dark, Calm and RTL (`?lang=ar`), with no console errors.

| Phase | Deliverable | Done when |
| --- | --- | --- |
| **0. Decide** | Answers to §11; the list of ~31 blocks and ~15 gotchas agreed | This doc updated |
| **1. Data and domain** | `src/content/chip/*`, `domain/chip.ts`, `sources.ts`, content tests, `check-refs` tool | Tests pass; every fact has a ref; coverage computed for current lessons |
| **2. Skeleton pages** | Five routes with L0/L1 content, markers, tables (no 3D, no charts) | Pages readable end to end on a phone; i18n keys in `en` |
| **3. Icons** | `drawings/chip.tsx` (30–34 icons) + line twins; gallery updated | Parts tests pass; visual review of the whole family side by side |
| **4. Charts** | `ui/charts` kit + tests; wired into pins, atlas, inside | Each chart has a table fallback and passes axe; Calm shows end states |
| **5. 3D** | `scroll-progress` + descent, package, die and bus scenes | 60 fps on a mid laptop; under 20 ms per frame at 390 px or SVG fallback; scroll never trapped |
| **6. Motion pass** | Entry staggers, count-ups, flows, hover tilt, page transitions (View Transitions API where supported) | Every motion has a reduced form; nothing animates layout (transform and opacity only) |
| **7. Progress everywhere** | Coverage on ChipNav, atlas, die heights, pin matrix "used", home link | Ticking a lesson step updates every page live (store subscription) |
| **8. Languages** | The `chip` namespace translated into the 7 languages | Catalogue test green; RTL checked |
| **9. Polish and docs** | Lighthouse pass, bundle check, `ARCHITECTURE.md` section, README GIF | Initial route JS unchanged; chip chunk budget met |

Phases 3 and 4 can run in parallel with 2. Phase 5 needs 2.

## 10. Risks and decisions

- **Copyright.**
  - The reference is Espressif's text and figures, and the site is public.
  - Ship our own redrawn diagrams and our own short sentences, with facts and numbers (not copyrightable as such) and links to Espressif's PDFs.
  - Never ship their images, long verbatim passages or the logo. The `images/` folder in `docs-llm/` stays local.
- **Accuracy.**
  - Every number carries a `SourceRef`.
  - Gotchas get a second check against the PDF page, not only the merged reference.
  - Where the sources disagree (UART stop bits, I2C controller count, the brown-out reset bit and others), show the value that applies to our chip revision and mention the other.
- **Scope creep.** 444 registers are not the goal. Each block shows only the registers a maker touches; the rest stays one link away.
- **Performance.**
  - three.js is lazy and scenes are low-poly.
  - Charts are SVG with CSS motion; there is no chart library.
  - Budget: the chip route chunk is at most 120 KB gzip without three.js.
- **Motion sickness.** Scroll-scrubbed camera moves are limited to the descent, a 5-layer story. Calm mode replaces them with steps.

## 11. Questions to settle in phase 0

1. **Placement**: a top-level "Chip" section, as planned, or a tab inside Bench?
2. **Advancement**: lab progress only, or also a "what I've read" ring for the chip pages, like the code reader's understanding ring?
3. **Depth for registers** in block pages: none, the top 3–6 (planned), or a full browsable list?
4. **Block list**: all ~31, or start with the ones the labs touch (GPIO, UART, I2C, SPI, LEDC, ADC, touch, I2S, RMT, Wi-Fi, BLE, USB Serial/JTAG) and grey the rest as "not yet"?
5. **Languages**: launch in English with the other six following, or all seven at once?
