# 06 — Edit shared light/dark themes

Status: Complete

## Dependencies

05 and Phase 2 authorization.

## Build task

Extend the typed schema to shared light/dark tokens for page/sidebar/chrome surfaces, text, muted text, border, accent, and selected state, plus shared typography and spacing defaults. Expose a compact Theme control group. Preserve task 04 edits while introducing inheritance. Scope theme application to the preview.

## Outside this task

Preset storage, arbitrary CSS input, styling the inspector through preview tokens.

## Acceptance checks

- [x] A shared text or accent change updates every inheriting preview component.
- [x] Inspector chrome remains unchanged.
- [x] Switching themes and switching back preserves edits in each theme.
- [x] Defaults reproduce the baseline, including readable focus and selection states.

## Completion record

Record affected components, theme-switch checks, and visual evidence.

- Files changed: See checks below.
- Checks and results: src/design.ts, Inspector.vue, DesignControl.vue, App.vue, style.css. Shared title/header/prose/UI sizing and theme surfaces/text/border/accent/selection/spacing. Theme changes update inheritors; inspector unchanged. Both themes retain independent settings. User-approved correction: 36px title, 28px headers.
- Known limitations: Session-only design; see ../PHASE-2-EVIDENCE.md. User review pending.

