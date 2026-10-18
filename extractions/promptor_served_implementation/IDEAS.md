# New ideas

Started 2026-09-28. This file collects new ideas. It replaces nothing: `SPEC.md`, the
`review-spec-*` files and `C:\_CODE\VimDojo\README.md` stay as they are. Nothing here is a
recorded decision; the Decisions log in `SPEC.md` is still where decisions go.

Sections 1 and 2 are the owner's words, as typed. Section 3 is Claude's reading of them and
may be wrong. Sections 4 to 6 are facts, inventory and open questions.

## 1. The Vim coach, in the owner's words

> If I'm doing something in vim and keep screwing it up in Promptor or Obsidian, I want to
> pop up the tool, and do the practice in Vim Dojo, for the thing I want to do. Then when I'm
> done, my original goal is reached and I don't have to practice "off the clock."

> People feel like they have to learn vim or their SE career is a sham. That guy is charging
> 20 for early access, I'll charge that. No subscriptions or logins. People can work on their
> code or documentation and only drill what they need unless they want to run through
> standard mode. All while still getting their work done.
>
> Integrated into the prompt editor.

> This was the original vision this isn't new I just haven't told you about it yet.

Example flow:

> You wanted copy something you highlighted mid paragraph and paste it down out of the way
> for some set of bullets you are placeholding with comma, separated, items.
>
> You open then tool, select workflow. Then in order you choose:
> 1. Copying, and pasting selected texted in visual mode.
> 2. Multiple line/paragraph navigation.
> 3. CSV to list shortcuts.
>
> There is a seeded text set for you to drill on. at any time select custom, then past your
> block in and drill on that.
>
> When you finish, so is that task. You learn it faster because you have a real goal and
> weakness in that goal internalized for your edits. Randomly trying to think of edits to
> show your speed off was difficult for earlier. I was constantly asking "what do I even
> want to do here?"
>
> In vim hero, I'm just playing a game of simon says on morphing text, and I don't now what
> it's going to want me to do next.

On custom:

> It doesn't open empty, when you hit go custom, it will do allow a paste that clears the
> block so you aren't deleting it in a non tool way. Or opening it 2 different ways

On how it is built:

> a server causing race conditions screams over engineered to me

> Vim get's pulled up. You built vim commands from vanilla js before. Last nuxt build you did
> custom js everything after installing it haha, so I know you'll figure it out and you can
> mess it up correctly for once.

> All logic should always be agnostic that's we call "Software Engineering, __in the biz__"

> This should have all been version controlled. Eventually I am going to build all this in
> C++ as a flex anyway

On the comparison with VimHero:

> I mean moving from easy to harder of a products features or tools isn't something you can
> copyright. the vim controls come in the order they do. to drill them is to drill them.
> changing the drills randomizes it out of a copy. I only found it by trying to build mine
> without knowing about vim hero

## 2. The platform, in the owner's words

> This is why I was leaning towards Nuxt. It's stable, I'll get SEO boost trying to sell it.
> Markdown Features are literally a template you can have in a few minutes. Draggable,
> commands to add headers. Then you have so many modules for context, llm.txt, supabase and
> all that jaz. Vim Flow for a mermaid thing you can test your own langchain stuff against.
> UI will have a lot of built ins and no mistakes, and no decisions to make on how the layout
> or grid will go, you just have all that. There's a music player module and you can bridge
> to you llm you can prompt while the app provides context to the LLM in the app chilling
> with you, for doc fetches and what not. you could work in that bitch all day chillin
> listening to some fire ass music and learn vim when you need the help, not have to go to
> another screen.

"Vim Flow" is Vue Flow (confirmed): "looks better than react Flow too."

> There's more promptors coming don't worry. 2 from bolt and 3 or 4 from Astra

## 3. Claude's reading

Correct anything here that is off.

- **Workflow is the main mode.** You choose the skills a task needs, in order, so nothing the
  tool asks is a surprise. Standard mode, the full run-through, is there for whoever wants it.
- **Skills are named by task** ("copying and pasting selected text in visual mode"), not by
  key. One skill may cover several of the lessons in VimDojo today.
- **Seeded text first, your block when you want it.** Custom keeps a block on screen; a
  paste replaces it. One way in.
- **The coach is pulled up inside the app**, on the same screen as the writing. It does not
  have to be the writing editor itself, which leaves the Nuxt UI editor template free to be
  the writing surface.
- **Vim commands can be written for the purpose** where no library fits.
- **Logic is agnostic.** Drill generation, the goal format and the checks are plain logic
  with no framework in them, so they move to whichever build is kept, and later to C++.
- **No server between the editor and the drills.**
- **The base is not chosen yet.** More builds are coming from Bolt and Astra.

## 4. Facts checked on 2026-09-28

| Editor | Found in | Vim | Drag blocks, slash commands |
| --- | --- | --- | --- |
| CodeMirror 6 | `PromptTOR/src`, VimDojo | `@replit/codemirror-vim` | not included |
| Monaco | `C:\_CODE\prompttor-nuxt` | `monaco-vim` add-on | not included |
| TipTap | Nuxt UI `UEditor` | none | included |

- Nuxt UI's editor supports Markdown, HTML and JSON content, drag-and-drop block
  reordering, slash commands and mentions (ui.nuxt.com/docs/components/editor).
- `prompttor-nuxt` is Nuxt 4.5.2 with `ssr: false` for the whole app and no `@nuxt/ui`.
  Search engines need the sales pages rendered; the app itself can stay client-only.
- In the CodeMirror Vim emulation, with real key presses: `f,` `2s` Enter `- ` Esc splits a
  comma list at the first comma, and `;` `.` repeats it for each comma after.

## 5. What exists (nothing removed)

| Where | What | State |
| --- | --- | --- |
| `C:\_CODE\PromptTOR` | Vue 3 + Nuxt UI + CodeMirror 6 + Tauri | as described in `CLAUDE.md` |
| `C:\_CODE\prompttor-nuxt` | Nuxt 4 + Monaco | not examined beyond its config |
| `C:\_CODE\VimDojo` | Python + Gradio Vim trainer, 56 lessons | see below |
| `C:\_CODE\project-*-bolt-0*.zip` | Bolt builds | not opened |

VimDojo: the build of 2026-09-27 was verified end to end. On 2026-09-28 it was being
extended (second hotkey, bringing a selection in and pasting it back, "My text", a workflow
runner, list drills, a copy-a-selection drill) when work paused for planning. The editor
code calls three server functions that are not written (`set_work`, `paste_work`,
`get_workflow`), so workflow and custom do not run. All of it is kept.

## 6. Implementation order (Claude's proposal, 2026-09-28)

What to implement, in order. Each line is one assignment. The owner decides how.

1. Name the skills by task, starting with the three from the example flow, and list which
   existing drills each one uses.
2. Workflow picker: choose skills, in order.
3. Workflow runner: plays the chosen skills in that order on seeded text, shows "step 2 of 3",
   moves on when a step is done.
4. Custom: a paste replaces the block on screen; the drills then run on that block.
5. Finish: the last step is your own block, and the result goes back to where it came from.
6. Standard mode: the full run-through, as it is now.
7. Pull the coach up inside the prompt editor.
8. After that, one at a time: LLM bridge with context, music player, Vue Flow view, sales pages.

## 7. Open

- How the text gets back to the document when a workflow on your own block ends.
- Whether "when you finish, so is that task" means the last step is the real edit made
  freely, or the drills themselves leave the block finished.
- What Supabase is for, given no logins.
- Which build becomes the base, once the Bolt and Astra builds are in.

These are the owner's to settle when they get to them. They are listed, not raised.

## 8. How the owner builds, in their words (2026-09-28)

> when you plan this stuff out, you're plan should be to tell me what to implement in a
> decent order. Then I can just handle all this stuff that confuses you and I can give you
> more reasonable assignments at your level.

> It's not sharp it's me taking ownership. I always read you thinking about stuff like thing
> Supabase thing. If I participate or justify something, you run through an entire design,
> or fight tradeoffs. I would just write it down and when i got to it code it in assembly
> if I had to.

> Then like this gradio thing, you weren't sure what to do because of something with a
> server. I wouldn't have had one I'd have had seed text in files that roll around with the
> app. Never would have dealt with until the app was running Duck DB or Infinity, and I had
> some RAG and embed helpers, or the Local db interface made out. Then there wouldn't be 5
> problems and everything wayyyyyy off from good performing app.

> I could then send operations and seed and have apis or serverless cloud stuff everywhere
> instead of losing it all in the C drive. With git bash bandaids and /mnt-c jumps. Or zsh
> not working on wsl it's just all stuff i'd have sidestepped on accident from working
> traditional. and my logic would in all places, only using frameworks niceties when landed
> in that framework.

> often I'm trying to provide examples. To clear up stuff with a reason and goal like they
> say so you can understand more clearly. [...] Please do reason and talk tradeoffs; in
> order to engineer. You try to engineer so much on the where I could just tell you "hey I
> got that . let's do this for now." We'll both look a lot more rockstar instead of me
> sitting on the sidelines and you trying do god's work.

## 9. The lineup and what comes after, in the owner's words (2026-09-28)

> Another thing is all these promptors. I still have to get a couple of them. I'm gonna line
> them up, discuss the engineering with you when I have them. We're gonna pick all stuff we
> like, mush it together, recycle some UI's into a vim block or context engine. Maybe copy
> another, change the headers and animate the text as examples for the vim thing. Iterate
> our own optimizer with something like this image. Run this sweet mother fucking keyboard I
> have here as a zen mode focus tool

What came with that message:

- **The image** is Prompt Optimizer at `prompt.always200.com/#/pro/variable`. On screen: an
  original prompt with an optimization model and template, Analyze and Optimize buttons; a
  workspace with Render, Source and Compare views; a variables panel with "Extract as
  Variable"; and test columns that run the original and the workspace version side by side
  against a chosen model. The workspace holds the example flow from section 1.
- **The video** (`C:\Users\dz\Downloads\keyboard-demo-3d.mp4`, 25 s) is a recording of a
  3D keyboard on Raycast's product page. Keys glow in colour as they are pressed and fade
  after.

Written down for later, not designed: line up the builds and choose from them together;
reuse existing UIs as a Vim block or a context engine; animated text examples for the Vim
coach; an optimizer of our own; a keyboard that lights with the keys pressed, as a zen
focus mode.

## 10. Notes for later

Written down for later, not designed: seed text as files that ship with the app; DuckDB or
Infinity; RAG and embed helpers; a local db interface; APIs or serverless for operations
and seed.

The on-screen keyboard (`white-keyboard`, made with Astra): the key that reads RAYCAST was
meant to read **ice-code**, and the whole thing is "WAY TOO WHITE". Both still to do.

Skills: "I need write our own skills anyway." Our own, in place of the stock plugin ones
(Engineering, Design, Product Management, Enterprise Search).
