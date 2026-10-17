# 08 — Extend selection and controls

Status: Complete

## Dependencies

07.

## Build task

Extend the explicit editable-component registry to sidebar, toolbar, buttons, and editor surface. Supply appropriate color, border, typography, gap, and radius controls from the existing metadata model. Define deterministic nested selection: choose the nearest registered target, with an inspector parent-selection action where needed.

## Outside this task

Arbitrary DOM editing, component galleries, exhaustive state editors, new UI framework.

## Acceptance checks

- [x] Every supported component can be selected and restyled through relevant controls.
- [x] Nested button selection does not unexpectedly select its container; parent selection remains available.
- [x] Shared versus local edits behave as in task 07.
- [x] Unrelated components remain unchanged.

## Completion record

List supported components/properties and record one successful edit per component type.

- Files changed: See checks below.
- Checks and results: src/components/*.vue, design.ts, App.vue. Document title, sidebar, toolbar, two toolbar buttons, all sections and six editor surfaces selectable. Nearest nested target wins; parent action tested. Each component type restyled in live checks; unrelated component remains unchanged.
- Known limitations: Session-only design; see ../PHASE-2-EVIDENCE.md. User review pending.

