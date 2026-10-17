# Promptor

XML prompt composer. React + Chakra UI + CodeMirror 6. Pick a template, the
editor prefills a best-practice XML scaffold, edit it, copy the prompt.

## Run

```bash
npm install
npm run dev      # opens http://localhost:5180
```

## Templates

| Template          | Use for                                              |
| ----------------- | ---------------------------------------------------- |
| General           | non-code asks (writing, analysis, reasoning)         |
| Dev / Code        | refactors/changes against a known stack              |
| Trading / Quant   | strategy/scanner work where domain beliefs matter    |
| Claude Code Task  | one scoped, dependency-aware Claude Code ticket       |

Field order follows Anthropic's canonical prompt component order:
role/context → background → reference/state → task → constraints → output format.

## Editor features

- **XML prefilled** per selected template (switching templates re-prefills).
- **Autocomplete**: type `<` to get tag-block snippets. Active-template tags
  rank first, then shared best-practice tags (`<thinking>`, `<example>`, etc.).
  Tab cycles snippet fields.
- **Formatting toolbar**: wrap selection in any tag, insert quick blocks,
  toggle comment, indent/outdent.
- **Bracket matching + auto-close.**

## Keybindings (VS Code style)

| Action                         | Key                         |
| ------------------------------ | --------------------------- |
| Duplicate line down            | `Shift+Alt+↓`               |
| Duplicate line up              | `Shift+Alt+↑`               |
| Move line down                 | `Alt+↓`                     |
| Move line up                   | `Alt+↑`                     |
| Expand selection (syntax)      | `Shift+Alt+→`               |
| Select inside brackets         | `Alt+A`                     |
| Jump to matching bracket       | `Ctrl/Cmd+Shift+\` or `Alt+M` |
| Indent / outdent               | `Ctrl/Cmd+]` / `Ctrl/Cmd+[` |
| Toggle comment                 | `Ctrl/Cmd+/`                |
| Indent with Tab                | `Tab`                       |

## Files

```
src/
  main.jsx            ChakraProvider entry
  App.jsx             layout: header, template select, toolbar, editor, footer
  theme.js            Chakra dark/neon theme
  templates.js        template registry + XML prefill builders
  PromptEditor.jsx    CodeMirror 6 wrapper + extensions
  editorKeymap.js     VS Code keybinds + custom bracket commands
  editorActions.js    toolbar edit helpers (wrap/insert/comment/indent)
  completions.js      XML tag-snippet autocomplete source
```

## Extending

Add a template: drop a new entry in `TEMPLATES` (templates.js) with `label`,
`tags`, and a `build()` returning the prefilled XML string. It appears in the
dropdown, autocomplete, and wrap-tag menu automatically.
