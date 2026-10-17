# 02 — Render the Compose baseline

Status: Complete

## Dependencies

01.

## Build task

Extract the visible Compose shell into reusable sidebar, toolbar, section, button, and editor-surface components. Use fixed realistic sample data and reference light/dark styles. A styled textarea is sufficient until task 09. Add a minimal theme switch if needed to inspect both baselines.

## Outside this task

Full document management, Source/Focus workflows, XML processing, redesign.

## Acceptance checks

- [x] Compare reference and preview at the same desktop viewport in both themes.
- [x] Record deliberate differences.
- [x] Verify at 1280×800 and 1600×1000 that content is readable and key controls are reachable.
- [x] Sample text is editable.

## Completion record

Save comparison evidence and identify any visual mismatch rather than claiming exact fidelity.

- Files changed: See record below.
- Checks and results: Files: src/components, sample.ts, style.css, App.vue. Both themes inspected at 1280x800 and 1600x1000. Text editable and controls reachable. Reference uses its textarea fallback with CDN blocked. Visual differences documented in ../PHASE-1-EVIDENCE.md.
- Known limitations: See ../PHASE-1-EVIDENCE.md; Phase 1 review pending.

