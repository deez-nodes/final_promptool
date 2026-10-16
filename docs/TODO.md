# Docs TODO — everything above the code

Target: the intended Nuxt + Nuxt UI app. Source of truth for extraction: current `src/`.

## Core
- [ ] PRD — `docs/PRD.md`
- [ ] User Stories — `docs/USER-STORIES.md`
- [ ] Specs — `docs/specs/` (output, eval-stub, templates, persistence, files, vim, ui)
- [ ] ADRs — `docs/adr/` (nuxt, local-storage, output-format, default-item, mode-forces-template, theme, bridge-deferred)

## Missing
- [ ] Architecture overview — `docs/ARCHITECTURE.md`
- [ ] Data model — `docs/DATA-MODEL.md`
- [ ] Template authoring guide — `docs/TEMPLATE-GUIDE.md`
- [ ] Acceptance criteria / test plan — `docs/ACCEPTANCE.md`
- [ ] README / runbook — `README.md`
- [ ] Glossary — `docs/GLOSSARY.md`
- [ ] Migration note, Vue → Nuxt — `docs/MIGRATION-VUE-TO-NUXT.md`
- [ ] Changelog — owner decides whether wanted

## Deferred
- [ ] Bridge (live model session: API contract, Optimize / Run / Chat) — not until the app is complete

## Test
- [ ] Reconstruction: fresh agent reads `docs/` + `README.md` only, writes what it would build; diff against code and intent
