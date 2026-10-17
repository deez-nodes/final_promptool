# PrompTOR status

Snapshot: 2026-09-20, branch `v1`. Git repo initialised this day; `main` = tag `baseline` (everything as found, including the old single-file app and `promptor-next.html`).

## Checkpoints on `v1` (each is a tag; branch from these)

| Tag | What changed | Why |
| --- | --- | --- |
| `cp1-export` | Typed text is copied raw in every format; inner Markdown headings drop one level under a named section | Hand-typed `<a1>` came out as `&lt;a1&gt;`; inner `# List` sat level with `# Agreements` |
| `cp2-controls` | Bordered controls, `#`/`</>` switch before the name, no Exclude, one Save as piece, no insert dropdown, no header buttons, coloured reply sections | Faint glyphs, redundant controls, purple-on-purple |
| `cp3-points` | `+ agreement` / `+ point`: numbered items exported as `<agree_01>…`; Alt+Enter next, Backspace removes | Tags isolate points for the model; typing them is the hardest input |
| `cp4-quotes` | Reply mode: pasted "Their reply" stays pinned; select → tap a section → quote becomes a point; nothing sent | Chat quote-reply takes one selection and fires early; cited text scrolls away |
| `cp5-lifetimes` | Keep, Next reply, arrangements that carry kept text and lead-ins, built-in Mode line | The same leading context was retyped in every message |
| `cp6-structure` | Split into `promptor.html` / `.css` / `.js` / `.seed.js`; stylesheet rewritten with tokens and one block per component | The minified single file forced find-and-replace patching and override-on-override CSS |

## Verification
`node verify.cjs` and `node verify-workflows.cjs` pass at every checkpoint (isolated Edge, Playwright from the Codex runtime path). `preview-workflow.png` inspected at cp2, cp3, cp4 and cp6. Preview panes render local files as `data:` snapshots (no sibling files, no localStorage), which is why saving failed there and why the split showed unstyled. Fixed by `serve.cjs` + `.claude/launch.json`: at `http://localhost:4173/` the pane shows the styled app and `Draft saved locally` with data in localStorage (checked 2026-09-20). The desktop shortcut opens the file in the default browser, where it also persists; the two are separate storage.

## Known gaps
- `promptor.js` is still dense one-statement-per-function code moved verbatim; it needs formatting (Prettier, with the user's OK to fetch it) so normal edits replace patch scripts.
- Live Markdown/tag highlighting is not built (isolated spike; likely CodeMirror + bundler).
- Reply quoting is manual selection only; auto-splitting is an open question.
- One conversation at a time (the reply draft). Multiple conversations undecided.
- Base sections are pulled through the Pull dialog, not listed one-click in the library.
- PLAN.md predates v1: its items 1–5 are largely covered by cp1–cp5; item 0 (real-host persistence) and item 6 (reading surface) remain.
