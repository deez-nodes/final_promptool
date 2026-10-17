# PrompTOR market research — summary (2026-10-13)

Sourced facts only. [SR] = self-reported by maker. Full evidence, every URL: `raw/A_census.md`, `raw/B_churn_wants.md`, `raw/C_counterargument.md`, `raw/D_wtp.md`.
Spot-checked by the orchestrator (fetched and re-quoted): TypingMind IH post, Microns listing, AI Toolbox IH post, OpenAI multi-quote thread.
Coverage gaps: Reddit, Play Store, App Store, and GitHub search were blocked from the research sessions. Reddit was reached only through a mirror.

## 1. How many people paid

| Product | Model | Users | Paid evidence | Source |
|---|---|---|---|---|
| TypingMind (chat UI, desktop/web) | One-time license; $9 at launch, then $19, $29 … $79 | 20,641+ daily users (pricing page) | "4,000+ paying users" ~3 months after launch (Jun 2023) [SR]; $1M trailing 12 months by Nov 2024 [SR] | indiehackers.com/post/making-10k-mo-by-building-a-better-chatgpt-ui-5e69b67949 |
| BoltAI (macOS AI client) | Perpetual license, $9 → $100 | — | ~$25K/mo [SR]; raising to $110 cut unit sales, revenue stayed ~flat [SR] | indiehackers.com/post/cRvgt7fySrr3M76MSVas |
| AI Toolbox (ChatGPT prompt/org extension) | $9.99/mo or $99 lifetime | 35,000+ [SR] | "5-figure" monthly; author: "Most of the revenue is one-time lifetime purchases… it is not MRR." 200 paid users in month 1 (Dec 2024) [SR] | IH post ltsw3AYvsvslFIYZtYZG; indieniche.substack.com |
| Unnamed ChatGPT extension (sold on Microns, Jan 2026) | $9.99/mo or $99 lifetime | "over 17,000 users" | 598 customers = **3.5% paying** (arithmetic); ARR listed as $51.4K in one place and $54.2K in another; asking price $230K; marked sold | microns.io/startup-listings/browser-extension-for-chatgpt |
| Superpower ChatGPT | Freemium | 420K downloads, 150K WAU [SR] | ">$10K a month" [SR]; no count of paying users | IH post 3rIbjigZxiFsrgqJjJYp |
| AIPRM | Subscription | 1,000,000 (Chrome Web Store), 3.9★ from 3.4K ratings | No paid count disclosed | Chrome Web Store |
| Prompt Genie / PromptStorm / Prompt Perfect / teleprompt | Mixed | 20K / 20K / 10K / 7K | Not disclosed | Chrome Web Store |
| Prompt-library startups on TrustMRR (Stripe-verified) | — | — | $0 or no active subscriptions | trustmrr.com/startup/prmpts.md |
| Wispr Flow | $15/mo Pro | — | $280M Series B at a $2B valuation; revenue +150% in each of the last 4 quarters (company figure). Command Mode edits text by voice. **No prompt library or composer feature found.** | pulse2.com; docs.wisprflow.ai |

Not found: any local-first desktop prompt composer that publishes paid-user numbers. The "~20K users" figure the founder has seen matches TypingMind's daily-user claim.

## 2. Why people left (counted)

- **AIPRM, Trustpilot:** 9 of 12 visible 1–2★ reviews are about billing. That breaks down as silent renewal 3, refund refused 4, can't cancel 1, invoice problem 1. The profile has only 14 reviews in total. trustpilot.com/review/aiprm.com
- **AIPRM, Chrome:** 572 of 3,388 ratings are 1★ (20%). The review text couldn't be read.
- **Superpower ChatGPT, Firefox (35 reviews at 1–2★):**
  - bloat or pop-ups: ~15
  - broken or slow: 11
  - privacy or email harvesting: 6
  - paywall: 4
  - data loss: 2 ("Killed all 306 threads")
  - one review says the prompt feature led "to worse generated responses"
- **Privacy:** extensions with 8M and 900K users were caught harvesting AI chats (The Register, 2025-12-16).
- **Breakage:** an extension developer writes that "selectors silently break in production within two weeks" because the chat UIs owe extensions no stable markup (dev.to). AIPRM's own listing: "Please uninstall other ChatGPT extensions for reliable AIPRM functionality."
- **PromptPerfect** (Jina) went offline 2026-09-01. The only source is a competitor's blog; no primary notice was found.

## 3. What people want

| Want | Evidence count | Note |
|---|---|---|
| Reply to one passage of a long answer | 10 OpenAI-forum threads + 4 Claude GitHub issues | ChatGPT ("Ask ChatGPT" quote) and Claude.ai ("Reply") both have a **native single select-to-reply** today. The gaps users name: only one quote at a time (OpenAI forum, 2025-12-01, verified), and that it "appears to open a new conversation". |
| A built-in prompt library | 3 OpenAI threads | Staff reply: "valuable addition", no timeline. Claude Code #30405 was closed as not planned. |
| Compose outside the chat box / Enter sends too early | OpenAI-forum threads | — |
| Model loses context in long chats | 1 thread, 13 replies | — |

## 4. Why incumbents don't have it (stated reasons only)

- Extension vendors: unstable host DOM (quotes above).
- OpenAI staff: "I don't have a timeline to share" and "We can't promise implementation or timing."
- No technical or product rationale from OpenAI, Anthropic, or the optimizer vendors was found.

## 5. "Just use Obsidian / VS Code"

- **Frequency:** a strict count found only 3–4 comments, in 2 HN launch threads (Runprompt, EchoStash). The 106-comment prompt-builder thread pushed back with "I'll just ask ChatGPT to write my prompts" instead.
- **Reddit "where do you keep prompts" threads:** people store and paste prompts from Obsidian, text files, Notes, git and Text Blaze. None of those posts documents re-prompting or speed.
- **Capabilities, per each tool's docs** (matrix in raw/C):

| Capability | Present in |
|---|---|
| (a) Reusable composable blocks | All of them. Real nesting in Templater and TextExpander; Raycast one level deep. |
| (d) Per-task context isolation | Roo Code subtasks, VS Code subagents. These are agent-side, not a writing surface. |
| (b) Point-by-point reply under quoted passages | **No tool's docs** |
| (c) One-step XML-tagged export | **No tool's docs.** Tags are hand-typed into templates. |
| (e) Published speed numbers | **No tool** |

- **Measured format effects:**
  - Sclar et al. 2023: format changes swing LLaMA-2-13B accuracy by up to 76 points (arxiv 2310.11324).
  - Voronov et al. 2024: the best template doesn't transfer between models (2401.06766).
  - He et al. 2024: large format sensitivity on GPT-3.5 (2411.10541). The "40%" figure is unconfirmed; check the PDF before quoting it.
  - Chroma Context Rot 2025: across 18 models, focused ~300-token prompts beat ~113k-token prompts.
  - **Against:** Tam et al. 2024 found that forcing *output* into JSON/XML/YAML lowers reasoning (2408.02442). That concerns output format, not input.
- **Gaps:** no peer-reviewed timed study of prompt-writing speed, and no peer-reviewed benchmark of XML tags against other delimiters. Your recordings would be first-party evidence in an empty field.

## 6. Conversion benchmarks → the 35-buyer target (arithmetic, not forecast)

Sources:
- Lenny/OpenView: freemium is "good" at 3–5%.
- ChartMogul/Growth Unhinged 2026: freemium converts a median 5.5%; 5 payers per 1,000 visitors.
- Indie Chrome-extension portfolio: 0.8% [SR].
- One-time plugin upgrade: 0.31% (2 sales from 641 downloads) [SR].

| Rate | Free users needed for 35 | for 350 | for 3,500 |
|---|---|---|---|
| 0.31% | 11,218 | 112,175 | 1,121,750 |
| 0.8% | 4,375 | 43,750 | 437,500 |
| 3% | 1,167 | 11,667 | 116,667 |
| 5% | 700 | 7,000 | 70,000 |

Gross revenue at $10–28 per buyer: 35 buyers = $350–980; 350 = $3.5–9.8K; 3,500 = $35–98K.

## 7. Corrections the pitch deck needs

- **F-D1** `market` slide, "AIPRM $5.99–20 a month": **no source found.** AIPRM's pricing FAQ shows Plus @ $10 and Pro @ $33 without saying monthly or yearly. A third-party review lists $20, $39 and $79 a month. The same number is also on the `price` slide.
- **F-D2** `market` + `demand` slides, "Reply to part: No / unclaimed": **inaccurate.** ChatGPT and Claude.ai ship single-quote reply. What's actually open: multiple quotes collected before sending, comments under each quote, and routing quotes to sections. Reword to that.
- **F-D3** `problem` slide, Notepad++ quote: the text is verified (github.com/lencx/ChatGPT/issues/726). But it's a third-party desktop wrapper, not OpenAI's app, and the "2023" date is unconfirmed.
- **F-D4** `problem` slide, "100+ prompts" HN quote: verified (HN 45437190, 2025-10-01), but it's a founder pitching his own product, not an independent user.
- **F-D5** `math` slide, AI Toolbox: verified. Add the author's own caveat that the revenue is mostly lifetime purchases and "not MRR".
- **F-D6** `price` slide, "TypingMind $30 at launch": the source says launch was **$9**, then $19, $29, …, $79.
