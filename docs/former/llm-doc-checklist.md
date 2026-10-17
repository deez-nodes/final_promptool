# LLM-Friendly Documentation Checklist

## Structure
- [ ] Clear hierarchical headers (##, ###)
- [ ] Critical info (constraints, non-negotiables, scope) stated early
- [ ] Distinct sections (Requirements, Out of Scope, Success Criteria) instead of prose blocks

## Specificity
- [ ] Concrete acceptance criteria (not vague adjectives)
- [ ] Input/output examples, including edge cases
- [ ] Explicit negative constraints ("do NOT do X")

## Precision of Language
- [ ] Consistent terminology (one term per concept, no synonyms)
- [ ] Unambiguous scope markers (MUST / SHOULD / MAY)
- [ ] Acronyms/domain terms defined on first use

## Format
- [ ] Tables for comparative/structured data
- [ ] Numbered steps for sequences, bullets for unordered sets
- [ ] Code blocks for literal content (paths, signatures, config)

## Avoid
- [ ] Vague qualifiers without concrete definition ("robust," "scalable")
- [ ] Deeply nested conditional prose (use table/decision tree instead)
- [ ] Mixing what/why/how in the same paragraph

## Doc-Type Skeletons
- [ ] PRD: problem statement → goals/non-goals → numbered requirements → acceptance criteria
- [ ] SDD: context/constraints → architecture decision → interfaces/contracts → edge cases
