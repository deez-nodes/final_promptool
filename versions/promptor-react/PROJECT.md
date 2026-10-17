# Promptor — refine before extraction

Local project and issue descriptions. These records have NOT been published to Linear. No Linear IDs or remote project exist for this work.

## Project description

Rebuild `../promptor_v1.html` in React while preserving its effective body-plus-points editing workflow. Improve the reusable library sidebar first, then refine the cards, response grouping, keyboard flow, preview, and pane resizing. Deliver a self-contained HTML file that runs by double-clicking, without a server, network dependency, or installation for the user.

This is refinement before feature extraction. Features may later migrate as behavior or design, not necessarily as code. Preserve the original prototype. Do not turn reference-image sample copy into instructions, or implement every control pictured in a design reference.

## Confirmed design context

- `C:/Minty/WorkflowCapture/left-pane_&_clear-headings.png`: primary sidebar reference and highest product priority. Start with search, Library/Outline, All prompts, Starred, Snippets, collapsible project groups, selected rows, and reusable snippets.
- `C:/Minty/PROMPTORS_FEATURE_EXTRACTIONS/component_designs/button_designs.png`: wordmark, outlined action buttons, clear heading bands, dark surfaces. Copy, Save, New, and preview actions must remain easy to recognize.
- `C:/Minty/PROMPTORS_FEATURE_EXTRACTIONS/component_designs/starting-point_for_background-glow.png`: restrained glows around selected items and actions; a starting point, not a theme engine.
- Original screenshot: functional card structure, body text above points, freely named sections.
- The old theme is rejected. Full theme design/merging is later work. A usable base now is acceptable.
- The fourth image documents the Linear integration; it is not an app design reference.

## Delivery order

01 → 02 → 03/04/05 → 06/07/08 → 09/10 → 11. Issue 12 records future decisions only.

---

## 01 — Preserve the source and establish the local React build

### Context
The confirmed source is `C:/Minty/PROMPTORS_FEATURE_EXTRACTIONS/ordered_promptor_versions/promptor_v1.html`. It is a standalone DOM-based prototype with a reusable section library, separate prompt/reply drafts, autosave, generated XML, copy, movement shortcuts, and text/file drops. The user does not want to run a server.

### Action
Create a separate React source directory and bundle React, scripts, and styles into one directly openable HTML file. Keep data operations, persistence, serialization, and display components separate so later extraction is practical.

### Acceptance criteria
- Original prototype remains unchanged.
- The built HTML opens with a `file:` URL.
- React and all required styles/scripts are bundled; no CDN or remote font is required.
- Build instructions are for maintainers; normal use requires only the HTML file.

## 02 — Define durable document, section, quote, and library data

### Context
The source stores `lead` plus numbered points. Replies need multiple quotations with multiple response points belonging to each quotation. Saving by title in the prototype can unintentionally overwrite a different item; stable identity is preferable.

### Action
Use stable IDs for documents, sections, points, response groups, snippets, and projects. Keep text as literal user text. Use one Responding To section with repeated quote/response groups as the base representation: it makes ownership explicit without repeating top-level sections. This is an engineering choice, not a claim of proven superior LLM performance.

### Acceptance criteria
- Reordering or renaming preserves identity and content.
- Every response point belongs to exactly one quote group.
- Each document can belong to a local project and be starred.
- Save and load round-trip section bodies, points, and quote groups.

## 03 — Build the library sidebar from image 3

### Context
The user identifies this as the app's most important feature and likely selling point. The original bulky sidebar is not the visual foundation. Image 3 is explicitly approved as a starting point, not an instruction to copy its unrelated design inspector.

### Action
Implement search, Library/Outline switching, All prompts, Starred, Snippets, project groups, current selection, and reusable snippet insertion. Support basic project creation and document assignment. Keep saved documents and reusable sections distinct and easy to scan.

### Acceptance criteria
- Search filters actual saved content and titles.
- Project groups expand/collapse; loading a row opens the correct document.
- Starred shows only starred documents.
- Outline reflects the active draft and navigates to its sections.
- Saving a section makes it available as a reusable snippet; insertion preserves its structure.
- New, empty, selected, and no-results states are usable.

## 04 — Apply the supplied partial design system

### Context
The user rejected the existing theme and supplied button, glow, and sidebar references. They accept an unoptimized base. A full configurable theme system belongs to a later merge.

### Action
Use dark navy/black surfaces, bright lime/cyan heading accents, outlined semantic buttons, restrained glows, and readable body text. Make New and Save visibly actionable. Use a consistent accent for custom headings in this base; defer configurable semantic color rules.

### Acceptance criteria
- The layout follows the reference hierarchy and does not revert with operating-system light mode.
- Only the section title occupies the card's top line; controls sit elsewhere.
- Text, focus, disabled controls, and selected states are readable.
- No AI optimization, execution, Vim mode, or component-inspector feature is added merely because it appears in a reference.

## 05 — Preserve and refine body-plus-points cards

### Context
The primary redeeming quality is body text above independently editable points. These cards are to be honed before extraction, not replaced by an unrelated form or code editor.

### Action
Support freely named sections, auto-growing bodies and points, add/remove/reorder controls, save-section actions, and a visible undo for destructive changes. Retain Alt+Enter and Alt+Up/Down shortcuts where applicable. Preserve multiline pasted text without silently discarding content.

### Acceptance criteria
- Body text stays above the point list.
- Point operations preserve neighboring content and sensible focus.
- Long paragraphs, multiline code, punctuation, and custom names render literally.
- Section removal and document replacement are recoverable.

## 06 — Make Tab add a point with a cursor hint

### Context
The user clarified: from BOTH the section body and its last point, Tab adds a point. This supersedes the earlier ambiguous wording “single tab reaches + point.” The requested hint is “Tab adds point.”

### Action
On plain Tab in the body or final point, append and focus a new point. Show the hint near the editing caret while that shortcut applies. Keep Shift+Tab as backwards navigation; provide an explicit escape to normal forward navigation so the shortcut does not create a keyboard trap.

### Acceptance criteria
- Body → Tab creates and focuses a point even if other points exist.
- Last point → Tab creates and focuses the next point.
- Shift+Tab does not create a point.
- The hint is visible without obscuring text and updates with the caret.
- A keyboard user can leave the editor without adding endless points.

## 07 — Group multiple response points beneath each quote

### Context
“In response to” currently turns pasted paragraphs into ordinary numbered points. The user instead wants multiple quotes with multiple response points for each quote, grouped clearly for an LLM.

### Action
Place Responding To first in new reply documents. Add/edit/remove quote groups, each with its own source quotation and response-point list. Export explicit quote/response relationships. Keep ordinary document sections available below it.

### Acceptance criteria
- Two quotes can each contain two independent response points.
- Adding, removing, moving, saving, and reloading groups preserves associations.
- A quote without a response can remain as captured context.
- XML and Markdown exports make each quote's response ownership clear.

## 08 — Make preview and copying explicit

### Context
The prototype's “XML” button obscures that it opens a pane. Output syntax should not clutter the editing surface. The reference's format segment is a visual starting point, not a reason to hide the pane toggle.

### Action
Use Show preview / Hide preview, and a labeled XML/Markdown selector inside the preview. Keep generated output read-only, preserve literal content, and report actual clipboard success or failure. Provide a file-download alternative.

### Acceptance criteria
- The toggle label accurately describes its action and state.
- Editing updates preview and copy output consistently.
- Quote/response grouping survives both formats.
- XML escapes literal special characters and generates valid element names.
- Copy does not claim success if both clipboard methods fail.

## 09 — Add resizable panes with recovery controls

### Context
The user explicitly requires resizable panes for all designs. Sidebar importance must not leave the writing surface cramped, and preview visibility must not break the layout.

### Action
Add pointer and keyboard resizing for the library/editor and editor/preview boundaries. Allow collapse and restoration, keep recovery controls reachable, and persist widths. On narrow displays provide usable panel switching instead of clipping controls.

### Acceptance criteria
- Both dividers resize with mouse and keyboard.
- Collapsed panels can always be restored.
- Reopening preview and reloading preserve usable dimensions.
- Text areas grow/reflow when panes change size.
- Narrow-screen controls and content remain accessible.

## 10 — Save locally, back up, and import existing material safely

### Context
The source uses `prompttor.v1` localStorage and silently swallows storage failures. Browser storage under file URLs can be browser/path-specific. The new app must not overwrite the prototype's stored data or falsely imply disk durability.

### Action
Use a separate versioned key, visible autosave status, JSON backup/import, and legacy v1 conversion. Validate imported content before replacement. Explain browser-local storage and provide an import action for v1 data when it is accessible in the same browser.

### Acceptance criteria
- Reload restores drafts, library, projects, and layout in the tested browser.
- Backup/import preserves all user content and IDs.
- Invalid imports do not replace current data.
- Unreadable saved data is not automatically overwritten.
- Legacy conversion retains prompt/reply drafts and saved reusable pieces.
- Storage failure remains visible with a usable export path.

## 11 — Verify and hand off the directly openable app

### Context
Build success is not evidence that file-based execution, styling, keyboard interactions, and persistence work. Delivery must be concrete and inspectable.

### Action
Test model/serialization/import boundaries and exercise the actual built file in a browser: cards, Tab, responses, sidebar, save/reload, pane resizing, preview, and backup. Review desktop and narrow screenshots. Record exactly what was tested and any limitation.

### Acceptance criteria
- Automated checks cover content-preservation and serialization risks.
- A real browser opens the final file without a server.
- Essential user interactions are checked against the acceptance criteria above.
- Final handoff links to the HTML, editable source, local issue records, and verification record.

## 12 — Record later design and backlog-routing decisions

### Context
Full themes belong to a later merge. The earlier idea of sending selected points to todo/Kanban/issues is a proposed extension; the user has not selected routing destinations, synchronization rules, or an external write contract. Creating THIS project's Linear issues is separate from adding a Linear integration to the product.

### Action
Keep these as future work: configurable theme/color system, optimized sidebar behavior beyond the supplied base, external backlog routing, and feature extraction into another app. Record current rationale and references with the work rather than relying on agent memory.

### Acceptance criteria
- Future proposals remain explicit and discoverable.
- No external issue-tracker credentials or services are required to use this local build.
- Later issue routing must clarify destination, tagging, copy-versus-move, source links, and duplicate handling before implementation.
