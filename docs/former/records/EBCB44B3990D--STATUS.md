# PrompTOR handoff status

Snapshot: 2026-09-20. Handoff-only turn: four Markdown documents created; app, candidate, backup, tests, and CLAUDE.md left unchanged. No app tests rerun in this documentation turn.

## Workspace and source selection

- Workspace: `C:/Minty/PrompTOR`.
- `promptor.html`: current reference app and ambient in-app browser URL. Single HTML file, vanilla JS, browser localStorage key `promptor-workbench-v1`.
- `promptor-next.html`: separate candidate found during this handoff. Not promoted, merged, or browser-tested here. Read-only inspection shows control/chrome changes, but it retains heading-only arrangements, destination dropdown, and XML export escaping. Review the full diff before adopting anything.
- `promptor-before-sections.html`: existing earlier app snapshot; not a substitute for saved user data.
- `CLAUDE.md`: existing working decisions; not edited in this turn.
- No `.git` directory found during handoff inspection. Do not claim version control or rollback commits exist.
- Browser state belongs to a host/profile/origin; copying an HTML file is not a reliable backup of localStorage.

## Implemented in reference source

- Independently editable, named sections; add, move, collapse, include/exclude, remove, Undo.
- Enter/newline and list continuation; Ctrl+Enter copies, not sends.
- Separate base and mid-task drafts; local saving; saved prompts and pull individual sections.
- Searchable pieces; save a whole section or selection; independent inserted copies.
- Insert as a new section or at the focused cursor via a destination dropdown.
- Built-in base/reply/correction/handoff arrangements; custom arrangements store headings only.
- Markdown/plain/XML output; optional collapsed exact-output display; export/import backups.
- Per-section tag wrapper (`wrap`) in current source. In non-global-XML mode it emits raw body text inside generated tags. Global XML mode escapes body text, including manually typed tags.
- Prior save-then-edit stale-reference issue was fixed in this task and included in workflow checks.

## Known gaps and evidence limits

| Gap | Evidence / implication |
| --- | --- |
| No conversation reuse layer | Base/reply slots are not named conversations with mode, decisions, and questions. |
| Empty arrangements | `headings` array only; lead-ins/content/settled defaults are absent. |
| Annotation collection | No persistent source-response and multi-annotation composer. |
| Real-host persistence | Transcript reports preview saving failures; actual in-app host was not tested by the isolated suites. |
| XML semantics | Global XML escapes bodies; wrapping in Markdown leaves bodies raw. Neither alone resolves intended structure versus literal content. |
| Markdown hierarchy | Section heading is `#`; body headings are unchanged, potentially making inner headings peers. |
| Interaction friction | Destination dropdown and repeated Save selected text controls remain. |
| Reading surface | Textareas; no live syntax/heading-level colours or checklist rendering. |
| Candidate drift | promptor-next.html exists; its status/ownership is not established. |

## Verification already performed in this conversation

Both `node verify.cjs` and `node verify-workflows.cjs` passed during the earlier implementation turn. Screenshots were inspected. Those results are historical, not fresh certification of subsequently changed files.

Coverage included isolated Edge browser checks for section editing/reordering, collapsed pieces, list continuation, copying, saving/reopening, Undo, XML escaping, selected-text reuse, cursor insertion, independent base/reply drafts, pulling base sections, arrangements, backup import/export, reload, and mobile width.

Limitations:

- Tests use Playwright with an isolated Edge context and hardcoded local paths. They target promptor.html, not promptor-next.html.
- Passing mobile width and screenshot inspection do not establish usability, clipboard integration, or persistence in the user's actual host.
- Existing XML tests intentionally verify escaping; update expectations only after defining correct literal-versus-structural behavior, not simply to make tests green.
- Test runs write verification-backup.json and preview images. Do not run them just to validate a documentation change.
- `preview-open.png`, `preview.png`, `preview-workflow.png`, and `preview-mobile.png` are prior artifacts, not proof of the candidate's appearance.

## Integrity snapshot (SHA-256 before documentation writes)

```text
promptor.html                  94721EAEA11B2044544A2FAA986A97C85B2D876EE114829200148B8500FF0A7C
promptor-next.html             5983BC8316BD79AEBC8BD7E52B8C22D818AC53BC8E611246AB0CC5015E54EF05
promptor-before-sections.html  E3BB3475D40EC2D7D79AFBD2565620CE8B66C87465264301B80E1E344E155AE6
CLAUDE.md                      C987F6C9A56CC9FD0B12C06E26A607F6EAC493669436299CE4B863E6C3107F8C
verify.cjs                     29FE9A10DC01E5D3D73B5CB626649A14AB6324E87C6A797BF7B86E7989E4C23A
verify-workflows.cjs           23CC99B87228360856EDEBA4980F2ACC07F466C98CB3DDE2227A95D5304609FD
```

## Next task entry point

Read AGENTS.md, SPEC.md, STATUS.md, PLAN.md, and CLAUDE.md. Inspect current source and candidate differences. Follow the new user's requested scope; this handoff alone is not permission to implement. For an implementation request, begin with PLAN item 0 before the first product increment.
