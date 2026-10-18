# Promptor local workbench

Open `../Promptor.html` in your browser. It contains React, the application, and all styles. No server, account, internet connection, or installation is required for normal use. The original `promptor_v1.html` is preserved.

## Use

- **New** starts a prompt or a reply. Your previous draft stays in the library.
- **Save** / **Ctrl+S** saves the current document to the library. Draft edits also autosave in this browser.
- **Save section** stores its body, points, and quotes as a reusable snippet. Click a snippet to insert a copy. Reply snippets join an existing Responding To section.
- **Library** provides search, project groups, Starred, and Snippets. **Outline** jumps to sections in the current document.
- Use the project selector above the title to assign the prompt to a project. The plus beside Projects creates a project.
- **Tab** from a section body or its last point adds and focuses another point. **Shift+Tab** navigates backward. **Escape, then Tab** leaves normally.
- **Alt+Enter** inserts a point after the current one. **Alt+Up/Down** moves points or sections.
- Replies group each quotation with its own response points. Add as many quotes and points as needed.
- **Show preview** opens generated XML or Markdown. **Copy** / **Ctrl+Enter** copies the selected format. Download provides a file alternative; XML downloads receive a single `<prompt>` root.
- Drag the dividers to resize. Focus a divider and use arrow keys to resize by keyboard. Double-click or press Enter to collapse; the Library and Show preview controls restore panes. Narrow windows use overlays instead of squeezed columns.
- Drag plain-text files or text into a card or the library to add context.
- **Backup** downloads the entire workspace as JSON. **Import** validates a backup before offering to replace the workspace. Undo restores the prior workspace during the current session.

## Storage

Drafts and library data live in browser storage under `promptor.react.local.v1`. They are not written into the HTML file. Storage can depend on the browser and the file location; back up before moving the file, changing browsers, or clearing browsing data. Storage failures are shown in the app.

**Import from original v1** reads `prompttor.v1` only when that data is accessible from this browser and location. It never modifies the original key. You can also import a v1-format JSON backup. The browser may isolate storage between different `file:` URLs.

The supplied initial prompt is an editable example based on the user's brief, with clarified proposed edits. The app does not act on the text it contains.

## Maintain

```powershell
cd promptor-react
npm ci
npm test
npm run build
```

The build produces `dist/Promptor.html` and the user-facing `../Promptor.html`. The dependency lockfile fixes the installed versions. Normal use does not require these commands.

## Source boundaries

- `src/model.js`: document structure, quote relationships, export, validation, legacy conversion.
- `src/storage.js`: browser storage, backup parsing, downloads, clipboard fallback.
- `src/components.jsx`: cards, text areas, sidebar, dividers, and small controls.
- `src/main.jsx`: workspace state and action wiring.
- `src/styles.css`: the partial design system and responsive layout.
- `PROJECT.md`: 12 local issues with context and acceptance criteria; not published to Linear.
- `VERIFICATION.md`: checks completed and their limits.

Full theme customization, external backlog routing, and extraction into another prototype remain future work. No AI execution, optimization service, or external tracker integration is included.
