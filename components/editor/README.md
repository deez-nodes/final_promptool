# components/editor (D3, section editor)

- `<EditorSectionEditor v-model="body" :role="type" :vim="vimOn" />`. Props: `modelValue: string`, `role` (role|context|goal|task|constraints|output|custom), `vim: boolean`. Emits `update:modelValue`, `focus`, `blur`. Exposes `focused` and `focus()`.
- CodeMirror 6, one instance per section, created in `onMounted` (client only). The store keeps the plain string; history is CodeMirror's, per section. Editor: "CodeMirror 6 in Obsidian Live Preview style".
- Live Preview: a `ViewPlugin` walks the lang-markdown syntax tree and adds decorations: headings styled per level, bold/italic/strike/code rendered, `#`/`*`/`` ` `` markup hidden except on the cursor's line. Editor: "Markdown converts on the spot, and headings are styled".
- Lists continue on Enter; Enter on an empty item ends the list (`insertNewlineContinueMarkupCommand({ nonTightLists: false })`). Layout: "Lists continue on Enter. (DZ-53)"
- A top-level numbered list shows as 01, 02 … (a "0" widget before 1-9); the stored text stays `1.`. What it is: "numbered points 01, 02 … The number is the address."
- `useVim()`: shared `enabled` (default false), `toggle`, `bindHotkey()` for F3. Vim: "A Vim toggle button, off by default, on F3."
- Hue: the root sets `--section-hue` (`--t-<role>`, custom inherits `--hue`) and `data-focused` / `$style.focused` when focused, for the card. Colour and type: "The focused section takes its hue on the whole card. (DZ-56)", DZ-57.
- Body face at 16px, nothing under 14px, no monospace in the body. Colour and type: "Body text 16px, nothing under 14px."
- CSS Modules only (`SectionEditor.module.css`, level-3 `--c-editor-*` tokens over `--t-*`), no class strings. Code: "No class strings, and no template literals."
- Ctrl+Enter is left to the app (Copy); soft wrap on, no gutter, auto-height up to 60vh. Keyboard first.
