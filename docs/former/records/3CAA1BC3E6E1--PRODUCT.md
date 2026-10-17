# PrompTOR — product source of truth (entry point)

Purpose: the one file a production-build session reads first. It points to canonical docs, sets which wins when they disagree, and lists the open conflicts. It does not restate those docs.
Assembled 2026-10-13 from `C:\Minty\{DECIDED,SPEC,PLAN}.md`, the reference archive, `AstraProjects\Promptor`, the pitch deck, and the user's stated decisions.

## 1. Read order and precedence (later beats earlier)

| # | Doc | Date | Role |
|---|---|---|---|
| 1 | `C:\Minty\SPEC.md` | 2026-09-20 | Requirements, acceptance scenarios, deferred scope |
| 2 | `C:\Minty\PLAN.md` | 2026-09-20 | Increment order 0–6 with acceptance criteria |
| 3 | `C:\Minty\DECIDED.md` | 2026-09-26 | Decisions: layout, colour, stack, Vim. **Overrides SPEC where they differ** (its own rule: "later one is used") |
| 4 | §3 below | 2026-10-13 | Later stated decisions not yet in DECIDED |
| 5 | §4 below | open | Conflicts. **Do not build across these until resolved** |

Not product requirements: `C:\Minty\DESIGN.md` (REVX design system, a separate brand; confirm whether it applies, see D7), and the pitch deck (marketing; corrections in `09_market-research_2026-10-13/SUMMARY.md` §7).

## 2. Product in one paragraph (from DECIDED + SPEC)

A local desktop composer that replaces the chat textbox for substantial prompts and replies. The section is the unit: an editable title (exported as the XML tag), lead text, and numbered points (the number is the address). Reuse has three lifetimes: library, this conversation, this message. Inserted copies are independent. Reply mode: paste the model's answer, collect multiple quotes with optional comments **without sending**, and route them to In Response To / Agreements / Corrections / Proposed Edits / Questions. One primary action: Copy (Ctrl+Enter) emits XML with no root element. Text goes out verbatim, empty sections drop out. No model calls, no cloud, no accounts.

## 3. Stated after DECIDED (2026-10-13 sessions; add to DECIDED when confirmed)

- One-time price, no subscription, prompts stay local. Price stated as "about $10" in an earlier session; the deck says $28. → D3
- Vim trainer + 3D RGB/sound keyboard: the user pastes the real code that sent them looking for a command and practises on it. Prototype: white keyboard (`08_white-keyboard`). Not in SPEC/DECIDED scope. → D5
- Left pane with category dropdowns (from `prompttor_desktop_prompt_studio.html`) is a high-priority interaction direction. Target design is a middle ground between "pomptor-alt" (functionality) and Studio (styling). → Q1 in HANDOFF
- Seed library: developer roles and contexts (vibe coders), plus generic computer and office procedures that every profession shares. No industry catalogs (HR, healthcare, legal, etc.).
- Salvage features from the scrapped prototypes (`04_round3…/assets/html`) before new building.
- Anthropic docs now recommend `<pasted_content id="…">` wrapping; `promptor-editor.html` emits `<quote>/<source>/<comment>` without the shared ID. → D6

## 4. Conflicts (each blocks the area it names)

- **D1 Desktop shell.** DECIDED: Tauri v2 + Nuxt/Nuxt UI + CodeMirror 6. Built code in `AstraProjects\Promptor`: Electron 44 + Vue + Vite + Tiptap (Phase 1–2 verified). Pick one.
- **D2 Bridge.** DECIDED: "No bridge, no AI talking to AI." A project note (10-13): "runs through a local bridge with no API needed". `promptor_bridged.html` has a bridge plus model/effort selects. Is it the copy-paste-only bridge, or none?
- **D3 Price.** ~$10 (stated) vs $28 (deck). Benchmarks are in research SUMMARY §1/§6.
- **D4 Import/export.** DECIDED: "no import or export". SPEC scenario 6 and PLAN item 1: export/import backup. Which wins: no data import/export, but backup allowed?
- **D5 Vim scope.** SPEC: Vim mode deferred. DECIDED: Vim toggle, F3, off by default. 10-13: full Vim trainer + keyboard. Is the trainer v1 or post-v1?
- **D6 Quote wrapper format.** `<quote>/<source>/<comment>` vs Anthropic's `<pasted_content id>`. Which goes into the export spec (PLAN item 4)?
- **D7 Visual system.** DECIDED `_MINTY` palette (neutral B/W surfaces + six semantic hues) vs `DESIGN.md` REVX vs the Phase-2 dark screenshot (acid yellow/cyan). Which is canonical for production?
- **D8 Right pane.** DECIDED: Trello-style Kanban of edits. The visual-editor record says "Right pane is to be repurposed"; job-board proposals were not adopted.
- **D9 CSS rule vs stack.** DECIDED/your convention: CSS Modules, no class strings. Nuxt UI and shadcn are Tailwind-based, and Studio prototype uses Tailwind CDN. Confirm the CSS-Modules wrapping layer is the plan.
- **D10 Which codebase is the base.** Recorded implementations: `C:\DEV\promptor` (47 tests), `C:\Minty\PrompTOR` (Vite/TS, 11 tests; **not present in C:\Minty as of 10-13**), `AstraProjects\Promptor` (Electron), `promptor-editor.html`. The deck says "the best one is chosen as the base". Which one?

## 5. Where things live

| What | Path |
|---|---|
| Requirements / plan / decisions | `C:\Minty\SPEC.md`, `PLAN.md`, `DECIDED.md` |
| Prototypes, screenshots, competitor captures | `C:\Minty\promptor-reference-archive\01…08` (see INDEX.md) |
| Market research (2026-10-13) | `C:\Minty\promptor-reference-archive\09_market-research_2026-10-13\` |
| Prompt-optimization literature (~30 PDFs) | `C:\Minty\Knowledge\`. This is very likely the folder in `06` screenshot (resolves HANDOFF Q2; confirm) |
| Electron visual-editor build | `C:\Minty\AstraProjects\Promptor` |
| Example prototypes | `C:\Minty\Examples_promptor` |
| Pitch deck | claude.ai/artifact/G4CcgxGCUu8rdivC99fYbo |

## 6. Known defects carried forward

From HANDOFF §5 (`promptor_bridged.html`): leading `- ` kept in file paths; raw newlines in `depends`; eval stub hard-codes `claude-opus-4-8`; Studio uses Tailwind CDN.
