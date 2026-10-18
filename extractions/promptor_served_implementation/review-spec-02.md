# PromptTOR

A prompt editor. A prompt is a title and seven sections in a fixed order: Role, Context, Goal, Constraints, Instructions, Task, Output format. You write markdown in each. Copy gives the prompt as XML with the markdown inside. Pieces you want again are saved to a library and dragged back into any section.

## Theme (do not invent colors)
- Bearded Theme, Arc. The JSON is in `theme/`, with `theme/SOURCE.md` saying where it came from. Never edit it.
- At startup the app reads `colors` and sets each as a CSS variable on `:root`: `editor.background` becomes `--vscode-editor-background`, and so on. shadcn's variables (`--background`, `--foreground`, `--sidebar`, `--primary`, `--border`, `--ring`, `--muted-foreground`, `--popover`, `--accent`, `--destructive`) are set from those in one CSS file. The CodeMirror theme is an `EditorView.theme` that reads the same variables.
- Roles map to keys, in `src/theme/roles.ts`, key names only. Every key below exists in the Arc JSON (checked 2026-09-26).

| Role | Key |
|---|---|
| page background | `editor.background` |
| text | `editor.foreground` |
| muted text (placeholders, footer state) | `descriptionForeground` |
| focus ring, drop target outline | `focusBorder` |
| rail and library | `sideBar.background`, `sideBar.foreground`, `sideBar.border` |
| top bar | `titleBar.activeBackground` |
| footer | `statusBar.background`, `statusBar.foreground` |
| buttons | `button.background`, `button.foreground` |
| title and search inputs | `input.background`, `input.foreground` |
| menus | `dropdown.background` |
| library row hover, selected | `list.hoverBackground`, `list.activeSelectionBackground` |
| text selection, cursor | `editor.selectionBackground`, `editorCursor.foreground` |
| Revert, and the × that removes | `errorForeground` |
| heading: Role | `terminal.ansiBlue` |
| heading: Context | `terminal.ansiGreen` |
| heading: Goal | `terminal.ansiYellow` |
| heading: Constraints | `terminal.ansiRed` |
| heading: Instructions | `terminal.ansiMagenta` |
| heading: Task | `terminal.ansiCyan` |
| heading: Output format | `terminal.ansiWhite` |
| heading: Custom | `editor.foreground` |
| code inside markdown | the JSON's `tokenColors`, through Shiki |

- A test asserts each role resolves to a present key. A lint step fails the build on any color literal outside `theme/`.
- One typeface: the system UI stack shadcn ships with. No second face, no monospace except inside code fences.

## On screen
- **Left:** a 52px icon rail with one icon, Library, and room for more. Then the library panel: search at the top; a Prompts group (rows show the title; × on hover); then seven groups, one per kind, of saved pieces, and a Custom group. Groups collapse. Resizable, no limits, can be dragged to nothing.
- **Top bar, fixed, 44px:** Add section ▾ (Role, Context, Goal, Constraints, Instructions, Task, Output format, Custom…) · New prompt · Undo.
- **Middle:** padding 36px 40px 72px, full width, no column cap. The title, 28px bold, placeholder "Untitled prompt". Then the sections, 30px apart. Each section is a heading, 21px bold in its kind's color, and under it the editor, transparent, 15px on a 1.7 line height. Controls appear on hover at the heading's right: Save to library, Clone, and × on clones and custom sections only. Sections never move.
- **Footer, fixed, 40px:** "Saved" or "Unsaved changes" · Revert · Save prompt · Save .xml · Copy.
- **Right:** an empty panel, resizable with no limits, dragged to nothing by default. Reserved.

Placeholders, one per kind: Role "Who the model is." · Context "What it needs to know." · Goal "What a good result achieves." · Constraints "What it must not do." · Instructions "How to work." · Task "What to do now." · Output format "What the answer looks like." · Custom: none.

## Actions
- Writing: CodeMirror 6 with inline markdown preview. Headings, emphasis, lists, links, and code render in place; the markdown syntax shows only on the line the cursor is on. Ctrl+Z inside an editor is the editor's own undo.
- Add section → a kind: a new empty section of that kind, placed right after the last section of that kind. Custom…: asks for a name in the menu, then adds it after Output format. Later custom sections follow it in the order added.
- Clone: the same as Add for that kind, with the text copied. ×: removes a clone or custom section. The base seven cannot be removed.
- Undo (top bar): reverses add, clone, remove, and drops, fifty steps. It does not touch typing.
- Save to library: asks for a name, defaulting to the section's first line cut to forty characters, and stores the text under the section's kind.
- Drag a library piece over a section: the section outlines in the focus color. Drop appends the piece's text after one blank line, or fills the section if it is empty. Any kind may drop into any section. Dropping anywhere else does nothing.
- Prompts list: click opens a prompt. Unsaved changes on the one you leave are kept as a draft, no dialog. × deletes; the footer shows "Deleted 'name' · Undo" for eight seconds.
- New prompt: a fresh untitled prompt with the seven empty sections, opened and selected.
- Save prompt stores it. Revert discards the draft and reloads the saved version. Save .xml downloads `<title-slug>.xml`. Copy puts the XML on the clipboard and the footer says "Copied" for two seconds.
- Search filters prompts by title and pieces by name and text.

## Output
```xml
<prompt title="Full-stack architect">
<role>
The markdown, exactly as typed. Nothing is escaped or rewritten.
</role>
<context>
...
</context>
</prompt>
```
- Element names: `role`, `context`, `goal`, `constraints`, `instructions`, `task`, `output_format`. A custom section's element is its name lowercased with runs of anything but letters and digits turned into `_`; if it does not start with a letter, it is `section`. The original name goes in a `name` attribute.
- Clones repeat the element in document order. Sections that are empty or whitespace are left out. The `title` attribute is left out when the title is empty.
- Text goes out verbatim: not escaped, not rewritten, spacing kept. Nothing is indented, so the markdown's own indentation and blank lines survive exactly.
- The XML is proved by tests and never shown in the app.

## Data
- Storage: localStorage. `promptor.prompts` (saved prompts), `promptor.pieces`, `promptor.drafts` (by prompt id), `promptor.version`.
- Prompt: `{ id, title, sections: [{ id, kind, name?, text }], savedAt }`. Piece: `{ id, kind, name, text, savedAt }`. Ids from `crypto.randomUUID()`.

## Parts, standard only
Vite, React, TypeScript. Tailwind v4. shadcn/ui stock components: Sidebar, Button, DropdownMenu, Collapsible, Input, Separator, Tooltip. Class strings live in `*.styles.ts` files as template literals and are joined with `cn()` (tailwind-merge over clsx); no class strings in JSX. `react-resizable-panels` for the three panes, no min or max. CodeMirror 6 with `@atomic-editor/editor`'s `inlinePreview` extension; keep one copy of each CodeMirror package (check with `npm ls @codemirror/state`). `codemirror-shiki` and `shiki` for code fences. `jsonc-parser` to read the theme. Vitest for unit tests, Playwright for one smoke test.

## Files
- `src/model/types.ts` — the two shapes above.
- `src/model/compile.ts` — prompt → XML string. Pure.
- `src/model/sections.ts` — add, clone, remove, drop, ordering rules, undo stack. Pure.
- `src/model/store.ts` — localStorage: prompts, pieces, drafts, delete with undo.
- `src/theme/roles.ts`, `src/theme/load.ts`, `src/theme/shadcn.css`, `src/theme/codemirror.ts`.
- `src/editor/SectionEditor.tsx` — one CodeMirror instance per section.
- `src/ui/` — Rail, Library, TopBar, Prompt, Section, Footer, App, each with its `.styles.ts`.
- `theme/` — the JSON and SOURCE.md.

## Tests
- compile: seven kinds in order; empty sections omitted; clones repeat; custom slugs and `name` attribute; one open and one close tag per non-empty section, in order, and the text between them is byte for byte what was typed; indentation, blank lines, `&`, and a fenced block containing `<div>` all survive untouched.
- sections: adding Context lands after the last Context; Custom lands last; removing a base section is refused; clone copies text; drop appends after one blank line or fills an empty section; undo restores each of add, clone, remove, drop.
- store: save, revert, draft kept when switching prompts, delete then undo.
- theme: every role resolves to a key present in the JSON; the lint step finds no color literal outside `theme/`.
- smoke: new prompt, type in Role, add a Context clone, save a piece, drag it into Task, Copy, the clipboard equals `compile()` of the state, reload, everything is still there.

## Verify
Run it with the real theme JSON loaded. Screenshot at 1440 wide and at a narrow width. Drag the left panel to nothing and back. All tests green.

## Rules
Sections stretch the full width. No cards, no numbers, no arrows, no include toggle, no preview, no output panel. Headings are headings, body is body. No color literal outside `theme/`. No custom component where a shadcn one exists. Library empty state: "Nothing saved yet. Hover a section and choose Save to library."

## Not this
The purple PrompTOR, the PROMPTOR workbench, the ANATOMY/#tags build, the adactio iterations, the terminal look.

## Later
Reply mode in the right panel: answer a long AI reply point by point.
