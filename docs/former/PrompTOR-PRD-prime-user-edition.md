# PrompTOR — Prime User Edition

### TL;DR

PrompTOR is a zero-install, structured prompt and task editor for technical users. It modularizes prompt creation, reuse, and export for production-grade AI prompt engineering—all locally in a single highly-usable HTML file. Target users are prompt engineers, advanced developers, and power users who value full control and transparency.

---

## Goals

### Business Goals

* Deliver a robust, locally-running prompt engineering tool requiring no installation or cloud account.
* Enable rapid authoring and management of reusable prompt components and tasks with minimal friction.
* Position PrompTOR as the standard for professional, reproducible, and auditable prompt workflows.
* Support integration points for future cloud features or collaborative extensions.

### User Goals

* Build, edit, reuse, and export prompts as modular, versionable stacks rather than text blobs.
* Seamlessly switch between prompt, task, and best-practice templates with full customizability.
* Preserve complete user control and privacy: no cloud saves, all data is local.
* Achieve high productivity with keyboard shortcuts, responsive UI, and fast "save/share/import/export" cycles.

### Non-Goals

* No built-in collaboration (multi-user support).
* No cloud-dependent features or persistent remote storage.
* No live LLM execution beyond simple chat/eval stubs.

---

## User Stories

**Primary Persona: Prime User (advanced prompt engineer/tech lead)**

* As a prime user, I want to break prompts into reusable sections so I can iterate and swap components efficiently.
* As a prime user, I want to save and reuse best-practice blocks so future work is more reliable.
* As a prime user, I want instant feedback on token counts and cost estimates so I can target the right model with each prompt.
* As a prime user, I want to export/import or copy prompts between machines or projects.
* As a prime user, I want the tool to never send my data to any server or third-party by default.

---

## Functional Requirements

* **Prompt and Task Authoring** (Priority: MUST):
  * Modular editor supporting ordered fields/sections, templates, and best-practice blocks.
  * Section library for storing/reusing snippets or blocks across prompts.
  * Quickly switch base templates, with presets offering guided fields for common scenarios.
* **Persistence & Export** (Priority: MUST):
  * All data stored in browser localStorage; one-click export/import for migration or backup.
  * Export compiled output in multiple formats (Markdown, XML, JSON, code, etc.).
* **Live Preview & Feedback** (Priority: MUST):
  * Real-time preview of compiled prompt in all supported formats.
  * Model selector with on-the-fly token and cost estimation.
* **UI Layout & Responsiveness** (Priority: MUST):
  * Resizable panels, responsive breakpoints for tablet/mobile, and sidebar as drawer on small screens.
  * Accessible by keyboard with VIM-mode support for editing.
* **Advanced Features** (Priority: SHOULD):
  * Section "include" toggles for preview/output control.
  * Search and filter the prompt/task list and section library.
  * Optional Term Bank for preferred vocabulary/consistent phrasing.
  * Eval Stub generation for offline/automated prompt testing.
* **Edge Cases** (Priority: SHOULD):
  * Graceful handling of localStorage overflow/full scenarios.
  * Onboarding sample or first-prompt wizard for new users.

---

## User Experience

**Entry Point & First-Time User Experience**

* Users download/open prompTOR.html and see an empty-state with a call-to-action ("Create your first prompt" or load a sample).
* Simple onboarding tip for exporting to save/back up work.

**Core Experience**

* User creates a new prompt or task from a template.
* Adds or arranges fields/sections/blocks; adjusts "include" toggles and ordering as needed.
* Switches preview output formats; updates are shown live.
* Adds sections to the library or reuses from library when needed.
* Exports/imports as single-file bundles or compiled outputs.

**Advanced Features & Edge Cases**

* Section library can be filtered/tagged and is global (per user, not just per project).
* When editing a library section, changes are local unless explicitly updated in the library.
* Responsive breakpoints adjust layout and UI for mobile or tablet users. Resizer handles are touch-friendly.
* On localStorage overflow, user gets a clear, actionable error with export options.

**UI/UX Highlights**

* Keyboard-centric navigation (tab/enter, VIM-mode toggle).
* Clear, high-contrast color theme for focus and accessibility.
* Tooltip help for advanced output, eval, or block selection.

---

## Narrative

Prime User "A'hlang," an advanced prompt engineer, routinely iterates on LLM prompts for complex production use. Tired of maintaining messy text files and losing reusable logic, A'hlang opens PrompTOR: a zero-install, modular prompt/task builder running entirely locally. Instantly, they start building a complex workflow prompt, reusing past best-practice blocks and seeing real-time feedback on cost and structure. The drag-and-drop editor, side-library, and live preview let A'hlang iterate rapidly—without any data leaving their machine. After exporting to XML for Claude and Markdown for internal docs, A'hlang shares a prompt bundle with a teammate. Fast, safe, and fully under their control—PrompTOR becomes the cornerstone of their AI engineering toolkit.

---

## Success Metrics

### User-Centric Metrics

* Number of prompts/sections created and exported by a single user per month (tracked only in-app, with opt-out).
* Frequency of prompt-to-prompt section library reuse.
* User-reported error/bug occurrences via optional feedback export or log.

### Business Metrics

* Downloads and active local session counts.
* Qualitative feedback or upvotes in user/developer forums.

### Technical Metrics

* Export/import reliability (zero export/import failures across supported environments).
* App load and action latency (<100ms on section/task edits/previews).
* Zero network activity or data egress (verified by audits).

### Tracking Plan

* Prompt or task creation events.
* Section library add/delete/insertion events.
* Export/import initiation.
* Error alerts (local only).

---

## Technical Considerations

### Technical Needs

* Modular JS: internal IIFEs for namespaced logic in a single HTML file.
* Data stored via browser localStorage; import/export flows.
* Clean interfaces between template logic, render/preview, storage, and UI controls.

### Integration Points

* Pluggable architecture for future expansion: new output formats, additional best-practice blocks, or cloud integration.

### Data Storage & Privacy

* All user content stored 100% locally; exportable for backup but not synced/hosted anywhere by default.
* No background data sharing or telemetry unless the user exports logs intentionally.

### Scalability & Performance

* Must handle >100 prompts/tasks per user with negligible performance degradation.
* UI and storage logic should anticipate browser quota limitations.

### Potential Challenges

* LocalStorage quota limits and lack of real cross-device backup.
* Cross-browser quirks in file input/output and storage persistence.
* Ensuring the UI remains responsive and accessible for all users—including those exclusively on keyboard or screen-readers.

---

## Milestones & Sequencing

### Project Estimate

* Medium: 2–4 weeks for MVP with zero-install HTML app, modular logic, live preview, and library features.

### Team Size & Composition

* Small team: 1–2 people (Product/Tech Lead + UI Engineer/Frontend Generalist).

### Suggested Phases

**Phase 1: Modular HTML MVP (1–2 weeks)**

* Key Deliverables: Core modular editor, base templates, best-practice block system, local storage CRUD. (Product + Engineer)
* Dependencies: None (local only).

**Phase 2: UX/Output/Export Enhancements (1 week)**

* Key Deliverables: Resizable panels, responsive UI breakpoints, export/import, real-time output preview. (Engineer)
* Dependencies: Completion of base editor.

**Phase 3: Advanced Library/Onboarding (Up to 1 week)**

* Key Deliverables: Section library tagging/search, onboarding sample/wizard, clear overflow handling, user guides/tooltips. (Engineer + Product)
* Dependencies: Prior phases complete.
