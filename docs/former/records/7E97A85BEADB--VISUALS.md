# 04 · Visual transcriptions (Claude's descriptions; visible text quoted)

The HTML prototypes themselves are stored as text in this project under `promptor-archive/04_round3_html-prototypes-and-task-screens/html/`.

## Screenshot_2026-10-03_225416.png — promptor_bridged.html, Tasks view (orig. 1791818677837_…)
- Browser tab bar: "prompTOR // rich prompt editor", "TradeSlayer // Prompt Manager" ×3; address `C:/Minty/Examples_promptor/promptor_bridged.html`; bookmarks "Evaluation quickst…", "Topics - Braintrust".
- Header "PROMPTOR // RICH PROMPT EDITOR", tabs PROMPTS | TASKS (active), "BASE DIR ~/Projects/".
- Left TASKS 4: Current Edit Yellow in Lef… [BLOCKED] Oct 3 10:54 PM; Finished [DONE] 10:45 PM; Task - In Progress [IN_PROGRESS] 10:44 PM; Task - ready [READY] 10:44 PM; "+ NEW".
- Center "Current Edit Yellow in Left Pane", template "Claude Code Task", status "X Blocked". Fields: TASK ID S1-04; OBJECTIVE "Both panes are resizable"; FILES TO CHANGE; DEPENDS ON S1-01, S1-02…; scope rules 1–3; implementation notes (yellow focus): "Tool Calling 1. Make calls via Aleph RLM 2. Then edit via Serena MCP 3. Manage Job Board on ToDoIst / Pass plans to Reviewer, reviewer passes on to architect. Project lead verifies task and stack match design plans."
- Bottom bar: COPY, SAVE, ✦ OPTIMIZE, ▶ RUN, sonnet ▾, medium ▾, ● , `<XML>` | MD, VIM | OFF; HUD "VIM OFF — vim editing is off — flip the VIM switch to drill modal editing ?".
- Right PROMPT | EVAL STUB | CHAT, COPY: `<task id="S1-04" status="BLOCKED" depends="S1-01\nS1-02\nS1-03">Current Edit Yellow in Left Pane</task> <objective>Both panes are resizable</objective> <files_to_change>- ~/Projects/- path/to/file/here.ts - ~/Projects/path/to/another/file.md - ~/Projects/path/to/another/file.txt</files_to_change> <scope_rules>1…4. Output format</scope_rules> <implementation_notes>Use Skills - skill 1 - skill 2 - skill 3 / Tool Calling …`.

## Screenshot_2026-10-03_225515.png — same app, "Filled Out Task Prompt" (orig. 1791818685572_…)
Same layout; task "Filled Out Task Prompt" [BLOCKED] 10:55 PM. FILES TO CHANGE shows pills "- path/to/file/here.ts ×", "path/to/another/file.md ×", "path/to/another/file.txt ×", input "path/to/file (Enter to add)". DEPENDS ON lines S1-01 S1-02 S1-03. Scope/rules 1–4 incl. "4. Output format". Notes: "Use Skills - skill 1 - skill 2 - skill 3", Tool Calling list, reviewer/architect/project-lead lines. Right pane shows full XML ending `</implementation_notes>`.

Defects visible here (Claude's notes): leading "- " retained in the first path (`~/Projects/- path/…`); `depends` attribute contains newlines.
