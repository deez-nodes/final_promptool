# PromptTOR: decided

Your Sep 25 decisions record (recovered from git, `2aa651d`) with every change you've made since. Where the two disagree, the later one is used.

## What it is
- Writes prompts first; makes answering a model's reply easy second. Answering the right item of a reply is the main activity.
- The section is the unit: a title (which becomes the XML tag), lead text, and numbered points 01, 02 … The number is the address.
- Prompt skeleton: Role, Context, Goal, Task, Constraints, Output Format.
- Reply skeleton: In Response To (the quote first, points under it), Agreements, Corrections, Proposed Edits, Questions.
- Answer under the quote: a point holds the quoted line and your answer. A pasted list splits into one point per line. (DZ-54)
- Corrections reads "you said X; it is Y", and drops out when empty. (DZ-55)
- Three reuse levels: the library, the conversation and the current message. An inserted copy is independent of its source.
- Output is XML, with no root element. Text goes out verbatim: not escaped, not rewritten, spacing kept. Markdown goes out with it (DZ-49).
- Copy (Ctrl+Enter) is the one primary action. You never see or handle the XML.
- Empty sections drop out. Nothing sends, and there are no model calls.
- Desktop app, not a browser page, not a single HTML file.
- Local only: no cloud, accounts or sync, no import or export. File uploads from the side are allowed.
- For a human talking to AI. No bridge, no AI talking to AI.

## Layout
- Section titles are clear headings, not the sidebar's size or colour. (DZ-46)
- Panes are resizable, movable and addable. (DZ-47)
- Add a section by chip or by typed name. The chip sets its type and colour. (DZ-51)
- Sections fold. Include is a separate control. (DZ-52)
- Lists continue on Enter. (DZ-53)
- The output stays hidden until asked for. No preview pane.
- Fixed action bar: remove or merge controls before adding any.
- Undo on every destructive action.
- Keyboard first.
- Right pane: a Trello-style Kanban with bordered columns, cards coloured by meaning, and checkboxes inside. Edits from your replies land there as cards.

## Colour and type
- Neutral black-and-white surfaces, with no tint and no haze. Readable text is neutral.
- The `_MINTY` palette:
  - green = who
  - violet = what it knows
  - blue = where it ends
  - cyan = what to do
  - red = limits
  - amber = what comes back
- One inverted action colour.
- Colour follows the section's type, custom sections included. (DZ-57)
- The focused section takes its hue on the whole card. (DZ-56)
- Body text 16px, nothing under 14px. Monospace only for tags, counts and hotkeys.
- Themes you can cycle through. Styling is by element: each heading level, bold, italic, and your own sections, not just the seeded ones.

## Editor
- Obsidian Live Preview style: Markdown converts on the spot, and headings are styled.

## Code
- Tailwind and shadcn only through CSS Modules, in levels: raw tokens, then semantic roles, then components. No class strings, and no template literals.

## Words and tools
- Work items are called edits, not issues.
- Dropped:
  - Linear
  - Playwright
  - Magic Patterns
  - Super Productivity
  - Obsidian Kanban
  - Serena, for now

## Stack
- **Nuxt, with Nuxt UI styled through CSS Modules.** You called it the most reliable. Nuxt UI already ships the resizable panels, sidebar, tree library, tabs, command palette and editor parts. 10's IDE shell is Nuxt.
- **Tauri v2 for the desktop.** It was the original direction, 08 and 09 were built on it, and it's the stack in your Tauri dashboard plan.
- **Editor: CodeMirror 6 in Obsidian Live Preview style**, not Nuxt UI's Tiptap editor.

## Vim
- **A Vim toggle button, off by default, on F3.** You asked for it on Sep 15 ("like the original damn design months ago"), and 12, the one you'd buy, has it. The Sep 25 "not doing" came from the PRD, which you called outdated.
