# 11 — Save and load named presets

Status: Not started

## Dependencies

10 and Phase 3 authorization.

## Build task

Implement the versioned preset schema and one local persistence adapter. Save a named preset from the current design; load and update it through explicit actions. Retain the active design draft and selected preset across app restarts. Handle storage errors visibly and preserve unreadable stored data for recovery instead of overwriting it.

## Outside this task

Cloud sync, preset marketplace, app-source rewriting, prompt-document persistence.

## Acceptance checks

- [ ] Save two distinct presets and switch between them.
- [ ] Updating one leaves the other intact.
- [ ] Close the actual desktop app and reopen; active design is restored.
- [ ] A simulated storage failure does not falsely report Saved or discard the in-memory design.
- [ ] Malformed stored data is retained for recovery.

## Completion record

Record actual desktop restart results and focused persistence/error checks.

- Files changed: pending
- Checks and results: pending
- Known limitations: pending
