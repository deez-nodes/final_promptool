# Spec: PrompTOR — Prime User MVP

## Objective

Deliver a single-file HTML prompt/task editor for advanced users, supporting modular prompt assembly, reusable best-practice blocks, and live preview/export in multiple formats. All data remains 100% local, supporting privacy, rapid iteration, and versionable output for production prompt engineering. Prime user is a technical owner/power user, with owner-like control over all data and settings.

## Tech Stack

* HTML5, JavaScript (ES6+), CSS3, no external build tools required to run
* Delivery as a single portable file: `prompTOR.html`
* Only standard browser APIs (localStorage, File API)

## Commands

* Open/work: Double-click file in browser (no installation needed)
* Export: One-click download for prompt/task or compiled output
* Import: File picker dialog; merges saved prompts/tasks/blocks
* Backup: Export/Import cycles for full local backup

## Project Structure

* One HTML file, logically separated via banner comments and IIFE modules:
  * `PT.Templates` (schema, presets, merging)
  * `PT.Blocks` (best-practice text/sections)
  * `PT.Store` (CRUD, in-browser persistence)
  * `PT.Output` (output/compile logic)
  * `PT.Render.*` (UI: Sidebar, Fields, Preview)
  * `PT.Layout` (resizing, responsive, breakpoints)
  * `PT.App` (main wiring & event delegation)

## Code Style

* 2-space indent, trailing commas allowed
* Functional, modular, event-driven structure (ES6 arrow functions, avoid global scope)
* Inline documentation above key functions and modules
* Example: 

  ```js
  // Section: PT.Store
  // Handles saving/loading data to localStorage
  (function() {
      /\* ... \*/
      PT.Store.save = function(data) { ... }
  })();
  
```

## Testing Strategy

* Manual testing in core browsers: Chrome, Firefox, Safari, Edge
* Automated check for localStorage write/read/overflow
* Export/import tested with real roundtrips (no data loss)
* Quick sanity UI tests: prompt/task create, edit, export/import, responsive

## Boundaries

* Always: All edits/data are local only; must never require an internet connection.
* Ask first: If cloud or collaboration features are considered, must not compromise local workflow or privacy.
* Never: Send user prompts or task data anywhere by default; add tracking or telemetry without explicit user export.

## Success Criteria

* Fully local, portable, and “no-leak” per privacy goals.
* Prime user completes prompt/task authoring, exports, and backup with no unexpected errors.
* All major features (library, preview, output, export/import) demonstrably used by prime user in realistic scenarios.

## Open Questions

* Should library sections ever auto-sync across projects, or always require explicit export/import?
* Are custom extension/plugin mechanisms needed for field types or outputs in MVP?
* Should onboarding sample be on by default, or opt-in on first launch?