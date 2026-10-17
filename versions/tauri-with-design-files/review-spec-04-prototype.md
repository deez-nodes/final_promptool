# Review spec 04: the Magic Patterns prototype

Recorded on 2026-09-27 from `magic-pattern_prototype.mp4`, a 2 min 02 s screen recording of the Magic Patterns project "PromptTOR Workbench Interface - Fork - Fork", v12. This file is an input to `SPEC.md` like 01 and 02, and is labelled **P** there. It describes only what the recording shows. What the recording does not show is listed at the end and is not guessed.

## What it is
A prompt is a title and a list of sections. Each section has a title, a kind that gives it a colour, and a body made of lines. The prompt is copied out as XML or as Markdown. A task list sits beside it.

## On screen
Three panes, a top bar and a footer.

- **Top bar.** The name "PROMPTOR // PROMPT WORKBENCH" on the left. On the right: a theme picker (seen: Promptor Grey, Monokai Black, Black & Gold), Undo, Redo, Save, and a reset button.
- **Left, Library.** A count ("8 pieces") and a search field. Pieces are grouped by kind: Role, Context, Instructions, Constraints, two pieces each. A search with no match keeps the four group headings and says `No pieces match "stud".`
- **Middle.** The title, in capitals, cut short when the pane is narrow. Beside it: two tabs, Base prompt and Mid-task reply; a two-way switch, XML and MD; and Copy prompt. Then the sections, then "+ new section". With no sections: "No sections. Add one, or insert a piece from the library."
- **Right, Tasks.** A column "To Do" with a count and a "…" menu. Each task is a row with a round checkbox. "+ Add task" opens a name field with Cancel and Add task. A horizontal scrollbar suggests more columns off screen; only To Do is seen.
- **Footer.** Left: "Unsaved changes", "6/6 sections sent", a word count, a character count. Right: "Enter new line · Shift+Enter line break · Backspace on empty removes it".

## A section
- A heading row: fold arrow, a square in the kind's colour, the title in the same colour. At the right: move up, move down, an eye that includes or excludes the section, and delete.
- The title is edited in place. Renaming does not change the kind: a section made as Instructions and renamed "Approach 1" keeps the Instructions colour.
- "+ new section" makes a section titled "New section" with no kind, shown grey. Sections titled "Instructions" and "Contraints" made this way stay grey.
- The body is a list of lines, not one editor. Each line is its own row. The placeholder is "Write here. Enter for a new line." Below the lines: "+ Add line". The focused line shows an × that removes it.
- An empty section shows "Empty · skipped". A folded section shows its line count, "2 bullets".
- Numbers typed by the writer ("1.", "2.") are text. The app adds no numbering.

## Actions
- **Library.** Hovering a piece shows "+" with the tooltip "Add to Instructions" (the piece's kind). Clicking it when no section of that kind exists makes one, titled by the kind, holding the piece's text as one line. No drag is seen.
- **Tasks.** Checking a task strikes it through and moves it below the open ones; the count drops. Tasks are typed by hand. Nothing in the recording links a task to a section.
- **Format switch.** XML is selected at the start; the recording ends on MD. The word and character counts change with the switch (259 words, 1675 characters on XML; 261 and 1610 on MD).

## Output
The recording never shows the copied text. The Magic Patterns change note visible in the recording describes it, and this is the only source:
- XML: each section's text between its tags, as in `<context>`.
- MD: each section's text under a `## Context` heading, one blank line between heading and text.
- In both, lines go out as typed, and excluded or empty sections are left out.
- The switch returns to XML on reload.

## Against the decisions

| Decision | P |
|---|---|
| D1 structure | Free sections: add, rename, move, fold, exclude, delete. Kinds give colour. Nearest to **Build**. Differs from all three on the body: a list of lines, where A, B and Build all use a Markdown editor. |
| D2 examples | Not shown. |
| D3 reuse | A library grouped by kind (as A), inserted by click (as Build). A click can create the section. No drag, no slots. |
| D4 history | Save, "Unsaved changes", Undo, Redo, reset. Nearest to **A**. No versions. |
| D5 storage | Not shown. |
| D6 runs | None. A Mid-task reply tab exists; its content is not shown. |
| D7 theme | Its own named themes. Not the Bearded JSON. |
| D8 typeface | Monospace for body and chrome, a heavy display face for titles. Neither A nor B. |
| D9 panels | Left: library only. Right: tasks. Top: theme, undo, redo, save, reset. Footer: state, counts, key hints. |
| D10 escaping | Verbatim, as **A**, per the change note. |
| D11, D12 | P has the shape of the Vue build more than of either spec. |
| new, **D13** output format | An XML and MD switch beside Copy. B's top bar has Copy XML and Copy markdown as two buttons; A and Build have XML only. |

## Against the Rules and Not this
P breaks these Rules in `SPEC.md`: no cards (tasks are cards), no include toggle (the eye), no arrows (move up, move down), no numbers (footer counts, line counts), no colour literal outside `theme/` (its own themes).

`SPEC.md` lists "the PROMPTOR workbench" and "the terminal look" under Not this. P carries that name and that look. Either P replaces that entry or P is one of the rejected builds; the owner says which.

## Not in P
- The numbered points, the Corrections form, and the point gutter of the build.
- A conversation of messages. P has one prompt with two tabs.
- File upload.
- Placeholders in the text (`{{name}}`), versions, runs, token counts.
- Vim.

## Not shown
The Mid-task reply tab. The copied text in either format. What Save stores and where. Whether there is a root element. Other task columns. How a piece behaves when a section of its kind already exists. Light themes. Narrow widths.
