# PrompTOR product requirements

## Purpose and authority

Replace the chat textbox as the place to compose substantial prompts and replies to agents. Reduce repeated writing, context reconstruction, mechanical tagging, and premature sending. The user writes base prompts and reuses their parts while addressing ongoing tasks.

This is a consolidation of the current Codex conversation, the supplied transcript, and the latest annotation feedback (2026-09-20). It does not authorize implementation. Requirements below are separated from proposals and unresolved details. External market claims and vendor-prompting claims in the transcript are not product evidence.

The user has spent months repeating these requirements. Do not ask them to explain the product again. The independently editable sections are intentional. A single assembled output does not imply a single continuous editing field.

## Core authoring requirements

- Open directly on the work, ready to type; avoid navigation and team-oriented scaffolding.
- Enter inserts a newline. Lists continue and can be ended naturally. No accidental send.
- A message contains independently editable sections with freely editable headings.
- Paragraphs and lists belong inside sections. Suggested headings are optional, never mandatory fields.
- Add, reorder, collapse, exclude, and remove sections; recover accidental destructive actions.
- Collapsing supports the user's sense that a section is settled and frees attention for changing parts. Collapsing alone must not silently exclude its content. Whether it records a separate done state is unresolved.
- Keep the message overview compact through folding, not tiny text, clipping, or a promise that every expanded message fits a physical screen.
- Copy the assembled turn in one explicit action. Keep exact-output inspection optional and collapsed, not a permanent duplicate preview.
- Drafts must persist reliably in the environment actually used. Storage failures must be visible and recoverable.

## Flexible section vocabulary

Examples: Request; Role; Persona; Context; Instructions; Stack; Constraints; In response to; Agreements; Corrections; Proposed edits; Questions; Asides; Settled decisions; Areas of uncertainty; What done means; Expected output; Acceptance criteria; Next action.

These names are examples, not a fixed schema. Capitalization and user wording remain editable.

## Reuse has three lifetimes

1. **Long-term base:** reusable persona, role, context, constraints, and other recurring material. User-defined, not necessarily a developer persona. Settled sections can start filled and collapsed.
2. **This conversation:** mode/lead-in, continuation context, settled decisions, and open questions. Reuse across turns without promoting every item into the permanent library. Allow eventual removal or promotion to long-term reuse.
3. **This message:** new questions, changes, agreements, quotations, and instructions for the current turn.

Requirements:

- Searchable library with a compact tree; reuse whole prompts, individual sections, or selected text.
- Inserted pieces are independent copies. Updating a library original requires an explicit action.
- A saved starting arrangement must be able to carry headings, lead-in text, reusable content, and initial folded/settled presentation, not just empty heading names.
- Base context should be available in replies with small local edits, without retyping or silently including all irrelevant base material.
- Clicking a piece should insert into the focused section without a recurring destination dropdown step. Adding it as its own section remains available. No-focus behavior needs a clear fallback.
- Avoid a permanent library full of incidental a1/a2/a3 or per-message quote fragments.
- Preserve existing saved prompts and backups when extending the data model.

Example reusable lead-in: "This is still a continuation. I am gathering feedback. Do not build, edit, or propose a plan yet; first understand the complete message."

## Annotating and answering an agent

Latest feedback: the current chat editor is nicer because it can collect annotations without explicitly sending each one. Preserve that separation as a central requirement.

- Keep the source response visible while gathering multiple selections.
- Each annotation retains the exact selected source text and an optional user comment; absence of a comment is valid.
- Maintain the association between the source quotation and its comment, and preserve order and enough provenance to know what it refers to.
- Support several agreements, proposed edits, and clarifications in one turn.
- Adding, revising, or categorizing an annotation only changes the draft. It never sends or starts agent work.
- Allow the user to finish collecting everything before one explicit copy/send action.
- Avoid scrolling away or replacing the source just because a quote was added.
- Route quotations to useful sections such as Agreements, Corrections, Questions, or Proposed edits. Exact routing interaction is unresolved.
- A pasted agent reply can be the initial source; a bridge is not required for this workflow.

Automatic point splitting was an assistant proposal, not a settled requirement. Manual selection is a concrete demonstrated need. Do not require an auto-splitting engine before implementing useful annotation collection.

## Boundaries and output

- Produce one assembled prompt with included sections in chosen order.
- Support Markdown headings and explicit tag wrappers where useful.
- Generate opening and closing delimiters from section structure; users should not have to hand-type, escape, copy, and repair them.
- Treat literal text, quoted reference material, and structural wrappers distinctly. Do not silently convert intended boundaries into literal escaped text, or treat arbitrary source text as executable HTML.
- An inner Markdown heading must not accidentally flatten the intended hierarchy relative to its containing section. Exact mapping needs a documented decision and code-fence handling.
- Preserve code, angle brackets, ampersands, and quoted content according to the chosen output semantics. Do not broadly remove escaping as a substitute for this distinction.
- Tags help delimit meaning; they do not guarantee model obedience or replace explicit mode instructions.

Boundary example: a section named `example-xml-tags-usecase` should let the user write `would have gone here` and copy an appropriate opening wrapper, content, and closing wrapper without manually repairing markup.

## Reading and interaction quality

- Reading matters as much as typing: distinguish heading levels, use meaningful colour, support folding, and make controls recognizable.
- Desired future reading surface: live Markdown within each independent section, coloured heading hierarchy, and visible completed-checklist treatment.
- Keep explicit boundaries intelligible without requiring raw tag maintenance in the writing area. Whether literal tags themselves receive inline highlighting remains an editor-design question.
- Avoid repeated "Save selected text" controls everywhere; provide a discoverable contextual/shared action.
- Give wrapping controls a clear location and meaning. Keep backup language plain and low-frequency controls out of the core writing path.
- Friends should understand the essential workflow without instruction. Keep density useful and keyboard focus visible; retain readable and responsive layouts.
- Keep current visual direction unless a scoped design change is requested. Live formatting requires a separate editor prototype; do not silently turn this into a document-editor rewrite.

## Concrete acceptance scenarios

1. **Base to reply:** save a base with persona/context/constraints; start a reply with In response to, Agreements, Proposed edits, and Questions; bring in relevant base material without retyping it; preserve the base original.
2. **Carry conversation state:** reuse "not yet time to build" and settled decisions on later turns. Reopen after a restart with the draft and context intact.
3. **Collect before sending:** select three different passages, comment on two, retain one without comment, revise the second comment, and assemble one turn. All original associations remain; no intermediate action sends anything.
4. **Reusable starting point:** load a filled arrangement with settled sections folded and the changing task area ready to edit. Existing draft text is not overwritten accidentally.
5. **Safe output:** use a generated wrapper around reference material containing Markdown, literal `<` and `&`, and code. Verify the intended boundaries and preserved content, not only that a parser accepts the result.
6. **Actual persistence:** reopen in the actual Codex browser/selected host and recover work. Export/import a backup with long-term, conversation, and current-message state intact.

## Deferred scope

- Nested/sub-level block authoring is parked. Earlier one-tap sub-agreement examples express a desired future interaction, not current authorization to implement nested trees or numbered tags.
- Direct model/Claude bridge and send/receive infrastructure are later. Copy/paste works for the current scope.
- Daily to-dos and specs on the same surface are a future direction, not a task-management build now.
- Variables/interpolation, linked pieces, file-backed Git storage, IDE integration, evals, cost dashboards, multi-model runs, teams, Vim mode, and platform-specific exports were proposals or tangents, not accepted requirements.

## Unresolved details (ask only when relevant)

- Quote routing: choose destination on capture, or collect then sort? Should optional auto-splitting supplement manual selection?
- Conversation lifecycle: naming, starting/ending, archiving, and multiple simultaneous conversations.
- Exact Markdown editor behavior, heading remapping, selection preservation, and presentation of raw code/tags.
- Whether "settled" is explicit metadata or simply a folded presentation default.
- Which actual host persists reliably? Ambient UI points to Codex's in-app browser, but reported preview failures remain unresolved.
- Who is the sole implementation writer, and is promptor-next.html actively being developed elsewhere?
- Deferred tag stem naming and nested blocks: do not ask until that scope is reopened.

## Sources and limits

- This Codex task: original product request, section-editor clarification, implementation, cross-work comparison, and latest annotation feedback.
- Attached transcript: `C:/Users/dz/.codex/attachments/41fa65ea-2419-48e7-ab4c-0c793593b458/Pasted text.txt`.
- Transcript references screenshots not attached to this handoff. Their described properties are user feedback, not screenshots independently inspected here.
- Existing CLAUDE.md records implementation decisions. Preserve compatible decisions; explicit later feedback above identifies desired changes.
- No external product-market or vendor-guidance claims were independently verified during this handoff.
