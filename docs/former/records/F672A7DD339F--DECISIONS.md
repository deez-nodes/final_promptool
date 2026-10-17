# PromptTOR decisions

Baseline: `prompttor.html` as of 2026-09-25. It is the prototype, not the product shape. Change only what Minty asks for; every other behaviour in that file stands. Where this file differs from `docs/PRD.md`, `docs/Specs.md` or `docs/ADR-001-prompTOR-architecture.md`, this file wins. Later explicit direction from Minty wins over this file; add it here the same day, with a Linear item in project "Prompt Editor" (team DZ).

## What the tool is

- Writes prompts first; makes answering a model's reply easy second. The primary activity is answering the right item of a reply, and the tool must make finding that item cost nothing.
- The XML is for the model. The user never has to look at it or handle it. Copy (Ctrl+Enter) is the one primary action.
- The section is the reusable unit: an editable title (becomes the XML tag), lead text, and numbered points (01, 02 ...) that work as addresses in the reply. Empty sections drop out on Copy.
- Three reuse lifetimes: library (long-term), conversation, current message. An inserted copy is independent of its source.
- Prompt skeleton: Role, Context, Goal, Task, Constraints, Output Format. Reply skeleton: In Response To (quote first, points underneath), Agreements, Corrections, Proposed Edits, Questions.
- XML by default, no root element, text verbatim. Settled 2026-09-25. Not to be re-argued.
- A desktop app, not a browser page (DZ-58). The single HTML file is where the prototype lives until the shell is chosen.

## Design rules (kept)

- Neutral black and white surfaces. No tint, no haze. One vivid hue per semantic job at equal lightness: green = who (Role, Agreements); violet = what it knows (Context, Questions); blue = where it ends (Goal); cyan = what to do (Task, In Response To); red = limits (Constraints); amber = what comes back (Output Format, Proposed Edits). One action colour: inverted white on black or black on white.
- The colour follows the section's type, including custom titles (DZ-57). The focused section takes its hue on the whole card (DZ-56).
- Body 16px. Nothing under 14px. Mono only for tags, counts and hotkeys.
- No preview by default; the XML pane stays hidden until asked for. No format dropdown, no import/export in the header, no tags, no KEPT toggle.
- Controls live in a fixed action bar. Remove or merge controls before adding any. No piles of small buttons.
- Undo on every destructive action. Nothing sends. No model calls.

## Decided 2026-09-25

| Linear | Decision |
|---|---|
| DZ-46 | Section titles at heading-1 size, minimal, clear. Not the sidebar's size and colour. |
| DZ-47 | Panes resizable by dragging edges, movable, addable. Right pane: a second prompt to diff or merge, or the job board beside Proposed Edits. |
| DZ-48 | Library entries: no forced wrap-or-truncate rule. Only matters once the left pane is narrowed. |
| DZ-49 | Markdown typed in a field (`##`, `---`, ordered lists) survives into the XML as typed. |
| DZ-50 | In-place Markdown rendering (WYSIWYM): deferred, not rejected. "For this turn only, it's quite needed otherwise down the road." Target is Linear's editor. |
| DZ-51 | Add sections by chip and by typed name. The chip sets type and colour. More UI is allowed. |
| DZ-52 | Fold sections. Include/exclude stays a separate control. |
| DZ-53 | Ordered lists continue on Enter in any field, Obsidian-style. A pasted quote is numberable without retyping. |
| DZ-54 | Answer under the quote: a point holds the quoted line and the reply. Pasting a list into a point splits per line. The number is the address. This is the spec's annotation unit. |
| DZ-55 | Corrections section in the reply skeleton: "you said X; it is Y". Optional; drops out when empty. |
| DZ-56 | Focused section takes its rail colour on the whole card, as the earlier version did. |
| DZ-57 | Custom sections keep their semantic colour. A section named "contexts regarding responses" got grey; that is wrong. |
| DZ-58 | Desktop shell, not a browser page. Split the single file into modules once the shell is chosen. Tauri v2 was the earlier direction; DZ-39 tracks Electron. |
| DZ-59 | Pull `promptor-editor.html` from the GitHub archive as the design reference. Older, but the cleanest-looking build. |

## Not doing

- WYSIWYM rendering now (DZ-50).
- Variables, to-do items, cost dashboards, nested points, Git storage, IDE features, Vim mode (excluded by the PRD; still excluded).
- Tailwind, frameworks, network calls in the prototype.

## Tooling (settled 2026-09-25)

- Serena MCP: not now. It indexes multi-file codebases through language servers; there is nothing for it to index until DZ-58 splits the file.
- Playwright: no. Browser testing is not the target.
- Magic Patterns: not for this. It generates UI.
- Linear project "Prompt Editor" is the job board. Work items are called edits, not issues. This file and the board are kept in step.

## Sources

- `docs/PRD.md`, `docs/Specs.md`, `docs/ADR-001-prompTOR-architecture.md`, `docs/prompt-rewrite-synopsis.md` (2026-09-22). They describe `promptor-editor.html`, which is in the GitHub archive, not on this disk.
- "PrompTOR: Docs vs. Vision Review" (Claude Doc, 2026-09-23). Minty's markups there override the docs.
- Screen recordings of 2026-09-25: `promptor_example_usage.mp4`, `promptool_usage_latest.mp4` (in `C:\20_ARCHIVE\VIDEOS\Desktop`).
