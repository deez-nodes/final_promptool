# 01 — Launch the desktop shell

Status: Complete

## Dependencies

None; read the draft first.

## Build task

Create the minimum Vue/TypeScript/Vite application and Electron entry point with a single documented local launch command. Use a local placeholder view; keep renderer isolation enabled and desktop privileges narrowly scoped.

## Outside this task

Reference extraction, inspector controls, persistence, installers.

## Acceptance checks

- [x] The documented command opens one dedicated desktop window with the placeholder UI.
- [x] Closing and reopening works.
- [x] Renderer execution has no general Node access.
- [x] The application build completes.

## Completion record

Record the launch command, build result, and actual desktop launch result.

- Files changed: See record below.
- Checks and results: Files: package.json, lockfile, Electron entry, Vite/TypeScript config, launch.ps1. Build and actual desktop launch/close/reopen pass. One window; renderer require undefined, Node integration false, context isolation and sandbox true. Desktop test required execution outside the restricted sandbox.
- Known limitations: See ../PHASE-1-EVIDENCE.md; Phase 1 review pending.

