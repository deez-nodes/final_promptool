# Promptor feature matrix

Eight versions, one product. Each row is a feature; each column says whether a version has it, and the last column names the version whose implementation should be lifted into the consolidated build. Files are in `ordered_promptor_versions/` unless noted.

Legend: **Y** has it, **~** partial, blank none.

| Feature | v0 basic | v0 bridged | v1 | v2 | v3 | v4 | snippets-subpoints* | React (Promptor.html) | Take from |
|---|---|---|---|---|---|---|---|---|---|
| Section cards: title, body, numbered points | | | Y | Y | Y | ~ (body only) | Y | Y | **React** (cleanest model, tests) |
| Section skeletons per mode (Base / Reply) | ~ (templates) | ~ (templates) | Y | Y | Y (starting points) | | Y (arrangements, saveable) | Y | **snippets-subpoints** (built-in + user-saved arrangements) |
| Section hints as placeholders | | | Y | | | | | ~ | **v1** (HINT table) |
| Color per section by name | | | Y | Y | Y | Y (by type) | Y | ~ (one accent) | **v1** (hue-per-job mapping) + v4 type colors |
| Tab adds a point, caret hint | | | | | | | | Y | **React** |
| Alt+Enter point, Alt+↑↓ move, Backspace on empty | | | Y | | ~ (Alt+Enter) | | Y | Y | **v1 / React** |
| Enter continues `- ` and `1. ` lists | | | | | Y (incl. checkboxes) | Y | Y | | **v3** `listEnter` (handles `[ ]` too) |
| Paste paragraphs → points | | | Y | | | | | | **v1** |
| Per-point XML tags (`<agree_01>`) | | | | | Y (named points too) | | Y | | **v3** `pointTag` (named or stem+index) |
| Point on/off toggle (Stacks) | | | | | | | | | **new** (per-point `on` flag) |
| Section include/exclude from output | | | | | Y | Y | Y | | **v3** |
| Keep section for next turn + Next turn | | | | | Y | | | | **v3** |
| Previous turns history | | | | | Y | | | | **v3** |
| Collapse card to one line with snippet | | | | | Y | Y | Y | Y | **React** (footer + outline) |
| Reply: quotes with response points under each | | | ~ (points) | ~ | Y (select-to-quote) | | Y (quote per point) | Y | **React** model + **v3** capture |
| Reference / reply pane: paste source, select text → quote into a section | | | | ~ (Their reply box) | Y | | | | **v3** `captureQuote` |
| Reading view (rendered markdown, click to edit) | | | | | Y | | | | **v3** `markdown()` |
| Colored markdown while typing | | | | | | | | | **new** (overlay highlighter or CodeMirror) |
| `{{variables}}` with interpolation | Y | Y | | Y | | | | | **v0 bridged** (27 template vars) + v2 toggle |
| Templates by task type (PE agentic, research, extract…) | Y | Y | | | | | | | **v0 bridged** labels as skeletons |
| Library: reusable pieces, grouped, colored | | | Y | Y (3 panels + categories) | Y | Y (by type) | Y (by type) | Y (snippets) | **v2** panels/categories + **v4** type groups |
| Library: pull single sections from a saved prompt | | | | | Y | | Y | | **snippets-subpoints** `pullPrompt` |
| Insert piece at cursor | | | | | Y | | Y | | **v3** `insertPiece` |
| Search → Enter inserts top hit | | | Y | | Y | Y | Y | | **v1** |
| Projects, starred, outline tab | | | | | | | | Y | **React** |
| Resizable panes, keyboard resize, collapse | | | | | | | | Y | **React** `Splitter` |
| Output formats | md/json | xml/md/json | xml | xml/md/json | xml/md/text | text/md/xml | text/md/xml | xml/md | **v3** assemble (CDATA, demote headings) + v2 json |
| Per-section `#` heading vs `<tag>` wrap toggle | | | | | | | Y | | **snippets-subpoints** |
| Token / char / cost meter | | Y | Y | Y | | | | | **v2** |
| Copy Ctrl+Enter, download file | ~ | Y | Y | Y | Y | Y | Y | Y | **React** (fallback path) |
| Undo (snapshot) | | Y | Y | | Y | Y | Y | Y | **v3** (50-deep stack) |
| Backup / import JSON, legacy import | | | | | Y | Y | Y | Y | **React** (validated) + v3 merge |
| Drop text/files onto card or library | | | Y | | Y (attach document) | | | Y | **React** |
| Vim mode with HUD and cheatsheet | | Y | | | | | | | **v0 bridged** |
| Local model bridge: run, optimize draft, model + effort select, chat tab | | Y | | | | | | | **v0 bridged** (`optimizeViaBridge`) |
| Eval grader tab | | Y | | | | | | | **v0 bridged** |
| Base directory / file location field | Y | Y | | | | | | | **v0** (becomes file-backed storage) |
| Themes | dark | dark | dark + light (system) | dark | dark | light | light | dark | **new** picker; v1 proves light works |
| Mobile layout | | | ~ | | Y | Y | Y | Y | **React** |
| Tests | | | | | | | | Y (10) | **React** |

\* `promptor_snippets-subpoints.html` lives on the Desktop; it is v4 plus points, arrangements, modes and pull.

## The consolidated build, in one list

Base: the **Nuxt workspace** (`docus-main/playground`, page `/promptor`): Nuxt UI dashboard shell, Nuxt Content over a folder of markdown, Nitro routes for save and version history, CodeMirror cards, theme picker. Shipped as an **Electron** app with Nitro running inside (what Obsidian, Notion and Linear are), the same code hosted as the free demo. Tauri is a later size optimization, not the first build.

The React single file (`promptor-react`) is the free demo and the feature donor for card UX, quotes-with-responses, splitters, projects and backup. Its tests describe the behaviors to keep.

Lift in, in this order:

1. **v3**: `listEnter` with checkboxes, `pointTag` per-point XML, include/exclude, Keep + Next turn, Previous turns, reference pane with select-to-quote, reading view, CDATA-safe XML, 50-deep undo.
2. **v1**: section hints, hue-per-job colors, paste-paragraphs-to-points, search-Enter-inserts.
3. **snippets-subpoints**: arrangements (saveable skeletons), pull single sections, `#` vs `<tag>` per section, insert at cursor.
4. **v2**: library categories and panels, `{{vars}}` interpolate toggle, token/cost meter, JSON output.
5. **v0 bridged**: Vim mode with HUD, local bridge (run, optimize draft, model and effort), eval tab, task-type templates as skeletons.
6. **New**: point on/off (Stacks), typed-word autocomplete, folder picker on first run, global hotkey to summon the window, license key check, auto-update, code signing. Colored markdown, themes and file storage already exist in the Nuxt base.

Nothing in the matrix is invented. Every feature already runs in at least one file.

## Addendum 2026-10-17: the GitHub repo is the donor set

`https://github.com/deez-nodes/final_promptool.git` holds every version above plus the ones the matrix missed. Lift from here, not from the loose HTML files:

| Feature | Where in the repo | Note |
|---|---|---|
| Obsidian live-preview editor (CodeMirror 6, marks hidden off the cursor line, `01` gutter numbers, paste-splits-to-list, Vim compartment) | `versions/served-implementation/src/components/Writing.vue` | **Built. Port as is.** Vue, Nuxt UI v4 already. |
| Point parser, rootless XML serializer, Corrections form, section types + skeletons | `versions/served-implementation/src/model/{points,serialize,types}.ts` | Pure, no Vue imports, drop-in |
| Store with 50-deep undo, kanban landing Proposed Edits as cards | `versions/served-implementation/src/store/app.ts`, `components/KanbanPane.vue` | Pinia; map to a Nuxt composable |
| Platform shim (clipboard, state file vs localStorage, file picker) | `versions/served-implementation/src/lib/platform.ts` | Becomes the Electron/web switch |
| Typed-word autocomplete (words + Capitalised Phrases, bank terms rank first) | `src/complete.js` (+ tests), `composables/usePromptStore.ts` `harvest/getCandidates` | Tested |
| Term Bank with Tab cycling, modal | `components/TermBankModal.vue`, `usePromptStore.ts` | |
| Multi-target compilers: Anthropic XML, OpenAI messages, Gemini, Markdown, Python/TS SDK, `{{var}}` interpolation, model pricing | `composables/usePromptStore.ts` lines 195–400 | The LangChain/API export story |
| 30 CodeMirror themes mapped to palettes, OKLab palette generator | `versions/bolt-01/src/lib/{cm-themes,palettes,color}.ts` | `@uiw/codemirror-themes-all` |
| Template gallery (Engineering, Product, Analysis, Writing, Replies) | `versions/bolt-01/src/lib/templates.ts` | 767 lines of section skeletons |
| Vim: HUD + cheatsheet | `versions/promptor_v0_bridged.html`, `versions/served-implementation/promptor-mantine/src/model/{vim,cheatsheet}.ts` | Use codemirror-vim for the engine, keep the HUD design |
| Eval stub generator, subagent work packets | `promptor-mantine/src/model/{evalStub,subagent}.ts` | Later |
| Local bridge (one long-lived claude session, SSE) | `archive/bridge.js`, `archive/README.md` | The optional local assistant, as a separate opt-in process |
| Decisions log, PRDs, market research, 108 records | `docs/former/archived-documentation/DECIDED.md`, `docs/former/records/*PRODUCT.md` | Read PRODUCT.md first |

### PRODUCT.md conflicts D1–D10, resolved by today's decisions

- **D1 shell:** Electron wrapping the Nuxt app, Nitro inside. Tauri deferred.
- **D2 bridge:** an optional local assistant, off by default, LM Studio/Ollama on localhost, seeded with the prompting guides. Not "AI talking to AI": it tightens and checks your sections, beside the card, never over it.
- **D3 price:** $49 one-time, published. No subscription, no account, no telemetry.
- **D4 import/export:** backup and import allowed; the files are markdown on disk anyway.
- **D5 Vim:** toggle on F3, off by default, in v1. Trainer post-v1.
- **D6 quotes:** `<pasted_content id="…">` per Anthropic docs, with `<quote>/<source>/<comment>` inside.
- **D7 visual:** theme picker from VS Code JSON; the acid/cyan dark is the default theme, the `_MINTY` hue-per-job colors stay for section types.
- **D8 right pane:** kanban of edits stays (it exists); preview is a toggle, not a fixed pane.
- **D9 CSS:** Nuxt UI as shipped. The CSS-Modules-only rule is dropped for speed.
- **D10 base:** the Nuxt workspace (docus-main/playground, /promptor), lifting the served-implementation model layer and editor first.

### Rule override, 2026-10-17 (later beats earlier)

Default Nuxt components and composables with Nuxt UI components only. This overrides every "CodeMirror" and "Writing.vue" entry above: the editor is `UEditor` with markdown content type, toolbar and suggestion/mention menus from Nuxt UI; the typed-word autocomplete feeds `UEditorMentionMenu` from `harvest()`. Vim is deferred until Nuxt UI has it. Product rules still lift as pure functions. Framework behaviors come from Nuxt, Nuxt UI, Nuxt Content, VueUse or Nitro, never hand-rolled.

Vim: deferred, not in the build. The 272-line `promptor-mantine/src/model/vim.ts` is a Claude-written stub, not Vim and not the user's work; do not cite it as an asset or a starting point. Real Vim means a proper engine (e.g. codemirror-vim), which the Nuxt-UI-only rule excludes for now.
