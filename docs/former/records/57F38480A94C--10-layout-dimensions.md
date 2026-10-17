# 10 — Adjust bounded layout dimensions

Status: Complete

## Dependencies

08 and 09.

## Build task

Expose a small set of layout controls: sidebar width, content width, section gap, and component padding. Give each a documented bounded range appropriate to the preview. Use resilient layout rules and retain the inspector as a separate surface.

## Outside this task

Freeform positioning, drag-and-drop builders, responsive breakpoint editors.

## Acceptance checks

- [x] At both target viewport sizes, exercise each control at minimum, default, and maximum.
- [x] No selected component or inspector control becomes unreachable.
- [x] Content scrolls where necessary instead of clipping.
- [x] Edits do not recreate the rich editor or lose text.

## Completion record

Complete the Phase 2 demonstration and record review corrections.

- Files changed: See checks below.
- Checks and results: design.ts, Inspector.vue, style.css. Sidebar 160-340px, content width 400-1200px, gap 0-48px, padding 0-48px. Minimum/default/maximum checked at 1280x800 and 1600x1000. No page overflow; inspector reachable; the rich editor model and text remain stable. Widths clamp to available preview space. Both themes visually inspected.
- Known limitations: Session-only design; see ../PHASE-2-EVIDENCE.md. User review pending.


