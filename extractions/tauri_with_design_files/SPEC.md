# PromptTOR spec, v0

Consolidated on 2026-09-26 from `review-spec-01.md` (Bench: one document, versions, runs; last written 14:05) and `review-spec-02.md` (PromptTOR: seven sections, a library; last written 18:39). `review-spec-03.md` is a byte-identical copy of 02. Where the two agree, this file states the decision once. Where they differ, a **Decide** block gives both, labelled **A** (02, PromptTOR) and **B** (01, Bench), plus **Build** for what `src/` does today when it differs from both. Open decisions are numbered D1 to D12 and are worked through in the Workshop section at the end.

## What it is
A place to write prompts in markdown and get them out as XML. Both specs agree on that sentence. They disagree on the shape of a prompt (D1), and everything else follows from that.

- **A:** A prompt is a title and seven sections in a fixed order: Role, Context, Goal, Constraints, Instructions, Task, Output format. Each section is its own editor. Pieces you want again go to a library and are dragged back into any section.
- **B:** One markdown document per prompt; `##` headings are the sections. Snippets are inserted by typing `/`. Every save is a version. A run sends the prompt to a model and keeps the reply beside the version that produced it, with a verdict. A prompt is an experiment with a history, not a document.
- **Build:** A conversation of messages, each a list of typed sections with its own editor; a message is a prompt or a reply. List items and quotes become numbered points in the output. Proposed Edits from a reply land on a kanban board.

## Why (from B; A gives no Why)
I am the one who reads prompts, so these are a reader's choices.
- I read top to bottom. One document matches that. Seven boxes make people fill boxes.
- Examples beat adjectives. Examples are a section with real input and output pairs, not a description of the output.
- Prompts change between runs and nobody remembers what changed. Versions and a diff.
- The reply is the only test there is. Runs live next to the version that produced them.
- Length is a cost I pay. Each section shows its weight in tokens.

What A implies without saying it: the same seven headings every time, in the same order, so prompts compare by shape; a kind per section, so headings carry a colour and the library groups by kind. Round 1 of the workshop either writes A's Why or drops A.

## Theme (do not invent colors)
Agreed:
- A Bearded Theme JSON in `theme/`, with `theme/SOURCE.md` saying where it came from. Never edit it.
- At startup the app reads `colors` and sets each as a CSS variable on `:root`: `editor.background` becomes `--vscode-editor-background`, and so on. shadcn's variables (`--background`, `--foreground`, `--sidebar`, `--primary`, `--border`, `--ring`, `--muted-foreground`, `--popover`, `--accent`, `--destructive`) are set from those in one CSS file. The CodeMirror theme is an `EditorView.theme` that reads the same variables.
- Roles map to keys in `src/theme/roles.ts`, key names only. A test asserts each role resolves to a present key. A lint step fails the build on any color literal outside `theme/`.
- Code inside markdown is coloured by the JSON's `tokenColors`, through Shiki.

**Decide D7, variant.** **A:** Arc. **B:** HC Flurry, a cool white, high-contrast light theme. Both JSONs are in `theme/` today; `SOURCE.md` documents only Arc (10.1.0 from Open VSX). Whichever is chosen, SOURCE.md must cover it and the other file goes. **Build:** neither; its own `--t-*` tokens in `src/assets/tokens.css` with system, light, dark and paper schemes.

Roles both specs use:

| Role | Key |
|---|---|
| page, editor | `editor.background`, `editor.foreground` |
| muted text (placeholders, footer state) | `descriptionForeground` |
| focus ring, drop target outline | `focusBorder` |
| left panel | `sideBar.background`, `sideBar.foreground`, `sideBar.border` |
| top bar | `titleBar.activeBackground` |
| footer | `statusBar.background`, `statusBar.foreground` |
| buttons | `button.background`, `button.foreground` |
| title, search, note fields | `input.background`, `input.foreground` |
| menus, pickers | `dropdown.background` |
| list hover, selected | `list.hoverBackground`, `list.activeSelectionBackground` |
| text selection, cursor | `editor.selectionBackground`, `editorCursor.foreground` |

Roles only A needs:

| Role | Key |
|---|---|
| Revert, and the × that removes | `errorForeground` |
| heading: Role | `terminal.ansiBlue` |
| heading: Context | `terminal.ansiGreen` |
| heading: Goal | `terminal.ansiYellow` |
| heading: Constraints | `terminal.ansiRed` |
| heading: Instructions | `terminal.ansiMagenta` |
| heading: Task | `terminal.ansiCyan` |
| heading: Output format | `terminal.ansiWhite` |
| heading: Custom | `editor.foreground` |

Roles only B needs:

| Role | Key |
|---|---|
| weight bars | `editorLineNumber.foreground` |
| diff added, removed | `diffEditor.insertedTextBackground`, `diffEditor.removedTextBackground` |
| verdict Worked, Didn't | `terminal.ansiGreen`, `terminal.ansiRed` |
| links | `textLink.foreground` |

**Decide D8, typeface.** **A:** the system UI stack shadcn ships; no second face, no monospace except inside code fences. **B:** one typeface, Literata from Google Fonts, for the document and the chrome; code fences use the system monospace stack. **Build:** Literata for section bodies, system UI for the chrome.

## On screen
Agreed: three panes, left and right resizable with no limits. A fixed top bar and a fixed footer. The middle is the writing surface. No cards.

**Decide D9, panels.**
- **Left. A:** a 52px icon rail with one icon, Library, and room for more. Then the library panel: search at the top; a Prompts group (rows show the title; × on hover); then seven groups, one per kind, of saved pieces, and a Custom group. Groups collapse. Can be dragged to nothing. **B:** prompts, newest first, search at the top. **Build:** the conversation's messages, then the library, then a Files button that adds uploaded text files as Context sections.
- **Top bar, fixed. A:** 44px. Add section ▾ (Role, Context, Goal, Constraints, Instructions, Task, Output format, Custom…) · New prompt · Undo. **B:** New · Save version · Run ▾ (a model list) · Copy XML · Copy markdown.
- **Middle. A:** padding 36px 40px 72px, full width, no column cap. The title, 28px bold, placeholder "Untitled prompt". Then the sections, 30px apart. Each section is a heading, 21px bold in its kind's colour, and under it the editor, transparent, 15px on a 1.7 line height. Controls appear on hover at the heading's right: Save to library, Clone, and × on clones and custom sections only. Sections never move. **B:** one CodeMirror instance, markdown with inline preview. The first line is the title (an H1). Each `##` heading starts a section. Along the right edge of each section a thin bar shows its share of the prompt's tokens; hover shows the number.
- **Right. A:** an empty panel, dragged to nothing by default. Reserved; later, reply mode. **B:** this prompt's notebook, three stacked lists. Versions: number, note, time; click opens it read-only with a Restore button. Compare: pick two versions, see a unified diff. Runs: model, time, verdict, note; click shows the full reply. **Build:** a kanban board, To do · Doing · Done, with checklists on cards.
- **Footer, fixed. A:** 40px. "Saved" or "Unsaved changes" · Revert · Save prompt · Save .xml · Copy. **B:** "v12 · saved 3 min ago · 1,840 tokens" on the left; on the right, for the latest run, Worked · Didn't · a one-line note.

Placeholders and empty states say what to do.
- **A**, one per kind: Role "Who the model is." · Context "What it needs to know." · Goal "What a good result achieves." · Constraints "What it must not do." · Instructions "How to work." · Task "What to do now." · Output format "What the answer looks like." · Custom: none. Library: "Nothing saved yet. Hover a section and choose Save to library."
- **B:** "New prompt to start" · "Save a version to see it here" · "Run to see a reply here".

## Actions
Agreed:
- Writing is CodeMirror 6 with inline markdown preview. Headings, emphasis, lists, links and code render in place; the markdown syntax shows only on the line the cursor is on. Ctrl+Z inside an editor is the editor's own undo.
- Copy puts the compiled XML on the clipboard and the footer says "Copied" for two seconds.
- Search at the top of the left panel filters what the panel lists (A: prompts by title, pieces by name and text).

**Decide D3, reuse.**
- **A**, library and drag: Save to library asks for a name, defaulting to the section's first line cut to forty characters, and stores the text under the section's kind. Drag a piece over a section: the section outlines in the focus colour. Drop appends the piece's text after one blank line, or fills the section if it is empty. Any kind may drop into any section. Dropping anywhere else does nothing.
- **B**, snippets: type `/` at the start of a line and the snippet picker opens, filtered as you type. Enter inserts. Slots written as `${1:name}` become tab stops; Tab moves through them. This is CodeMirror's own snippet support. Select text, right-click, Save as snippet: asks for a name and writes `snippets/<name>.md`. Snippets are plain markdown files and can be opened and edited like prompts.
- **Build:** a library of whole sections; click one to append a copy to the current message. No drag, no slots.

**Decide D1, structure editing (follows from the document model).**
- **A:** Add section → a kind: a new empty section of that kind, placed right after the last section of that kind. Custom…: asks for a name in the menu, then adds it after Output format; later custom sections follow in the order added. Clone: the same as Add for that kind, with the text copied. ×: removes a clone or custom section; the base seven cannot be removed. Undo in the top bar reverses add, clone, remove and drops, fifty steps; it does not touch typing. New prompt: a fresh untitled prompt with the seven empty sections, opened and selected.
- **B:** there is no structure to edit. A heading is a section. New prompt is an empty document.
- **Build:** add, duplicate, rename, retype, move, merge, fold, exclude and delete any section; undo of the destructive ones as whole-state snapshots, fifty steps.

**Decide D4, history.**
- **A:** Save prompt stores it. Unsaved changes on a prompt you leave are kept as a draft, no dialog. Revert discards the draft and reloads the saved version. × on a prompt deletes it; the footer shows "Deleted 'name' · Undo" for eight seconds. Save .xml downloads `<title-slug>.xml`.
- **B:** autosave writes `prompt.md` on every pause. Save version copies it to `versions/NNNN.md` with an optional one-line note; versions never change. Restore copies a version into the editor; nothing is lost, the next Save version records it. Compare shows a unified diff between any two versions. Deleted prompts move to `trash/`. Copy markdown puts the file on the clipboard as is.
- **Build:** autosave of the whole state, no versions, no revert.

**Decide D6, running and tokens.**
- **A:** none. You paste the XML into a chat.
- **B:** Run compiles the document, sends the `role` section as the system prompt and the rest as the user message, and writes `runs/NNNN.json`: version, model, request, reply, tokens in and out, time. The key comes from `ANTHROPIC_API_KEY` on the server; there is no field for it. Worked and Didn't set the verdict on the latest run; the note beside them saves on blur. Token counts come from the model's own count endpoint, per section, debounced one second, cached by the section's text; the footer shows the total.
- **Build:** no runs, but a reply mode: a reply message has In Response To, Agreements, Corrections, Proposed Edits and Questions, and Copy also lands the Proposed Edits on the board as cards. This is A's "Later" item, built.

## Output
Agreed:
```xml
<prompt title="Release notes writer">
<role>
The markdown.
</role>
<task>
…
</task>
</prompt>
```
- The `title` attribute is left out when the title is empty.
- Each section is an element named by its slug: lowercase, runs of anything but letters and digits become `_`, and it must start with a letter or it becomes `section`. When the slug differs from the heading text, the text goes in a `name` attribute.
- Sections that are empty or whitespace are left out. Nothing is indented, so the markdown's own indentation and blank lines survive exactly.
- The XML is proved by tests and never shown in the app.

**Decide D10, escaping.** **A:** text goes out verbatim; nothing is escaped or rewritten; a fenced block containing `<div>` survives untouched. **B:** only `&` becomes `&amp;` and `<` becomes `&lt;`, so the output parses with DOMParser and every section round-trips.

Only in A: the seven elements are `role`, `context`, `goal`, `constraints`, `instructions`, `task`, `output_format`; clones repeat the element in document order.

Only in B (**D2**): text before the first `##` goes straight inside `<prompt>`. Under `## Examples`, each `### Input` followed by `### Output` becomes one `<example>` with `<input>` and `<output>`; `###` headings anywhere else stay markdown; an unpaired `### Input` stays markdown.

**Build:** no root element; the tag is the title with whitespace turned to `_`, case kept; list items and `>` quotes become numbered points `01`, `02`…; a section titled Corrections writes `NN you said X; it is Y`.

## Data
**Decide D5, storage.**
- **A**, localStorage: `promptor.prompts` (saved prompts), `promptor.pieces`, `promptor.drafts` (by prompt id), `promptor.version`. Prompt `{ id, title, sections: [{ id, kind, name?, text }], savedAt }`. Piece `{ id, kind, name, text, savedAt }`. Ids from `crypto.randomUUID()`.
- **B**, plain files under one folder, `~/bench` by default; Open folder changes it. Git-friendly on purpose.
  ```
  prompts/<slug>/prompt.md
  prompts/<slug>/versions/0001.md      (first line: the note, or blank)
  prompts/<slug>/runs/0001.json
  snippets/<name>.md
  bench.json                           (models list, default model, folder)
  trash/                               (deleted prompts move here, nothing is erased)
  ```
- **Build:** one JSON blob, `promptor.state.v1` in localStorage, plus `state.json` in the Tauri app-data folder when running as a desktop app.

## Parts, standard only
Agreed: Vite, React, TypeScript. Tailwind v4 with shadcn/ui stock components: Sidebar, Button, DropdownMenu, Input, Separator, Tooltip (A adds Collapsible; B adds ContextMenu). Class strings live in `*.styles.ts` files as template literals joined with `cn()` (tailwind-merge over clsx); none in JSX. `react-resizable-panels` for the panes, no min or max. CodeMirror 6 with `@codemirror/lang-markdown` and `@atomic-editor/editor`'s `inlinePreview`; keep one copy of every CodeMirror package (check with `npm ls @codemirror/state`). `codemirror-shiki` and `shiki` for code fences. `jsonc-parser` to read the theme. Vitest for unit tests, Playwright for one smoke test.

Only B: `@codemirror/autocomplete` for the snippet picker and fields, `@codemirror/merge` for the diff, a Hono 4 server for files, runs and token counts using `@anthropic-ai/sdk` (`messages.create`, `messages.countTokens`). `npm start` runs server and UI. B pins `@atomic-editor/editor` 0.6.2, `@codemirror/autocomplete` 6.20.3, `@codemirror/merge` 6.12.2 and `@anthropic-ai/sdk` 0.128.0 as of 2026-09-26; re-check at build time.

**Decide D11, the build.** `src/` is Vite, Vue 3, Pinia, Nuxt UI v4, CSS Modules, a hand-rolled CodeMirror live preview, `@replit/codemirror-vim`, and Tauri v2 for a desktop window. None of that is in either spec.

## Files
Agreed: `theme/` holds the JSON and SOURCE.md. `src/theme/roles.ts`, `load.ts`, `shadcn.css`, `codemirror.ts`. `src/model/compile.ts` is pure and turns the prompt into the XML string. Every `src/ui/` component has its `.styles.ts`; App, TopBar and Footer are in both.

- **A:** `src/model/types.ts` (the two shapes), `sections.ts` (add, clone, remove, drop, ordering rules, undo stack; pure), `store.ts` (localStorage: prompts, pieces, drafts, delete with undo). `src/editor/SectionEditor.tsx`, one CodeMirror instance per section. `src/ui/` Rail, Library, Prompt, Section.
- **B:** `compile.ts` also gives `{ system, user }` for a run. `sections.ts` (document → sections with ranges, for the weight bars; pure), `slug.ts` (heading → element name; pure). `src/editor/Document.tsx`, the one editor: markdown, inline preview, snippet picker, weight gutter. `src/ui/` Prompts, Notebook (Versions, Compare, Runs). `server/` routes: prompts, prompt, versions, snippets, run, count.

## Tests
Agreed:
- compile: sections in document order; empty sections omitted; slugs and the `name` attribute; one open and one close tag per non-empty section; indentation and blank lines survive exactly; a fenced block containing `<div>` survives (A: byte for byte; B: escaped, and the output round-trips through DOMParser).
- theme: every role resolves to a key present in the JSON; the lint step finds no color literal outside `theme/`.
- smoke ends the same way in both: Copy, and the clipboard equals `compile()` of the state.

Only A: compile: seven kinds in order; clones repeat; `&` untouched. sections: adding Context lands after the last Context; Custom lands last; removing a base section is refused; clone copies text; drop appends after one blank line or fills an empty section; undo restores each of add, clone, remove, drop. store: save, revert, draft kept when switching prompts, delete then undo. smoke: new prompt, type in Role, add a Context clone, save a piece, drag it into Task, Copy, reload, everything is still there.

Only B: compile: title from H1; text before the first heading; Examples pairs; an unpaired `### Input` stays markdown; the run split puts `role` in system and everything else in user. sections: ranges cover the document with no gaps; a document with no headings is one section. server: Save version numbers from 0001 and never overwrites; delete moves to `trash/`; run writes the JSON with the version number it was made from; count is cached by text. smoke: new prompt, a title and two sections, insert a snippet with `/` and tab through its fields, Save version, edit, Save version, Compare shows the change.

## Verify
Agreed: run it with the real theme JSON loaded. Screenshot at 1440 wide and at a narrow width. All tests green.
- **A:** drag the left panel to nothing and back.
- **B:** run it on a folder with three prompts and two snippets. Do one real run against the default model and check the reply lands in the right panel under the right version.

## Rules
Agreed: no cards. No numbers as headlines (A: no numbers at all). No preview of the XML, no output panel. No color literal outside `theme/`. Empty states say what to do.
- **A:** sections stretch the full width. Headings are headings, body is body. No arrows, no include toggle. No custom component where a shadcn one exists.
- **B:** one document, not boxes. The right panel is the notebook, not a preview. Nothing is ever erased: versions are immutable and deletes go to `trash/`.
- **Build** breaks these today: cards on the board, numbered points, an include toggle, section moving, its own colours.

## Not this
The purple PrompTOR, the PROMPTOR workbench, the ANATOMY/#tags build, the adactio iterations, the terminal look. **D12:** does the Vue build in `src/` join this list, or does the spec absorb parts of it?

## Later
- **A:** reply mode in the right panel: answer a long AI reply point by point. The build has a version of this.
- Anything from an unchosen option that is wanted, but not now.

## Workshop
Four rounds, one version of this file per round, decisions logged at the bottom. Each round I post the decisions in scope with the options as they read above, one line of consequence each, and my lean. You answer in a line per decision. I fold the answer in, delete the losing text or move it to Later or Not this, bump the version, and log it. The review-spec files stay as the record and are not edited.

**Round 1, the shape of a prompt: D1, D2, D3, D10.** Everything else depends on D1. I write the Middle, Actions and Output sections three ways to read side by side: A as written, B as written, and a hybrid: one document with `##` headings, where New prompt seeds the seven headings and a heading's slug gives it a kind, so A's colours, placeholders and library-by-kind still work with B's single editor and diff. My lean is the hybrid, because B's Why is written and A's is not, and the hybrid loses nothing A lists except "sections never move". On D10 my lean is A, verbatim: the reader is a model, not a parser, and escaped code fences mislead it.

**Round 2, memory: D4, D5, D6.** This decides whether there is a server. My lean: B's versions and trash (A's drafts and revert are a subset of them), files on disk since Tauri already has file access, and Run and token counts moved to Later, because the build's reply mode shows the paste-into-chat loop already works for you.

**Round 3, the chrome: D7, D8, D9.** Theme variant, typeface, and what sits in each panel and bar, settled after the shape is known so every panel has a known job. SOURCE.md is fixed in this round.

**Round 4, the build: D11, D12.** Keep, port or restart. The pure model code (`points.ts`, `serialize.ts`) ports to either stack unchanged. Whatever is kept from the build (reply mode, the board, numbered points, Vim, Tauri) is either written into this spec or added to Not this. Then Files and Tests are rewritten to match, and the result is v4, the build-ready spec.

## Decisions
- 2026-09-26 · v0 · Consolidated review-spec-01 and review-spec-02; review-spec-03 found identical to 02. No product decisions taken.
