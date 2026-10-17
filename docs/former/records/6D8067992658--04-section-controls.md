# 04 — Change three section properties

Status: Complete

## Dependencies

03.

## Build task

Introduce the small typed design-state module and metadata for section background color, text font size, and padding. Connect inspector inputs to immediate style updates for the selected section. Bound numeric inputs and keep units explicit. Keep sample text outside design state.

## Outside this task

Complete token system, persistence, other controls.

## Acceptance checks

- [x] Each control changes the selected section immediately.
- [x] Another section is unchanged.
- [x] Changing selection preserves earlier edits.
- [x] Sample text and selection survive updates.
- [x] Empty, invalid, and out-of-range inputs do not produce broken CSS or a crash.

## Completion record

Record valid/invalid input checks and before/after appearance.

- Files changed: See record below.
- Checks and results: Files: design.ts, App.vue, PromptSection.vue. Three properties update live, only target affected, text and edits survive selection changes. Empty input restored; numeric extremes clamped; invalid hex rejected. Padding is vertical, following reference section axis. Session-only edits.
- Known limitations: See ../PHASE-1-EVIDENCE.md; Phase 1 review pending.


Review correction: added independent header size (10-48px) as the first inspector control; renamed text size to Prose size. Header edits affect only the selected section heading.
