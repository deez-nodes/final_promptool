# PrompTOR — Product Requirements Document

## 1. Problem Statement
Prompt authors write LLM prompts as single unstructured text blobs. This makes prompts hard to reuse, hard to compare across models, and hard to reason about token cost. PrompTOR is a structured prompt editor: prompts are built from typed, reusable, toggleable sections and compiled into multiple target formats.

## 2. Goals
1. Let a user build a prompt as an ordered stack of typed sections rather than one text field.
2. Let any section be saved to a shared library and reused across prompts.
3. Compile the same prompt into multiple output formats (XML, JSON, Markdown, SDK code) without rewriting it.
4. Estimate token count and run cost per model before running the prompt.
5. Support variable interpolation (`{{var}}`) so one prompt template serves many runs.

## 3. Non-Goals
- Multi-user collaboration or auth
- Cloud sync / hosted storage (data model implies local filesystem — see §7 Open Questions)
- Running the prompt against a live model inside the editor beyond a lightweight Chat/Eval Stub check

## 4. Users
Prompt engineers / AI developers building and maintaining a personal or team library of production prompts, working locally.

## 5. Core Concepts (data model)

| Entity | Fields | Notes |
|---|---|---|
| **Prompt** | title, type tag (`General Task`, `Promptology`, `Template`), ordered `Section[]`, updated_at | A prompt is a stack of sections, not a string |
| **Section** | order index, name/tag, type (`SYSTEM`, `INSTRUCTION`, `CONTEXT`, `CONSTRAINT`, `FEW-SHOT`, …), content, `include` flag, token estimate | `include` hides a section from output without deleting it |
| **Section Library entry** | name, content preview, source prompt, tags | Any section can be promoted to the library and inserted into other prompts |
| **Variable** | `{{name}}` placeholder | Count shown in toolbar; interpolation is a toggle, not always-on |
| **Term Bank entry** | term, definition/preferred phrasing | Enforces consistent terminology across prompts (see checklist: "consistent terminology") |

## 6. Functional Requirements

| # | Requirement | Priority |
|---|---|---|
| 1 | User MUST be able to create, clone, and delete both prompts and individual sections | MUST |
| 2 | Each section MUST have a type dropdown and an `include` checkbox that excludes it from compiled output without deleting content | MUST |
| 3 | Right pane MUST show a live compiled preview that updates on every edit | MUST |
| 4 | Output MUST be selectable across formats: XML (Claude), JSON (OpenAI), Gemini AST, Markdown, Python SDK, TypeScript | MUST |
| 5 | Toolbar MUST show per-section token estimate and a total estimated token count + cost, driven by a selected model | MUST |
| 6 | Model selector MUST change the cost estimate | MUST |
| 7 | User MUST be able to save any section to a searchable, tag-filterable Section Library and insert it into the current prompt | MUST |
| 8 | Variables MUST support `{{var}}` syntax with an "Interpolate {{vars}}" toggle and a live count badge | MUST |
| 9 | User MUST be able to Export/Import a prompt or prompt set, and Copy or Save the compiled output as `.xml` | MUST |
| 10 | Term Bank SHOULD be available for consistent terminology across prompts | SHOULD |
| 11 | Prompt list SHOULD be filterable (all types / filled / by type tag) and searchable | SHOULD |
| 12 | A Tasks view SHOULD exist separate from the Prompts view | SHOULD |
| 13 | Each prompt SHOULD support Eval Stub and Chat tabs to sanity-check it without leaving the editor | SHOULD |
| 14 | A history/version scrubber MAY let the user step through prior edits of a prompt | MAY |

## 7. UI Layout

| Pane | Contents |
|---|---|
| Left | Prompt list (filter/search) + Section Library (filter/search, tagged, shows source prompt) |
| Center | Ordered section editor stack — each section shows: order #, name, type dropdown, include checkbox, token count, clone/delete |
| Right | Compiled output, format tabs, char count, Copy / Save `.xml` |
| Top bar | New Prompt / New Section / Template / Clone / Delete, model selector, token+cost estimate, Variables count, Term Bank, Export/Import |

## 8. Acceptance Criteria
- Toggling a section's `include` checkbox removes it from every output format's preview immediately, without losing its content.
- Switching the format tab re-renders the same section stack correctly in that format's syntax.
- Switching the model selector changes the displayed cost estimate without altering the prompt content.
- Saving a section to the library and inserting it into a different prompt does not mutate the original prompt.
- Import of an exported prompt reproduces the same section stack, types, and include states.

## 9. Open Questions
- Storage: `Base Dir` field suggests prompts are read from/written to a local project folder rather than a database — confirm.
- Section Library scope: per-project or global across all Base Dirs?
- Does the version scrubber persist history, or is it session-only?
