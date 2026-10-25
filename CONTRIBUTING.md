# Contributing to esp-labs-web

Thanks for helping. This guide covers everything from a one-word typo fix to a brand-new lab. Small pull requests are welcome; you don't need to open an issue first for a typo, a broken link or an unclear step.

- [Ways to help](#ways-to-help)
- [Set up](#set-up)
- [The rules every change follows](#the-rules-every-change-follows)
- [Add a lab](#add-a-lab)
- [Add a simulator or explainer](#add-a-simulator-or-explainer)
- [Translate](#translate)
- [Before you open a pull request](#before-you-open-a-pull-request)
- [Commits and pull requests](#commits-and-pull-requests)

## Ways to help

| What                                                 | How                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Something is broken or looks wrong                   | Open a [bug report](https://github.com/agharsallah/esp-labs-web/issues/new?template=bug-report.yml) with the link (it carries the lesson and language) and a screenshot |
| You have an idea for a lab or a whole theme          | Open a [lab proposal](https://github.com/agharsallah/esp-labs-web/issues/new?template=new-lab.yml): the parts, what the learner builds, what they learn |
| A translation reads badly                            | Open a [translation issue](https://github.com/agharsallah/esp-labs-web/issues/new?template=translation.yml), or edit `src/locales/<lang>/` directly |
| A step is confusing or a fact is wrong               | Edit the lesson in `src/content/lessons/<track>.ts` and open a PR                           |
| You want to build something                          | Pick an issue labelled [`good first issue`](https://github.com/agharsallah/esp-labs-web/labels/good%20first%20issue) or [`help wanted`](https://github.com/agharsallah/esp-labs-web/labels/help%20wanted), and say so in a comment |

The firmware lives in its own repo, [esp-labs](https://github.com/agharsallah/esp-labs). A problem with what the board itself does (a crash, a wrong pin, a library) belongs there. A problem with the guide (text, simulator, layout, code reader) belongs here.

## Set up

You need Node 24.14+ and pnpm 11 (`corepack enable` picks the version pinned in `package.json`). Clone both repos side by side so the code reader can show the firmware:

```sh
git clone https://github.com/agharsallah/esp-labs.git
git clone https://github.com/agharsallah/esp-labs-web.git
cd esp-labs-web
pnpm install
pnpm dev        # http://localhost:5180
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before a larger change. It is short and it names the contracts the code relies on.

## The rules every change follows

These are checked by `pnpm check` where a tool can check them. A reviewer checks the rest.

- **Pure logic in plain `.ts`**, small components, one responsibility per file. `domain/` and simulator logic never import React or the i18n instance.
- **Strict TypeScript**: no `any`, no unchecked `!`, no disabled React Compiler lint rules. No hand-written `useMemo`/`useCallback`; the compiler does it.
- **No inline user-visible text.** Interface strings go through i18next (`src/locales/en/<namespace>.json` + `t()`). Lesson text lives in `src/content/` and is extracted for translators. See [docs/I18N.md](docs/I18N.md).
- **RTL-safe CSS**: logical properties only (`margin-inline-start`, `inset-inline-end`, `text-align: start`).
- **Design tokens only**: colours, fonts and radii come from `src/styles/tokens.css`, never raw values.
- **Accessible**: real buttons and links, labels on icon buttons, state never shown by colour alone, reduced motion respected.
- **Phones count**: no horizontal page scroll at 390 px. Wide things scroll inside themselves (`ScrollBox`).
- **Minimal tests for new logic** (Vitest, next to the module: `thing.ts` → `thing.test.ts`).
- **Dependencies pinned exactly** with pnpm (`pnpm add -E`). Stay on TypeScript 6 until typescript-eslint supports 7.

## Add a lab

A lab has two halves: the firmware that runs on the board ([esp-labs](https://github.com/agharsallah/esp-labs)) and the lesson that teaches it (here). You can open the lesson PR first with `status: "planned"`, or after the firmware is merged.

### 1. The firmware, in esp-labs

Follow [esp-labs: Adding a lab](https://github.com/agharsallah/esp-labs#adding-a-lab): a `labs/<lab>/` PlatformIO project with `extra_configs = ../../common.ini`, shared code in `kit/lib/`, an entry in `labs.json` and a README.

### 2. The lesson, here

1. **Write the lesson** in `src/content/lessons/<track>.ts`. Copy a lesson close to yours and change it. The shape is `ActiveLesson` in [`src/domain/lesson.ts`](src/domain/lesson.ts):

   ```ts
   {
     kind: "lesson",
     id: "S9",                       // unique across all tracks
     track: "sound",
     title: "Echo",                  // short: shown on tiles and pills
     status: "built, not flashed",   // contains "works", "runs" or "on board" once it runs on a real board
     heading: "Hear yourself twice",
     goal: "Record a word and play it back with an echo you can tune.",
     learn: ["ring buffers", "I2S output"],
     pins: [{ pin: "4", role: "MIC SD", side: "L", kind: "snd-mic" }],
     cmd: "uv run pio run -d labs/sound-lab-s9 -e sound-lab-s9 -t upload -t monitor",
     steps: ["Wire the mic as in S1.", "Run the command.", "Type <code>echo 300</code>."],
     note: "No sound? Check the amplifier's GAIN pin.",
     preview: { widget: "sound" },        // a widget id the track registers
     panels: [],
   },
   ```

   Text fields may use `<b>`, `<i>`, `<code>` and `<span class="snd-parts|need|opt">`; nothing else is rendered. The command's `-d labs/<dir>` gives the lesson its "code on GitHub" link, and `-e <env>` picks the firmware the code reader shows.

2. **List it** in the track's `lessonIds` in [`src/content/tracks.ts`](src/content/tracks.ts), in reading order.
3. **Give it a part** in `LESSON_PART` in [`src/content/icons.ts`](src/content/icons.ts) (any name from `src/ui/parts/registry.ts`). The content test fails if one is missing. A new drawing is one function in `src/ui/parts/drawings/<theme>.tsx` and one registry line.
4. **Pick a preview.** Reuse a widget the track already registers, or [add one](#add-a-simulator-or-explainer).
5. **Extract the text** for translators: `pnpm i18n:extract`. This rewrites `src/locales/en/content/`; commit those files too. Other languages fall back to English until someone translates the new keys.
6. **Optional**: a hand-written code tour in `src/content/code/tours.ts` (stops anchored by text in the firmware; the content test checks the anchors). Without one, the reader builds an automatic tour from the code's own comments.
7. **Check it** ([below](#before-you-open-a-pull-request)), open the lesson at `#/lessons/S9` at desktop and phone width, and open its **Read the code** tab.

A new **track** also needs an entry in `TRACKS`, a lessons file, a loader in `src/content/queries.ts`, a `src/labs/<track>/widgets.ts` spread into `src/widgets/registry.ts`, a colour token in `tokens.css` and a `TRACK_PART`. Open a [lab proposal](https://github.com/agharsallah/esp-labs-web/issues/new?template=new-lab.yml) first so we can agree on the theme.

## Add a simulator or explainer

Every simulator, diagram and explainer is a **widget**: a component that takes `WidgetProps` (`{ lesson, panel? }`), registered by id and loaded only when a lesson shows it.

1. Put the component in `src/labs/<track>/`. A track never imports another track; shared pieces go in `src/labs/shared/` or `src/ui/`.
2. Register it in that track's `widgets.ts`: `myWidget: lazyWidget(() => import("./MyWidget"), "MyWidget")`.
3. Reference the id from a lesson (`preview: { widget: "myWidget" }` or a `panels` entry). Ids are type-checked.

Simulators animate at 60 fps, so they follow three rules (details in [ARCHITECTURE.md](docs/ARCHITECTURE.md#simulators-react-around-imperative-drawing)):

1. **Logic is plain TypeScript**: firmware behaviour (command parsing, state machines, protocol maths) in a `.ts` module with unit tests. `src/labs/intro/led-firmware.ts` is a small example.
2. **Per-frame state is not React state**: keep it in a ref or a `Simulation` and draw from `useFrameLoop`.
3. **DOM written per frame is DOM React leaves empty.**

A lab with a screen, buttons and a serial monitor (like the RFID, BLE and sound labs) can use the **lab-screen engine** in `src/labs/shared/lab-screen/`: write one `ScreenSpec` and the engine draws the rest. What the simulated hardware prints (serial lines, the TFT) stays in English, like the real firmware. Captions and buttons around it are translated.

## Translate

Translations live in `src/locales/<lang>/` and nowhere else. Interface text is in one JSON file per namespace; lessons, the phrasebook and the code tours are in `content/`. Any file can be partial: missing text shows in English, so a half-done translation is safe to merge.

- Keep the guide's voice: short sentences, plain words, second person, informal (`tu`, `du`, `tú`, `ty` in Polish, `sen` in Turkish), です/ます in Japanese. See [Translation style](docs/I18N.md#translation-style).
- Keep the markup (`<b>`, `<code>`, `{{placeholders}}`) exactly as in English, and give each plural form your language needs. `pnpm check` tells you when one is off.
- Code, commands, pin names and what the board prints stay in English.
- **A new language**: four steps in [docs/I18N.md](docs/I18N.md#adding-a-language).

Check your work at `http://localhost:5180/?lang=<code>`, including the 390 px layout. German and French run about 30% longer than English.

## Before you open a pull request

```sh
pnpm check     # typecheck, lint, tests
pnpm build     # the production bundle builds
```

Then open the lessons you touched in a browser at desktop width and at 390 px. Check that the browser console shows no errors and that there is no horizontal page scroll. The pull request template has the full checklist.

## Commits and pull requests

- One topic per pull request. A new lab and an unrelated refactor are two PRs.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) with the area as the scope, as in the history: `feat(lesson): …`, `fix(rfid): …`, `docs: …`, `chore(deploy): …`.
- For a visible change, put a screenshot or a short GIF in the pull request, at desktop and phone width if the layout changed.
- A pull request that changes the firmware's behaviour links its esp-labs counterpart.
- Keep at most **3 pull requests open at once**. A fourth is closed automatically with a note; reopen it when one of the others is merged or closed.
- The pull request title follows the same Conventional Commits form (it becomes the squash commit), and a check enforces it.

### What CI checks

Every pull request runs `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` (with the esp-labs firmware), lints the workflows, and runs CodeQL. A pull request that changes dependencies also gets a vulnerability review. On your first pull request a maintainer approves the CI run before it starts. All of these must pass, and the maintainer must approve, before a pull request merges.

Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md). Report a security problem privately, as [SECURITY.md](SECURITY.md) describes, never in a public issue.
