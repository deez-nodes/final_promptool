# 07 — Add explicit component overrides

Status: Complete

## Dependencies

06.

## Build task

Formalize theme-specific overrides keyed by stable component ID and allowed property. Resolve effective styles from shared tokens plus overrides. Label inherited versus overridden values in the inspector and provide a clear-override action for each property. Normalize existing section edits into this model.

## Outside this task

Resetting whole presets, storage, duplicate styling state outside the design model.

## Acceptance checks

- [x] A local override affects only its target.
- [x] A subsequent shared-token change affects inheritors while preserving that override.
- [x] Clearing the override restores the latest shared value.
- [x] Light and dark overrides stay independent.
- [x] Unknown properties never reach rendered styles.

## Completion record

Verify the style resolution rules with a small meaningful automated check and live UI inspection.

- Files changed: See checks below.
- Checks and results: src/design.ts, Inspector.vue. Sparse allowlisted overrides by theme and stable ID. Clear restores latest inherited value. Section color/background/prose size flow into editor; toolbar traits flow into buttons. Pure resolution tests reject unknown fields and verify parent/local precedence. Earlier controls remain supported in the new model; session-only drafts do not survive app replacement.
- Known limitations: Session-only design; see ../PHASE-2-EVIDENCE.md. User review pending.

