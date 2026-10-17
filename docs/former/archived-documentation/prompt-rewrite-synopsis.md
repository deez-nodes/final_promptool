# Prompt rewrite synopsis — PrompTool vocabulary question

Four variants of the same request, each run once in an isolated side process with an identical product-context block. Nothing else differed.

## Verdict first

**D1 Use v4 (below).** It is v3's shape (array with parenthetical asides + a verdict enum) with v2's one open-ended ask folded in. v3 produced the only correct definition of *Bank* and the cleanest per-term coverage; v2 produced the only new idea (rename tag/section → *Block*).

**F1 Your parenthesis instinct is right, but not for the reason you suspect.** The parenthetical is not "randomness that loosens the model." It is a per-item slot that smuggles two things into a list: a fact (`bank (term bank — completions)`) and a question (`new (new what?)`). A clean list has nowhere to put either. The model answers what is in front of it; the aside puts the missing object and the doubt right next to the term. That is why v3 alone got Bank right — it was the only variant that said what Bank was.

**F2 Input form is mirrored by output form.** XML-tagged input → coded D/F list. Prose → prose plus a table. `terms = [...]` → a table with a verdict column. The original (unstructured, questions trailing off) → the longest, most consultative answer, four frameworks, an offer to do more. If you want a table back, hand it something table-shaped.

**F3 Content converged; the prompt shape moved the *edges*, not the center.** All four landed on Object-Oriented UX (Prater) + Nielsen #2 "match system to real world", and all four regrouped the header by object. The differences were exactly the things a variant asked for explicitly: v2 asked for *one word* and got *Block*; v3 asked for a verdict enum and got a disciplined keep/rename/drop/needs-object column; v1 asked for codes and got codes.

**R1** n = 1 per variant, one model. Some of the spread is sampling noise. Treat F2/F3 as strong tendencies, not laws.

## Per-variant results

| | v0 original | v1 XML-tagged | v2 prose | v3 array + asides |
|---|---|---|---|---|
| Form of answer | Long prose, 2 tables, offer to mock up | Coded D/F/O list, header in code block | Prose, definitions list, header split by *location* | Table, verdict per term, header in code block |
| Bank defined as | Library (wrong) | Save to library (wrong) | Send blocks to library (wrong) | Autocomplete snippets (**right**) |
| Tag vs section | Drop "tag" | Drop "tag" | **Rename both → Block** | Drop "tag" |
| Up/down | Drag handle | Keep, add drag | Keep, demote to hover/overflow | Drag handle, arrows as a11y fallback |
| Clone | Overflow menu | **Drop** (name collision in XML) | **Drop** (Bank covers reuse) | Keep, rename Duplicate |
| Frameworks | OOUX, Norman/Nielsen, IA labeling, direct manipulation | OOUX, Nielsen #2, progressive disclosure | OOUX, Nielsen #2/#4, controlled vocabulary | OOUX, Nielsen #2/#4, information scent |
| Distinctive move | Empty-state onboarding, 5-word glossary, card sort | Export ≠ Save .xml separation | Move `+ Add block` to bottom of stack; header becomes title bar | Import/Export ▾ menus expose scope |

## Frameworks the runs agree on (for the design question itself)

- **Object-Oriented UX** (Sophia Prater): name the nouns — Prompt, Section, Template, Snippet/Library — then hang verbs on them. Diagnoses the header exactly: verbs with no object.
- **Nielsen heuristics #2 and #4**: users' words, one word per concept. "Tag" is the serializer's word; it should exist only inside Inspect.
- **Controlled vocabulary / labeling systems** (Rosenfeld & Morville): a one-page glossary both UI copy and code draw from.
- **Progressive disclosure**: primary verbs visible, backup/destructive verbs behind a menu.
- **Information scent** (Pirolli & Card): a label must predict the outcome before the click. "Bank" has none.

## The three rewrites, as tested

### v1 — XML-tagged
```
<problem>
First-time users of PrompTool cannot tell what the header verbs act on. Undefined or object-less terms: New (new what?), Section, Template, Bank, Export (export what?), Import (import what?). The per-card controls up / down / clone may be redundant: fixed sectioning already implies order and identity. The words "tag" and "section" are used for the same thing.
</problem>

<ask>
1. Define each term in one line, in the words a new user needs.
2. For up / down / clone: keep or drop, with the reason.
3. Resolve tag vs section: pick one word and say where the other disappears.
4. Name 2–3 established design frameworks or patterns that address this class of confusion (naming, object-verb pairing, progressive disclosure) and apply one concretely to this header.
</ask>

<format>
Terse. Assign codes: D1..Dn decisions, O1..On options, F1..Fn findings. No preamble.
</format>
```

### v2 — conversational
```
The current PrompTool layout is close. What's left is vocabulary. A new user opens it and sees New, Section, Template, Bank, Export, Import across the top and has no idea what any of those verbs act on — new what, export what, import what? Down in the cards, up/down/clone feel like leftovers: the fixed section stack already carries order and identity, so I'm not sure they earn their place. And we say "tag" in one spot and "section" in another for what is really one thing.

Give me a one-line definition for each term as you'd write it for a first-timer, a keep-or-drop call on up/down/clone, one word to replace tag/section, and two or three established design frameworks that deal with exactly this kind of naming confusion — then show me how one of them would reshape the header.
```

### v3 — array with asides
```
PrompTool, header + card controls. Audit the vocabulary for a first-time user.

terms = [
  new        (new what?),
  section    (vs "tag" — same thing, two words),
  template   (a prompt? a kind of prompt? a section preset?),
  bank       (term bank — completions; unclear from the label),
  export     (export what — the prompt, the library, everything?),
  import     (same question),
  up / down / clone  (do these survive once sectioning is fixed and ordered?)
]

for each term: definition (one line, new-user words) + verdict (keep | rename | drop | needs object).
then: which 2–3 traditional design frameworks resolve this class of problem, and apply one to this header.
Codes D/O/F. Terse.
```

## v4 — recommended (untested; v3 + v2's open ask)
```
PrompTool, header + card controls. Audit the vocabulary for a first-time user.

terms = [
  new        (new what?),
  section    (vs "tag" — same thing, two words; propose ONE word, may be neither),
  template   (a prompt? a kind of prompt? a section preset?),
  bank       (term bank — Tab completions; unclear from the label),
  export     (export what — the prompt, the library, everything?),
  import     (same question),
  up / down / clone  (do these survive once sectioning is fixed and ordered?)
]

for each term: definition (one line, new-user words) + verdict (keep | rename → x | drop | needs object).
then: 2–3 traditional design frameworks that resolve this class of problem; apply one to the header and show the regrouped header.
Codes D/O/F. Terse. Table for the terms.
```

## How to use the finding

- **A1** When a list item is ambiguous *to you*, put the ambiguity in a parenthetical on that item. The model resolves it per item instead of globally.
- **A2** When an item has a fact the model cannot know (what Bank is), the parenthetical is the cheapest place to put it. Every variant without it guessed wrong.
- **A3** Pick the register of the answer you want and write the question in it. Structured in, structured out.
- **A4** Reserve one open-ended ask per prompt ("propose ONE word, may be neither"). Enums produce discipline; a single open slot produces the new idea.
