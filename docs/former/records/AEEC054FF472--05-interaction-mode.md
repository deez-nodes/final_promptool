# 05 — Switch between selecting and interacting

Status: Complete

## Dependencies

04.

## Build task

Add an explicit Select/Interact toggle. Select mode intercepts preview actions to choose sections; Interact mode restores normal editing and the preview's existing lightweight actions. Preserve selected ID and design edits across mode changes.

## Outside this task

Simulating the full prompt IDE or introducing additional feature screens.

## Acceptance checks

- [x] In Select mode a click selects without moving the text caret or triggering preview actions.
- [x] In Interact mode text can be edited normally.
- [x] Switching modes preserves text, styles, and selected ID.
- [x] Toggle and inspector controls are keyboard reachable with visible focus.

## Completion record

Complete the Phase 1 demonstration and record the review handoff.

- Files changed: See record below.
- Checks and results: Files: App.vue, EditorSurface.vue, PromptSection.vue, tests/phase1.spec.ts. Select blocks caret and preview actions; Interact enables editing and collapse/star/sidebar actions. Selection, styles and text preserved. Native keyboard controls have visible focus. Four tests pass; delivered for user review.
- Known limitations: See ../PHASE-1-EVIDENCE.md; Phase 1 review pending.

