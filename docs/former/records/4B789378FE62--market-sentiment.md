# Market sentiment: the chat box is the problem

Collected 2026-09-25. Web sources only; the Mo Bitar video Minty cites is paywalled or unindexed and is not quoted here.

## The pain, in other people's words

| Who | What they say | Source |
|---|---|---|
| OpenAI forum, 2023 to 2024, still open | "If the ChatGPT uses markdown, why not the user?" "It's like I'm writing code in Notepad instead of an IDE." Markdown still does not render in the input bar. | [community.openai.com](https://community.openai.com/t/add-markdown-support-to-input-bar/70242) |
| FlipEnter author, Sept 2025 | "The Shift key often gets ignored." "Every time that happens, I have to stop the AI, scroll back up, and fix my question." Writes long prompts in Notion first. | [dev.to](https://dev.to/awesome-friday/on-ai-serivces-press-enter-for-a-new-line-shiftctrlcmd-enter-to-send-the-prompts-59nf) |
| Claude Code issue tracker, 2026 | Shift+Enter sends instead of inserting a newline, in web, desktop and CLI. Three separate bug reports. | [#25349](https://github.com/anthropics/claude-code/issues/25349), [#25145](https://github.com/anthropics/claude-code/issues/25145), [#9321](https://github.com/anthropics/claude-code/issues/9321) |
| XDA, June 2026 | "The chatbot model starts to fall apart when you try to go beyond basic answers and analysis." | [xda-developers.com](https://www.xda-developers.com/chatgpt-claude-gemini-still-have-ui-flaw-not-easy-to-fix/) |
| Nielsen Norman Group, 425 logged conversations | Users constantly had to mention part of a previous answer, retyping or pasting it to remove ambiguity. They named it "apple-picking". | [nngroup.com](https://www.nngroup.com/articles/ai-prompt-structure/) |
| Obsidian + Claude Code writer, March 2026 | "The loop is slow and stateless — every conversation starts from zero unless you're managing memory manually." | [dev.to](https://dev.to/numbpill3d/claude-code-inside-obsidian-the-setup-that-10xd-my-thinking-20e8) |
| Ruben Hassid, April 2026 | "You didn't give Claude enough context." "The files are the prompt. Forever." Recommends Obsidian folders as the persistent prompt. | [ruben.substack.com](https://ruben.substack.com/p/stop-prompting-claude) |
| Sahan Rao, Aug 2025 | Prompt libraries past 10 to 15 entries stop being used; teams need versioning and "why it worked", not more entries. | [substack](https://sahanrao1.substack.com/p/saving-every-prompt-doesnt-make-your) |
| Mo Bitar, Sept 2026 | "We work in 'does the thing I asked for come out good' land, and there is no good chart for that." | [atmoio.substack.com](https://atmoio.substack.com/p/nobody-can-test-ai-models-anymore) |

Pattern: three complaints, repeated for three years across every vendor. The input box cannot be edited like a document. Nothing renders while you write. Replying to part of an answer means retyping it.

## What is being sold, and what it does not do

| Product | Price | Does | Does not |
|---|---|---|---|
| Promptery (macOS) | $5 / $19 / $49 once | Save prompts, global hotkey, paste in under 2 s, docs to Markdown context | Any reply workflow, any structure or XML, any editing surface |
| PromptKit, Promptty, Promptory, PromptStorage, Promta, PromptMan | App Store one-time or low subscription | Save and recall prompts | Same gaps |
| AIPRM | $5.99 to $20 / month, 1M+ installs, 3.4 to 3.9 stars | Community template library in the chat page | Reuse of your own context; editing |
| Prompt Genie | $6.99 | Prompt rewriting and library | Same gaps |
| Enjoy (Mo Bitar) | $14.99 / month, desktop, launched 2026 | Drives Claude Code, Codex, Grok Build, Antigravity for non-programmers; projects with notes, documents, workflows; files on disk | It is an agent-driving workspace, not a composer. No quote-and-answer, no structured output |
| Obsidian + Claude Code plugins | free | Terminal or sidebar inside the vault; vault as context | Nothing for composing a reply from pieces; the forum threads ask what to feed as context |

Nobody sells the reply half. Every tool stops at "save a prompt and paste it". The back-and-forth, quote a line and answer under it and ship it as clean structure, is unclaimed.

## Signals worth stating in a pitch

- TUI renaissance: 25,000+ projects on modern TUI libraries; the draw is keyboard speed and startup under 50 ms. Same buyer as PromptTOR: keyboard first, no visual slop. ([byteiota](https://byteiota.com/tui-renaissance-2026-why-terminal-uis-are-back/))
- Linear's editor converts Markdown to rich text as you type; that is the bar users now expect for any box they write in. ([linear.app/docs/editor](https://linear.app/docs/editor))
- Anthropic's own docs recommend XML tags to separate prompt parts and say consistent tag names let teams "scan, update, and reuse" prompts. That is the output PromptTOR produces without the user typing a tag. ([docs.claude.com](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags))

## Positioning that follows

One line: the editor for talking to a model. Write from pieces you already wrote, answer a reply line by line, ship XML you never see.

Price anchor: the prompt savers sit at $19 once; Enjoy at $14.99 a month. A one-time $19 to $29 desktop app with the reply workflow is above the savers on function and below Enjoy on price.

Buyer test before any pitch: would Minty pay $19 for `prompttor.html` as it is today? If not, the missing pieces are DZ-54, DZ-52 and DZ-50, in that order.

## Not found

- The Mo Bitar video on editing and talking to AIs: his channel is youtube.com/@atmoio; the recent posts are paywalled on Substack. Drop the link into this file when found.
- Reddit, r/PromptEngineering, 2026: "Is anyone else annoyed that AI prompting is…" ([thread](https://www.reddit.com/r/PromptEngineering/comments/1wd1tjy/is_anyone_else_annoyed_that_ai_prompting_is/)). Reddit is blocked from Claude's fetcher and browsers; quotes to be pasted in by Minty.
- Reddit threads about teams writing the same prompts: search returned Gumroad prompt packs, not the threads. Paste the links when found.
