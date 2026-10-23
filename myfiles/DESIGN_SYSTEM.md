# prompTOR / PrompTool Design System Specification

---

## 1. Design Philosophy & Vision

**prompTOR** (also known as **PrompTool**) is a professional, section-based prompt engineering and AST architecture studio. It adopts a **dark-ground, single-accent aesthetic** optimized for extended focus, prompt composition, token inspection, and syntax clarity.

The ground is a near-black blue-slate (`bg` `#07080e`) so that the accents carry all the signal. Depth comes from lit edges and hairline borders, never from gradient washes. The register is the modern developer tool: quiet surfaces, tight radii, one saturated accent doing the work.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ PT ] prompTOR [STUDIO] │ ⚡ Anthropic XML │ 🌐 OpenAI JSON │ ✦ Gemini AST │ ＋ New Section │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Color Palette

**Source of truth: [`tokens.json`](./tokens.json).** `npm run tokens` (`scripts/gen-tokens.mjs`) generates the
`theme.extend.colors` / `theme.extend.boxShadow` blocks of `tailwind.config.ts` and the `:root` block of
`assets/css/main.css` from it. To change a color, edit `tokens.json`, run `npm run tokens`, then `npm run check`.

Token names below are the code's names, one-to-one. A token `x` is the Tailwind class suffix (`text-x`, `bg-x`,
`border-x`) and the CSS custom property `--x`. There are no other color names.

### Color tokens

Contrast is WCAG 2.1 (relative luminance) against `--bg` `#07080e`, **computed by
[`checks/contrast.mjs`](../checks/contrast.mjs)**, which is part of `npm run check`. Rerun it after any token
change and copy its "all color tokens vs --bg" block into this table; do not edit ratios by hand.
"Small text" means the token is used for text under 14px somewhere in `pages/`, `components/` or `layouts/`
(the script's header documents how it decides), and is therefore gated at **4.5:1**.

| Token | Hex | Role | Contrast vs `--bg` | Small text |
| :--- | :--- | :--- | :--- | :--- |
| `bg` | `#07080e` | Root canvas, gutter backdrop, editor canvas. The ground every ratio is measured against. Also inverse text on `bg-acid` (17.93:1) and `bg-miku` (10.88:1) fills. | 1.00:1 | inverse only |
| `surface` | `#0f1119` | Navbar, pane headers, section cards | 1.06:1 | no |
| `surface2` | `#161a26` | Inputs, secondary buttons, section header strip | 1.15:1 | no |
| `surface3` | `#1f2533` | Hover fill, active tab, metadata pill, scrollbar thumb | 1.31:1 | no |
| `surface4` | `#283042` | Highest raised fill: count badges | 1.52:1 | no |
| `border` | `#222a3c` | Default 1px structural divider | 1.39:1 | no |
| `border2` | `#313c54` | Focus/active boundary, scrollbar hover, decorative separator glyphs (`\|`, `·`) | 1.81:1 | decorative only |
| `border3` | `#414f6e` | Strongest border step (unused) | 2.45:1 | no |
| `acid` | `#e8ff47` | Primary accent: actions, active tab, section index pill, XML tag identifiers | **17.93:1** | yes |
| `acid-dim` | `#454f17` | Low-intensity acid for tinted fills (unused) | 2.27:1 | no |
| `miku` | `#39d4c8` | Variable interpolation, term bank badges, compiler tabs | **10.88:1** | yes |
| `pink` | `#ff4da6` | Destructive / remove affordances on hover | **6.54:1** | yes |
| `green` | `#5dffb0` | Success, cost estimate, copy confirmation | **15.61:1** | yes |
| `amber` | `#ffb84d` | Warning-flavoured quick-add accent | **11.63:1** | yes |
| `text` | `#dfe6f0` | Primary body copy, editor text, headings | **15.92:1** | yes |
| `muted` | `#6c7b9c` | De-emphasized metadata: token counts, timestamps, placeholders, inactive tabs | **4.71:1** | yes |
| `muted2` | `#808ea8` | Secondary labels, one step brighter than `muted` | **6.05:1** | yes |

### Shadow tokens

| Token | Value | Use |
| :--- | :--- | :--- |
| `glow-acid` | `0 0 14px rgba(232,255,71,.35)` | Acid buttons, section index pill |
| `glow-miku` | `0 0 12px rgba(57,212,200,.35)` | Active variable-matrix toggle |
| `glow-pink` | `0 0 14px rgba(230,0,122,.4)` | Unused |
| `glow-cyan` | `0 0 14px rgba(0,229,255,.35)` | Unused |

Tailwind: `shadow-<token>`. CSS: `var(--<token>)`.

### "muted" means the dimmer gray

The code has two grays. **`muted`** is the dimmer one; **`muted2`** is one step brighter. Earlier versions of
this document called `#808ea8` "color-text-muted"; in the code that value is `muted2`, and the earlier "dim"
gray is `muted`. The code's names win: there is no `color-text-muted` token.

**Contrast constraint.** `muted` was `#54607a` (3.17:1) and was applied to 10–11px token counts, timestamps and
placeholders. It is now `#6c7b9c` (4.71:1), which clears 4.5:1 on `--bg` while staying visibly dimmer than
`muted2` (6.05:1). A placeholder or label must not take an opacity modifier (`placeholder:text-muted/50`
measures 1.99:1); `checks/contrast.mjs` composites the alpha and fails it. The `border*` and `surface*` tokens
measure under 2.5:1 and must never be applied to a text node, except as purely decorative separator glyphs.

**Known gap (reported by the script, not gated).** The spec's gate is `--bg`. On raised fills `muted` measures
4.44:1 on `surface`, 4.09:1 on `surface2` and 3.61:1 on `surface3`, and `muted2` measures 3.99:1 on `surface4`.
`muted` cannot clear 4.5:1 on `surface3` without becoming as bright as `muted2`; prefer `muted2` for small text
on raised fills.

### Accent Discipline

- Exactly **one** accent may be saturated in any given viewport region. `acid` is the default; the others appear as state, not decoration.
- Accents are never used as large background fills. They appear as 1px borders, small text, glyphs, and glow — never as a panel color.
- Tinted backgrounds use the accent at ≤12% alpha (e.g. `bg-miku/20`) over a surface, paired with the accent as a border.

### Proposed direction (not implemented)

A neutral re-palette was proposed earlier: a zinc ground (`#09090B`, surface `#18181B`) with fuchsia `#D946EF`,
cyan `#06B6D4`, yellow `#EAB308` and emerald `#10B981` accents. None of it exists in the code. Adopting it means
changing values in `tokens.json` (the names above stay), running `npm run tokens`, and re-verifying contrast with
`npm run check`.

---

## 3. Typography Hierarchy

- **Brand & Display**: `Orbitron` (geometric display face for the prompTOR logo, modal titles, and metric badges).
- **Toolbars & Section Headers**: `Rajdhani` (condensed geometric sans for panel headers, section tags, and navigation).
- **Prompt AST, Variables & Editor**: `JetBrains Mono` (coding monospace with clear ligature support for `{{variables}}`, XML tags, JSON syntax, and prompt payloads).

All three faces are self-hosted as `woff2` in `/fonts` — no network font requests.

> **Open item.** Orbitron and Rajdhani were selected against the previous acid-on-slate palette. The reference board in section 6 sits in neutral-grotesk territory throughout. The display face is unresolved against the new palette; the mono is not in question.

---

## 4. CSS Custom Properties

`assets/css/main.css` holds one `:root` block, generated from `tokens.json` between `BEGIN generated` /
`END generated` comments. Do not edit it by hand. It defines exactly one custom property per token in section 2:

```css
:root {
  /* colors: --bg --surface --surface2 --surface3 --surface4
             --border --border2 --border3
             --acid --acid-dim --miku --pink --green --amber
             --text --muted --muted2 */
  /* shadows: --glow-acid --glow-miku --glow-pink --glow-cyan */
}
```

Components reach colors through Tailwind token classes (`text-muted`, `bg-surface2`) or these properties
(`var(--muted)`), never a hex literal; `checks/no-raw-hex.mjs` fails on a six-digit hex under `pages/`,
`components/` or `layouts/`. `checks/tokens.mjs` fails when a hex in `tailwind.config.ts` or `main.css` is not a
`tokens.json` color, or when a generated region is stale.

Font stacks are configured in `tailwind.config.ts` (`font-mono`, `font-orbitron`, `font-rajdhani`, `font-sans`)
and are not CSS custom properties.

---

## 5. Surface Treatment & Depth

The target is crispness through restraint. Four techniques, applied narrowly.

> **Proposed treatment, not implemented.** The snippets below are design intent. Where they name a color they use
> the section 2 tokens. The other custom properties they mention (`--hairline`, `--bevel-top`, `--bevel-floor`,
> `--lip`, `--radius-md`, `--acid-glow`, `--acid-edge`) are **not tokens and do not exist in the code**; adopting a
> snippet means adding its values to `tokens.json` first, then `npm run tokens`. The raw hex values inside the
> snippets are illustrative only and may not be copied into a component.

### 5.1 Hairline borders

Structural dividers are white at very low alpha rather than a solid gray. On a `#09090B` ground this reads as an edge catching light instead of a drawn line.

```css
border: 1px solid var(--hairline);   /* rgba(255,255,255,.06) */
```

Use `border` (`border-border`, `var(--border)`) only where a divider must survive over a raised surface (`surface3`).

### 5.2 Relief — the keycap

Depth is built from stacked shadows, not images or transforms-in-3D. The bevel highlight sits inside the top edge, the floor shadow inside the bottom, and a hard offset shadow forms the extruded lip below the cap.

```css
.keycap {
  background: linear-gradient(180deg, #232327 0%, #18181b 100%);
  border: 1px solid #2e2e33;
  border-radius: var(--radius-md);
  box-shadow:
    inset 0  1px 0 var(--bevel-top),     /* bevel highlight   */
    inset 0 -1px 0 var(--bevel-floor),   /* inner floor       */
    0 2px 0 var(--lip),                  /* extruded lip      */
    0 3px 6px rgba(0, 0, 0, 0.50);       /* cast shadow       */
  transition: transform 90ms ease, box-shadow 90ms ease;
}

.keycap:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 2px 4px rgba(0, 0, 0, 0.50),
    0 0 0 var(--lip),                    /* lip collapses     */
    0 1px 2px rgba(0, 0, 0, 0.40);
}
```

**The critical detail:** the cap translates down by exactly the lip height (`2px`) while the lip collapses to `0`. The bottom edge of the assembly stays fixed, so the key appears to compress rather than slide. Any other pairing of those two numbers reads as a bug.

This treatment governs buttons, section-number badges, and the keyboard-sound surface — anything the user is meant to read as pressable.

### 5.3 Lit edge

Panels that need emphasis take a single lit edge in the accent, plus a wide soft bloom beneath. The face stays near-black; the edge does the work.

```css
.plate {
  background: #101013;
  border: 1px solid var(--acid-glow);
  box-shadow:
    0 1px 0 var(--acid-edge),                  /* lit extrusion */
    0 12px 40px -12px rgba(217, 70, 239, 0.25);   /* bloom         */
}
```

Glow is a light source, never decoration. One glowing element per region.

### 5.4 Grain

A single low-opacity noise layer over large surfaces prevents banding in the near-black gradients and supplies the texture in the reference material. It must be an inline `feTurbulence` data URI — the application makes no network requests for assets.

```css
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

### 5.5 Focus & motion

```css
:focus-visible {
  outline: 2px solid var(--acid);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Transitions are 90–160ms on `transform`, `opacity`, `box-shadow`, and `border-color` only. Nothing animates `width`, `height`, `top`, or `left`.

---

## 6. Reference Board

| Reference | What it governs here |
| :--- | :--- |
| [thirdweb.com](https://thirdweb.com/) | Crispness by restraint — hairline borders at genuinely low contrast, tight radii, generous negative space, glow as a light source, one accent carrying all signal. |
| [raycast.com/keyboard](https://www.raycast.com/keyboard) | The relief technique in 5.2. Layered box-shadows for the bevel, floor, and lip; the press state that collapses the lip as the cap descends. |
| [inspira-ui.com](https://inspira-ui.com/) | Stack-native component source — Nuxt 3 + Tailwind, matching this application. Border beams, spotlight cards, glow borders as adaptable implementations rather than mood. |

The supplied isometric plate illustration establishes the governing principle for 5.3 and 5.4: **depth reads from a single lit extruded edge against near-black faces, with grain — not from gradient fills.**

---

## 7. UI Component Hierarchy & Spacing

1. **Header Toolbar (`h-12`)**:
   - Fixed top bar containing `prompTOR` branding, collection selector, quick section add buttons, Term Bank toggle (`Ctrl+K`), Variable Matrix toggle, and Workspace Import/Export.
2. **Left Navigation Drawer (`w-72`)**:
   - Upper Pane: Prompt Collections (Templates, Filled prompts, Search, Tag filtering).
   - Middle Pane: Section Library & Pre-seeded Best Practice Blocks.
   - Lower Pane: Variable Matrix (Real-time dynamic interpolation table).
3. **Center Section Composer (`flex-1`)**:
   - Prompt Title & Kind badge.
   - Section Blocks: Number badge, Reorder arrows (▲/▼), Role Chip, XML `<tag>` slug input, Include toggle, Token counter, Textarea with Tab Autocomplete.
   - Bottom Action Bar: Preset block accelerators (`+ System`, `+ Context`, `+ Guardrails`, `+ Output Format`).
4. **Right Compiler & Inspector (`w-[38%]` min `340px`)**:
   - Multi-Target Tabs: `Anthropic XML`, `OpenAI JSON`, `Gemini AST`, `Raw Markdown`, `Python / TS SDK`.
   - Variable Interpolation Mode Toggle (`Raw {{var}}` vs `Interpolated`).
   - Token & Cost Estimator Bar (Live count, USD price estimate for Claude 3.7 / GPT-4o / Gemini 2.5).
   - Copy & Download controls.
</content>
</invoke>
