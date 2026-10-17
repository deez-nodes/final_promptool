# 03 · Visual transcriptions (Claude's descriptions; visible text quoted)

## Screenshot_2026-10-12_112011.png — "Design workshop · Phase 2"
- Top: "PROMPTOR Design workshop · Phase 2"; right toggles SELECT | INTERACT, LIGHT PREVIEW.
- Left sidebar "PROMPTOR WORKSPACE": search "Search prompts Ctrl K"; tabs Library | Outline; All prompts 5, Starred 2, Snippets 3; PROJECTS: Product 2 (Product design partner [selected], Research brief), Engineering 1, Writing 2; REUSABLE SNIPPETS: Clear, direct writing / A careful research partner / Show the tradeoffs; footer "Compose sample — Changes last for this session".
- Center: breadcrumb "Product › Prompt", ★, Compose. Numbered collapsible sections with uppercase titles and tag chips: 02 CONTEXT `<context>` ("I'm building a tool for writing reusable, structured prompts. People combine a role, context, tasks, and constraints, then copy the finished prompt into their model of choice."), 03 GOAL `<goal>` ("Make writing the prompt feel as natural as writing a note. Keep organization close by, without crowding the editor."), 04 TASK `<task>` (1 Identify the primary writing workflow. 2 Propose three distinct interface directions. 3 Explain the tradeoffs of each direction. 4 Recommend a starting point and describe the key interactions.), 05 CONSTRAINTS `<constraints>` (Keep one central writing surface. Use a compact sidebar for projects, prompts, and reusable snippets. Make everything usable from the keyboard.), 06 OUTPUT FORMAT `<output_format>` (For each direction, include: a short name and the main idea / the layout and writing interactions / the tradeoff worth considering). Status bar "139 words  Session sample".
- Right inspector tabs COMPONENT | THEME | LAYOUT: "COMPONENT · dark", **Context editor**, "Select the title, a section, editor, sidebar, toolbar, or button. Local changes flow to inheriting children." "↑ Select parent", "context-editor"; Text size 13 px (10–56 px · Inherited · context); Background #0f1119 (Inherited · context); Text color #dfe6f0; Border color #222a3c; Border width 0 px (0–4 px · Inherited · component default).
- Bottom-right overlay: chat composer "Work with Codex" with **attachment thumbnails** (one labeled "promptor_bridged…").

## des_alt_theme.png — alternate light-serif theme
- Card "Untitled · Prompt" with Copy button. Left "Library": ■ Thoughtful editor (green), ■ Concise output (red), ■ Structure the output (yellow).
- Sections with serif headings and colored squares: **Role** (green) "You review pull requests for a small team."; **Task** (teal, highlighted background, "2 points") 01 Read the diff, 02 List findings by severity; **Constraints** (red, "1 point") 01 No style-only comments.
- Below: two column headings "Gained" (green rule) and "Lost, or what it costs" (red rule).

## Screenshot_2026-10-03_232254.png — XML preview with markdown inside tags
- `</doc></docs>`, `<tasks><task01>Add a request guard to the auth middleware.</task01><task02>Return 401 with a JSON body, never a redirect.</task02></tasks>`, `<context>` containing "# Purpose of App", "> Markdown from the editor fields stays as written, then wrapped on out…", "- on output - on copy - on save", "### Reason — Otherwise the user can't pull their text back out after save or copy.", ```ts export const guard = (req) => req.user ?? deny(401)```.
- Caption "Static preview — see the note above." Component label "PreviewTabs" with tabs PROMPT | EVAL STUB | CHAT.

## Screenshot_2026-10-04_004248.png — Badges, toggles, buttons, chat
- Badge rows: "1 · WHAT IT IS — Refactor auth middleware [PROMPT][BEST PRACTICE][TASK]"; "2 · WHERE IT STANDS — ✓ DONE, X BLOCKED, ! FAILED (ready / in progress: no badge)"; "3 · OUTCOME — ✓ COPIED, ✓ SAVED, ! RUN FAILED".
- Checkbox chips: examples ✓, constraints ✓, output format, eval stub.
- Buttons: COPY, SAVE, ✦ OPTIMIZE, DELETE, ▶ RUN; PRIMARY ACTION, SECONDARY ACTION, + NEW.
- Chat: avatar "WT", "START THE BRIDGE, THEN OPTIMIZE ✦ OR RUN ▶", user bubble "Tighten the constraints block and add an eval stub.", "More comments 5".

## Screenshot_2026-10-04_051309.png — component sheet (Name | Preview)
Wordmark "PROMPTOR // rich prompt editor"; Button set; Segmented `<XML> | MD` and `VIM | OFF`; Badge rows (as above); StatusDot "bridge offline" (amber) / "bridge online" (teal); Field: **Persona** "who is answering" — "You are a senior platform engineer reviewing a pull request. Terse, specific, no praise"; **Scope / rules** "what NOT to touch" — 1 Do not edit files outside the listed files. 2 Unknowns logged as future to do. 3 Review with user before implementation.; Documents: **Files** "exact paths only" [PATHS] [+ FILE] — here.ts [TS], file.md [MD], file.txt [TXT].

## Screenshot_2026-10-04_051443_-_Copy.png — XML preview, Modal, EmptyState, Toast
- XML: `<context># Purpose of App > Markdown from the editor fields stays as written, then wrapped on output, copy and save. ```ts export const guard = (req) => req.user ?? deny(401)``` </context><tasks><task01>…</task01><task02>…</task02></tasks><objective>Both panes are resizable.</objective>`.
- Modal "VIM CHEATSHEET" [ESC]: "prompTOR implements the same modal subset as the Claude Code editor." MOTION: move h j k l; word forward/back w b; line start/end 0 $; top/bottom gg G. EDIT: insert before/after i a; delete line dd; yank/paste y p; undo/redo u ^r.
- EmptyState: crosshair icon, "No prompt selected", "+ NEW". Toast: "COPIED TO CLIPBOARD".

## Screenshot_2026-10-04_052400_-_Copy.png — glow tokens comparison
Columns Name | prompTOR (live app) | REVX (PDF). Rows glow-primary (yellow-green, 0,0 · 14px, 40%), glow-secondary (teal, 45%), glow-tertiary (amber, 45%), glow-magenta (40%), glow-cyan (45%), glow-amber (45%), glow-acid (cut off). Each cell a dark rounded card with colored outer glow. REVX source: `C:\Minty\REVX_Design_System.pdf` (seen on disk, not uploaded).

## Screenshot_2026-10-04_052438.png — component sheet Wordmark → FilePill
Same as 051309 plus FilePill row: middleware.ts [TS], adr-014.md [MD], routes.json [JSON], logo.png [PNG], each with ×.

## Screenshot_2026-10-04_052521.png — component sheet VimHUD → ChatMessage
- VimHUD: [VIM OFF] "vim editing is off — flip the VIM switch" [?]; [NORMAL] "press i to insert, v to select" [INSERT] [VISUAL].
- TextInput: "BASE DIR ~/Projects/…", title "Refactor auth middleware", "message the session… (Enter to send)", "Enter project description…".
- Select: Promptology ▾, ● Ready ▾, sonnet ▾. ModeTabs: PROMPTS | TASKS. NavTabs: ACTIVE TAB | INACTIVE TAB | SETTINGS. PreviewTabs: PROMPT | EVAL STUB | CHAT … COPY.
- ListItem "PROMPTS 6": Refactor auth middle… Oct 3; Release notes — stru… Oct 1; Promptology base Sep 28; Agentic coding — re… Sep 26; Research digest tem… Sep 22; Role assistant — su… Sep 19.
- ChatMessage: "START THE BRIDGE, THEN OPTIMIZE ✦ OR RUN ▶"; user "Tighten the constraints block and add an eval stub."; reply "Done — two constraints merged, eval stub added under <eval>."; "1,284 tokens · $0.004".

## Screenshot_2026-10-03_225659_-_Copy.png — full VIM CHEATSHEET
"prompTOR implements the same modal subset as the Claude Code editor. Enter mode = Esc; not supported: macros, marks, :ex, registers, ctrl-v block."
Modes: i/I insert before/line-start; a/A insert after/line-end; o/O open line below/above; Esc back to NORMAL; v visual select.
Move: h j k l; w/e/b word fwd/end/back; 0/$ line start/end; ^ first non-blank; gg/G top/bottom.
Edit: x delete char; dd/D delete line/to end; cc/C change line/to end; dw cw db operator + motion; yy/p/P yank/paste after/before; u undo.
Not supported: macros q@, marks m, :ex / :s, ctrl-v block.

## Screenshot_2026-10-03_224039.png — template dropdown + eval stub
Dropdown (open on "Promptology"): — Prompt Templates — Claude Code Task, Promptology, General, Dev / Code; — Best-Practice (Anthropic) — PE — General Task, PE — Structured Extract, PE — Long Document, PE — Agentic Coding, PE — Research, PE — Role Assistant; — TradeSlayer — TS — Signal Engine, TS — Frontend Component, TS — Schema / DB, TS — Debug Session. Status select "● Ready". Right pane PROMPT | EVAL STUB: "# Eval stub — Change Files / # grader: grade_llm (auto-… template) / # Success criteria (S·M·A·…) - Judge rates >= {{4}}/5 … rubric (E-G3) - >= {{0.90}} of the seed … threshold - Hard constraints (length…) cheap code check / # Runnable harness (eval_p…) ```python """Eval stub for: Change F… Auto-generated by promptol… (template 'promptology'). pip install anthropic ; ANTHROPIC_API_KEY=... ; py… eval_promptology.py""" import anthropic".

## Screenshot_2026-10-03_224310.png — Tasks "Backlog" (orig. 1791818668590_…)
Left TASKS 4: Backlog [READY] Oct 3 10:42 PM; In progress [IN_PROGRESS] Oct 3 10:42 PM; Done [DONE] Oct 3 10:42 PM; Change Files [BLOCKED] Oct 3 10:40 PM. Center "Backlog", template "Claude Code Task", "● Ready". Fields: 1 TASK ID (e.g. S1-03) "S1-03"; 2 OBJECTIVE (one sentence goal) "Wire useTradeLog composable to GET /trades endpoint"; 3 FILES TO CHANGE (exact paths only) "path/to/file.ts (Enter to add)"; 4 DEPENDS ON (task IDs this needs) "S1-01 (FastAPI trades endpoint), S1-02 (SQLite schema)"; 5 SCOPE / RULES (what NOT to touch) "Do not touch anything outside the listed files. TypeScript strict. Async everywhere."; 6 IMPLEMENTATION NOTES (context for claude). Right EVAL STUB: "# Eval stub — Backlog # grader: grade_llm (auto-selected from template) # Success criteria (S·M·A·R) … # Runnable harness (eval_claude_code.py) … CANDIDATE_MODEL = "claude-opus-4-8" GRADER_MODEL = "claude-opus-4-8"".
