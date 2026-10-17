# Promptor: live design editor

Start with [the initial draft](docs/INITIAL-DRAFT.md), then follow the phase guides.

Phases 1 and 2 are implemented: a local Electron window contains the Compose sample, shared light/dark themes, inheriting component overrides, bundled rich Markdown editor, and bounded layout controls. Title/header defaults are 36px/28px. The reference is unchanged. Phase 2 user review is pending; Phase 3 is not started.

## Build sequence

| Phase | Outcome | Tasks |
| --- | --- | --- |
| [1: Prove live editing](docs/phases/PHASE-1.md) | Desktop preview; select and restyle one prompt section | 01–05 |
| [2: Extend design control](docs/phases/PHASE-2.md) | Shared themes, overrides, other components, Monaco, dimensions | 06–10 |
| [3: Preserve and reuse](docs/phases/PHASE-3.md) | Presets, reset, JSON/CSS export, reliable reopening | 11–15 |

Every task has a separate file, dependencies, bounded scope, and observable acceptance checks. Tasks 01-10 are complete; Phase 2 user review is pending.

## Instructions for a new implementation chat

Read this README, the initial draft, the relevant phase guide, and the selected task. Inspect existing code before modifying it. Treat these documents as the shared project context; do not assume access to earlier chats.

When asked to build a phase, complete its tasks in dependency order and stop at its review gate. When asked to build one task, complete that task only. If a prerequisite is missing, identify it instead of silently expanding the assignment.

Update the task's status and evidence after implementation. Record changed requirements in the draft before dependent work proceeds. Keep the reference file unchanged.

## Reference

[Original HTML](reference/themed-prompt-editor.html) is copied unchanged from the supplied attachment. It is a visual and behavioral reference, not the production architecture or an accepted final design.

## Delegation and verification

The lead agent owns architecture, shared interfaces, visual coherence, integration, and final review. Delegate bounded extraction, repetitive component work, persistence helpers, or independent checks to subagents when useful. Assign explicit file ownership and inputs/outputs. Define shared interfaces before parallel implementation; do not let agents independently redesign the same UI or edit the same files.

Verify each task's observable behavior. Use automated checks for data round trips and meaningful state transitions, and rendered inspection for visual changes. Build success alone does not prove visual quality. Record limitations honestly; do not mark native launch/restart checks passed from a browser-only test.

Keep communication brief.

## Local launch

Prerequisite: Node.js 22.12+ (tested on 24.19.0). From this folder, install dependencies once with `npm install`, then run `./launch.ps1` in PowerShell. It type-checks, builds local assets, and opens the desktop window. `npm start` is equivalent when npm works normally.

Dependencies are already installed here. The default npm shim on this machine is broken; installation used the bundled npm CLI under `C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js`. The launch script avoids that shim.

Select a section, adjust background/text size/padding, choose Interact to edit text, then return to Select. Use the preview theme button for light/dark. All edits are session-only until Phase 3.

## Verification

`npm run build` checks TypeScript and builds. `npm test` verifies interactions, both viewport sizes/themes, reference screenshots, and actual Electron close/reopen. For this workspace's local browser download, first set `$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/.playwright"`. On a clean checkout install the test browser with `npx playwright install chromium`.

See [Phase 2 evidence](docs/PHASE-2-EVIDENCE.md) for current checks and screenshots. [Phase 1 evidence](docs/PHASE-1-EVIDENCE.md) records the original slice.

## Phase 2 review workflow

Use Theme to set title and header sizes first, then prose/UI sizing, colors and spacing. Select a component for an explicit local exception; Clear restores inheritance. Editor and button selection is nested: Select parent moves to the section or toolbar. Layout controls sidebar/content width, section gap and shared padding. Interact enables headings, smart lists, and inline bold/italic. Hover formatted content to see normalized raw Markdown output.



## Selection formatting

In Interact, highlight text and use the built-in Tiptap selection menu or Ctrl+B for bold (Markdown: **text**). Ctrl+I toggles italic. Typing * or _ formats the selection as italic; pressing it twice makes it bold. Backticks apply inline code and ~ applies strike-through. Quotes, parentheses, brackets, braces and angle brackets surround the selection and preserve its text. Hover to inspect the exported Markdown. Undo reverses wrapping.

Both side panes have independent resize grips with no minimum width or viewport maximum. They may collapse to zero or cover the center entirely. Grips remain reachable at screen edges; focus a grip and use arrow keys (Shift for larger steps), or Home to collapse. Resizing preserves the editor instance and draft. Pane content wraps and scrolls at narrow widths. Widths remain session-only.
