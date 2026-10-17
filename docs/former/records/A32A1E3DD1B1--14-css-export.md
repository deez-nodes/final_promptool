# 14 — Export equivalent CSS

Status: Not started

## Dependencies

11; use the shared schema established by 07.

## Build task

Generate readable CSS containing both theme token blocks and theme-scoped component overrides using stable preview selectors. Include a short usage note naming the expected root attributes/selectors. Use a pure export function; document the small Monaco theme adapter needed because Monaco also requires JavaScript theme configuration. JSON remains the complete preset format.

## Outside this task

A generic site exporter, rewriting application files, claiming CSS alone applies Monaco syntax themes.

## Acceptance checks

- [ ] Apply exported CSS to a clean instance of the same preview components without the live inspector state; verify relevant computed styles match in both themes.
- [ ] Override scope is correct and cannot style the inspector.
- [ ] Exported CSS is valid.
- [ ] Demonstrate Monaco equivalence using the documented adapter and JSON values, or report that boundary explicitly.

## Completion record

Record clean-preview comparison and the CSS/Monaco boundary.

- Files changed: pending
- Checks and results: pending
- Known limitations: pending

User review amendment: Monaco was replaced by rich Markdown editing in task 09. Export equivalence now uses semantic rich editor selectors; no Monaco JavaScript theme adapter is required. Retain JSON as the complete design format. Earlier Monaco-specific clauses in this task are superseded.

