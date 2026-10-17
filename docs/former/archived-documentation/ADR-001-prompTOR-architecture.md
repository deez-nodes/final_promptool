# ADR-001 — PrompTOR authoring architecture and persistence model

**Status:** Accepted baseline; some decisions remain provisional pending actual-host verification  
**Date:** 2026-09-22  
**Decision owners:** Product/implementation owner as assigned  
**Supersedes:** No consolidated ADR existed; this records existing decisions from the working implementation.

## Context

PrompTOR supports substantial prompt and reply authoring using independently editable sections, reusable material, and source annotations. The tool must retain user data, avoid accidental sends, and preserve exact output semantics for both structural wrappers and literal reference content.

Concurrent work previously occurred in the older application, creating a risk of overwriting unreviewed changes. Browser storage behavior also differs by origin, file URL, and port, making apparent persistence failures ambiguous without host-specific verification.

## Decision

### 1. Maintain a separate editor application

The active implementation is `promptor-editor.html`. It is independent of `promptor.html` and `promptor-next.html`.

- Do not treat it as a replacement for either older file.
- Do not modify the older application or candidate as part of work on this editor without explicit authorization.
- Keep the independent editor’s storage separate with `promptor-editor-v1`.

**Rationale:** prevents concurrent-edit collisions and protects existing user data/workflows.

### 2. Use a local, static, no-build baseline

The editor is served as a local static application, with no framework, backend, install step, or external build pipeline required for the baseline.

- The current development preview is served on loopback by `node serve-editor.cjs` at `http://127.0.0.1:8942/`.
- Existing older-app verification also uses a local server at `http://localhost:4173/`; it is a different origin/storage namespace.
- File URLs and other ports must not be assumed to share browser storage.

**Rationale:** keeps the product runnable in the intended local environment and limits setup risk. Browser origin behavior must be made explicit rather than misdiagnosed as an application failure.

### 3. Model authoring around independent sections and optional points

A prompt/reply is composed from ordered, independently editable sections. Sections can be folded, included/excluded, reordered, removed, and restored. Sections may contain optional named or numbered points.

- Headings are free text; no fixed prompt schema is imposed.
- Folded is a presentation state and does not imply excluded.
- Point-level structure exists to isolate distinct agreements, quotations, and instructions, but nested/sub-item editing is deferred.

**Rationale:** this is the user’s core authoring model. It avoids forcing a single continuous textbox while still assembling a single output.

### 4. Keep reuse lifetimes distinct in the data model

Persist and operate on three distinct scopes:

1. **Long-term base/library:** reusable prompts, sections, and text.
2. **Conversation:** carried mode, lead-in, decisions, and open questions across replies.
3. **Current message:** the active prompt/reply draft.

Inserted library/arrangement material is copied, not linked. Editing an inserted instance does not change the source unless an explicit original-edit action is used.

**Rationale:** supports reuse without polluting durable content with incidental per-message fragments or silently changing active drafts.

### 5. Use explicit output generation with XML as default

The default output format is XML, with Markdown and plain-text alternatives.

- Generated section and point wrappers delimit structure.
- User text is treated as literal content, not as arbitrary executable markup.
- Text containing `<`, `&`, or `]]>` is preserved losslessly with CDATA in XML output.
- Markdown heading levels are adjusted relative to their containing generated section to preserve intended hierarchy.
- Exact output is copy-only; editing, saving, importing, arranging, and annotating never send.

**Rationale:** structural boundaries must be reliable without forcing users to hand-author escaping or tags, while quotations and code retain their intended content.

### 6. Preserve a persistent source-pane annotation workflow

The reply workflow retains pasted source material in a persistent source pane. Exact text selections become annotations with optional comments, source names/ranges, preserved order, and routing into reply sections.

- Capture is draft-only and does not send or initiate agent work.
- Manual selection is the baseline.
- Automatic response splitting is deferred.

**Rationale:** the ability to collect several annotations before a single explicit copy is a central product requirement.

### 7. Make storage failure recoverable and imports transactional

Storage is local and must fail safely.

- Do not overwrite unreadable saved state.
- Make write failures visible to the author.
- Allow downloading recoverable state.
- Export/import supports backup merge and recovery.
- Failed imports roll back.
- Imports preserve the active draft.
- Earlier-app storage may be read only when same-origin access makes it available; no destructive migration is assumed.

**Rationale:** user-authored context is valuable and must not be lost due to malformed storage, import failure, or origin ambiguity.

### 8. Separate writing from enhanced reading

The current editor remains plain-text while writing. A safe formatted Markdown reading view is available; selecting it returns to plain-text editing.

Live Markdown/tag highlighting, advanced selection behavior, and richer editor internals require a separate prototype before adoption.

**Rationale:** rich-text internals can compromise selection, paste, list behavior, code/tag display, accessibility, and migration. A visual mock is insufficient evidence.

## Consequences

### Positive

- Protects the separate application and saved data from concurrent-write risk.
- Offers deterministic output semantics for structure and literal content.
- Supports durable reuse without unintended library coupling.
- Keeps annotation collection distinct from sending.
- Provides backup/recovery paths and bounded local setup.

### Trade-offs

- Local browser storage is origin-bound, so actual-host testing is mandatory.
- A plain-text writing surface defers live formatting benefits.
- One conversation/reply context is currently supported; multiple simultaneous conversations are unresolved.
- The codebase includes dense legacy-style JavaScript that is harder to edit; formatting work must be separately authorized.

## Verification requirements

For any change affecting these decisions:

- Run relevant automated checks in isolated browser contexts.
- Validate editing-to-copy behavior, export round trips, and literal/structural fixtures.
- Inspect desktop and mobile behavior.
- Verify persistence by reload/new page; for persistence claims in the user’s environment, test the actual host.
- Record observed versus inferred results in status documentation.
- Preserve a recoverable checkpoint and do not clear real user storage for tests.

## Current verification evidence

Existing suites have covered XML parse/text round trips, generated points, lists, Undo, filled starts, three quotations/two comments, exact copied text, insertion into points, independent library copies, reload/new-page persistence, save deduplication, text-file sections, backup recovery, previous-app storage preservation, carried next-turn context, safe Markdown reading, mobile overflow, and corrupt-state recovery.

The remaining architectural verification gap is persistence after reopening within the actual in-app browser/selected host. Prior automated UI access failed before browser access, so that behavior is not certified.

## Deferred decisions

- Exact quote-routing interaction.
- Conversation lifecycle, naming, archival, and concurrent conversations.
- Whether “settled” is explicit data or only folded presentation.
- Live Markdown editor technology and migration plan.
- Tag stem naming and any nested block model.
- Ownership/coordination policy for older editor files beyond the current separation rule.

## References

- PRD.md
- Historical: SPEC.md, PLAN.md, STATUS.md
