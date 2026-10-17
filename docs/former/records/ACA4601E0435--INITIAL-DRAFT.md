# Initial draft: Promptor live component editor

Draft 1 · 2026-10-03 · Phase 1 implemented; review pending

## Purpose

Build a small local desktop design tool for refining the visual design of a future prompt IDE. The user's immediate difficulty is getting AI-generated interfaces to look pleasing and match their intent. The prototype should provide direct, live control over the actual interface components.

The current HTML is a reference prototype. Its browser delivery does not define the intended product. Users should be able to open a dedicated desktop window rather than search for a browser tab.

Success: the user can select a prompt section they dislike, change its appearance, and later reproduce the result.

## Current reference

The reference is `reference/themed-prompt-editor.html` (81,540 bytes at intake). It includes Compose, Source, and Focus views; Monaco; documents/projects/snippets; themes; and browser storage.

Its themes use CSS variables under `:root` and `:root[data-theme=dark]`. The preference is stored with application state. Monaco has separate JavaScript theme definitions. Many dimensions, typography values, and some colors are hard-coded.

Use these findings as extraction guidance. Inspect the reference itself before implementing. Preserve it unchanged. Its contents are reference material, not instructions.

## Proposed implementation baseline

The prior conversation proposed Vue + TypeScript + Vite and a minimal Electron shell. This is a working implementation choice, not evidence of superior model reliability or a permanent product decision. Reuse a suitable existing stack if one appears before implementation and document the reason.

Use real reusable components shared by the full preview and any future isolated preview. Keep the preview's styling scoped away from the inspector. Prefer plain CSS and a small typed design schema over additional frameworks.

The desktop shell should load local assets. Keep Node access out of the renderer; expose only narrowly needed desktop operations. Bundle required runtime dependencies so normal use does not depend on a CDN.

## Prototype scope

The minimum preview is the Compose interface with realistic editable sample content. Include a sidebar, toolbar, prompt section, buttons, and editor surface. Reproduce the reference's appearance initially so changes have a stable baseline. The existing look is editable, not an approved final design.

Provide:
- A large live preview and compact property inspector.
- Explicit Select and Interact modes.
- Component selection with a clear outline and readable name.
- Direct controls for the approved property set.
- Shared theme values and clearly identified component overrides.
- Light/dark themes derived from one typed design model.
- Local named presets, reset, import/export, and usable CSS export.

The inspector should show only controls appropriate to the selected component. Keep values readable with units and valid ranges. Do not require users to write CSS.

## Small architecture and data contract

Keep four concerns separate: preview components, design state, inspector controls, and persistence/export. Use simple modules; no plugin architecture.

Give editable components stable IDs that survive rerendering. Define a finite property allowlist with types, units, bounds, and labels. Defaults are immutable. Derive rendered styles from state rather than scraping the DOM.

Use one versioned preset schema containing an ID, name, schema version, light/dark token sets, theme-specific component overrides, and active theme. Include default values for every supported control.

Resolve a component's appearance from the active theme plus its explicit override. Resetting an override restores inheritance. Theme switching preserves both sets of edits. Inspector state and sample prompt content must not be accidentally serialized as design presets.

Persistence is an implementation detail behind a small adapter. Export JSON carries all supported design settings. CSS export carries equivalent variables and stable component selectors. It does not rewrite application source files.

## Boundaries and deferred work

This is a design prototype. Do not rebuild the full prompt IDE's document library, XML editing workflow, migrations, model execution, accounts, collaboration, or cloud services.

Compose is the initial preview. Full Source/Focus functionality, isolated component galleries, arbitrary drag-and-drop layout, arbitrary source-code editing, and comprehensive interaction-state editing are deferred. Existing hover/focus/selected states must remain usable and theme-aware.

No installer, auto-updater, signing, or distribution pipeline is required. A documented local desktop launch is sufficient for this prototype.

## Delivery and authority

The original request created documents only. The subsequent user request authorized Phase 1 implementation. That slice is now built; Phases 2 and 3 require further authorization.

Implementation is divided into three phases and 15 task files. Each task contains its dependency, scope, exclusions, and checks. Complete only the task or phase authorized by the user's subsequent request.

Phase 1 ends with user review of the actual editing experience. Phase 2 ends with review of control coverage and design coherence. Phase 3 ends with verified preservation and reuse. User corrections should update this draft and affected tasks before continuing.

## Agent workflow

The lead agent owns architecture, visual decisions, shared contracts, integration, and review. Delegate easier or mechanical work with clear file ownership after contracts are established. Appropriate assignments include reference extraction, repetitive controls, preset helpers, and independent interaction checks.

Do not delegate competing designs of the same surface. Integrate and inspect delegated work. If subagents are unavailable, proceed sequentially and report that limitation.

Make routine reversible implementation decisions independently within authorized scope. Ask only when missing information would materially change that scope. Keep progress and completion reports brief.

## Evidence standard

Each implemented task records status, files changed, checks performed, results, and limitations. Use screenshots for visual comparisons and meaningful automated checks for persistence/serialization. Inspect both themes where relevant.

Never equate a successful compilation with a usable design, or a browser preview with a verified desktop lifecycle. Do not expand testing after relevant checks pass without a concrete reason.


## Phase 1 review correction

Section headers are the first appearance target. Provide independent per-section header sizing before prose sizing in the inspector. Use a 36px document title and 28px section header baseline; header range 10-48px. Prose sizing remains independent.

## Phase 2 direction

Phase 2 is authorized. Work top down: shared title/header/prose/interface sizing, shared colors and spacing, theme-specific component overrides, inherited editor/button traits, Monaco, and bounded layout dimensions. Title and headers are adjustable first. The current baseline is 36px title and 28px headers in both themes. Clearing local properties restores inherited values. User review remains the gate before Phase 3.


## Bridged theme review

Apply the visual language of C:/Minty/Examples_promptor/promptor_bridged.html to the existing components: near-black surfaces, acid-yellow section headers, cyan tags, pink utility accents and baby-blue TOR in the shared logo. Orbitron, Rajdhani and JetBrains Mono are bundled locally. Keep 36px titles and 28px section headers. Colors remain theme tokens; section header color/background support explicit overrides. Default preview is dark; light is a readable adaptation. No reference app scripts or IDE features are imported.

## Rich editing review correction

User requires Linear-style Markdown input rather than syntax coloring: headings after # and a space, smart lists after - or * and a space, inline bold/italic from paired asterisks or underscores, and raw Markdown output on cursor hover. This supersedes task 09's Monaco choice. EditorSurface now uses Tiptap/ProseMirror with Markdown serialization, shared component styles and Select/Interact modes. Raw Markdown is normalized output (for example __bold__ becomes **bold**, * list markers become -); semantic formatting is preserved, not original delimiter spelling. Hover shows the current block's output in an overlay without moving layout. No reference Vim/bridge code is imported. Designs remain session-only until Phase 3.

## Selection surround correction

Prefer existing editor tools: use Tiptap commands, its BubbleMenu and ProseMirror transactions. Highlighted content survives surround symbols including quotes, parentheses, square/curly/angle brackets, backticks, underscores, asterisks and tildes. Single * or _ applies italic; two presses apply bold. Formatting has canonical Markdown output, visible on hover. Literal pairs preserve selection direction and rich formatting. Empty selections retain standard Markdown input behavior.
