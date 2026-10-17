# PrompTOR remaining work

This is a proposed execution order derived from settled requirements. All items remain unfinished. The current request is documentation only; a fresh implementation request authorizes action. Do not reopen the product premise or ask the user to restate it.

## 0. Establish a trustworthy working baseline

- Inspect differences between promptor.html and promptor-next.html; identify active writer and reference target before conflicting edits.
- Preserve a recoverable source checkpoint and user data. Do not overwrite an unreviewed candidate or wipe browser storage.
- Verify persistence in the actual host using a recoverable, non-destructive sample. Distinguish preview limitations from app bugs; retain backup recovery.
- Acceptance: record target file, checkpoint, actual browser/host, save/reload/reopen result, and any reproducible failure in STATUS.md. Existing saved material remains accessible.
- Scope boundary: no new framework, backend, Git setup, or installs merely to complete this check. Ask only if coordination/access blocks it.

## 1. Filled starting arrangements and settled sections

- Extend arrangements to preserve section headings, body/lead-in text, and folded defaults. Maintain old heading-only arrangement compatibility.
- Provide a reusable base and reply starting point using user-owned content; no forced persona or fixed schema.
- Insert filled sections as independent copies; do not overwrite an active draft by loading an arrangement.
- Acceptance: save an arrangement containing context and a "collecting feedback, do not implement" lead-in, reopen it with settled parts folded, edit the new task only, and export/import it without losing content or folding defaults.

## 2. Conversation reuse

- Add the middle lifetime: mode, continuation context, decisions, and open questions reusable within a conversation.
- Keep long-term pieces and this-message content distinct. Support deliberate promotion or removal of conversation material.
- Resolve only the lifecycle details needed for this increment; multiple simultaneous conversations are not yet a settled UI design.
- Acceptance: compose two replies carrying the same mode and decisions without retyping; recover both conversation context and the current draft after reopening; promote one item without polluting the permanent library with every message fragment.

## 3. Collect annotations without sending

- Keep pasted source text available while collecting multiple exact selections and optional comments.
- Retain source/comment associations and ordering; allow editing/removal and useful section placement.
- Make capture and final copy/send separate. Current implementation remains copy-only unless separately authorized.
- Start with manual selection. Automatic point splitting is optional and unresolved, not a dependency.
- Acceptance: capture three passages from different parts of a reply, add two comments, change one, retain the uncommented selection, and copy one assembled turn. No intermediate event sends, launches agent work, or loses the source position/content.
- Design option: Product Design audit can review this flow and a small interactive prototype can test control placement before integration. Preserve the existing section-based app.

## 4. Reliable boundaries and hierarchy

- Define how literal text, generated section wrappers, quoted sources, and body Markdown are represented and exported.
- Fix the mismatch between global XML escaping and per-section raw wrapping without silently reinterpreting source content.
- Define body heading hierarchy relative to section headings; preserve fenced code and user text.
- Acceptance: named wrapper output contains correct matching delimiters; literal `<`, `&`, sample tags, code fences, and multiline quotes preserve intended meaning; no unsafe HTML rendering. Structural and literal fixtures must both pass.
- No nested/sub-item editor in this increment. Deferred numbered-tag decisions are not blockers for top-level boundaries.

## 5. Remove demonstrated interaction friction

- Make inserting into the focused section direct, with an obvious separate add-section action and a safe no-focus fallback.
- Replace repeated Save selected text buttons with a discoverable shared/contextual action that retains the selection.
- Clarify wrap control placement and low-frequency backup/download controls. Preserve core keyboard behavior.
- Acceptance: select text, save it, then insert a piece into the focused section without changing a global dropdown; keyboard/pointer focus and Undo remain correct; screenshots show the user can identify the primary actions.

## 6. Prototype the reading surface before replacing internals

- Explore live Markdown inside separate sections, coloured heading levels, folded settled content, and completed-checklist styling.
- Keep the working app intact while assessing editor selection, list behavior, paste, code/tag display, accessibility, and migration.
- Acceptance: a scoped prototype demonstrates these behaviors on the user's base/reply examples; visual and interaction review identifies a concrete target before integrating new editor internals.
- Product Design can assist with an evidence-based flow audit and focused prototype. A visual mock alone does not prove selection handling, annotations, or persistence.

## Verification and handoff for each implemented item

- Run the relevant existing suites and behavioral checks for the changed flow, using isolated fixtures.
- Inspect desktop and mobile screenshots; test the actual path from editing to copied output.
- State what was observed versus inferred. Test success is not proof that friction is gone.
- Update STATUS.md and this checklist only for completed, checked behavior. Record unresolved points and exact next action.
- Stop at the scope authorized by the current user; no automatic loop through the entire roadmap.

## Parked

Nested sub-items, numbered tag trees, direct agent bridge, task tracking/to-dos, team features, multi-model runs/evals, variables, linked includes, and file-backed Git storage. Revisit only with explicit scope.

## Fresh-task starter

> Read AGENTS.md, SPEC.md, STATUS.md, PLAN.md, and CLAUDE.md, then inspect the current app and the separate candidate. These files carry the agreed context. Preserve existing work and saved data. Establish the baseline in item 0, then implement the first unfinished product item that can be completed within this request. Verify behavior and appearance, update STATUS.md, and stop after that increment. Ask only about ambiguities that block it; do not ask me to describe the product again.
