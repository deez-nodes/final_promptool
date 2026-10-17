# 02 · Anthropic docs — "Mark pasted text in user messages"

## User's words (verbatim)

> It was over before it began. I still enjoy the fight, even when I know I'm gonna win. Facial Le'Fluer. It was on the Google Home page articles baby boy.

Earlier, same thread:

> Then Anthropic themselves added sections on the best practices documentation about making sure use id_numbers and xml tags in user cited text in prompts. Like only a week ago or so.

## Asset map

| File | What it shows |
|---|---|
| `assets/anthropic_confirms_promptor.png` | Docs section: wrap pasted blocks in `<pasted_content id="ab12">…</pasted_content id="ab12">`, matching random ID, plus a system-prompt note. Original filename chosen by user. |

## Claude's notes
- The screenshot ties the benefit to prompt-injection robustness (Opus 5.5); it does not state a reasoning-quality claim.
- Source URL was not supplied; only the screenshot.

Cross-refs: 01 (Reply mode "In Response To"), 04 (`promptor-editor.html` quote/source/comment tags).
