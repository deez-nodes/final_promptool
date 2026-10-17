# PromptTOR

Writes prompts as sections; makes answering a model's reply easy. See `../DECIDED.md`.

Stack: Vite + Vue 3 + Nuxt UI (Vite plugin, styled through CSS Modules) + CodeMirror 6 + Tauri v2.

## Run

```bash
npm install
npm run dev          # web at http://localhost:1420
npm run tauri dev    # desktop window (needs Rust: https://rustup.rs)
npm run build        # dist/
```

## Keys

- Ctrl+Enter: copy the message as XML
- F3: Vim toggle (off by default)
- Ctrl+Z outside an editor: undo the last delete, merge or clear
- Alt+N / Alt+Shift+N: new prompt / new reply
- Alt+Up / Alt+Down inside a section: move it
