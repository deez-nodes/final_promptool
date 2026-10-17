# 04 · Round 3 — the nine HTML prototypes + bridged Task screens

**Source message:** "KAME HAME HA!!! This was all for your insolence lmao. I kid." (9 HTML attachments + 2 screenshots). Followed by the user's context in the next turn.

## User's words (verbatim)

> KAME HAME HA!!!
>
> This was all for your insolence lmao. I kid.

Next turn, about these same files:

> I'm gonna be honest these were all scrapped trying to get claude to "reason" about a decent looking design. So I just fell back to my own. I think those are the folders that hold that which you seek. If not, I got more.

> First, I want to rip everything I liked about all the prototypes I had to scrap to get a decent app. I had to pull all this out of the trash. So that's what my motivation is to continue working on any of these actual files. Which are all html you haven't seen me put my weight into it. The 'easy to replicate kind' ....lol.

## Asset map

| File | Notes |
|---|---|
| `assets/html/promptor.html` | Shell only — references external `promptor.css`, `promptor.seed.js`, `promptor.js` (**not uploaded**) |
| `assets/html/promptor_bridged.html` | Tasks/Prompts, XML/MD toggle, vim, eval stub, bridge, model/effort selects. Same file as group 01 |
| `assets/html/promptology.html` | **Byte-identical** to the two files below (MD5 `a4b3749d…`) |
| `assets/html/promptor_best-practice_tags.html` | identical to `promptology.html` |
| `assets/html/promptor_templatedOG.html` | identical to `promptology.html` |
| `assets/html/prompttor.html` | Prompt/Reply modes, numbered points, XML panel, library |
| `assets/html/promptor-editor.html` | Reference/reply pane, quote capture into `<quote>/<source>/<comment>`, CDATA |
| `assets/html/promptor-before-sections.html` | Library groups (collapsible), single-text sections |
| `assets/html/prompttor_desktop_prompt_studio.html` | "STUDIO" — Tailwind CDN; left pane with category dropdowns. See group 07 |
| `assets/screens/Screenshot_2026-10-03_225416.png` | `promptor_bridged.html` Tasks view, "Current Edit Yellow in Left Pane" (orig. `1791818677837_…`) |
| `assets/screens/Screenshot_2026-10-03_225515.png` | Same, "Filled Out Task Prompt" (orig. `1791818685572_…`) |

## Claude's notes (from earlier review in this conversation)
- Bugs seen in the bridged screens: leading `- ` kept inside file paths; `depends` attribute contains raw newlines; eval stub hard-codes `claude-opus-4-8`.
- "Folders that hold that which you seek" = `C:\project-promptor_bolt-Build` (connected folder). Not copied here — not a chat upload.

Cross-refs: 01, 03, 07.
