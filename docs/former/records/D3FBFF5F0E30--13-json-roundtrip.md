# 13 — Import and export preset JSON

Status: Not started

## Dependencies

11.

## Build task

Export a portable versioned preset JSON file and import it as a new named preset. Validate structure, supported version, allowed properties, values, and sizes before mutation. Resolve imported ID collisions without overwriting existing presets. Use the same schema and validation module as persistence.

## Outside this task

Arbitrary code import, future-version migration, source-code export.

## Acceptance checks

- [ ] Export a design containing both themes and local overrides; import it and verify semantic equality of supported settings.
- [ ] Existing presets remain intact on ID collision.
- [ ] Malformed JSON, unsupported versions, and invalid property values produce useful errors without changing current state.

## Completion record

Add a focused round-trip and rejected-import check; verify file dialogs/download behavior in the desktop app.

- Files changed: pending
- Checks and results: pending
- Known limitations: pending
