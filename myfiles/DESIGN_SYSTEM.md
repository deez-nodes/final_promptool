# prompTOR / PrompTool Design System Specification

---

## 1. Design Philosophy & Vision

**prompTOR** (also known as **PrompTool**) is a professional, section-based prompt engineering and AST architecture studio. It adopts a **high-contrast cyber-editorial aesthetic** optimized for extended focus, prompt composition, token inspection, and syntax clarity.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ PT ] prompTOR [STUDIO] │ ⚡ Anthropic XML │ 🌐 OpenAI JSON │ ✦ Gemini AST │ ＋ New Section │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Color Palette

### Color Palette Specification

| UI Element in Interface | Token Name | Hex | RGB / HSL | Semantic Role & Hierarchy | Optical Glow / Border Spec |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Anchor `[ PT ]` & Execution Glow** | `color-brand-magenta` | `#E6007A` | `rgb(230, 0, 122)`<br>`hsl(328, 100%, 45%)` | Primary brand glyph, focus state, active mutation highlight | `box-shadow: 0 0 14px rgba(230,0,122,0.40);`<br>`border: 1px solid #FF3399` |
| **`prompTOR` Title & Primary Action `+ New`** | `color-accent-acid` | `#E8FF47` | `rgb(232, 255, 71)`<br>`hsl(69, 100%, 65%)` | Primary action trigger, active tab indicator, XML tag highlights | `box-shadow: 0 0 12px rgba(232,255,71,0.30);`<br>`border: 1px solid #E8FF47` |
| **Tag Slugs `&lt;tag&gt;` & Model Accents** | `color-accent-cyan` | `#39D4C8` | `rgb(57, 212, 200)`<br>`hsl(175, 64%, 53%)` | Variable highlights `{{var}}`, term bank badges, compiler tabs | `background: rgba(57,212,200,0.12);`<br>`border: 1px solid rgba(57,212,200,0.35)` |
| **Verification & Token Success** | `color-accent-emerald` | `#5DFFB0` | `rgb(93, 255, 176)`<br>`hsl(151, 100%, 68%)` | Valid syntax, token budget green, copy confirmation | `box-shadow: 0 0 10px rgba(93,255,176,0.25);` |
| **Badge Background & Surface Pill** | `color-surface-pill` | `#1F2533` | `rgb(31, 37, 51)`<br>`hsl(222, 24%, 16%)` | Metadata badge container, section counter, role chip background | `border: 1px solid #283042;` |
| **Muted Labels & Inactive Text** | `color-text-muted` | `#808EA8` | `rgb(128, 142, 168)`<br>`hsl(219, 19%, 58%)` | De-emphasized labels, inactive tab headings, token metadata | Contrast ratio: 5.6:1 against `#07080E` (WCAG AA compliant) |
| **Section Card & Panel Frame** | `color-surface-card` | `#121622` | `rgb(18, 22, 34)`<br>`hsl(225, 31%, 10%)` | Prompt section block, sidebar drawer, preview container | `border: 1px solid #222A3C;`<br>`border-radius: 8px` |
| **Active Focus Boundary** | `color-border-active` | `#313C54` | `rgb(49, 60, 84)`<br>`hsl(221, 26%, 26%)` | High-contrast structural focus boundary for active block | Outer frame wrapper: 1px solid `#313C54` |
| **Root Studio Canvas** | `color-bg-obsidian` | `#07080E` | `rgb(7, 8, 14)`<br>`hsl(231, 33%, 4%)` | Root application canvas, gutter backdrop, terminal background | Radial gradient: `from #0F1119 to #07080E` |

---

## 3. Typography Hierarchy

- **Brand & Display**: `Orbitron` (Cyber-geometric sans-serif for prompTOR logo, modal titles, and metric badges).
- **Toolbars & Section Headers**: `Rajdhani` (Condensed, high-legibility geometric sans-serif for panel headers, section tags, and navigation).
- **Prompt AST, Variables & Editor**: `JetBrains Mono` (Coding monospace with clear ligature support for `{{variables}}`, XML tags, JSON syntax, and prompt payloads).

---

## 4. CSS Custom Properties

```css
:root {
  /* Brand & Accents */
  --promptor-magenta: #e6007a;
  --promptor-magenta-glow: rgba(230, 0, 122, 0.40);
  --promptor-acid: #e8ff47;
  --promptor-acid-dim: #2a310d;
  --promptor-acid-glow: rgba(232, 255, 71, 0.35);
  --promptor-cyan: #39d4c8;
  --promptor-cyan-dim: #0d282c;
  --promptor-cyan-glow: rgba(57, 212, 200, 0.35);
  --promptor-emerald: #5dffb0;
  --promptor-amber: #ffb84d;

  /* Surfaces & Containers */
  --surface-canvas: #07080e;
  --surface-panel: #0f1119;
  --surface-card: #121622;
  --surface-active: #1f2533;
  --surface-hover: #283042;

  /* Borders & Dividers */
  --border-subtle: #1a202c;
  --border-default: #222a3c;
  --border-active: #313c54;
  --border-highlight: #414f6e;

  /* Typography */
  --text-primary: #dfe6f0;
  --text-secondary: #808ea8;
  --text-disabled: #54607a;

  /* Typography Stacks */
  --font-display: 'Orbitron', -apple-system, sans-serif;
  --font-subheading: 'Rajdhani', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 5. UI Component Hierarchy & Spacing

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
