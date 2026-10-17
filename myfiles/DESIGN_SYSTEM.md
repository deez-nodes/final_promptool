# prompTOR / PrompTool Design System Specification

---

## 1. Design Philosophy & Vision

**prompTOR** (also known as **PrompTool**) is a professional, section-based prompt engineering and AST architecture studio. It adopts a **neutral-ground, single-accent aesthetic** optimized for extended focus, prompt composition, token inspection, and syntax clarity.

The ground is neutral zinc — effectively hue-free — so that the accents carry all the signal. Depth comes from lit edges and hairline borders, never from gradient washes. The register is the modern developer tool: quiet surfaces, tight radii, one saturated accent doing the work.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ PT ] prompTOR [STUDIO] │ ⚡ Anthropic XML │ 🌐 OpenAI JSON │ ✦ Gemini AST │ ＋ New Section │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Color Palette

The palette is built on the Tailwind default ramp — `zinc` for all neutrals, `500`-weight hues for all accents. Tokens are named by **role**, not by hue, so that a color can be reassigned without renaming every usage.

### Core Palette

| Token | Hex | Tailwind | Role | Contrast on Base |
| :--- | :--- | :--- | :--- | :--- |
| `--color-base` | `#09090B` | `zinc-950` | Root application canvas, gutter backdrop, editor ground | — |
| `--color-surface` | `#18181B` | `zinc-900` | Panels, section cards, sidebar, preview container | 1.18:1 |
| `--color-primary` | `#D946EF` | `fuchsia-500` | Brand glyph, primary action, focus state, active tab | **5.75:1** |
| `--color-secondary` | `#06B6D4` | `cyan-500` | Tag slugs `<tag>`, `{{variables}}`, compiler tabs, term bank badges | **8.19:1** |
| `--color-tertiary` | `#EAB308` | `yellow-500` | Warnings, token-budget pressure, unsaved state, drag affordance | **10.37:1** |
| `--color-success` | `#10B981` | `emerald-500` | Valid syntax, copy confirmation, budget headroom, completed task | **7.84:1** |

Contrast measured against `--color-base` `#09090B` per WCAG 2.1 relative luminance. All four accents clear 4.5:1 and are safe for normal-weight body text. Against `--color-surface` `#18181B` they measure 5.12 / 7.30 / 9.24 / 6.98 respectively — still all passing.

### Derived Tokens

The supplied palette specifies base, surface, and four accents. The following are **derived** from the same `zinc` ramp to complete the system, and are the values to overrule first if the direction shifts.

| Token | Hex | Tailwind | Role | Contrast on Base |
| :--- | :--- | :--- | :--- | :--- |
| `--color-surface-raised` | `#232327` | between `zinc-900`/`800` | Hovered card, keycap face, popover, active row | 1.45:1 |
| `--color-border` | `#27272A` | `zinc-800` | Default 1px structural divider | — |
| `--color-border-strong` | `#3F3F46` | `zinc-700` | Active focus boundary, resizer handle, selected block | — |
| `--color-text` | `#FAFAFA` | `zinc-50` | Primary body copy, editor text, headings | **19.06:1** |
| `--color-text-muted` | `#A1A1AA` | `zinc-400` | De-emphasized labels, inactive tabs, token metadata | **7.76:1** |
| `--color-text-faint` | `#71717A` | `zinc-500` | Non-text only — dividers, disabled glyphs, large icons | 4.12:1 |

**Contrast constraint.** `--color-text-faint` measures 4.12:1 on base and 3.67:1 on surface. It **fails WCAG AA for text at any size** and must never be applied to a text node. Muted labels use `--color-text-muted` `#A1A1AA`. This rule exists because the previous system applied a 3.17:1 gray to 10–11px metadata labels throughout the interface; the failure is easy to reintroduce and hard to see.

### Accent Discipline

- Exactly **one** accent may be saturated in any given viewport region. `--color-primary` is the default; the others appear as state, not decoration.
- Accents are never used as large background fills. They appear as 1px borders, small text, glyphs, and glow — never as a panel color.
- Tinted backgrounds use the accent at ≤12% alpha over `--color-surface`, paired with the accent at ~35% alpha as a border.

---

## 3. Typography Hierarchy

- **Brand & Display**: `Orbitron` (geometric display face for the prompTOR logo, modal titles, and metric badges).
- **Toolbars & Section Headers**: `Rajdhani` (condensed geometric sans for panel headers, section tags, and navigation).
- **Prompt AST, Variables & Editor**: `JetBrains Mono` (coding monospace with clear ligature support for `{{variables}}`, XML tags, JSON syntax, and prompt payloads).

All three faces are self-hosted as `woff2` in `/fonts` — no network font requests.

> **Open item.** Orbitron and Rajdhani were selected against the previous acid-on-slate palette. The reference board in section 6 sits in neutral-grotesk territory throughout. The display face is unresolved against the new palette; the mono is not in question.

---

## 4. CSS Custom Properties

```css
:root {
  /* Ground */
  --color-base:            #09090b;
  --color-surface:         #18181b;
  --color-surface-raised:  #232327;

  /* Accents */
  --color-primary:         #d946ef;
  --color-secondary:       #06b6d4;
  --color-tertiary:        #eab308;
  --color-success:         #10b981;

  /* Accent alpha derivatives */
  --primary-glow:          rgba(217, 70, 239, 0.28);
  --primary-tint:          rgba(217, 70, 239, 0.12);
  --primary-edge:          rgba(217, 70, 239, 0.50);
  --secondary-tint:        rgba(6, 182, 212, 0.12);
  --secondary-edge:        rgba(6, 182, 212, 0.35);
  --tertiary-tint:         rgba(234, 179, 8, 0.12);
  --success-tint:          rgba(16, 185, 129, 0.12);

  /* Borders */
  --color-hairline:        rgba(255, 255, 255, 0.06);
  --color-border:          #27272a;
  --color-border-strong:   #3f3f46;

  /* Text */
  --color-text:            #fafafa;
  --color-text-muted:      #a1a1aa;
  --color-text-faint:      #71717a;  /* non-text use only — see 2 */

  /* Relief */
  --bevel-top:             rgba(255, 255, 255, 0.07);
  --bevel-floor:           rgba(0, 0, 0, 0.40);
  --lip:                   #0c0c0e;

  /* Radii */
  --radius-sm:             4px;
  --radius-md:             6px;
  --radius-lg:             8px;

  /* Typography Stacks */
  --font-display:          'Orbitron', -apple-system, sans-serif;
  --font-subheading:       'Rajdhani', -apple-system, sans-serif;
  --font-mono:             'JetBrains Mono', ui-monospace, monospace;
}
```

---

## 5. Surface Treatment & Depth

The target is crispness through restraint. Four techniques, applied narrowly.

### 5.1 Hairline borders

Structural dividers are white at very low alpha rather than a solid gray. On a `#09090B` ground this reads as an edge catching light instead of a drawn line.

```css
border: 1px solid var(--color-hairline);   /* rgba(255,255,255,.06) */
```

Use `--color-border` `#27272A` only where a divider must survive over `--color-surface-raised`.

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
  border: 1px solid var(--primary-glow);
  box-shadow:
    0 1px 0 var(--primary-edge),                  /* lit extrusion */
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
  outline: 2px solid var(--color-primary);
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
