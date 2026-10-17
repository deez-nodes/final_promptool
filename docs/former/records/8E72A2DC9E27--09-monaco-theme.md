# 09 — Integrate rich Markdown editing

Status: Complete — amended by user review

## Dependencies

07; integrate alongside 08 before Phase 2 closes.

## Build task

The user's rich-editing correction supersedes Monaco syntax coloring. Use a bundled rich editor in the existing EditorSurface component. Convert Markdown heading/list/inline emphasis shorthand into formatted content while typing. Keep Markdown output outside design state; reveal the current block's raw output on hover. Preserve the editor, caret, text and undo during theme, inspector and layout updates. Honor Select/Interact mode. Shared and parent style traits must still reach the editing surface.

## Outside this task

Full prompt IDE, reference Vim behavior, accounts, arbitrary code editing, persistence or export UI.

## Acceptance checks

- [x] Interact supports editing; Select supports component selection without editing.
- [x] # and space create an actual heading.
- [x] - and * with space create lists; Enter continues, empty Enter exits.
- [x] **bold**, __bold__, *italic*, _italic_ format inline.
- [x] Hover reveals normalized raw Markdown without moving the editing area.
- [x] Theme/style/layout/mode changes preserve instance, caret, text and undo.
- [x] Editor and font assets load locally in browser and desktop.
- [x] Light and dark remain readable.

## Completion record

- Files changed: EditorSurface.vue, main.ts, bridged-theme.css, App.vue, dependencies/lockfile, phase2 and rich-markdown tests.
- Checks and results: 15 tests pass, including actual Electron close/reopen. Type check and production build pass. Bundled Tiptap + StarterKit + Markdown replaces Monaco. Reference behavior was not imported.
- Known limitations: Markdown output is normalized; hover reveals a whole block or list, not byte-for-byte original delimiter spelling. Edits remain session-only. Monaco phase evidence is historical and superseded.
