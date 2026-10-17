# Phase 3: Preserve and reuse designs

Status: Not started
Prerequisite: Phase 2 delivered, review corrections incorporated, and authorization to continue.

## Outcome

The user can save, reopen, reset, share, and reproduce a design locally.

## Tasks

1. [11 — Save and load named presets](../tasks/11-preset-persistence.md)
2. [12 — Reset overrides and themes](../tasks/12-reset.md)
3. [13 — Import and export preset JSON](../tasks/13-json-roundtrip.md)
4. [14 — Export equivalent CSS](../tasks/14-css-export.md)
5. [15 — Deliver a verified local launch](../tasks/15-local-delivery.md)

After task 11 establishes the stored schema, tasks 12–14 may be delegated with separate ownership. Task 15 depends on all preceding tasks.

## Final acceptance

Create a visibly distinct design, save it, close the desktop app, reopen it, and verify restoration. Export JSON, reset the current draft, import the exported preset, and verify equivalence. Apply exported CSS to the same clean preview components and compare the result.

Verify a local launch without runtime network access. Report launch instructions and known limitations. Installer distribution and production prompt-IDE functionality remain outside this prototype.
