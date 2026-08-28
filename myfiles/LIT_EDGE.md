# Lit Edge — Design System Specification

**v1.0 · Single-theme dark · No runtime dependencies**

A dark-ground interface system built on one idea: depth comes from a single lit edge, never from a gradient wash. Neutral zinc surfaces, four saturated accents, and physical relief rendered entirely in CSS.

---

## 1. Principles

Three rules govern every decision below. When a component is ambiguous, resolve it against these.

**Depth is an edge, not a fill.** Surfaces stay near-black and nearly flat. Elevation is communicated by a lit top edge, an inset bevel, and a cast shadow — never by lightening the face with a gradient wash. A panel that glows across its whole surface reads as decoration; a panel with one bright edge reads as a physical object catching light.

**One accent per region.** Exactly one element in any given viewport region may be saturated. The other three accents carry state — information, warning, success — and appear as small text, thin borders, and tinted chips. Accents are never large background fills.

**Borders are hairlines.** Structural dividers are white at very low alpha rather than a solid gray. On a near-black ground this reads as an edge catching light instead of a drawn line.

---

## 2. Color

Tokens are declared in two layers. The **base scale** holds literal values and is never referenced by a component. The **semantic layer** maps role to base token and is the only thing components consume. Reassigning a color means editing one semantic line.

### Base scale — neutral

| Step | Hex | Step | Hex |
| :--- | :--- | :--- | :--- |
| `zinc.50` | `#FAFAFA` | `zinc.600` | `#52525B` |
| `zinc.100` | `#F4F4F5` | `zinc.700` | `#3F3F46` |
| `zinc.200` | `#E4E4E7` | `zinc.800` | `#27272A` |
| `zinc.300` | `#D4D4D8` | `zinc.900` | `#18181B` |
| `zinc.400` | `#A1A1AA` | `zinc.950` | `#09090B` |
| `zinc.500` | `#71717A` | | |

### Base scale — accent

| Hue | 400 | 500 | 600 | Role |
| :--- | :--- | :--- | :--- | :--- |
| Fuchsia | `#E879F9` | `#D946EF` | `#C026D3` | Primary |
| Cyan | `#22D3EE` | `#06B6D4` | `#0891B2` | Information |
| Yellow | `#FACC15` | `#EAB308` | `#CA8A04` | Warning |
| Emerald | `#34D399` | `#10B981` | `#059669` | Success |

The `400` step is the hover state, `600` the pressed state. Only `500` appears in the semantic layer.

### Semantic layer

| Token | Resolves to | Applied to |
| :--- | :--- | :--- |
| `--bg-canvas` | `zinc.950` `#09090B` | Root application ground, gutters |
| `--bg-surface` | `zinc.900` `#18181B` | Panels, cards, sidebars |
| `--bg-raised` | `#232327` | Hover state, popovers, keycap face |
| `--bg-inset` | `#0D0D10` | Inputs, code blocks, wells |
| `--fg` | `zinc.50` `#FAFAFA` | Body copy, headings |
| `--fg-muted` | `zinc.400` `#A1A1AA` | Labels, secondary copy, inactive tabs |
| `--fg-faint` | `zinc.500` `#71717A` | Dividers, disabled glyphs — **never text** |
| `--line-hairline` | `rgba(255,255,255,.06)` | Default structural divider |
| `--line` | `zinc.800` `#27272A` | Dividers over raised surfaces |
| `--line-strong` | `zinc.700` `#3F3F46` | Active boundary, resize handle |
| `--accent` | `fuchsia.500` `#D946EF` | Primary action, focus ring, brand |
| `--info` | `cyan.500` `#06B6D4` | Neutral status, metadata highlight |
| `--warn` | `yellow.500` `#EAB308` | Warning, unsaved state, attention |
| `--ok` | `emerald.500` `#10B981` | Success, validation, completion |

---

## 3. Contrast

Measured per WCAG 2.1 relative luminance. Every accent clears 4.5:1 on both grounds and is safe for normal-weight body text at any size.

| Token | Hex | On canvas | On surface | Text use |
| :--- | :--- | ---: | ---: | :--- |
| Foreground | `#FAFAFA` | 19.06:1 | 17.00:1 | AAA |
| Foreground muted | `#A1A1AA` | 7.76:1 | 6.91:1 | AAA |
| Foreground faint | `#71717A` | 4.12:1 | 3.67:1 | **Non-text only** |
| Accent | `#D946EF` | 5.75:1 | 5.12:1 | AA |
| Info | `#06B6D4` | 8.19:1 | 7.30:1 | AAA |
| Warning | `#EAB308` | 10.37:1 | 9.24:1 | AAA |
| Success | `#10B981` | 7.84:1 | 6.98:1 | AAA |

> **Hard constraint.** `--fg-faint` measures 4.12:1 on canvas and 3.67:1 on surface. It fails AA for text at every size and must never reach a text node. Muted labels take `--fg-muted`. This is the easiest rule in the system to break, because 10–11px metadata labels are exactly where a designer reaches for a dimmer gray.

---

## 4. Typography

Three faces, three jobs.

| Role | Family | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| Display | Archivo | `clamp(44px, 8vw, 86px)` | 700 | `-0.035em` |
| H2 | Archivo | 30px | 600 | `-0.02em` |
| H3 | Archivo | 17px | 600 | `-0.01em` |
| Body | IBM Plex Sans | 15px / 1.65 | 400 | 0 |
| Label | IBM Plex Mono | 10–11px, uppercase | 500 | `0.12em` |
| Code | IBM Plex Mono | 12.5px / 1.7 | 400 | 0 |
| Keycap | IBM Plex Mono | 12px | 500 | `0.02em` |

Running text holds to roughly 66 characters per line. Any table or metric that aligns vertically takes `font-variant-numeric: tabular-nums`.

---

## 5. Scales

Space runs on a 4px base with a doubling bias. Radii stay tight — nothing in this system is soft.

| Space | Value | Use | Radius | Value | Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--s-1` | 4px | Icon gap | `--r-xs` | 3px | Chip, inline code |
| `--s-2` | 8px | Key gap, tight stack | `--r-sm` | 5px | Badge, small control |
| `--s-3` | 12px | Control padding | `--r-md` | 7px | Button, keycap, input |
| `--s-4` | 16px | Card gap | `--r-lg` | 10px | Card, panel, code block |
| `--s-5` | 24px | Card padding | `--r-xl` | 14px | Modal, large plate |
| `--s-6` | 32px | Block separation | | | |
| `--s-7` | 48px | Section padding | | | |
| `--s-8` | 64px | Section separation | | | |
| `--s-9` | 96px | Masthead | | | |

---

## 6. Surfaces & depth

Three surface treatments cover everything. The distinction between them is what the border is doing, not what the fill is doing.

```css
/* default panel — the border is barely there */
background: var(--bg-surface);
border: 1px solid var(--line-hairline);
border-radius: var(--r-lg);

/* over a raised ground, where a hairline would vanish */
border: 1px solid var(--line);

/* emphasis — one lit extrusion, one wide bloom */
background: #101013;
border: 1px solid var(--accent-glow);
box-shadow:
  0 1px 0 var(--accent-edge),                /* lit extrusion */
  0 12px 40px -12px rgba(217, 70, 239, .25); /* bloom */
```

The same rule scales to isometric composition: faces stay near-black, only the extruded edge carries the accent.

### Grain

A single noise layer over the canvas at 3.5% opacity in `overlay` blend mode. It prevents banding in near-black gradients and supplies the tactile quality the system depends on. Inline it as a data URI so the surface treatment carries no network dependency.

```css
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: .035;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

---

## 7. Keycaps

The keycap is the system's reference implementation of relief. Everything pressable — buttons, toggles, segment controls — inherits its shadow stack.

### Anatomy

Five layers, applied in one `box-shadow` declaration.

| # | Layer | Declaration | Does |
| :--- | :--- | :--- | :--- |
| 1 | Bevel | `inset 0 1px 0 rgba(255,255,255,.08)` | Lights the top inside edge |
| 2 | Floor | `inset 0 -1px 0 rgba(0,0,0,.45)` | Darkens the bottom inside edge |
| 3 | Lip | `0 3px 0 #0C0C0E` | Hard extrusion below the cap |
| 4 | Cast | `0 4px 8px rgba(0,0,0,.55)` | Soft shadow on the ground |
| 5 | Face | `linear-gradient(180deg, #2A2A2F, #1C1C20)` | The cap's own surface |

### Full recipe

```css
.key {
  --lip-h: 3px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  height: 46px;
  padding: 0 var(--s-3);
  border: 1px solid #323238;
  border-radius: var(--r-md);
  background: linear-gradient(180deg, #2A2A2F 0%, #1C1C20 100%);
  color: var(--zinc-200);
  font: 500 12px/1 var(--font-mono);
  letter-spacing: .02em;
  user-select: none;
  cursor: pointer;

  box-shadow:
    inset 0  1px 0 var(--bevel),                       /* 1 */
    inset 0 -1px 0 var(--floor),                       /* 2 */
    0 var(--lip-h) 0 var(--lip),                       /* 3 */
    0 calc(var(--lip-h) + 1px) 8px rgba(0, 0, 0, .55); /* 4 */

  transform: translateY(0);
  transition:
    transform  var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease);
}

.key:hover {
  border-color: #3D3D45;
  color: var(--fg);
}

.key:active,
.key.is-down {
  transform: translateY(var(--lip-h));      /* == lip height */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .04), /* bevel dims    */
    inset 0 2px 5px rgba(0, 0, 0, .55),     /* floor deepens */
    0 0 0 var(--lip),                       /* lip collapses */
    0 1px 2px rgba(0, 0, 0, .4);            /* cast tightens */
}

.key:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;  /* 3px, not 2px — clears the lip */
}
```

### The geometry rule

The cap descends by **exactly the lip height** while the lip collapses to zero. Bind both to one custom property — `--lip-h` — so they cannot drift apart. The bottom edge of the assembly then stays fixed and the key compresses. Any other pairing of those two numbers makes the key appear to slide down the page, which reads as a bug rather than a press.

### Variants

| Variant | Change | Use |
| :--- | :--- | :--- |
| `.key` | Base recipe, 46px square | Alphanumeric |
| `.wide` | `min-width: 78px` | Enter, backspace, ctrl |
| `.wider` | `min-width: 112px` | Shift, caps |
| `.space` | `min-width: 230px` | Spacebar |
| `.accent` | Fuchsia face, accent bevel, tinted bloom | Primary key in a cluster — one only |
| `[disabled]` | Flat face, lip retained, no press transform | Unavailable key |

```css
.key.wide  { min-width: 78px; }
.key.wider { min-width: 112px; }
.key.space { min-width: 230px; }

.key.accent {
  border-color: rgba(217, 70, 239, .45);
  background: linear-gradient(180deg, #3A1442 0%, #25102B 100%);
  color: var(--fuchsia-400);
  box-shadow:
    inset 0  1px 0 rgba(232, 121, 249, .22),
    inset 0 -1px 0 var(--floor),
    0 var(--lip-h) 0 #150618,
    0 calc(var(--lip-h) + 1px) 10px rgba(217, 70, 239, .22);
}

.key[disabled] {
  color: var(--zinc-600);
  border-color: #26262B;
  cursor: not-allowed;
  background: linear-gradient(180deg, #1E1E22 0%, #17171A 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 var(--lip-h) 0 #0A0A0C;
}
.key[disabled]:active { transform: none; }
```

### Driving press state from real input

Pointer presses are handled by `:active`. Bind physical keys to the same visual state:

```js
const keys = new Map(
  [...document.querySelectorAll('.key[data-k]')].map(el => [el.dataset.k, el])
);

addEventListener('keydown', e => {
  const el = keys.get(e.key.toLowerCase());
  if (el && !el.disabled) el.classList.add('is-down');
});

addEventListener('keyup', e => {
  keys.get(e.key.toLowerCase())?.classList.remove('is-down');
});

// release everything if the window loses focus mid-press
addEventListener('blur', () => {
  keys.forEach(el => el.classList.remove('is-down'));
});
```

Because `.is-down` and `:active` share one rule block, pointer and keyboard presses render identically.

---

## 8. Component recipes

Each recipe composes semantic tokens only. No component references a base scale value directly.

| Recipe | Fill | Border | Notes |
| :--- | :--- | :--- | :--- |
| Button / primary | `--accent` | `--accent` | Dark fuchsia text for contrast on fill |
| Button / tint | `--accent-tint` | `--accent-edge` | Secondary emphasis |
| Button / ghost | transparent | `--line` | Raises to `--bg-raised` on hover |
| Badge | `*-tint` (12%) | `*-edge` (35%) | Mono, 11px |
| Input | `--bg-inset` | `--line` | Focus: accent border + 3px tint ring |
| Card | `--bg-surface` | `--line-hairline` | Default container |

```css
.btn-primary { background: var(--accent); color: #1A0620; border: 1px solid var(--accent); font-weight: 600; }
.btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

.btn-tint  { background: var(--accent-tint); color: var(--fuchsia-400); border: 1px solid var(--accent-edge); }

.btn-ghost { background: transparent; color: var(--fg-muted); border: 1px solid var(--line); }
.btn-ghost:hover { color: var(--fg); border-color: var(--line-strong); background: var(--bg-raised); }

.field:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-tint);
}
```

---

## 9. Motion & focus

| Token | Value | Applied to |
| :--- | :--- | :--- |
| `--dur-fast` | 90ms | Key press, button press |
| `--dur` | 140ms | Hover, border, tint |
| `--dur-slow` | 220ms | Panel reveal, popover |
| `--ease` | `cubic-bezier(.4, 0, .2, 1)` | All of the above |

Animate `transform`, `opacity`, `box-shadow`, and `border-color` only. Width, height, top, and left are never animated.

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;   /* 3px on keycaps, to clear the lip */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:  .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 10. Token export

### CSS custom properties

```css
:root {
  /* base — never referenced by components */
  --zinc-50:#fafafa;  --zinc-400:#a1a1aa; --zinc-800:#27272a;
  --zinc-100:#f4f4f5; --zinc-500:#71717a; --zinc-900:#18181b;
  --zinc-200:#e4e4e7; --zinc-600:#52525b; --zinc-950:#09090b;
  --zinc-300:#d4d4d8; --zinc-700:#3f3f46;

  --fuchsia-400:#e879f9; --fuchsia-500:#d946ef; --fuchsia-600:#c026d3;
  --cyan-400:#22d3ee;    --cyan-500:#06b6d4;    --cyan-600:#0891b2;
  --yellow-400:#facc15;  --yellow-500:#eab308;  --yellow-600:#ca8a04;
  --emerald-400:#34d399; --emerald-500:#10b981; --emerald-600:#059669;

  /* semantic — the only layer components read */
  --bg-canvas:  var(--zinc-950);
  --bg-surface: var(--zinc-900);
  --bg-raised:  #232327;
  --bg-inset:   #0d0d10;

  --fg:         var(--zinc-50);
  --fg-muted:   var(--zinc-400);
  --fg-faint:   var(--zinc-500);   /* non-text only */

  --line-hairline: rgba(255,255,255,.06);
  --line:          var(--zinc-800);
  --line-strong:   var(--zinc-700);

  --accent:       var(--fuchsia-500);
  --accent-hover: var(--fuchsia-400);
  --accent-press: var(--fuchsia-600);
  --accent-tint:  rgba(217,70,239,.12);
  --accent-edge:  rgba(217,70,239,.50);
  --accent-glow:  rgba(217,70,239,.28);

  --info: var(--cyan-500);
  --warn: var(--yellow-500);
  --ok:   var(--emerald-500);

  /* relief */
  --bevel: rgba(255,255,255,.08);
  --floor: rgba(0,0,0,.45);
  --lip:   #0c0c0e;

  /* radii */
  --r-xs:3px; --r-sm:5px; --r-md:7px; --r-lg:10px; --r-xl:14px;

  /* space */
  --s-1:4px;  --s-2:8px;  --s-3:12px; --s-4:16px; --s-5:24px;
  --s-6:32px; --s-7:48px; --s-8:64px; --s-9:96px;

  /* motion */
  --dur-fast:90ms; --dur:140ms; --dur-slow:220ms;
  --ease:cubic-bezier(.4,0,.2,1);

  /* type */
  --font-display:'Archivo', system-ui, sans-serif;
  --font-sans:'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:'IBM Plex Mono', ui-monospace, monospace;
}
```

### Structured config

Base and semantic layers kept separate, in the shape a token pipeline or a component library's theme object expects.

```js
export const theme = {
  tokens: {
    colors: {
      zinc: { 50:'#fafafa', 400:'#a1a1aa', 500:'#71717a',
              700:'#3f3f46', 800:'#27272a', 900:'#18181b', 950:'#09090b' },
      fuchsia: { 400:'#e879f9', 500:'#d946ef', 600:'#c026d3' },
      cyan:    { 400:'#22d3ee', 500:'#06b6d4', 600:'#0891b2' },
      yellow:  { 400:'#facc15', 500:'#eab308', 600:'#ca8a04' },
      emerald: { 400:'#34d399', 500:'#10b981', 600:'#059669' },
    },
    radii:  { xs:'3px', sm:'5px', md:'7px', lg:'10px', xl:'14px' },
    space:  { 1:'4px', 2:'8px', 3:'12px', 4:'16px',
              5:'24px', 6:'32px', 7:'48px', 8:'64px' },
    durations: { fast:'90ms', base:'140ms', slow:'220ms' },
  },

  semanticTokens: {
    colors: {
      'bg.canvas':   '{colors.zinc.950}',
      'bg.surface':  '{colors.zinc.900}',
      'bg.raised':   '#232327',
      'bg.inset':    '#0d0d10',
      'fg.default':  '{colors.zinc.50}',
      'fg.muted':    '{colors.zinc.400}',
      'fg.faint':    '{colors.zinc.500}',   // non-text only
      'line.hairline': 'rgba(255,255,255,.06)',
      'line.default':  '{colors.zinc.800}',
      'line.strong':   '{colors.zinc.700}',
      'accent.default':'{colors.fuchsia.500}',
      'accent.hover':  '{colors.fuchsia.400}',
      'accent.press':  '{colors.fuchsia.600}',
      'status.info':   '{colors.cyan.500}',
      'status.warn':   '{colors.yellow.500}',
      'status.ok':     '{colors.emerald.500}',
    },
  },

  recipes: {
    key: {
      base: {
        '--lip-h': '3px',
        minW: '46px', h: '46px', px: 3,
        borderRadius: 'md',
        border: '1px solid #323238',
        bgGradient: 'linear(180deg, #2A2A2F, #1C1C20)',
        boxShadow: 'inset 0 1px 0 {bevel}, inset 0 -1px 0 {floor},' +
                   '0 var(--lip-h) 0 {lip}, 0 calc(var(--lip-h) + 1px) 8px rgba(0,0,0,.55)',
        transition: 'transform 90ms {ease}, box-shadow 90ms {ease}',
        _active: {
          transform: 'translateY(var(--lip-h))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04),' +
                     'inset 0 2px 5px rgba(0,0,0,.55), 0 0 0 {lip}, 0 1px 2px rgba(0,0,0,.4)',
        },
      },
      variants: {
        size: { md:{}, wide:{ minW:'78px' }, wider:{ minW:'112px' }, space:{ minW:'230px' } },
        tone: { neutral:{}, accent:{ /* fuchsia face + accent bevel */ } },
      },
      defaultVariants: { size:'md', tone:'neutral' },
    },
  },
};
```

---

## Adoption order

Land the base and semantic layers first, and let components read semantic tokens only. The relief group — `--bevel`, `--floor`, `--lip` — is what makes the keycap recipe portable to buttons, toggles, and segment controls without re-deriving the shadow stack each time.
</content>
