# Phase 2 delivery · 2026-10-03

Tasks 06–10 implemented and verified; user review pending. Phase 3 is not started.

## User direction and implementation

Work top down. Shared document title size is 36px, section headers 28px, prose 13px. Theme typography controls follow that order. Per-section headers remain adjustable. Light/dark tokens and sparse overrides are independent.

Resolution follows shared theme → parent component traits → explicit local override. Section background, text color and prose size pass to its editor. Toolbar background, color, border color and type size pass to its buttons. Clear restores the latest inherited value. The inspector labels inherited/local values and remains visually independent of preview edits.

Supported targets: document title; sidebar; toolbar; toggle-sidebar/star buttons; Role, Context, Goal, Task, Constraints, Output sections and their editors. Registered targets use stable IDs and a property allowlist. Nested selection chooses the nearest target; Select parent moves outward.

Title supports size/color. Sections support header/prose sizes, background/text/border, border width, padding, gap and radius. Sidebar/toolbar/buttons support relevant type/color/border/spacing/radius. Editors support type, background/text/border, border width, padding and radius.

## Verification

- Vue TypeScript check and Vite production build pass.
- Six Playwright checks pass: pure inheritance/allowlist resolution; live global/local/clear/theme behavior; component coverage and nearest selection; Monaco model/text/caret/undo preservation; layout bounds; actual isolated Electron window close/reopen.
- Browser observes zero external requests. Production output contains Monaco code, Markdown grammar, editor worker and codicon font locally. Actual Electron loads Monaco from built local assets twice.
- Sidebar width 160–340px, content width 400–1200px, section gap 0–48px, component padding 0–48px tested at minimum/default/maximum in both target viewports. Preview clamps widths to available space. Document and inspector scroll; no outer page overflow. Monaco model ID and content survive layout changes.
- Global type/color changes leave local exceptions and inspector chrome intact. Switching light/dark preserves each set. Clearing a header override adopts the current shared header size. Parent selection and editor inheritance verified.
- Local edits change one target while leaving another section unchanged. Controls validate colors/numbers through the typed metadata and render only allowed properties.
- Editor text entered in Interact survives theme, style, and mode switches with identical model ID and caret. Undo remains available after returning to Interact (Select mode is intentionally read-only).
- Dependency audit: zero vulnerabilities. Monaco 0.55.1 uses its established ESM integration paths; DOMPurify override `^3.4.16` patches its transitive dependency.
- Original reference SHA256 remains `F6B79C483042A5859F6068C3B29F4932B80632BE967291809FB10B591F3C1BC2`.

## Visual evidence

Inspected light and dark captures. Title and section heading hierarchy now follows user review direction; Monaco preserves the monospaced prose surface. Section padding applies on all sides in Phase 2, and shared spacing can affect container geometry. The sidebar remains fixed sample data. No full prompt IDE features were added.

| Viewport | Light | Dark |
| --- | --- | --- |
| 1280×800 | [Light](../evidence/phase2-light-1280.png) | [Dark](../evidence/phase2-dark-1280.png) |
| 1600×1000 | [Light](../evidence/phase2-light-1600.png) | [Dark](../evidence/phase2-dark-1600.png) |

[Desktop first launch](../evidence/phase2-desktop-1.png) · [Desktop reopened](../evidence/phase2-desktop-2.png)

## Limits and review

Design and prompt edits remain session-only; replacing/restarting the app starts a fresh draft. Existing Phase 1 control meanings are carried into the model, but there was no saved Phase 1 design to migrate. Presets, reset, JSON/CSS export belong to Phase 3. Monaco contributes a large (~3.8MB uncompressed) bundle; Vite reports its chunk-size warning. Desktop launch checks run outside the agent sandbox because restricted Electron execution previously crashed.

Launch `./launch.ps1`. In Theme, change section header size globally. In Component, set one local header size. Change the global size again, then Clear the local exception. Select the editor and its parent, switch themes, edit text in Interact, and adjust Layout dimensions. Review control coverage and inheritance clarity before Phase 3.

## Applied reference theme

Applied the supplied bridged theme through typed tokens and src/bridged-theme.css. Added section/header surfaces, header color, tag color, secondary accent and logo blue controls. BrandLogo.vue shares the acid/yellow and baby-blue TOR logo between workshop header and sidebar. All fonts are local @fontsource packages. Existing inheritance and Monaco checks passed; corrected a skin rule that initially blocked sidebar radius overrides. Source HTML remains unchanged. Preview now defaults to dark. The source supplies dark only; light remains a derived adaptation.

## Rich Markdown amendment

User explicitly requested in-place headings, smart lists, bold/italic and raw hover output. EditorSurface now uses Tiptap/ProseMirror plus Markdown; Monaco is removed from the runtime and dependencies. Fifteen tests pass, including input rules, list continuation/exit, canonical raw-hover output, undo, literal s/space typing, inherited styling, state preservation, layout and native desktop reopening. Hover overlay does not change the editor bounding box. Existing Monaco measurements above are historical. See evidence/rich-markdown-heading.png. Output normalizes equivalent Markdown delimiters. Type check and build pass; current JS bundle is approximately 538KB uncompressed.


## Selection formatting verification

Selection formatting uses the existing Tiptap BubbleMenu, mark commands and a small ProseMirror surround extension. Seventeen new checks cover quotes/brackets/braces/angles/parentheses, selected text preservation, undo, italic/code/strike, repeated asterisk/underscore bold and the visible Bold menu with raw-hover output. All 31 browser checks pass. The Electron launch/reopen check also passes outside the restricted sandbox (restricted launch fails on Windows sandbox ACLs). Type check and production build pass; JS is approximately 582KB uncompressed with Vite's chunk-size warning. See ../evidence/selection-bold.png. No remote publication is performed.
