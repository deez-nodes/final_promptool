# prompTOR — Workspace Shell & Composition PRD

**Status:** draft · **Target:** the Nuxt studio (`app.vue` → `pages/`, `components/`, `composables/`)
**Scope:** layout, theme, editor, prompt composition, organization, tasks, ambient tooling
**Persistence ceiling for this spec:** browser-local only (localStorage). No server, no account.

---

## 1. Problem Statement

The studio's shell is fixed, its state is fragile, and its opening screen is a wall of text. Pane
widths are hard-coded (`w-72` sidebar, `w-[38%]` preview, both `flex-shrink-0`), so a long
`few_shot` block and a 6-target compiler preview compete for a center column that cannot be widened.
First run seeds a 12-section template plus a fully-written architect prompt, so the first thing you
see is someone else's prompt rather than a place to write yours. Underneath, a schema version bump
silently overwrites saved work, and every keystroke re-serializes the entire workspace to
localStorage.

The cost of not fixing this is that the tool loses to a plain text file for the one thing it exists
to do — drafting a prompt — because a text file resizes, does not seed itself with twelve blocks you
did not ask for, and does not lose your work on a schema change.

---

## 2. Current-State Audit

Everything below was read out of the working tree, not assumed.

| Area | Today | File |
| :--- | :--- | :--- |
| Studio page | `index.vue` and `promptool.vue` are the **same page** — a 78-line diff, all comments. `editor.vue` is a 7-line redirect to `/`. Every layout change is written twice. | [pages/index.vue](../pages/index.vue), [pages/promptool.vue](../pages/promptool.vue) |
| Pane sizing | Fixed. `w-72` / `flex-1` / `w-[38%] min-w-[340px]`, all `flex-shrink-0`. No divider, no collapse, no persistence. | [pages/promptool.vue:4](../pages/promptool.vue:4), [:391](../pages/promptool.vue:391) |
| Section editor | Plain `<textarea class="resize-y">`. Manual resize is per-session and unsaved. | [pages/promptool.vue:294](../pages/promptool.vue:294) |
| Autocomplete anchor | Popup positions at `el.getBoundingClientRect().bottom` — the bottom edge of the whole textarea, not the caret. On a 40-line block the suggestions appear nowhere near where you are typing. (The `+ window.scrollY` term is dead: `body` is `overflow:hidden`.) | [pages/promptool.vue](../pages/promptool.vue) `checkAutocomplete` |
| Reordering | The number badge is styled `cursor-grab active:cursor-grabbing` with **no drag handler** — decoration. Only ▲/▼ work. | [pages/promptool.vue:207](../pages/promptool.vue:207) |
| `Ctrl+K` | Advertised in the Navbar tooltip *and* in `PROMPTOOL_SPEC.md`. **No global key handler exists anywhere in the app.** | [components/Navbar.vue](../components/Navbar.vue) |
| Composition | `insertLibrarySection` deep-copies via `cloneSection`. A guardrail fixed in one prompt stays broken in the other eleven. | [composables/usePromptStore.ts:821](../composables/usePromptStore.ts:821) |
| First run | `buildSeedStore()` creates a 12-block template + a filled architect prompt. | [composables/usePromptStore.ts:453](../composables/usePromptStore.ts:453) |
| Save | `saveToStorage()` fires from `updateSectionInCurrent` — a full `JSON.stringify` of the workspace **per character typed**. Quota failure is a `console.warn`. | [composables/usePromptStore.ts:589](../composables/usePromptStore.ts:589), [:793](../composables/usePromptStore.ts:793) |
| Load | `initStore()`: if `parsed.version !== VERSION`, the store is replaced by the seed store **and immediately written back**. A schema bump destroys the workspace. | [composables/usePromptStore.ts:557](../composables/usePromptStore.ts:557) |
| Theme tokens | Defined in **four** places that already disagree: `tailwind.config.ts`, `assets/css/main.css` `:root`, `myfiles/tokens.json`, `index.html` `:root`. | see F1 |
| Contrast | `muted` `#54607a` on `#07080e` = **3.17:1** — below AA (4.5:1) — and it is used at 10–11px for token counts, timestamps, and placeholders. `DESIGN_SYSTEM.md` names `#808ea8` "color-text-muted" and claims 5.6:1 (actual 6.05:1); the code calls that one `muted2`. The doc and the code disagree about which token the word "muted" means. | [tailwind.config.ts](../tailwind.config.ts) vs [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| `darkMode: 'class'` | Set in Tailwind. Nothing ever toggles the class. | [tailwind.config.ts:11](../tailwind.config.ts:11) |
| Tasks | No implementation. Working prior art exists in `promptology.html`: a Prompts/Tasks mode toggle with `task_id`, `depends`, and `badge-done`/`badge-blocked`/`badge-task` status. | [promptology.html:538](../promptology.html:538) |

---

## 3. Goals

1. **The shell gets out of the way.** Pane widths and visibility are yours, they persist, and the
   editor can occupy the full window when you are writing rather than compiling.
2. **First paint is a place to write.** Opening the app on a clean profile shows one prompt with a
   handful of empty labeled sections — not a library dump.
3. **Nothing is ever silently lost.** No schema change, quota exhaustion, or reload destroys a
   prompt without saying so and offering an export.
4. **A block is fixed once.** Editing a shared guardrail updates every prompt that uses it, instead
   of leaving eleven stale copies.
5. **The theme stops drifting.** One token source generates the Tailwind config and the CSS
   variables; every text color used under 14px clears 4.5:1.

---

## 4. Non-Goals

| Not doing | Why |
| :--- | :--- |
| Server or account-backed sync | Persistence ceiling for this spec is the browser. Every requirement below is designed to survive a later move to disk or a server, but none assumes one. |
| Keeping the static `index.html` / `src/*.js` build at feature parity | It is a different architecture with its own `checks/` harness. Holding both to the same spec doubles every requirement below. Treated as archived unless you say otherwise. |
| Mobile / small-screen layout | A three-pane prompt compiler at 375px is a different product. Below 900px the app may degrade to the editor pane alone; nothing further is specified. |
| Real-time collaboration, presence, comments | Single-user tool. The reference graph in C1 is deliberately simple because there is no merge to handle. |
| A plugin/extension API | Premature. Ambient features (sounds, timer) are built in, not as a plugin surface. |
| Live model execution / API calls | The archived `bridge.js` covers this ground; see [archive/README.md](../archive/README.md). Out of scope here. |

---

## 5. User Stories

**Composing**

- As a prompt author, I want to widen the editor and hide the compiler preview so that a long
  few-shot block is readable without horizontal cramping.
- As a prompt author, I want the first thing I see on a fresh install to be an empty prompt so that
  I can start writing instead of deleting.
- As a prompt author, I want to drag a section to a new position so that reordering a ten-section
  prompt does not take nine clicks of ▲.
- As a prompt author, I want autocomplete to appear at my cursor so that I can see the suggestion
  and the text it will replace at the same time.
- As a prompt author, I want long sections to collapse so that a prompt with twelve blocks is still
  navigable.

**Reusing**

- As a prompt author, I want to insert a guardrail as a *reference* to one shared block so that
  fixing it once fixes it everywhere.
- As a prompt author, I want to see which prompts use a shared block before I edit it so that I know
  the blast radius.
- As a prompt author, I want to detach a reference into a local copy so that one prompt can diverge
  without forking the shared block.

**Organizing**

- As a prompt author, I want folders and tags so that thirty prompts are not one flat list.
- As a prompt author, I want to pin the four prompts I actually use so that they are not buried.
- As a prompt author, I want a task with an id, a status, and dependencies so that multi-step work
  lives next to the prompts that do it.

**Trusting it**

- As a prompt author, I want to see that my work is saved so that I do not have to guess.
- As a prompt author, when storage fails, I want to be told and handed an export button so that I
  can rescue the workspace instead of discovering the loss on the next reload.

**Working in it**

- As a prompt author, I want the shortcuts the UI advertises to actually fire so that `Ctrl+K` opens
  the Term Bank.
- As a prompt author, I want optional keypress sound so that long drafting sessions feel like
  typing on a real board.
- As a prompt author, I want a pomodoro readout in the header so that I can time a drafting session
  without leaving the tool.

**Edge cases**

- As a returning user after a schema change, I want my prompts migrated or preserved — never
  replaced by seed content.
- As a user with a collapsed preview pane, I want re-opening it to restore my previous width, not a
  default.
- As a user who has never granted notification permission, I want the pomodoro to work anyway.

---

## 6. Requirements

P-levels are **sequence, not permission** — everything here ships. P0 is what the rest stands on.

### P0 — Foundation

#### F0. One studio page

`index.vue` and `promptool.vue` are duplicates; `editor.vue` redirects to `/`. Every layout
requirement below would otherwise be implemented twice and drift immediately.

- [ ] Exactly one component tree renders the studio; the three-pane shell lives in a layout or shell
      component, not inline in a page.
- [ ] Deleting the redundant page file produces no visible change.
- [ ] A check asserts the string `preview-pane` appears in exactly one file under `pages/` +
      `components/`.
- [ ] `composables/useRevxIde.ts` (615 lines, unreferenced by any surviving page) is either wired to
      a real route or moved to `archive/`.

#### F1. One token source, and a theme that passes its own spec

- [ ] `myfiles/tokens.json` is the single source. The Tailwind `theme.extend.colors` block and the
      `:root` custom properties in `assets/css/main.css` are both **generated** from it.
- [ ] A check fails when any hex in `tailwind.config.ts` or `main.css` is absent from `tokens.json`.
- [ ] Every token used for text under 14px clears **4.5:1** against `--bg`. `muted` (`#54607a`,
      currently 3.17:1) is raised, or demoted to borders/dividers only and its text usages
      repointed at `muted2` (6.05:1).
- [ ] `DESIGN_SYSTEM.md` token names match the code's names one-to-one. The doc's
      `color-text-muted` / the code's `muted` collision is resolved in the doc, not by renaming the
      code out from under existing classes.
- [ ] Components reference tokens through CSS custom properties or Tailwind token names — never a
      raw hex. A check fails on a six-digit hex literal in `components/` or `pages/`. (`#0d1017` in
      `CodeEditor.vue` is a current violation.)
- [ ] `darkMode: 'class'` is either wired to a real toggle or removed. Dead configuration is a lie
      about what the app supports.
- [ ] Contrast ratios are recorded in `DESIGN_SYSTEM.md` as computed values, with the script that
      computes them checked in — so the next token change re-verifies instead of re-asserting.

#### F2. No silent data loss

- [ ] `initStore()` never overwrites a store it failed to parse. Unknown or older `version` runs a
      migration; unmigratable data is copied to a timestamped backup key and the user is told, in
      the UI, that a backup was taken.
- [ ] Writes are debounced to ~400ms idle plus a flush on blur, route change, and `pagehide`.
      Today the full workspace is serialized on every keypress.
- [ ] Quota exhaustion surfaces a persistent banner — not a `console.warn` — with a one-click
      **Export workspace JSON**.
- [ ] A save-state indicator in the header reads *saved* / *saving* / *failed*, with the last-saved
      time on hover.
- [ ] Layout preferences (pane widths, collapse state, sounds, timer config) live under a **separate**
      storage key from prompt data, so clearing or corrupting one never takes the other.
- [ ] Verification: bump `VERSION`, reload, confirm prompts survive; fill localStorage to quota,
      type, confirm the banner appears and export works.

#### L1. Resizable panes

- [ ] Draggable dividers between sidebar↔editor and editor↔preview.
- [ ] Minimums enforced: sidebar 200px, preview 300px, editor never below 320px. The editor is the
      pane that yields last.
- [ ] Widths persist across reload and are stored as fractions of window width, so restoring on a
      different monitor does not push the editor below its minimum.
- [ ] Double-click a divider resets that pane to its default width.
- [ ] Hit area ≥6px with a visible hover state; `cursor: col-resize`; text selection suppressed for
      the duration of the drag only (the shell's blanket `select-none` should not be the mechanism).
- [ ] Pointer events, not mouse events — trackpad and touch both work.
- [ ] The divider is focusable; ←/→ move it 16px, Shift+←/→ 64px, Home/End jump to min/max.
- [ ] Resize does not re-render section editors (no remount, no lost cursor position).

#### L2. Collapsible panes

- [ ] The right preview pane collapses to a rail with a visible re-open control; the editor claims
      the freed width.
- [ ] The left sidebar collapses the same way.
- [ ] Re-opening restores the width the pane had before collapsing, not the default.
- [ ] Both toggle by keyboard (see K1) and by clicking the rail.
- [ ] Collapse state persists across reload.
- [ ] With both panes collapsed the editor is usable full-width — no orphaned borders, no
      `min-w` fighting, no horizontal scrollbar on `body`.

#### L3. A smaller first screen

- [ ] First run opens **one** prompt containing at most three empty, labeled sections
      (`system`, `instructions`, `output_format`).
- [ ] The twelve `SEED_BLOCKS` remain available as Section Library content and via an explicit
      **Load example prompts** action — they are no longer the opening view.
- [ ] The empty state names the next action rather than the product.
- [ ] Loading examples later is idempotent and never duplicates existing blocks.
- [ ] Measured: a clean profile shows the compose affordance without scrolling at 1280×800.

#### R1. Real drag reordering

- [ ] A section drags by its number badge to any position; a drop indicator shows the landing slot.
- [ ] ▲/▼ keep working — drag is added, not substituted.
- [ ] Escape cancels an in-flight drag and restores the original order.
- [ ] Alt+↑/↓ moves the focused section — the keyboard path is not the buttons alone.
- [ ] A reorder is one undoable action, not N swaps.
- [ ] Auto-scroll when dragging past the top or bottom edge of the editor pane.
- [ ] Dragging does not blur the editor's caret or drop in-flight text.

#### K1. Shortcuts that exist

- [ ] A single global handler owns: `Ctrl/Cmd+K` Term Bank · `Ctrl/Cmd+B` toggle sidebar ·
      `Ctrl/Cmd+\` toggle preview · `Ctrl/Cmd+Shift+C` copy compiled output ·
      `Ctrl/Cmd+Enter` focus preview · `?` shortcut overlay.
- [ ] Shortcuts do not fire while typing in an input or editor unless explicitly editor-scoped.
- [ ] `?` opens a list of every binding, generated from the same table the handler uses.
- [ ] A check fails when a `title`/`kbd` in the UI advertises a binding with no handler. This is the
      regression that produced the current `Ctrl+K` situation.

### P1 — The working surface

#### E1. A real editor

**Recommendation: CodeMirror 6, not Monaco.** The prompt page mounts one editor *per section* —
twelve simultaneous instances is normal. Monaco is a multi-megabyte, worker-backed IDE core designed
to be the single editor on a page; twelve of them is not viable, and it needs SSR guards throughout.
CodeMirror 6 tree-shakes to a few hundred KB, is built for many small instances, and its completion
extension is a proper home for the Term Bank engine. Monaco earns its weight only if this becomes a
single full-document editor.

- [ ] Each section body is an editor instance; the store still holds a plain string — no
      editor-specific state is persisted.
- [ ] `{{variable}}` and XML tag decoration in the editor matches the preview's existing
      highlighting exactly (same tokens, same treatment).
- [ ] Term Bank autocomplete becomes the editor's completion source, **anchored at the caret**.
- [ ] Current behavior preserved: Tab cycles candidates, ↑/↓ navigate, Enter accepts, Escape closes,
      bank terms outrank document terms and are badged.
- [ ] Soft wrap on; no line-number gutter for prose sections; auto-height to content with a max
      before internal scroll.
- [ ] Client-only mount — no hydration mismatch, no SSR crash.
- [ ] Undo/redo is per-section and does not fight the store's own undo.
- [ ] Typing latency is not measurably worse than the textarea with twelve sections open.
- [ ] `components/CodeEditor.vue` — the hand-rolled gutter no page currently uses — is replaced by
      this or deleted.

#### L4. Section body collapse

- [ ] Sections beyond ~12 lines collapse to a preview with a click to expand.
- [ ] Collapse state is per-section and persists.
- [ ] Collapse-all / expand-all from the prompt header.
- [ ] Excluded sections (`include: false`) default to collapsed.

#### O1. Organizing

- [ ] User-created folders; drag a prompt into one; folders collapse; order within a folder is
      user-set and persisted.
- [ ] Free-form tags on prompts, with tag filtering alongside the existing kind filter.
- [ ] Pin/favorite to a top section of the sidebar.
- [ ] Prompt list reorders by drag — the same interaction as R1, not a second one.
- [ ] Search matches name, tag, folder, and body, and shows the matching snippet. Today's prompt
      search shows only the name and a tag list.
- [ ] Deleting a folder never deletes its prompts without an explicit, separate confirmation.

#### C1. Composability

Today composition is copy-on-insert. This makes shared blocks real.

- [ ] A section can be a **reference** to a shared block. Editing the shared block updates every
      referencing prompt.
- [ ] References are visually distinct and show a usage count.
- [ ] One click detaches a reference into a local copy.
- [ ] All six compilers resolve references at compile time; exported XML/JSON/MD/SDK output contains
      resolved text, never a placeholder.
- [ ] Workspace JSON export/import preserves the reference graph; importing a workspace with
      references into one without the shared blocks resolves them to detached copies rather than
      failing.
- [ ] A prompt can include another prompt as a block, with cycle detection and a clear error.
- [ ] Deleting a referenced shared block warns and lists the prompts that use it.
- [ ] Token and cost estimates count resolved content, not the reference stub.

#### T1. Tasks

Port the model already working in `promptology.html`.

- [ ] A task type: title, body, status (`todo`/`doing`/`blocked`/`done`), optional `task_id`,
      optional `depends` on other task ids.
- [ ] Tasks live in the sidebar under their own mode, with O1's folders, tags, and search.
- [ ] A task links to the prompt it drives; the prompt opens from the task and vice versa.
- [ ] A task whose dependency is unfinished renders as blocked — the state is shown, not merely
      stored.
- [ ] Tasks export to markdown in the `## [ID] Name` shape `promptology.html` already emits.
- [ ] A dependency cycle is reported, not silently rendered.

#### A1. Keyboard sounds

Small, independent, and safe to build any time after F1.

- [ ] Keypress audio in editor surfaces. **Off by default.** Toggle in a settings panel.
- [ ] Volume control; distinct samples for Enter and Backspace vs. ordinary keys.
- [ ] At least two sample packs, **self-hosted** — the project already self-hosts its fonts
      specifically so the page never phones home; audio holds the same line.
- [ ] WebAudio with a preloaded buffer pool and voice stealing. Not `new Audio()` per keystroke:
      that allocates, lags on first play, and stacks voices at typing speed.
- [ ] Audio never sits in the keystroke's critical path — input latency is unchanged with sound on.
      Verify at 8+ keys/sec.
- [ ] Auto-mutes when the tab is hidden.
- [ ] A global mute honors the setting immediately, without a reload.

#### A2. Pomodoro timer

- [ ] 25/5 default; work, short break, long break, and cycles-until-long-break all configurable.
- [ ] Compact readout in the header; click to start/pause; explicit reset.
- [ ] State persists as an **absolute end timestamp**, not a decrementing counter — so a reload or a
      throttled background tab does not drift. Verify: start a timer, reload after two minutes,
      confirm the remaining time is correct.
- [ ] Interval end signals with sound (respecting the A1 mute) and a visible state change.
- [ ] Browser notifications only if the user turns them on, and only after an explicit permission
      request. No permission prompt on load.
- [ ] The timer works fully with notifications denied.
- [ ] *After T1:* optionally attach the current pomodoro to a task and count completed intervals
      against it. Ships standalone first.

### P2 — Designed for, not built now

Listed so the P0/P1 work does not architect them out.

| Item | What it constrains now |
| :--- | :--- |
| Saved layout presets (compose / review / focus) | L1+L2 store layout as a serializable object, not scattered refs — so a preset is a saved instance of that object. |
| Prompt version history + diff | F2's debounced writer is the natural place to emit snapshots later; keep the write path single. |
| File System Access API save-to-folder | F2 keeps the serializer independent of localStorage so the sink is swappable. |
| Detached / second-window preview | L2 treats the preview as a mountable unit, not a hard-coded `<aside>` sibling. |
| Split editor — two prompts side by side | The shell component owns pane composition; the editor pane must not assume a singleton current prompt. |
| Alternate themes (light, high-contrast) | Exactly what F1's token indirection buys. No component may hold a hex. |

---

## 7. Success Metrics

Success here is "the features exist and behave," so these are verifiable conditions, not adoption
funnels. Mechanical ones belong in `checks/`.

**Done conditions (automated)**

| Check | Passes when |
| :--- | :--- |
| Single studio page | `preview-pane` appears in exactly one file under `pages/` + `components/` |
| Token drift | Every hex in `tailwind.config.ts` and `main.css` exists in `tokens.json` |
| Contrast | Every token used for sub-14px text ≥ 4.5:1 against `--bg` |
| No raw hex | No six-digit hex literal in `pages/` or `components/` |
| Shortcut coverage | Every binding advertised in a `title`/`kbd` has a handler |
| Migration safety | Bumping `VERSION` and reloading preserves all prompts |

**Done conditions (manual, one pass)**

- Set pane widths, collapse the preview, hard reload → identical layout restored.
- Clean profile → one prompt, ≤3 empty sections, compose affordance visible without scrolling.
- Drag section 9 to position 2 → lands there; Escape mid-drag → order unchanged.
- Edit a shared guardrail once → every referencing prompt reflects it, compiled output included.
- Start a pomodoro, reload after 2 minutes → remaining time correct.

**Regression guards**

- Keystroke-to-paint stays within one frame (~16ms) with twelve sections open and sounds on.
  Baseline first: today's path serializes the whole workspace per character.
- Compiled output for all six targets is byte-identical before and after C1 for prompts that use
  no references.

**Workflow signal (the real one)**

You stop opening a scratch text file to draft a prompt before pasting it in. That is the honest
measure of whether the shell got out of the way.

---

## 8. Open Questions

**Blocking**

- **Editor choice** — CodeMirror 6 (recommended above) or Monaco? Decide before E1 starts; the
  per-section instance count is the whole argument.
- **Where shared blocks live (C1)** — does the Section Library become the canonical store for
  referenceable blocks, or is *any* section in *any* prompt referenceable in place? The first is
  simpler to reason about; the second matches how the library is populated today (it harvests from
  existing prompts).
- **Section scroll model** — independent fixed-height editors per section, or continuous document
  flow? This decides L4 and E1's auto-height rule together.

**Non-blocking**

- **Tasks shape (T1)** — a separate top-level mode, as `promptology.html` does it, or a facet of
  prompts (a prompt *is* a task with status)? The former is a straight port; the latter is fewer
  concepts.
- **Static build** — does `index.html` / `src/*.js` stay in sync, or is it archived? Only matters if
  you later want E1's dependency to exist there too.
- **`useRevxIde.ts`** — 615 lines with no surviving route. Revive or archive?
- **Layout below 900px** — degrade to editor-only, or leave unspecified?

---

## 9. Phasing

Each phase is independently shippable and leaves the app in a working state.

**Phase 1 — Foundation.** F0, F1, F2.
Nothing visual. Removes the duplicate page, makes tokens generated and legible, and stops data loss.
Every later phase would otherwise be written twice and land on a store that can eat it.

**Phase 2 — The shell.** L1, L2, L3, R1, K1.
The layout features as asked. Depends on F0 (one page to change) and F2 (a separate, reliable place
to persist layout).

**Phase 3 — The surface.** E1, L4, O1.
Editor swap, section collapse, folders and tags. Depends on Phase 2 for stable pane geometry —
swapping the editor while pane widths are still being reworked means measuring against a moving
target.

**Phase 4 — The model.** C1, T1.
References and tasks. The only phase that changes the persisted schema, which is why F2's migration
path is Phase 1 rather than here.

**Anytime after Phase 1 — Ambient.** A1, A2.
Independent of everything else; they need only the settings panel and the token work. Good work to
drop in between phases.
