# Verification

## Automated checks

`npm test`: **10 passing tests**.

- Literal-text preservation and XML escaping.
- Multiple quote/response associations in XML and Markdown.
- Fresh IDs and independent content when reusing a section.
- Rejection of invalid backups without mutation.
- Corrupt browser storage blocked from automatic overwrite.
- Independent storage key and round-trip persistence.
- Legacy v1 migration of both drafts and reusable material.
- Safe reorder boundaries.
- Imported layout clamping.
- Response snippet insertion into one existing Responding To section.

`npm run build`: **passed**. One self-contained HTML file, approximately 279 KB, with React and styles bundled. Installed versions: React/React DOM 19.3.1, esbuild 0.25.12.

## Browser checks

The actual built HTML was served temporarily on loopback for verification in the in-app Chromium browser.

- Desktop rendering reviewed at the default 1280×720 viewport.
- Narrow editor reviewed at 390×844; library can be hidden, toolbar wraps, and quote/response content remains readable.
- Tab from a section body creates and focuses a point.
- Tab from the final point creates the next point.
- Shift+Tab does not add a point.
- Escape then Tab exits the text editor normally.
- Alt+Enter in the middle of a list inserts between existing points.
- Responding To body adds a response point to its last quote group.
- Two quotes with two independently editable response points each created successfully.
- Preview clearly toggles; XML and Markdown retain quote associations.
- Copy succeeded; the browser clipboard contained the generated Markdown.
- Keyboard resizing updated both sidebar and preview widths.
- Save, search, star, project creation, project assignment, and reusable section saving exercised.
- Reload restored reply content, snippets, and pane widths.
- Reusing a response snippet kept one Responding To section and appended its quote groups.
- Undo restored the pre-insertion workspace.
- Invalid JSON import displayed an error and left the current draft intact.

## Limits

- Direct `file:` navigation is prohibited by this browser tool. Therefore direct double-click launching and file-origin persistence were not automated. The package has no runtime server or external asset dependency; visual checks used the same built bytes over temporary local HTTP.
- Valid backup import, legacy import, and corrupt-storage recovery are covered by model tests; their complete browser flows were not all exercised.
- Pointer resizing, file/text dropping, and download completion were not separately automated. Keyboard resizing was verified.
- No Linear project or issues were created. `PROJECT.md` preserves the issue descriptions locally.

Screenshots under `screenshots/` are verification captures; the narrow reply screenshot includes temporary test content, not additional shipped library items.
