# Competitor review — hands-on (2026-10-13)

Source: the user's live walkthrough and screenshots in the browser, plus vendor pages. Raw market data: ../09_market-research_2026-10-13/

## TypingMind vs PrompTOR

| Axis | TypingMind | PrompTOR |
|---|---|---|
| What it is | Chat client for models | Prompt composer |
| First screen | "Enter API key to chat", then an email-capture giveaway popup | Opens on the work: sections, ready to type |
| Cost to run | License (~$30–39 after the 50%-off banner) plus per-call API billing | One price. Bridge (off by default, a button) uses the user's existing subscription through the terminal: no API key, no per-prompt bill |
| "Library" | The "Library" label looks like a button but isn't one; the real entry is a separate "Browse prompts" button | Library tree in the left pane, inserts into the focused section |
| Prompt editor | Title, description, one flat text box with {{field}} variables | Independent sections (Role, Task, Context, Examples, Output Format…), each becoming its own tag; numbered points; best-practice block chips |
| Bundled content | Canned "You are an expert…" prompts for marketing, law (NDA, contracts), market research, pitch decks; 9 example chats | None by default; the user's own material |
| Structure out | None. The user types any tags by hand | XML/MD generated on copy; one Copy button |
| Reply to a model's answer | Fork chat / switch message version only | Reply mode: quote, then Agreements / Corrections / Proposed edits / Questions |
| Vim | No | VIM toggle |
| Users | 20,641 daily claimed; 4,000+ paying in first 3 months (2023, self-reported) | Pre-launch |

## Other products seen in the walkthrough

| Product | Users / ratings | What it does | What it lacks |
|---|---|---|---|
| Prompt Optimizer (Chrome Web Store, Developer Tools) | 20,000 users; 4.2 from 14 ratings | Split pane: original prompt vs test content; one-click multi-round optimization; variable manager | Works only on a prompt that's already written. No place to compose |
| Oneshot AI Multi-Prompt Launcher | 161 users; 5.0 from 5 ratings | Sends one prompt to ChatGPT, Claude, Gemini and DeepSeek at once | Same: it launches a prompt, it doesn't help write one |
| prompt.always200.com | — | Optimizer workspace with a quality score (65 on the user's keyboard prompt) | Same |
| promptoptimizer.tools | — | $5/mo, $39/yr, $99 lifetime | Same |

## Pattern

Every product above acts on a prompt that has already been written: it optimizes it, launches it, stores it or chats with it. None of them is a surface for writing the prompt.

## TypingMind prompt editor, hands-on test (Claude in Chrome, 2026-10-13)

Path: left rail → Prompt Library → Create new prompt. Fields: Title (required), Description, Tags, and one Prompt textarea with `{{field}}` variables.
- Typed `# Role`, `- one`, Enter, `two <task>`.
  - The list did not continue on Enter.
  - The heading stayed a raw `#`, with no Markdown rendering or preview.
  - `<task>` got no closing tag and no highlight.
- No sections, no folding, no per-part reuse. Reuse means inserting the whole template.
- Editor tips cover chaining prompts in a queue, mentioning agents, and template variables. Nothing on structure or tags.

## always200 = Prompt Optimizer, hands-on (2026-10-13)

- The page at prompt.always200.com is titled "Prompt Optimizer", the same name as the 20K-user Chrome extension. They are very likely the same product: a web build and an extension. Unconfirmed.
- Layout: Original Prompt box → Optimization Model + Template → Optimize / Analyze. There's an Optimization Workspace with Render/Source/Compare views, and side-by-side test columns for Original vs Workspace, each running against a chosen model.
- **Analyze (the eval)** with no API key set returned "Evaluation Failed: Could not resolve authentication method", meaning it needs a key per provider. Its History shows earlier runs on "Chrome Built-in AI", Chrome's on-device model, which needs no key.
- **Data-loss hazard:** clicking Analyze replaced the Optimization Workspace text with the Original Prompt. Ctrl+Z brought it back. There was no warning.
- Every input is still a single text box. No sections and no structured export.
- Worth taking: a quality score with feedback (65 on your keyboard prompt), and the Original vs Optimized compare view.

## Linear: restructuring one ticket, user recording (2026-10-13)

Source: final 5 minutes of `ClaudeProjects\Promptor\agents-skills-flows-plans\Capture\Last 5 minutes.mp4`. Contact sheets are in `C:\Minty\_claude_scratch\last5`.
- About 5 minutes went into restructuring the description of DZ-36 (Theming Library), and it still wasn't clean at the end.
- Sections (Reference, Context) were moved by cut and paste, and blank gaps built up between them. PrompTOR does this with ▲▼.
- A comma run of text was split into bullets by hand. An empty bullet appeared, and a "List" heading had to be typed. PrompTOR splits a pasted list into points.
- Numbering was typed by hand (`q1:`, `q2:`), and a "Does that" fragment was left behind. PrompTOR numbers points automatically.
- Markdown leaked: `__…__` stayed as literal underscores.
- DZ-55: nesting a quote block and checkboxes under a bullet took several tries.
