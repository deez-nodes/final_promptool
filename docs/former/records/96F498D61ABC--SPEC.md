# Session, seen whole

A desktop tool for reading and annotating Claude Code sessions. The transcript is drawn as one strip of marks; you click and drag on the strip to read turns and to name stretches of the session. Nothing in the transcript is ever changed.

Reference draft: `session.html` beside this file. It is the look to match, except its colors, which the theme now decides.

## Theme (do not invent colors)
- Theme: **Cobalt2** by Wes Bos. MIT. Repo `wesbos/cobalt2-vscode`, file `theme/cobalt2.json` on `master`.
- `npm run theme` downloads that file to `theme/cobalt2.json` and writes `theme/SOURCE.md` with the URL, commit SHA, date, and license. Commit both. Never edit the JSON.
- At startup the app reads `colors` from the JSON and sets each as a CSS variable on `:root`: `editor.background` becomes `--vscode-editor-background`, and so on.
- Roles map to keys, in `src/theme/roles.ts`, key names only:

| Role | Key |
|---|---|
| page background | `editor.background` |
| text, and the person's marks | `editor.foreground` |
| my marks (I am the cursor) | `editorCursor.foreground` |
| tool ticks, muted text | `editorLineNumber.foreground`, `descriptionForeground` |
| baseline, rests | `editorIndentGuide.background` |
| selection on the strip | `editor.selectionBackground` |
| focus ring | `focusBorder` |
| sidebar | `sideBar.background`, `sideBar.foreground` |
| top bar | `titleBar.activeBackground` |
| footer | `statusBar.background` |
| buttons | `button.background`, `button.foreground` |
| inputs | `input.background` |
| region labels | `editorWidget.background` |
| selected list row | `list.activeSelectionBackground` |

- Every key above exists in Cobalt2 (checked 2026-09-26). A test asserts each role resolves to a present key. A lint step fails the build on any color literal outside `theme/`.
- One typeface: Newsreader from Google Fonts, serif fallback. Italic only for the page title.

## On screen
- **Left:** sessions, grouped by project folder, newest first. Search at the top. Each row: date, length, and a small strip of that session. Resizable, no limits.
- **Top bar, fixed:** Open folder · Hide machine turns (on by default) · Scale Log / Linear · Rests over [30] min · Find in session · Copy outline · Save strip as SVG.
- **Middle, upper:** the strip. Marks for every turn in order; rests where the gap exceeds the threshold, labelled with length and clock times; named regions drawn above as brackets with their names; the cursor and the selection drawn on the strip. Ctrl+wheel zooms, then it scrolls sideways.
- **Middle, lower:** the reader. The selected turns in order. Each shows time, who, and the text as rendered markdown. A tool call is one line: the tool and its description. Tool results are collapsed behind that line. The split with the strip is resizable, no limits.
- **Footer, fixed:** what is selected ("Turn 84 of 259 · 7:12 am · them", or "12 turns · 7:10–7:14 am") · Name region · Delete region · Saved.
- **Right:** nothing.

## Actions
- Click a mark to put the cursor there. Drag across marks, or shift+click, to select a range. Arrow keys move the cursor, shift+arrows extend, Home and End jump.
- Name region (or N) makes a region over the selection and opens a name field above the strip. Enter saves, Esc cancels. Double-click a name to rename. Delete region removes the one under the cursor. Regions may touch but not overlap; an overlapping attempt is refused and the footer says which region is in the way.
- Copy outline puts markdown on the clipboard: the session date and length, then one line per region with its name, turn range, clock range, and how many turns were theirs, mine, and tools. Unnamed stretches are listed as "unnamed". Footer says "Copied".
- Save strip as SVG downloads the strip, with rests and regions, as a standalone file with the theme colors inlined.
- Ctrl+Z undoes region changes, fifty steps.
- Hover a mark to see its time, who, length, tool calls, and screenshots.
- Find in session (Ctrl+F) matches what was said, the tools called, and what they returned, without regard to case. Marks that don't match dim. Enter moves the cursor to the next match, shift+Enter to the previous, wrapping around. The footer says "match 3 of 9". Escape clears it.
- Click a turn's time in the reader to put the cursor on that turn.

## Data
- Transcripts are read from `~/.claude/projects` by default. Open folder changes that.
- Only `user` and `assistant` records count. Consecutive assistant records merge into one turn. Sidechain records are skipped.
- **Them:** a user record with text or an image, including "request interrupted" records.
- **Me:** an assistant turn, with character count and tool-call count.
- **Machine:** user records that are only tool results, and anything flagged `isMeta` or `isCompactSummary`. Hidden by default; the toggle shows them as hollow marks.
- Height is length: log scale `5 + log10(chars) / log10(20000) × 145`, or linear when chosen. Width is one unit per turn.
- Regions and per-session settings save to `%LOCALAPPDATA%\session-shape\<sessionId>.json` on Windows, `~/.local/share/session-shape/` elsewhere. Autosave on every change. The transcript folders are never written to.

## Parts, standard only
Vite, React, TypeScript. A small Node server (Hono) that lists sessions, parses a transcript, and reads and writes the sidecar file. `react-resizable-panels` for the splits. `react-markdown` for the reader. Vitest for unit tests, Playwright for one smoke test. `npm start` runs server and UI together.

## Files
- `src/parse.ts` — JSONL → turns. Pure.
- `src/layout.ts` — turns → marks, rests, label rows. Pure.
- `src/regions.ts` — create, rename, delete, overlap check, undo. Pure.
- `src/outline.ts` — regions and turns → markdown. Pure.
- `src/theme/roles.ts`, `src/theme/load.ts` — role map, JSON → CSS variables.
- `src/ui/` — Sidebar, TopBar, Strip, Reader, Footer, App.
- `server/` — routes: list, session, sidecar.
- `theme/` — the downloaded JSON and its SOURCE.md.

## Tests
- parse: split assistant records merge; tool-result-only user record is machine; compaction summary is machine; counts on a 12-turn fixture.
- layout: zero chars gives no bar; 20,000 chars is full height; a 31-minute gap adds a rest, 29 does not; three close rests land on rows 0, 1, 2.
- regions: overlap refused with the blocking name; rename; delete; undo restores.
- outline: exact markdown for the fixture.
- theme: every role resolves to a key present in `theme/cobalt2.json`; the lint step finds no color literal outside `theme/`.
- smoke: open the app on a fixture folder, click a mark, name a region, reload, the region is still there.

## Verify
Run it on a real session folder. Screenshot at 1440 and 390 wide. Put the screenshot beside `session.html`. Same shape, theme colors. All tests green.

## Rules
No words drawn on the strip, only lengths. No cards, no numbers as headlines, no stat tiles. One typeface. No color literal outside the theme file. Empty states say what to do: "Open a folder of transcripts", "Click a mark to read it. Drag to select a range."
