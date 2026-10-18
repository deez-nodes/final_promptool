# Bench

A notebook for prompts. One markdown document per prompt; headings are the sections. Snippets are inserted by typing `/`. Every save is a version. A run sends the prompt to a model and keeps the reply beside the version it came from, with a verdict. A prompt is not a document, it is an experiment with a history.

## Why it is this way
I am the one who reads prompts, so these are a reader's choices.
- I read top to bottom. One document matches that. Seven boxes make people fill boxes.
- Examples beat adjectives. Examples are a section with real input and output pairs, not a description of the output.
- Prompts change between runs and nobody remembers what changed. Versions and a diff.
- The reply is the only test there is. Runs live next to the version that produced them.
- Length is a cost I pay. Each section shows its weight in tokens.

## Theme (do not invent colors)
- Bearded Theme, HC Flurry: a cool white, high-contrast light theme. The JSON is in `theme/` with `theme/SOURCE.md`. Never edit it.
- At startup, `colors` become CSS variables on `:root` (`editor.background` → `--vscode-editor-background`). shadcn's variables and the CodeMirror theme read those. No color literal outside `theme/`, enforced by a lint step.
- Roles → keys, in `src/theme/roles.ts`, names only. All present in the JSON (checked 2026-09-26).

| Role | Key |
|---|---|
| page, editor | `editor.background`, `editor.foreground` |
| muted text | `descriptionForeground` |
| focus ring | `focusBorder` |
| prompts list | `sideBar.background`, `sideBar.foreground`, `sideBar.border` |
| top bar | `titleBar.activeBackground` |
| footer | `statusBar.background`, `statusBar.foreground` |
| buttons | `button.background`, `button.foreground` |
| search, note fields | `input.background`, `input.foreground` |
| menus, snippet picker | `dropdown.background` |
| list hover, selected | `list.hoverBackground`, `list.activeSelectionBackground` |
| selection, cursor | `editor.selectionBackground`, `editorCursor.foreground` |
| weight bars | `editorLineNumber.foreground` |
| diff added, removed | `diffEditor.insertedTextBackground`, `diffEditor.removedTextBackground` |
| verdict Worked, Didn't | `terminal.ansiGreen`, `terminal.ansiRed` |
| links | `textLink.foreground` |
| code fences | the JSON's `tokenColors`, through Shiki |

- One typeface, Literata from Google Fonts, for the document and the chrome. Code fences use the system monospace stack.

## On screen
- **Left:** prompts, newest first, search at the top. Resizable, no limits.
- **Top bar, fixed:** New · Save version · Run ▾ (a model list) · Copy XML · Copy markdown.
- **Middle:** the document. One CodeMirror instance, markdown with inline preview. The first line is the title (an H1). Each `##` heading starts a section. Along the right edge of each section a thin bar shows its share of the prompt's tokens; hover shows the number.
- **Right:** this prompt's notebook, three stacked lists. Versions: number, note, time; click opens it read-only with a Restore button. Compare: pick two versions, see a unified diff. Runs: model, time, verdict, note; click shows the full reply. Resizable, no limits.
- **Footer, fixed:** "v12 · saved 3 min ago · 1,840 tokens" on the left. On the right, for the latest run: Worked · Didn't · a one-line note.

## Actions
- Type `/` at the start of a line: the snippet picker opens, filtered as you type. Enter inserts. Slots written as `${1:name}` become tab stops; Tab moves through them. This is CodeMirror's own snippet support.
- Select text, right-click, Save as snippet: asks for a name and writes `snippets/<name>.md`. Snippets are plain markdown files and can be opened and edited like prompts.
- Autosave writes `prompt.md` on every pause. Save version copies it to `versions/NNNN.md` with an optional one-line note. Versions never change.
- Restore copies a version into the editor. Nothing is lost; the next Save version records it.
- Run compiles the document, sends the `role` section as the system prompt and the rest as the user message, and writes `runs/NNNN.json`: version, model, request, reply, tokens in and out, time. The key comes from `ANTHROPIC_API_KEY` on the server. There is no field for it.
- Worked and Didn't set the verdict on the latest run; the note field beside them is saved on blur.
- Compare shows a unified diff between any two versions.
- Copy XML puts the compiled prompt on the clipboard. Copy markdown puts the file on it as is. The footer says "Copied" for two seconds.
- Token counts come from the model's own count endpoint, per section, debounced one second, cached by the section's text. The footer shows the total.

## Output
```xml
<prompt title="Release notes writer">
<role>
Raw markdown. Only & becomes &amp; and < becomes &lt;.
</role>
<examples>
<example>
<input>
…
</input>
<output>
…
</output>
</example>
</examples>
<task>
…
</task>
</prompt>
```
- The H1 is the `title` attribute, omitted when there is none.
- Each `##` heading is an element named by its slug: lowercase, runs of anything but letters and digits become `_`, and it must start with a letter or it becomes `section`. When the slug differs from the heading text, the text goes in a `name` attribute.
- Text before the first `##` goes straight inside `<prompt>`.
- Under `## Examples`, each `### Input` followed by `### Output` becomes one `<example>`. `###` headings anywhere else stay as markdown.
- Empty sections are left out. Nothing is indented, so markdown indentation and blank lines survive exactly.
- Proved by tests. Never shown in the app.

## Data
Plain files under one folder, `~/bench` by default; Open folder changes it. Git-friendly on purpose.
```
prompts/<slug>/prompt.md
prompts/<slug>/versions/0001.md      (first line: the note, or blank)
prompts/<slug>/runs/0001.json
snippets/<name>.md
bench.json                           (models list, default model, folder)
trash/                               (deleted prompts move here, nothing is erased)
```

## Parts, standard only
Vite, React, TypeScript. Tailwind v4 with shadcn/ui stock components: Sidebar, Button, DropdownMenu, Input, Separator, Tooltip, ContextMenu. Class strings in `*.styles.ts` joined with `cn()`, none in JSX. `react-resizable-panels`, no limits. CodeMirror 6: `@codemirror/lang-markdown`, `@atomic-editor/editor` 0.6.2 for inline preview, `@codemirror/autocomplete` 6.20.3 for the snippet picker and fields, `@codemirror/merge` 6.12.2 for the diff, `codemirror-shiki` and `shiki` for code fences. One copy of every CodeMirror package; check with `npm ls @codemirror/state`. A Hono 4 server for files, runs, and token counts, using `@anthropic-ai/sdk` 0.128.0 (`messages.create`, `messages.countTokens`). `jsonc-parser` for the theme. Vitest; one Playwright smoke test. `npm start` runs server and UI.

## Files
- `src/model/compile.ts` — document → XML, and → { system, user } for a run. Pure.
- `src/model/sections.ts` — document → sections with ranges, for the weight bars. Pure.
- `src/model/slug.ts` — heading → element name. Pure.
- `src/theme/roles.ts`, `load.ts`, `shadcn.css`, `codemirror.ts`.
- `src/editor/Document.tsx` — the one editor: markdown, inline preview, snippet picker, weight gutter.
- `src/ui/` — Prompts, TopBar, Notebook (Versions, Compare, Runs), Footer, App, each with `.styles.ts`.
- `server/` — routes: prompts, prompt, versions, snippets, run, count.
- `theme/` — the JSON and SOURCE.md.

## Tests
- compile: title from H1; sections in document order; slugs and `name`; text before the first heading; Examples pairs; an unpaired `### Input` stays markdown; `&` and `<` escaped; empty sections omitted; the output parses with DOMParser and every section round-trips exactly; a fenced block containing `<div>` survives; the run split puts `role` in system and everything else in user.
- sections: ranges cover the document with no gaps; a document with no headings is one section.
- server: Save version numbers from 0001 and never overwrites; delete moves to `trash/`; run writes the JSON with the version number it was made from; count is cached by text.
- theme: every role resolves to a present key; the lint step finds no color literal outside `theme/`.
- smoke: new prompt, type a title and two sections, insert a snippet with `/` and tab through its fields, Save version, edit, Save version, Compare shows the change, Copy XML equals `compile()` of the file.

## Verify
Run it on a folder with three prompts and two snippets, the real theme loaded. Screenshot at 1440 and at a narrow width. All tests green. Do one real run against the default model and check the reply lands in the right panel under the right version.

## Rules
One document, not boxes. No cards, no numbers as headlines. No preview of the XML. The right panel is the notebook, not a preview. No color literal outside `theme/`. Nothing is ever erased: versions are immutable and deletes go to `trash/`. Empty states say what to do: "New prompt to start", "Save a version to see it here", "Run to see a reply here".
