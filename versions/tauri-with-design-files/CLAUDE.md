# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

The user's terminal is PowerShell in Windows Terminal on Windows 11. The Bash tool runs Git Bash and works too; use whichever fits, but write any commands you hand to the user in PowerShell syntax. A git repository since 2026-09-28 (local, no remote).

## Commands

```bash
npm install
npm run dev          # Vite web build at http://localhost:1420 (strictPort; Tauri expects this port)
npm run tauri dev    # desktop window; needs Rust toolchain (rustup)
npm run build        # vue-tsc -b && vite build -> dist/  (this is the only type-check step)
npm run preview
npm run tauri build  # native bundles; runs `npm run build` first via tauri.conf.json
```

There is no test runner, linter or formatter configured. `npm run build` is the correctness gate (vue-tsc with `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly`).

## What the app is

PromptTOR is a section-based prompt editor. A *message* (`Doc`) is either a `prompt` or a `reply` and is a list of *sections*. Each section is a Markdown body edited in its own CodeMirror instance. Copy (Ctrl+Enter) serialises the current message to a root-less XML string where each section title becomes a tag and list items / `>` quotes become numbered points. Reply messages exist to answer a model's reply point by point; their "Proposed Edits" points land as cards on a kanban board.

## Architecture

Stack: Vite 8 + Vue 3.5 + Pinia + Nuxt UI v4 (Vite plugin, `U*` components auto-imported, see `components.d.ts`) + Tailwind v4 + CodeMirror 6 + Tauri v2. Vue Router is registered with a single `/` route only because Nuxt UI expects it.

**Pure model layer** (`src/model/`) — no Vue imports, safe to unit-test in isolation:
- `types.ts`: `Section`, `Doc`, `LibraryItem`, `Card` shapes; the six `SectionType`s (`who/knows/ends/todo/limits/back`); `PROMPT_SKELETON` / `REPLY_SKELETON` defining the default sections of each message kind; `uid()`.
- `points.ts`: `parseBody()` splits a Markdown body into lead lines and `Point`s (list items or `>` quotes). This is the single definition of what a "point" is; `Writing.vue` mirrors its regexes for gutter numbering and line styling.
- `serialize.ts`: `serializeDoc()` → XML. Tag = title with whitespace → `_`. Sections excluded (`included=false`) or empty are dropped. A section titled "Corrections" gets the special `NN you said X; it is Y` form.

**Store** (`src/store/app.ts`, one Pinia setup store `useApp`) owns all state: `conversation: Doc[]`, `currentId`, `library`, `cards`, theme, vim flag, pane visibility, and an undo stack of full deep-copied snapshots. Convention: call `remember(label)` before any destructive mutation; `undo()` restores the whole snapshot and returns the label for the toast. Persistence is one debounced (300 ms) deep `watch` that writes the entire state blob via `platform.ts`; `load()` must run before the UI renders (`App.vue` gates on `loaded`).

**Platform shim** (`src/lib/platform.ts`) hides web vs Tauri: clipboard, state load/save (localStorage key `promptor.state.v1` always; plus `$APPDATA/state.json` when `inTauri()`), and file picking. Tauri plugins are dynamically imported so the web build never touches them. Rust side (`src-tauri/`) is boilerplate: it only registers the dialog, fs and clipboard plugins; permissions are in `src-tauri/capabilities/default.json`.

**Components** (`src/components/`): `App.vue` is the three-pane `UDashboardGroup` layout and owns the global keyboard shortcuts (Ctrl+Enter copy, F3 vim, Ctrl+Z undo outside editors, Alt+N / Alt+Shift+N new prompt/reply). `SectionCard` wraps one `Writing` editor plus title/type/include/fold controls and the Alt+Up/Down move keys. `Writing.vue` is the CodeMirror setup: Obsidian-style live preview (syntax marks hidden except on the cursor line), point-number gutter, paste-to-list splitting, optional Vim via a `Compartment`. `SidePane` = conversation list + library + file upload (files become Context sections). `KanbanPane` = To do / Doing / Done cards with checklists. `ActionBar` = Copy button and toasts.

**Styling**: every component has a sibling `*.module.css` (CSS Modules, `camelCaseOnly`). Design tokens live in `src/assets/tokens.css` as `--t-*` variables using `light-dark()` and an oklch `--minty-*` palette; `main.css` maps them onto Nuxt UI's `--ui-*` variables. Themes: `system | light | dark | paper`, applied via `data-theme` on `<html>` plus the `.dark` class Nuxt UI keys off. Section type colours are driven by `data-type` on the card. Keep colours in tokens.css; do not add literals in component CSS.

## Spec files vs. code

`SPEC.md` is the working spec, versioned by round (v0 = consolidation, 2026-09-26). It merges two frozen inputs: `review-spec-01.md` (Bench: one markdown document, versions, runs) and `review-spec-02.md` (PromptTOR: seven fixed sections, a library). `review-spec-03.md` is a byte-identical copy of 02. Do not edit the review-spec files. Where the inputs disagree, SPEC.md carries both options in **Decide** blocks (D1 to D12) and a Workshop section describing four rounds to settle them; a Decisions log at the bottom records what was chosen and when.

Neither input describes the shipped Vue app: both specify React + shadcn reading the Bearded Theme JSON in `theme/`, and nothing in `src/` reads that JSON. SPEC.md marks the current code as **Build** wherever it differs. Do not implement spec options until the Decisions log records the choice. The `theme/` JSON is GPL-3.0 and must not be edited (see `theme/SOURCE.md`).

## Status

Consolidation done. Next step is Workshop round 1 in SPEC.md (D1, D2, D3, D10: the shape of a prompt), with the owner answering per decision.
