import {
  contrast,
  darken,
  ensureContrast,
  lighten,
  mixOklab,
  pickReadable,
} from "@/lib/color"

export interface PaletteSurfaces {
  bg: string
  surface: string
  subtle: string
  hover: string
  border: string
  borderStrong: string
  fg: string
  fgMuted: string
  accent: string
  accentFg: string
}

export interface Palette {
  id: string
  name: string
  group: string
  light: PaletteSurfaces
  dark: PaletteSurfaces
}

interface Anchors {
  bg: string
  surface: string
  fg: string
  accent: string
  // The hue that colours the theme's borders, subtle backgrounds and muted
  // text. Defaults to the accent, so most themes just pick an authentic
  // accent; neutral themes override it with a near-fg color.
  tint?: string
}

// Finds the largest blend of `surface` toward `toward` that keeps every guard
// readable. Blending back to 0 always succeeds, so this cannot fail: the
// surfaces give way rather than the text.
function blendWithin(
  surface: string,
  toward: string,
  maxT: number,
  guards: Array<{ color: string; min: number }>,
): string {
  for (let step = 40; step >= 0; step--) {
    const t = (maxT * step) / 40
    const candidate = mixOklab(surface, toward, t)
    if (guards.every((g) => contrast(g.color, candidate) >= g.min)) {
      return candidate
    }
  }
  return surface
}

// Secondary surfaces are derived from the anchors so every theme stays
// internally consistent. The tint hue — the theme's signature color — colours
// borders, subtle and hover backgrounds and muted text, which is what makes
// a theme read as itself instead of a gray app with a swapped accent.
// Body text is pushed to AAA and muted text to AA against every surface it
// can appear on, so no theme can ship unreadable.
function buildSurfaces(a: Anchors, mode: "light" | "dark"): PaletteSurfaces {
  const isDark = mode === "dark"
  const away = isDark ? "#ffffff" : "#000000"
  const tint = a.tint ?? a.accent

  const fg = ensureContrast(
    ensureContrast(a.fg, a.surface, 7, away),
    a.bg,
    7,
    away,
  )

  const mutedSeed = mixOklab(fg, tint, 0.28)
  const fgMuted = ensureContrast(
    ensureContrast(mutedSeed, a.surface, 4.5, fg),
    a.bg,
    4.5,
    fg,
  )

  // Subtle backgrounds carry body text directly, so they hold AAA against it.
  // Hover backgrounds are transient, so AA is sufficient there.
  const subtle = blendWithin(a.surface, tint, isDark ? 0.12 : 0.08, [
    { color: fg, min: 7 },
    { color: fgMuted, min: 4.5 },
  ])
  const hover = blendWithin(subtle, tint, isDark ? 0.1 : 0.07, [
    { color: fg, min: 7 },
    { color: fgMuted, min: 4.5 },
  ])
  const border = mixOklab(a.surface, tint, isDark ? 0.3 : 0.22)
  const borderStrong = mixOklab(a.surface, tint, isDark ? 0.5 : 0.38)

  // An accent keeps its identity when it can hold white or near-black text;
  // otherwise it shifts slightly lighter or darker until it can.
  const accentFg = pickReadable(a.accent)
  let accent = a.accent
  if (contrast(accentFg, accent) < 4.5) {
    for (let step = 1; step <= 20; step++) {
      accent =
        accentFg === "#ffffff"
          ? darken(a.accent, step / 40)
          : lighten(a.accent, step / 40)
      if (contrast(accentFg, accent) >= 4.5) break
    }
  }

  return {
    bg: a.bg,
    surface: a.surface,
    subtle,
    hover,
    border,
    borderStrong,
    fg,
    fgMuted,
    accent,
    accentFg,
  }
}

function make(
  id: string,
  name: string,
  group: string,
  light: Anchors,
  dark: Anchors,
): Palette {
  return {
    id,
    name,
    group,
    light: buildSurfaces(light, "light"),
    dark: buildSurfaces(dark, "dark"),
  }
}

export const PALETTES: Palette[] = [
  // Core
  make(
    "default",
    "Default",
    "Core",
    { bg: "#f8fafc", surface: "#ffffff", fg: "#0f172a", accent: "#2563eb" },
    { bg: "#020617", surface: "#0f172a", fg: "#f8fafc", accent: "#60a5fa" },
  ),
  make(
    "midnight",
    "Midnight",
    "Core",
    { bg: "#f4f7fc", surface: "#ffffff", fg: "#0a1424", accent: "#1d4ed8", tint: "#93b4f5" },
    { bg: "#050a14", surface: "#0b1424", fg: "#edf3ff", accent: "#5b9dff" },
  ),

  // Editor classics
  make(
    "dracula",
    "Dracula",
    "Editor classics",
    { bg: "#f8f8fc", surface: "#ffffff", fg: "#1e1f29", accent: "#6d28d9", tint: "#bd93f9" },
    { bg: "#1e1f29", surface: "#282a36", fg: "#f8f8f2", accent: "#bd93f9" },
  ),
  make(
    "one-dark",
    "One Dark",
    "Editor classics",
    { bg: "#fafafa", surface: "#ffffff", fg: "#383a42", accent: "#4078f2", tint: "#61afef" },
    { bg: "#282c34", surface: "#31353f", fg: "#abb2bf", accent: "#61afef" },
  ),
  make(
    "monokai",
    "Monokai",
    "Editor classics",
    { bg: "#f8f8f2", surface: "#fcfcf7", fg: "#272822", accent: "#a13d2d", tint: "#a6e22e" },
    { bg: "#1e1f1c", surface: "#272822", fg: "#f8f8f2", accent: "#a6e22e" },
  ),
  make(
    "night-owl",
    "Night Owl",
    "Editor classics",
    { bg: "#f0f4f8", surface: "#ffffff", fg: "#011627", accent: "#2f7dd1", tint: "#82aaff" },
    { bg: "#011627", surface: "#0b2942", fg: "#d6deeb", accent: "#82aaff" },
  ),
  make(
    "tokyo-night",
    "Tokyo Night",
    "Editor classics",
    { bg: "#e6e7ed", surface: "#ffffff", fg: "#343b58", accent: "#34548a", tint: "#7aa2f7" },
    { bg: "#1a1b26", surface: "#24283b", fg: "#c0caf5", accent: "#7aa2f7" },
  ),
  make(
    "material-palenight",
    "Palenight",
    "Editor classics",
    { bg: "#f7f7fb", surface: "#ffffff", fg: "#292d3e", accent: "#5c6bc0", tint: "#c792ea" },
    { bg: "#292d3e", surface: "#333747", fg: "#a6accd", accent: "#c792ea" },
  ),
  make(
    "shades-of-purple",
    "Shades of Purple",
    "Editor classics",
    { bg: "#f7f7ff", surface: "#ffffff", fg: "#2d2b55", accent: "#6943ff", tint: "#a599e9" },
    { bg: "#1e1d40", surface: "#2d2b55", fg: "#ffffff", accent: "#fad000" },
  ),
  make(
    "vesper",
    "Vesper",
    "Editor classics",
    { bg: "#f5f4f0", surface: "#ffffff", fg: "#232323", accent: "#946a00", tint: "#ffc799" },
    { bg: "#101010", surface: "#1c1c1c", fg: "#d4d4d4", accent: "#ffc799" },
  ),
  make(
    "tomorrow-night",
    "Tomorrow Night",
    "Editor classics",
    { bg: "#f7f7f7", surface: "#ffffff", fg: "#4d4d4c", accent: "#4271ae", tint: "#81a2be" },
    { bg: "#1d1f21", surface: "#282a2e", fg: "#c5c8c6", accent: "#81a2be" },
  ),

  // Cool
  make(
    "nord",
    "Nord",
    "Cool",
    { bg: "#eceff4", surface: "#ffffff", fg: "#2e3440", accent: "#4c6f96", tint: "#88c0d0" },
    { bg: "#2e3440", surface: "#3b4252", fg: "#eceff4", accent: "#88c0d0" },
  ),
  make(
    "ocean",
    "Oceanic",
    "Cool",
    { bg: "#f5f7f9", surface: "#ffffff", fg: "#1b2b34", accent: "#4f5b93", tint: "#66aabb" },
    { bg: "#1b2b34", surface: "#22343f", fg: "#d8dee9", accent: "#6699cc" },
  ),
  make(
    "ayu",
    "Ayu",
    "Cool",
    { bg: "#fafafa", surface: "#ffffff", fg: "#5c6773", accent: "#e68a00", tint: "#ffb454" },
    { bg: "#0b0e14", surface: "#131721", fg: "#bfbdb6", accent: "#ffb454" },
  ),
  make(
    "github",
    "GitHub",
    "Cool",
    { bg: "#ffffff", surface: "#f6f8fa", fg: "#1f2328", accent: "#0969da", tint: "#8b949e" },
    { bg: "#0d1117", surface: "#161b22", fg: "#e6edf3", accent: "#58a6ff" },
  ),
  make(
    "material",
    "Material",
    "Cool",
    { bg: "#fafafa", surface: "#ffffff", fg: "#263238", accent: "#546e7a", tint: "#82aaff" },
    { bg: "#263238", surface: "#2e3c43", fg: "#eeffff", accent: "#82aaff" },
  ),
  make(
    "cobalt2",
    "Cobalt2",
    "Cool",
    { bg: "#f5f8fa", surface: "#ffffff", fg: "#193549", accent: "#1f6feb", tint: "#ffc600" },
    { bg: "#193549", surface: "#122d3f", fg: "#e1efff", accent: "#ffc600" },
  ),
  make(
    "vue",
    "Vue",
    "Cool",
    { bg: "#f8f8f8", surface: "#ffffff", fg: "#2c3e50", accent: "#3f9d6f", tint: "#41b883" },
    { bg: "#0f1a1c", surface: "#16232a", fg: "#e8f0ef", accent: "#41b883" },
  ),
  make(
    "papercolor",
    "PaperColor",
    "Cool",
    { bg: "#eeeeee", surface: "#ffffff", fg: "#444444", accent: "#005f87", tint: "#5fafd7" },
    { bg: "#1c1c1c", surface: "#262626", fg: "#d0d0d0", accent: "#5fafd7" },
  ),
  make(
    "zenburn",
    "Zenburn",
    "Cool",
    { bg: "#f0ede0", surface: "#ffffff", fg: "#3f3f3f", accent: "#4d7350", tint: "#dcdccc" },
    { bg: "#3f3f3f", surface: "#4f4f4f", fg: "#dcdccc", accent: "#8cd0d3" },
  ),
  make(
    "forest",
    "Forest",
    "Cool",
    { bg: "#f5f8f3", surface: "#ffffff", fg: "#1f2d22", accent: "#3f7d3f", tint: "#7fc98a" },
    { bg: "#0f1a14", surface: "#16241b", fg: "#dfeade", accent: "#7fc98a" },
  ),

  // Warm
  make(
    "gruvbox",
    "Gruvbox",
    "Warm",
    { bg: "#fbf1c7", surface: "#f9f5d7", fg: "#3c3836", accent: "#9d5b00", tint: "#b57614" },
    { bg: "#1d2021", surface: "#282828", fg: "#ebdbb2", accent: "#d79921" },
  ),
  make(
    "solarized",
    "Solarized",
    "Warm",
    { bg: "#fdf6e3", surface: "#fffcf2", fg: "#073642", accent: "#1f6fa8", tint: "#2aa198" },
    { bg: "#002b36", surface: "#073642", fg: "#f0ead6", accent: "#4fb3e8" },
  ),
  make(
    "rose-pine",
    "Rose Pine",
    "Warm",
    { bg: "#faf4ed", surface: "#fffaf3", fg: "#575279", accent: "#286983", tint: "#c4a7e7" },
    { bg: "#191724", surface: "#1f1d2e", fg: "#e0def4", accent: "#c4a7e7" },
  ),
  make(
    "everforest",
    "Everforest",
    "Warm",
    { bg: "#fdf6e3", surface: "#fffef7", fg: "#5c6a72", accent: "#70820d", tint: "#83c09c" },
    { bg: "#2b3339", surface: "#323c41", fg: "#d3c6aa", accent: "#a7c080" },
  ),
  make(
    "kanagawa",
    "Kanagawa",
    "Warm",
    { bg: "#f2ecbc", surface: "#fffdf0", fg: "#545464", accent: "#624c83", tint: "#7e9cd8" },
    { bg: "#1f1f28", surface: "#2a2a37", fg: "#dcd7ba", accent: "#7e9cd8" },
  ),
  make(
    "horizon",
    "Horizon",
    "Warm",
    { bg: "#fdf0ed", surface: "#fffaf8", fg: "#1c1e26", accent: "#b3306b", tint: "#e95678" },
    { bg: "#1c1e26", surface: "#232530", fg: "#d5d8da", accent: "#e95678" },
  ),
  make(
    "catppuccin",
    "Catppuccin",
    "Warm",
    { bg: "#eff1f5", surface: "#ffffff", fg: "#4c4f69", accent: "#1e66f5", tint: "#cba6f7" },
    { bg: "#1e1e2e", surface: "#313244", fg: "#cdd6f4", accent: "#cba6f7" },
  ),
  make(
    "sepia",
    "Sepia",
    "Warm",
    { bg: "#f4ecd8", surface: "#fbf6e9", fg: "#433422", accent: "#8a5a2b", tint: "#d9a05b" },
    { bg: "#241f18", surface: "#2e2821", fg: "#e8dcc8", accent: "#d9a05b" },
  ),

  // Bold
  make(
    "synthwave-84",
    "Synthwave 84",
    "Bold",
    { bg: "#faf0ff", surface: "#ffffff", fg: "#241b2f", accent: "#b9007e", tint: "#ff7edb" },
    { bg: "#241b2f", surface: "#2a2139", fg: "#f4eee4", accent: "#ff7edb" },
  ),
  make(
    "high-contrast",
    "High Contrast",
    "Bold",
    { bg: "#ffffff", surface: "#ffffff", fg: "#000000", accent: "#0000cc", tint: "#000000" },
    { bg: "#000000", surface: "#0a0a0a", fg: "#ffffff", accent: "#ffff00", tint: "#ffffff" },
  ),
]

export const DEFAULT_PALETTE_ID = "default"

export const PALETTE_STORAGE_KEY = "promptor-theme-palette"

export const PALETTE_GROUPS: string[] = [
  ...new Set(PALETTES.map((p) => p.group)),
]

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

export function readStoredPalette(): string {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (stored && PALETTES.some((p) => p.id === stored)) return stored
  } catch {
    // storage unavailable, fall through to default
  }
  return DEFAULT_PALETTE_ID
}

function cssVarName(key: keyof PaletteSurfaces): string {
  return `--chakra-colors-app-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
}

function block(selector: string, surfaces: PaletteSurfaces): string {
  const decls = (Object.keys(surfaces) as Array<keyof PaletteSurfaces>)
    .map((key) => `${cssVarName(key)}:${surfaces[key]};`)
    .join("")
  return `${selector}{${decls}}`
}

// These rules must stay unlayered: Chakra emits its own token definitions
// inside `@layer tokens`, and layered rules always lose to unlayered ones.
// Writing them into a plain stylesheet is what lets a palette take effect.
const STYLE_ID = "palette-overrides"

function injectPaletteStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return

  const css = PALETTES.filter((p) => p.id !== DEFAULT_PALETTE_ID)
    .flatMap((p) => [
      block(`html[data-theme="${p.id}"]`, p.light),
      block(`html[data-theme="${p.id}"].dark`, p.dark),
    ])
    .join("\n")

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

injectPaletteStyles()

export function applyPalette(id: string) {
  document.documentElement.setAttribute("data-theme", id)
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id)
  } catch {
    // storage unavailable, the theme still applies for this session
  }
  document.dispatchEvent(new CustomEvent("palette-change"))
}
