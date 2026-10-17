# C — Counter-argument test: "just use Obsidian / VS Code / notes / snippets"

Retrieved 2026-10-13. Sourced facts only. Where a source was read through a summarizing fetcher, that is noted. "Not documented" means the cited doc page does not describe the capability; it does not show the capability is impossible.

Capability key:
- (a) reusable composable blocks
- (b) replying to specific passages of a model's response
- (c) structured/tagged export (e.g. XML-wrapped sections emitted by the tool)
- (d) per-task context isolation
- (e) published speed metrics

---

## 1. Capability matrix

| Tool | (a) Composable blocks | (b) Reply to passages of a response | (c) Structured/tagged export | (d) Per-task context isolation | (e) Speed metrics |
|---|---|---|---|---|---|
| **VS Code / GitHub Copilot `.prompt.md`** | Partial. Prompt files are Markdown + YAML frontmatter and can reference other files via Markdown links and `#file:`. `${input:var}` variables. The doc does **not** describe prompt-to-prompt composition. [doc](https://code.visualstudio.com/docs/copilot/customization/prompt-files) | Not documented [same doc] | Not documented. Output is a Markdown prompt sent to chat [same doc] | Per-prompt `agent`, `model`, `tools` frontmatter. Separately, subagents: "A subagent works in its own context and returns a focused result to the main agent." [subagents doc](https://code.visualstudio.com/docs/agents/run/subagents) | None published |
| **Continue.dev prompt files** | Markdown file with `name`, `description`, `invokable: true`; invoked with `/`. No template variables documented; inclusion of other prompts not documented. [doc](https://docs.continue.dev/customize/deep-dives/prompts) | Not documented | Not documented. "Prompts are included as user messages." [same doc] | Not documented [same doc] | None published |
| **Cursor rules (`.mdc`)** | Yes, at the rules level: split into "smaller, composable files" (<500 lines recommended); four apply modes (Always / file-glob / agent-decided / manual `@rule`). `@file` refs are not inlined. [doc](https://cursor.com/docs/context/rules) | Not documented | Not documented. Rule bodies are placed "near the start of the model context" [same doc] | Rules scoped by glob / mode; nested `AGENTS.md` merges with parents. Not per-task chat isolation. [same doc] | None published |
| **Roo Code modes / Boomerang** | Modes = `roleDefinition` + `customInstructions` + tool `groups` + `fileRegex`; rules dirs `.roo/rules-{mode}/` read recursively. [modes doc](https://roocodeinc.github.io/Roo-Code/features/custom-modes/) | Not documented | Not documented | Yes: "Each subtask operates in its own isolated context with a separate conversation history"; "only this summary returns to the parent." [boomerang doc](https://roocodeinc.github.io/Roo-Code/features/boomerang-tasks/) | None published |
| **Fabric (danielmiessler)** | Patterns are Markdown system prompts, run with `-p`; variables via `-v=#role:expert`; strategies (`cot`, `tot`) modify the system prompt. Direct pattern chaining not documented in README (only piping to other tools). [README](https://github.com/danielmiessler/fabric) | Not documented | `--output-session` exports a session to a file; no tagged-structure export documented [same] | Named `--session` and `-C/--context` flags; wipe/list flags [same] | None published |
| **Obsidian: Copilot for Obsidian** | Custom commands are Markdown notes in `copilot-custom-prompts/`; variables `{}` (selection), `{activeNote}`, `{[[Note]]}`, `{Folder/Path}`, `{#tag}`; `/` invocation. [doc](https://docs.obsidiancopilot.com/custom-commands/) | Not documented. Context = active note, selected note text, files, folders, tabs, agents. [doc](https://docs.obsidiancopilot.com/context-and-mentions/) | Not documented | Projects "give ongoing work its own instructions, context, and chat history"; doc does not state cross-project exclusion; "Ignore Files" "is not a file permission setting." [doc](https://docs.obsidiancopilot.com/projects/) | None published |
| **Obsidian: Text Generator** | "Create templates to automate repetitive AI tasks"; Handlebars-based; installable prompt packages. Partials/inclusion not covered in docs read. [README](https://github.com/nhaouari/obsidian-textgenerator-plugin), [docs](https://docs.text-gen.com/) ("Documentation in progress") | Not documented | Not documented | Not documented | None published |
| **Obsidian: Smart Connections / Smart Context** | Local-embedding related-notes; "Send to Smart Context" copies related content to clipboard "for use as context with any AI chat"; Smart Context (separate plugin) assembles notes "using context selectors, links, and templates." Smart Chat split into its own plugin. [README](https://github.com/brianpetro/obsidian-smart-connections) | Not documented | Clipboard copy of assembled notes; tag format not documented | Not documented | None published |
| **Obsidian: Templater** | Yes: `tp.file.include("[[MyFile]]")` — "Templates in the included content will be resolved"; supports section/block inclusion. [doc](https://silentvoid13.github.io/Templater/internal-functions/internal-modules/file-module.html) | N/A (not an LLM client) | User writes any text, including tags, into templates; no export feature | N/A | None published |
| **Espanso** | Nested matches: "include the output of a match inside another one" (`type: match`, since v0.5.0) — documented on the **legacy** docs page [legacy doc](https://espanso.org/docs/legacy/matches); current extension docs list clipboard, choice, form, shell, script [doc](https://espanso.org/docs/matches/extensions/), [variables](https://espanso.org/docs/matches/variables/) | N/A (text expander) | Plain-text insertion; tags only if typed into the snippet | N/A | None published |
| **TextExpander** | "Nest a snippet within another snippet"; clipboard macro. [doc](https://textexpander.com/learn/using/snippets/advanced-snippet-elements/more-advanced-functions); fill-ins [doc](https://textexpander.com/learn/using/snippets/snippet-fill-ins) | N/A | Plain text | N/A | None published |
| **Raycast Snippets** | `{snippet name="…"}` one level only: "Only snippets that don't reference other snippets can be inserted." Also `{clipboard}`, `{selection}`, `{argument}`, `{cursor}`. [doc](https://manual.raycast.com/dynamic-placeholders) | N/A | Plain text | N/A | None published |

### Adjacent: native chat UIs and passage-reply (b)
- OpenAI community feature request (Apr 6 2026): responses are "presented as a single block of text"; replying to part of one requires copy/paste; OpenAI Support said highlighting is a workaround that "doesn't preserve a clear connection between the response and the follow-up." https://community.openai.com/t/feature-suggestion-quote-reply-to-specific-text-segments/1378659
- Second request (Apr 17 2026) for forum-style "Reply with quote"; OpenAI Support: no timeline. https://community.openai.com/t/ability-to-use-forum-style-quoted-reply-feature/1379172
- Third-party tools exist for this (e.g. HighlightGPT on Product Hunt: https://www.producthunt.com/products/highlightgpt; meinGPT "Quote a passage": https://meingpt.com/en/docs/platform/chats/textstelle-zitieren). Not verified in depth.

---

## 2. Threads: "just use notes / Obsidian / text files / snippets"

Method: HN Algolia API (via fetcher; direct curl blocked by proxy) and web search for Reddit (read through reddit.sentinel-team.org snapshots). Product Hunt comment search was not reachable — **0 Product Hunt threads verified**.

### 2a. Responses on prompt-tool launch threads (strict criterion)
HN launch threads checked and result:

| Thread | Comments | "Use general tool instead" comments found |
|---|---|---|
| Show HN: I made an AI prompt manager to stop rewriting the same prompts (2025-05-29) https://news.ycombinator.com/item?id=44123511 | 9 | 1 soft: messi-ai: "Just saving them on side notes.." and later says prompt libraries feel inefficient / would be another place to lose prompts (paraphrased by fetcher). Founder replied: "that's what I used to do too (Notion, Apple Notes, random files everywhere)." |
| Show HN: Runprompt – run .prompt files from the command line (2025-11-27) https://news.ycombinator.com/item?id=46069556 | 49 | 2–3: orliesaurus: "Why this over md files I already make and can be read by any agent CLI ( Claude, Gemini, codex, etc)?"; benatkin suggests simonw's `llm` instead; dymk suggests `tee`/`cat`. |
| Show HN: A simple ChatGPT prompt builder (2024-01-31) https://news.ycombinator.com/item?id=39201182 | 106 | 0 for notes/editors. 2–3 say "just ask ChatGPT to write my prompts" (erellsworth: "That's great but I'll just ask ChatGPT to write my prompts."). |
| Show HN: Nova – GPT with composable prompts (2023-07-09) https://news.ycombinator.com/item?id=36651557 | 20 | 0 |
| Show HN: Build AI prompts 10x faster with drag-and-drop blocks (2025-10-01) https://news.ycombinator.com/item?id=45437174 | — | 0 from commenters; the **author** says they "debated just doing folders + plain text" (comment 45437190). |

Non-launch HN comments in the same vein:
- "Agent Skills" thread, Sherveen (2026-02-03): uses AutoHotkey to expand a trigger into a saved pre-prompt; suggests "turn it into a text expansion snippet so that it works no matter where you are." https://news.ycombinator.com/item?id=46871783
- rcarmo (2025-04-10): "I just use Obsidian's copilot sidebar plugin with a prompt that is essentially…" (a fixed review prompt; "Zero generation, zero automated edit, pure review and manual tweaking"). https://news.ycombinator.com/item?id=43643707
- lim8603 (2026-03-25): "I used to copy and paste the same prompt into Obsidian every time, then run it on two or three different AI models to compare the results." https://news.ycombinator.com/item?id=47514047

**Strict count (responses to prompt-tool launches recommending a general tool): 3–4 comments across 2 HN threads** (44123511, 46069556). Note most Show HN prompt managers found had 0–2 comments (32 hits listed for "prompt manager"; only one had >2 comments).

### 2b. Reddit "where do you keep your prompts" threads (not launch responses, but the habit itself)
- r/PromptEngineering, "Where do you store the prompts you actually reuse?" https://reddit.com/r/PromptEngineering/comments/1salnm5/ — snapshot captured 51 of 151 comments. Named stores: Obsidian ×3 ("In an Obsidian Base"), text-file folder ("I just have a folder with them all stored as text files."), Apple Notes/Notes ×2, Google Keep ×2, Notepad, Notion, Proton Docs, Google Sheets, Treepad; git repos ×4 (one "served through an MCP server"); CLAUDE.md/SKILL.md ×3; a Zsh plugin over .txt vaults; "I just have a bunch of scripts that echo "prompt" | pbcopy"; Text Blaze ("/main"); "Use your native text replacements tool"; phone shortcuts; Wispr Flow snippets; iOS Shortcuts; Win+V clipboard pins. Several commenters named dedicated apps (Prompt Nest, PrettyPrompt, Prompt Wallet, Musebox, PromptAnthology); OP promoted promptportal.io. (Post date from snapshot page is ambiguous.)
- r/PromptEngineering, "Where do you keep your prompts?" https://reddit.com/r/PromptEngineering/comments/1rws60n/ — nishant25: "I started with a notion doc, which worked until i had ~30 prompts and couldn't remember which version"; DEVONthink 4; Text Blaze ("I use text expansion. You can assign shortcuts to insert prompts."); "Notion, notepad and *.md files"; "SKILLS.md"; Microsoft Loop. OP's edit: settled on Text Blaze.
- r/ChatGPT, "Do people actually use prompt libraries?" https://reddit.com/r/ChatGPT/comments/1tmgbgl/ — "Mine are writen as files." Others use ChatGPT Projects / custom instructions.

### 2c. Documented personal workflow
- Bernardo Bechtold, DEV (2023-10-06): Notion DB vs Raycast Snippets for prompts; Raycast `{clipboard}` placeholder for proofreading; claims are qualitative ("without touching the mouse"); Notion flow described as four manual steps (locate, copy, paste, fine-tune). No composition of snippets described; no timings. https://dev.to/bernbecht/juggling-ai-prompts-with-a-tech-virgo-1dga

**Against the founder's standard (efficient prompting AND re-prompting with speed, scale, context isolation in those tools):** no thread or write-up found that documents re-prompting (answering a model's reply point-by-point) or timed speed in Obsidian/VS Code/snippet tools. Evidence found is of *storage and insertion* of prompts.

---

## 3. Measured evidence: format/structure and context length

**Sclar, Choi, Tsvetkov, Suhr — "Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design" (arXiv 2310.11324, Oct 2023; v2 Jul 2024).** Few-shot formatting changes yield differences of "up to 76 accuracy points" for LLaMA-2-13B; sensitivity persists with larger models, more shots, and instruction tuning; format rankings correlate weakly across models; proposes FormatSpread. https://arxiv.org/abs/2310.11324

**He, Rungta, Koleczek, Sekhon, Wang, Hasan — "Does Prompt Formatting Have Any Impact on LLM Performance?" (arXiv 2411.10541, Nov 2024).** Plain text vs Markdown vs JSON vs YAML on OpenAI GPT models; abstract: GPT-3.5-turbo "varies by up to 40% in a code translation task"; GPT-4 more robust. https://arxiv.org/abs/2411.10541
Table values (read via fetcher from https://arxiv.org/html/2411.10541v1; verify before quoting): MMLU GPT-3.5-0613 59.7 (JSON) vs 50.0 (MD); GPT-4-1106 81.2 (MD) vs 73.9 (JSON). HumanEval GPT-4-32k 76.2 (Plain) vs 21.95 (JSON). GPT-3.5 consistency on MMLU: only 16% identical responses between Markdown and JSON. Top-format IoU across model series often <0.2. GPT-3.5 tends to prefer JSON, GPT-4 Markdown; no single format wins everywhere. Fetcher could not trace the "40%" figure to the CODEXGLUE BLEU tables (gaps ~9–12 BLEU).

**Voronov, Wolf, Ryabinin — "Mind Your Format" (arXiv 2401.06766; ACL Findings 2024).** 21 models (770M–70B), 4 classification datasets: a poor template can drop strong models to roughly random-guess; best template does not transfer across setups or within a model family; Template Ensembles improve average performance. https://arxiv.org/abs/2401.06766 , https://preview.aclanthology.org/setup/2024.findings-acl.375

**Tam et al. — "Let Me Speak Freely?" (arXiv 2408.02442, Aug 2024).** "a significant decline in LLMs reasoning abilities under format restrictions" (constraining *output* to JSON/XML/YAML); stricter constraints → larger drops. Relevant counterweight: structure on output can hurt reasoning. https://arxiv.org/abs/2408.02442

**Liu et al. — "Lost in the Middle" (TACL 2023/24, arXiv 2307.03172).** Performance is highest when relevant info is at the beginning or end of context; drops in the middle, including for long-context models. https://arxiv.org/abs/2307.03172

**Chroma — "Context Rot" (Hong, Troynikov, Huber; Jul 14 2025).** 18 LLMs, 194,480 calls. Performance "grows increasingly unreliable as input length grows"; even one distractor reduces performance; shuffled haystacks beat coherent ones across all 18 models; LongMemEval focused prompts (~300 tokens) scored significantly higher than full prompts (~113k tokens) for all model families (exact accuracies only in charts). https://www.trychroma.com/research/context-rot

**Anthropic docs — prompting best practices.** XML tags "help Claude parse complex prompts unambiguously… reduces misinterpretation"; use "consistent, descriptive tag names"; nest for hierarchy. No quantification of the XML benefit. Long-context: put documents at top; "Queries at the end can improve response quality by up to 30 percent in tests" (no methodology given). https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
**Anthropic engineering — "Effective context engineering for AI agents" (Sep 29 2025).** Recommends "XML tagging or Markdown headers to delineate these sections"; "attention budget"; sub-agents "with clean context windows" returning "a condensed, distilled summary… (often 1,000-2,000 tokens)." https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

**Prompt-composition speed / tooling studies.**
- Prompt-with-Me (Li, Sergeyuk, Izadi; arXiv 2509.17096, Sep 2025): in-IDE structured prompt management; 1,108-prompt taxonomy; user study n=11; SUS 73; NASA-TLX 21; **no time measurements** — efficiency gains self-reported. https://arxiv.org/abs/2509.17096
- Liang, Lin, Rao, Myers — "Prompts Are Programs Too!" (arXiv 2409.12447; FSE 2025): 20 developer interviews; developers struggle to form reliable mental models of model behavior; call for prompt-programming tools. No timing data. https://arxiv.org/abs/2409.12447v2
- **No peer-reviewed timed comparison of prompt composition speed (dedicated tool vs notes/snippets) was found.** No peer-reviewed benchmark isolating XML tags vs other delimiters was found (only blog posts).

---

## 4. Present vs absent (per docs read)

**Present in general tools:**
- (a) Reusable blocks: all; true nesting/inclusion in Templater (`tp.file.include`), TextExpander (nested snippets), Espanso (nested matches, legacy docs), Raycast (one level only), Cursor (composable rule files), VS Code (file links/`#file:`).
- Variables/fill-ins: VS Code `${input:}`, Copilot-Obsidian `{activeNote}`/`{[[Note]]}`, Fabric `-v`, Raycast `{argument}`/`{clipboard}`, Espanso form/choice, TextExpander fill-ins.
- (d) Context isolation: Roo Boomerang subtasks (explicitly isolated), VS Code subagents (own context), Copilot-Obsidian Projects (own instructions/context/history, isolation not stated), Fabric named sessions.

**Absent / not documented in any doc read:**
- (b) Replying point-by-point to quoted passages of a model's long response — not documented in VS Code prompt files, Continue, Cursor rules, Roo, Fabric, Copilot-Obsidian, Text Generator, Smart Connections; not applicable to snippet expanders. ChatGPT users were still requesting it in Apr 2026.
- (c) One-step export of a sectioned prompt as XML-tagged structure — not documented anywhere; achievable only by hand-writing tags into templates/snippets.
- (e) Speed metrics — none published by any tool; none found in studies.
