# PrompTOR — Implementation Specification

**Status:** Active baseline  
**Last consolidated:** 2026-09-22  
**Companion documents:** PRD.md; ADR-001-prompTOR-architecture.md

## 1. Scope

This specification defines the behavior of the independent PrompTOR editor. It does not authorize changes to `promptor.html` or `promptor-next.html`.

Active application:

- Entry point: `promptor-editor.html`
- Storage key: `promptor-editor-v1`
- Local preview: `node serve-editor.cjs` at `http://127.0.0.1:8942/`

The product is local-first and copy-only. It does not send messages, call models, or start agent work.

## 2. Core data model

### Prompt document

A prompt document contains:

- Title
- Mode: base prompt or mid-task reply
- Ordered sections
- Current-message draft state
- Optional conversation state

### Section

Each section contains:

- Editable heading
- Ordered body content and optional points
- Colour/presentation choice
- Folded state
- Included state
- Keep-for-next-turn state where applicable

Rules:

- Section headings are arbitrary user text.
- Folded and included are independent. Folded content remains included unless explicitly excluded.
- Remove is recoverable through Undo.
- Reordering preserves content, folded state, inclusion, and point ordering.

### Point

A point is an optional unit inside a section.

- A point has editable text and optional naming/numbering metadata.
- Named or numbered points generate their own XML wrappers.
- Points preserve order.
- Nested points are not supported.

### Reusable content

Reusable material is scoped by lifetime:

- **Library/base:** saved prompts, sections, and selected content.
- **Conversation:** carried mode, lead-in, decisions, and open questions.
- **Current message:** active draft-only content.

Insertion always creates an independent copy. An inserted copy does not update its library source. Original-source editing must be explicit.

### Source annotation

An annotation contains:

- Exact selected source text
- Optional author comment
- Source name and range/provenance
- Capture order
- Destination/routing information when assigned

A comment is optional. An annotation with only quoted text is valid.

## 3. Editor behavior

### Authoring

- The editor opens directly into authoring work.
- Enter inserts a newline.
- Lists continue naturally and can be ended naturally.
- No keyboard or pointer action implicitly sends content.
- Sections can be added, folded, reordered, included/excluded, and removed.
- Focused-section insertion is the default destination for reusable content.
- Adding reusable material as a new section remains available.
- When no section is focused, the UI provides a clear safe fallback rather than silently choosing a destination.
- Keyboard focus must remain visible; Undo must remain correct after pointer and keyboard editing.

### Arrangements

A saved arrangement can include:

- Section headings
- Section body/lead-in content
- Points
- Folded defaults
- Kept/conversation content where supported

Loading an arrangement inserts a new independent instance. It must not overwrite an active draft.

### Conversation continuity

- Kept items and reply context can populate a subsequent reply.
- Conversation content can be promoted into long-term reusable material deliberately.
- Current baseline supports one reply conversation. Multiple simultaneous conversations are not specified.

### Source annotations

- Pasted source remains visible during capture.
- The author can collect multiple selections before copy.
- Capturing a selection, adding/editing a comment, changing category/routing, or removing an annotation changes only local draft state.
- Capture never sends content or invokes an external action.
- Source position/content remains available after capture.
- Manual selection is required; automatic splitting is deferred.

## 4. Output semantics

### Formats

Supported output formats:

- XML (default)
- Markdown
- Plain text

Only explicitly included sections appear in assembled output, in visible chosen order.

### XML

- The root wrapper is `<prompt>`.
- Section and optional point wrappers are generated from section structure.
- Users do not need to hand-type generated opening/closing wrappers.
- Literal content must not be reinterpreted as structural markup.
- XML content containing `<`, `&`, or `]]>` uses lossless CDATA representation.
- Literal `&lt;`, `&amp;`, sample tags, Markdown code fences, and multiline quotations retain their intended text meaning.

### Markdown hierarchy

- A Markdown heading inside a generated section is lowered relative to the section’s structural heading.
- Code fences and literal content are exempt from heading transformation.
- Output generation must not broadly remove escaping to address structural/literal ambiguity.

### Copy

- Copy is an explicit action.
- Ctrl+Enter may invoke the explicit copy behavior.
- Exact-output inspection is optional and collapsed by default.
- Copying does not modify library originals, conversation state, or source annotations.

## 5. Persistence and recovery

- Persist state under `promptor-editor-v1`.
- Never overwrite unreadable persisted state.
- Surface storage write failures visibly.
- Maintain a downloadable recovery path for unreadable or failed storage.
- Support backup export/import for library, conversation, and current-message data.
- Imports merge safely, preserve the active draft, and roll back on failure.
- Prior-app data may be read only when available on the same browser origin; do not assume access across file URLs, ports, or hosts.
- Test persistence in the actual user-selected host before declaring it verified.

## 6. Reading surface

- Writing is plain-text editing at the current baseline.
- A safe Markdown reading view is available and can return to editing.
- Live Markdown while typing, inline tag highlighting, and richer editor internals are deferred pending a focused prototype.
- The prototype must assess selection, list behavior, paste, code/tag display, accessibility, migration, and responsive behavior before integration.

## 7. UI requirements

- Use meaningful section colour and hierarchy; colour is presentation, not semantics.
- Folding is the compact-overview mechanism; do not rely on tiny text or clipping.
- Primary controls must be understandable without training.
- Keep backup/export/download controls low-frequency and outside the main writing flow.
- Avoid repeated “Save selected text” controls. Use a discoverable shared/contextual save action.
- Keep wrapping controls clearly named and located.
- Verify desktop and mobile layouts; avoid mobile horizontal overflow.

## 8. Explicit exclusions

Do not add without renewed scope:

- Direct model bridge or send/receive integration
- Automatic response splitting
- Nested block/point authoring
- Team features, task management, or to-dos
- Variables, linked includes, Git-backed storage, IDE integration
- Multi-model execution/evaluation, cost dashboards, or agent automation
- Framework/backend/install requirements

## 9. Required verification

For a changed flow, verify the relevant subset of:

- XML parse/text round trips and literal-content fixtures
- Generated points and wrapper matching
- List and Enter behavior
- Fold/include/reorder/remove/Undo
- Arrangement loading without draft overwrite
- Independent-copy behavior for library insertion
- Three quotations with two comments and one comment-free selection
- Exact copied output
- Reply carry-over and promotion behavior
- Reload/new-page persistence
- Backup export/import and corrupt-state recovery
- Desktop and mobile layout
- Actual-host reopen persistence when making persistence claims

Record observed results separately from inference. Do not clear or seed the user’s real storage during verification.

## 10. Open specification decisions

- Whether quote destination is selected at capture or after collection.
- Conversation lifecycle, naming, archival, and multiple concurrent conversations.
- Whether settled state is explicit metadata or folded-default presentation.
- Exact heading mapping and selection preservation in a future live-Markdown editor.
- Tag stem/naming conventions for any future nested model.
