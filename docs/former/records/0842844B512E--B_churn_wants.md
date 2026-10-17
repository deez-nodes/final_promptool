# B — Churn reasons, wants, and stated reasons for gaps (prompt managers / optimizers)

Retrieved 2026-10-13. Sourced facts only. Counts are only of reviews or posts I actually read. Quotes were pulled with a fetch tool, which caps verbatim excerpts at about 125 characters, so long quotes are trimmed.

**Access limits (these affect coverage):**
- reddit.com was blocked. Reddit content comes from the reddit.sentinel-team.org snapshot mirror or from secondary pages.
- hn.algolia.com worked through WebFetch.
- The GitHub search API was blocked, so I couldn't get author or date metadata for GitHub issues.
- The Chrome Web Store review pages show only a few reviews at a time, and chrome-stats hides most low-star reviews behind a paywall.
- The Wispr Flow Trustpilot profile has been removed.
- I didn't reach App Store or Play Store review pages for any prompt app, so they're not covered.

---

## Q1. Why people leave or give 1–2 stars

### Dataset A: AIPRM on Trustpilot (https://www.trustpilot.com/review/aiprm.com)
2.4/5 from 14 reviews, 13 of them visible. Of the 12 visible 1–2★ reviews, **9 are about billing, renewal, refunds or cancellation**, 1 is about chat history being destroyed, and 2 have no text.

Billing sub-themes (one review can count twice):
- Auto-renewal with no notice: 3
- Refund refused: 4
- Can't cancel, or still charged after cancelling: 1
- Invoice problem with no way to reach anyone: 1

Quotes:
- 1★, Aug 17 2026, "Auto-renewed for a full year with no notice": "I received no advance notice that my annual subscription was about to auto-renew."
- 1★, Apr 16 2026, "Cannot cancel this tool": "they keep your credit card info and keep running it even after you cancel"
- 1★, Jul 8 2025, "Sneaky little company": "I signed up for the service on an intro deal, but never agreed to auto-renewals."
- 2★, Jun 14 2025, "Pay-gated clutter and unreliable Claude integration": "AIPRM's FAQ states there are no refunds under any circumstances"
- 1★, Apr 24 2024, "BUYER BEWARE- They hide their renewal policy!": "They do not give you advance warning that your account is coming up for renewal."
- 1★, May 16 2026 (data loss): "DESTROYS YOUR CHATGPT HISTORY PERMANENTLY. DO NOT INSTALL."

### Dataset B: AIPRM on the Chrome Web Store
Listing: https://chromewebstore.google.com/detail/aiprm-for-chatgpt/ojnbohmppadfgpejeebfnmnknjdlckgj/reviews

- chrome-stats reports 3.94/5 from 3,388 ratings. 572 of those are 1★ (20%) and 97 are 2★ (3%). Source: https://chrome-stats.com/d/ojnbohmppadfgpejeebfnmnknjdlckgj/reviews. None of the 1★ review text is readable there.
- The store showed 10 reviews from July 2024. Five of them read as negative:
  - Emma Faye, Jul 21 2024: "They actually started charging, and it's so expensive."
  - Jacob Sanchez, Jul 19 2024: "Do not download this extension or you will go months trying figure how to cancel."
  - Sufyaan Moosani, Jul 18 2024: "the are limiting your prompts"
  - Andrew, Jul 17 2024: "i hate having to install an app"
  - Nalain Fatima, Jul 16 2024: "please help me not show Allow button"

### Dataset C: Superpower ChatGPT on Firefox Add-ons (the largest set I could read)

**1★ reviews, page 1 of 2, 25 reviews** (https://addons.mozilla.org/en-US/firefox/addon/superpower-chatgpt/reviews/?score=1). Each review is counted under one main theme:

| Theme | Count |
|---|---|
| Bloat (unwanted tabs, popups, newsletter) | 9 |
| Broken or stopped working | 5 |
| Privacy or email harvesting | 3 |
| Paywall or deceptive pricing | 2 |
| Data loss | 2 |
| Other or no text | 4 |

Quotes:
- Bloat:
  - Nov 6 2023: "This is a spam addon that keeps opening the spam site 'superpowerdaily.com'"
  - Nov 18 2023: "Opened my browser after a restart and it pinned itself 5 times."
- Data loss:
  - Jan 25 2024: "Killed all 306 threads on autosync restart on openai.com, not only locally."
  - Feb 17 2024: "Occasionally, the chats in my folders will disappear"
- Privacy: May 16 2025: "Will take the email you use for ChatGPT and spam newsletters in your inbox without you knowing"
- Paywall:
  - Jun 13 2025: "Only after paying $96 for an annual subscription, I discovered"
  - Dec 6 2024: "Deceptive design, set up and name. Tricks user into beliving its chat gpt pro."
- Broken: Jun 28 2024: "Doesn't work at all!"

**2★ reviews, 10 reviews** (https://addons.mozilla.org/en-US/firefox/addon/superpower-chatgpt/reviews/?score=2). One review can count under several themes:

| Theme | Count |
|---|---|
| Broken, slow or laggy | 6 |
| Bloat or popups | 6 |
| Privacy | 3 |
| Paywall | 2 |
| Worse output from the prompt feature | 1 |

Quotes:
- Mobius Mann, Nov 21 2023: "The cost for the Pro version ($100 / year at the time of this writing), seems outrageous to me."
- Alanyyab, Oct 18 2023: "The spam can be removed with a subscription which is crazy."
- ArmainAP, Aug 3 2023: "Prompt feature seems to consistently lead to worse generated responses in general"
- DJSens, May 20 2023: "exports all my chats as soon as I installed it without me even being prompted"

**Across all 35 low-star Superpower reviews:**
- Bloat or popups: 15
- Broken or slow: 11
- Privacy: 6
- Paywall: 4
- Data loss: 2

The 2★ counts allow more than one theme per review, so these totals are approximate.

On Chrome, chrome-stats reports 3.36/5 from 136 ratings, with 50–61 at 1★ (the page contradicts itself). Only 4 low-star texts are visible. Source: https://chrome-stats.com/d/superpower-chatgpt/reviews

### Dataset D: Superpower ChatGPT support thread on the OpenAI forum, page 2
URL: https://community.openai.com/t/superpower-chatgpt-chrome-extension-folders-search-gpt-store-image-gallery-custom-instruction-profiles-and-more/40412?page=2

- Seven user posts from April to June 2023 report breakage or data loss.
- Kevin2626, Apr 27 2023: "it has stopped working for me few days ago."
- d.swinicki, May 15 2023: "All queries created when the plugin is active after a few hours "disappear" (Conversation not found)."
- The developer (ezi) replied "New version was just released" and "I released an update with the fix", but gave no cause in either reply.
- Separate thread: "Superpower for ChatGPT is no longer working at all" (mikedubai1, Feb 29 2024): "it's as if it isn't even installed." https://community.openai.com/t/superpower-for-chatgpt-is-no-longer-working-at-all/659858

### Dataset E: smaller sets
- **ChatGPT Toolbox on Trustpilot**, 5 reviews (https://ca.trustpilot.com/review/ai-toolbox.co): one is 1★ (May 24 2025): "Your software (ChatGPT Toolbox) has stopped working." The company replied that the fix was waiting for Chrome Web Store approval.
- **Prompt Genie on Trustpilot**, 3 reviews (https://www.trustpilot.com/review/prompt-genie.com): none are 1–2★. The 3★ review (Jan 23 2026) says: "the number of free prompts are limited to 1 per day."
- **Wispr Flow on Trustpilot** (https://ca.trustpilot.com/review/wisprflow.ai): the profile shows "This profile has been removed" for breaking Trustpilot guidelines, so there are no reviews to count.
  - A secondary article (eesel.ai, https://eesel.ai/blog/wispr-flow-review) paraphrases complaints from the r/macapps thread "A fair warning about the app Wispr Flow": an unclear AI-training data policy (now opt-in), adding itself to login items, idle CPU use and background traffic. Thread: https://www.reddit.com/r/macapps/comments/1fulspc/a_fair_warning_about_the_app_wispr_flow_voice/. It was blocked for me, so I have no verbatim quotes.

### Dataset F: privacy incidents involving extensions that read AI chat pages
- **Urban VPN and three sister extensions**, more than 8 million users. They harvested chats from ChatGPT, Claude, Gemini, Copilot and others, starting with version 5.5.0 in July 2025. Koi Security CTO Idan Dardikman: "There is no user-facing toggle to disable this." The Register, Dec 16 2025: https://www.theregister.com/2025/12/16/chrome_edge_privacy_extensions_quietly/
- **Two AI-sidebar extensions**, about 900,000 users. They "were found exfiltrating user conversations and all Chrome tab URLs to a remote C2 server every 30 minutes" (OX Security). The Hacker News, Jan 6 2026: https://thehackernews.com/2026/01/two-chrome-extensions-caught-stealing.html

### Dataset G: product shutdown
- **PromptPerfect** goes offline on Sep 1 2026. The reason given is that it "doesn't fit Elastic's roadmap" after Elastic acquired Jina AI. Source: https://promptbuilder.cc/blog/promptperfect-shutting-down-alternatives-2026
- That page is a competitor's secondary source with no primary notice. promptperfect.jina.ai showed no notice when I fetched it, so this is unverified.

---

## Q2. What people ask for

### 2a. Replying to one part of a long answer (quote or inline reply)

**Count:** 10 OpenAI forum threads and 4 Claude GitHub issues.

| Source | Author, date | Quote |
|---|---|---|
| https://community.openai.com/t/ability-to-use-forum-style-quoted-reply-feature/1379172 | VPROK, Apr 17 2026 | "When ChatGPT gives a long answer, I often want to respond to one exact passage." |
| https://community.openai.com/t/feature-suggestion-quote-reply-to-specific-text-segments/1378659 | Daniel_Castaire, Apr 6 2026 | "Currently, responses are presented as a single block of text." |
| https://community.openai.com/t/inline-replies-to-chatgpt-responses/1381344 | Paradox2579, May 20 2026 | Proposes a "Reply to this point" option (summary, not a quote) |
| https://community.openai.com/t/add-native-message-quoting-in-chatgpt/1381628 | DiCE, May 23 2026 | "In long, high-context conversations, users often need to refer back to a specific previous message." |
| https://community.openai.com/t/message-style-reply-feature/1122231 | Milo_0, Feb 16 2025 | "I really think it would benefit for a reply feature (like in normal messaging apps)." |
| https://community.openai.com/t/reply-feature-improvement-request/537060 | 123uzunince123, Dec 1 2023 | "it would be great if chatGPT is aware of what message did we take the quotation from." |
| https://community.openai.com/t/multiquote-responses-in-prompt-as-result-of-ask-gpt-popup-click/1368065 | alexander.podgorny, Dec 1 2025 | "Make GPT quotes in prompt box multiple instead of one, por favor." |
| https://community.openai.com/t/anchored-sub-chats-for-focused-follow-up-questions/1400704 | Harry_Cane (reply), Oct 7 2026 | "The crucial point is that the user should not have to copy/paste the original text." |
| https://community.openai.com/t/threaded-replies-for-long-conversations/1385480 | ljkane715, Jul 1 2026 | "reply directly to individual sentences or paragraphs, creating threaded discussions." |
| https://community.openai.com/t/focus-on-one-prompt-field-or-answer-get-a-reference/30634 | christophequentin17, Jan 6 2023 | "Is it already possible ? it would be great !" |
| https://github.com/anthropics/claude-code/issues/58691 | unknown author and date | "When Claude writes a long response with multiple points, I want to right-click on a specific sentence or paragraph and get an option like "Reply to this"" |
| https://github.com/anthropics/claude-code/issues/45904 | opened Apr 9 2026, closed not planned May 22 2026 | "the single prompt input forces me to address everything at once in one message" |
| https://github.com/anthropics/claude-code/issues/26716 | Gles, date not shown | "Users currently rely on manually typing > markdown syntax to reference previous messages, which is inefficient and error-prone." |
| https://github.com/anthropics/claude-code/issues/70628 | opened Jun 24 2026, closed completed Aug 25 2026 | "Claude.ai has a 'Reply' feature: select text in a message, click Reply, and it's inserted into the prompt" |

**Native features that already exist, as stated in these threads:**
- **ChatGPT** has a select-text "Ask ChatGPT" option.
  - OpenAI_Support (Avinash), May 29 2026: "I believe what you're looking for may already be available." (thread 1381628)
  - EricGT, Jul 1 2026: "just select the text to reveal the popup menu." (thread 1385480)
- **Claude.ai** has a select-text Reply (issue #70628).

**Limits users report with those native features:**
- Only one quote at a time (thread 1368065).
- DiCE, May 29 2026, says "Ask ChatGPT" "appears to open a new conversation" (thread 1381628).
- OpenAI_Support, Apr 10 2026, said highlighting and referencing text doesn't keep a clear link to the follow-up (thread 1378659; paraphrase).

### 2b. Writing long prompts outside the chat box, and Enter sending too early
- lencx/ChatGPT #726, "[Feature] Hitting 'Return' ('Enter') creates a new line instead of sending the message": "I have to first compose my question in Notepad++ and copy and paste into the ChatGPT app." https://github.com/lencx/ChatGPT/issues/726 (date not retrieved)
- OpenAI forum 1253379 (HatBeard, May 6 2025, 8 replies): https://community.openai.com/t/chatgpt-app-allow-toggle-newlines-and-cmd-ctrl-return-enter-for-submission/1253379
  - nikola.jovanovic, Sep 17 2025: "Accidentally sending mid-draft with Enter can interrupt my workflow."
  - Tom_Bullotta, Jan 10 2026: "mistakenly send fragments in error all the time"
  - zhouyc, May 6 2026: "Accidentally sending message by pressing Enter is super annoying!"
  - Staff reply, Sep 6 2026: the desktop app setting Settings → General can require Cmd+Enter.

### 2c. Reusable prompt blocks and a prompt library
- OpenAI forum 1385130 (Alien2, Jun 28 2026): "A built-in prompt library would make ChatGPT much more efficient and user-friendly." https://community.openai.com/t/request-for-a-built-in-prompt-saving-feature/1385130
  - kg.codes, Jul 8 2026: "Until there is a native feature, I have been using Snippeta app."
- OpenAI forum 1383975 (Rishiraj7b9, Jun 17 2026): "Just like a clipboard or Notes, can we have a feature to store the prompts which user uses in day to day life." https://community.openai.com/t/feature-to-store-prompts-just-like-notes-or-clipboard/1383975
- OpenAI forum 992413 (sam.landing214, Oct 25 2024): "I would like to propose a Prompt Template Library, or Saved Prompt Templates feature in ChatGPT."
  - peter.ryther, Dec 12 2024: "This is a must have."
  - https://community.openai.com/t/enhancing-chatgpt-with-a-prompt-template-library-a-feature-proposal-to-streamline-customized-responses-and-boost-efficiency-for-all-users/992413
- Claude Code #30405 (Mar 3 2026, closed not planned Apr 3 2026): "no way to capture and store them in-flow without leaving the terminal." https://github.com/anthropics/claude-code/issues/30405
- r/PromptEngineering, "Where do you keep your prompts?" (via mirror; original: https://reddit.com/r/PromptEngineering/comments/1rws60n/where_do_you_keep_your_prompts/). Tools people named: Notion, Text Blaze, DEVONthink, Microsoft Loop, ScratchTabs, Prompt Bunker, SKILLS.md.
  - u/nishant25 (a tool vendor) left Notion "until i had ~30 prompts and couldn't remember which version was actually performing well."
  - u/Low-Proposal-3319 (a tool vendor): "Notion: Not lightweight and its a brain fog for me."
- r/PromptEngineering, "Where do you store the prompts you actually reuse?" (original: https://reddit.com/r/PromptEngineering/comments/1salnm5/). The OP is a vendor account.
  - OP: "Feels like once you find a few good ones, they're surprisingly easy to lose track of."
  - Tools people named: Text Blaze (20 points), Obsidian, plain text folders, git plus MCP, Gemini Gems, SKILL.md.

### 2d. Managing context in long chats, and the model losing the thread
OpenAI forum 600365 (andreflavionb, Jan 24 2024, 13 replies, no staff reply): https://community.openai.com/t/persistent-issues-with-gpt-model-loss-of-contextual-understanding-and-continuity-in-conversations/600365
- BPS_Software, Jan 24 2024: "the ChatGPT interface struggles to maintain context throughout a long conversation"
- Kepulikeppi, Jan 24 2024: "forget the conversation context completely after only 7 to 10 messages"
- Macha, Jan 24 2024: "Continuity is something that has to be managed by the user."
- AMDphreak, Nov 22 2024: "having to provide constant reminders is annoying"

---

## Q3. Stated reasons the incumbents don't have it

### Extensions depend on a page layout they don't control
- AIPRM's own Chrome listing (updated Oct 7 2026): "Please uninstall other ChatGPT extensions for reliable AIPRM functionality." Also: "AIPRM doesn't support or endorse using other ChatGPT extensions in parallel to AIPRM." https://chromewebstore.google.com/detail/aiprm-for-chatgpt/ojnbohmppadfgpejeebfnmnknjdlckgj
- Julie Do, dev.to, posted Jul 16 (year not shown). Her extension watches ChatGPT, Claude and Gemini. https://dev.to/juliedechili/5-things-i-learned-building-a-chrome-extension-that-watches-chatgpt-claude-gemini-4a4i
  - "had selectors silently break in production within two weeks of launch"
  - "none of them are obligated to keep a stable class name for you to hook into"
- Adi Leviim, Level Up Coding, May 11 2026. He co-founded AI Toolbox, so he is a vendor. https://levelup.gitconnected.com/i-built-the-same-chrome-extension-three-times-each-one-broke-differently-5fcdc7d4fe37
  - "ChatGPT virtualizes its message list."
  - "Claude does not expose stable per-message identifiers in its DOM."
  - "The host app did not promise you a stable data-uuid."
- Leonid Svyatov, dev.to (about a Hacker News extension; same principle): "HN can change that structure any day, without a changelog, and they owe me nothing." https://dev.to/svyatov/keeping-code-alive-on-a-dom-you-dont-own-12-year-chrome-extension-story-2g3o

### ChatGPT interface changes broke extensions
- Blu Radio, Aug 16 2023, reporting a ChatGPT extension update (v1.1.8.16). It quotes an apology for "los recientes problemas de la interfaz de usuario derivados de la actualización de ChatGPT el 16 de agosto de 2023" (the recent interface problems caused by the Aug 16 2023 ChatGPT update), and the line "las modificaciones imprevistas en el diseño o la interfaz de usuario a veces conducen a desafíos inesperados" (unforeseen design or interface changes sometimes cause unexpected problems).
  - The article attributes the statement to "OpenAI", but the context points to a third-party extension. I couldn't confirm who actually said it.
  - https://www.bluradio.com/tecnologia/extension-de-chatgpt-presento-fallas-en-su-mas-reciente-actualizacion-so35
- ChatGPT Toolbox replied on Trustpilot (May 2025) that its fix for "stopped working" was waiting for Chrome Web Store approval. https://ca.trustpilot.com/review/ai-toolbox.co

### What the platform vendors have said about their plans
None of these replies gives a reason or a commitment.
- OpenAI_Support (Sunny), Apr 20 2026, on quoted reply: "I don't have a timeline to share." (thread 1379172)
- OpenAI_Support (Sunny), May 23 2026, on inline reply: no timeline; will pass it along internally (paraphrase; thread 1381344).
- OpenAI_Support (Avinash), May 29 2026: "I'll make sure the feedback is surfaced to the engineering team." (thread 1381628)
- OpenAI_Support (Avinash), Jul 12 2026, on prompt saving: "I agree that having a native prompt-saving feature in ChatGPT would be a valuable addition." (thread 1385130)
- Prashant_Pardesi, Jun 18 2026, on a prompt template library: "We can't promise implementation or timing." Topic closed. (thread 992413)
- Anthropic closed #45904 (inline replies) and #30405 (prompt stash) as "not planned". No maintainer reason was cached. It closed #70628 (Reply in Claude Code Desktop) as completed.

### Business-model statements
- PromptPerfect's vendor blog (Jina AI, Alex C-G, Jun 15 2023), "Traditional Prompt Engineering Is Dead. PromptPerfect is What Comes Next": "New tools are coming along that automate prompt engineering itself." https://jina.ai/news/traditional-prompt-engineering-is-dead-heres-what-comes-next
- PromptPerfect is shutting down because it "doesn't fit Elastic's roadmap". This comes from a secondary competitor source with no primary notice (see Q1 Dataset G).

### Not found
I found no statement from OpenAI or Anthropic giving a technical or product reason for not building multi-quote replies, prompt composition or a prompt library. I also found none from an optimizer vendor explaining why it doesn't offer authoring.

---

## Deck-quote verification

1. **"I have to first compose my question in Notepad++ and copy and paste into the ChatGPT app."**
   - **Text verified.** It's in lencx/ChatGPT issue #726: https://github.com/lencx/ChatGPT/issues/726
   - I couldn't retrieve the author or date (the GitHub API was blocked and the page showed no timestamps), so the year "2023" is not verified.
   - The repo is a third-party desktop wrapper, not OpenAI's app.
2. **"When ChatGPT gives a long answer, I often want to respond to one exact passage."**
   - **Verified.** VPROK, Apr 17 2026: https://community.openai.com/t/ability-to-use-forum-style-quoted-reply-feature/1379172
   - OpenAI_Support replied Apr 20 2026 with no timeline.
3. **"After 6 months of juggling 100+ ChatGPT/Claude prompts across Notion, Slack DMs, Apple Notes..."**
   - **Verified.** HN user Jaber_Said, Oct 1 2025: https://news.ycombinator.com/item?id=45437190
   - Caveat: this is the founder introducing his own product ("Show HN: Build AI prompts 10x faster with drag-and-drop blocks", promptbuilder.space), not an independent user. The comment has no replies.
4. **"AIPRM's reviews dominated by billing: silent renewals, no way to cancel, no refunds"**
   - This is a paraphrase, not a quote.
   - **The counts support it:** 9 of 12 visible 1–2★ AIPRM Trustpilot reviews are about billing. That breaks down as silent renewal 3, refund refused 4, can't cancel or charged after cancelling 1. Source: https://www.trustpilot.com/review/aiprm.com
   - One more Chrome Web Store review (Jul 19 2024) says users "will go months trying figure how to cancel".
   - This holds for Trustpilot only, which has 14 reviews. The 572 one-star Chrome reviews couldn't be read.
