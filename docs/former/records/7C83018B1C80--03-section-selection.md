# 03 — Select a prompt section

Status: Complete

## Dependencies

02.

## Build task

Assign stable IDs to prompt sections. Add a preview-scoped selection outline and inspector placeholder showing the selected section's name. Clicking any child within the section resolves to that section.

## Outside this task

General DOM inspector, editable controls, other selectable component types.

## Acceptance checks

- [x] Click a section label and its editor surface; both select the same section.
- [x] Select a different section; exactly one outline remains.
- [x] Clicking the inspector does not change selection.
- [x] Selection decoration does not move layout.

## Completion record

Record the selection scenarios exercised.

- Files changed: See record below.
- Checks and results: Files: PromptSection.vue, App.vue. Label and textarea resolve to the same ID. Only one outline; inspector preserves selection; bounding box unchanged. Enter/Space support selection.
- Known limitations: See ../PHASE-1-EVIDENCE.md; Phase 1 review pending.

