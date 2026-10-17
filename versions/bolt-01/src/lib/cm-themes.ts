import type { Extension } from "@codemirror/state"
import {
  abyss,
  atomone,
  aura,
  bbedit,
  bespin,
  dracula,
  duotoneDark,
  duotoneLight,
  eclipse,
  githubDark,
  githubLight,
  gruvboxDark,
  gruvboxLight,
  kimbie,
  materialDark,
  materialLight,
  monokai,
  noctisLilac,
  nord,
  quietlight,
  red,
  solarizedDark,
  solarizedLight,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  tomorrowNightBlue,
  vscodeDark,
  vscodeLight,
  whiteDark,
  whiteLight,
} from "@uiw/codemirror-themes-all"

// Each app theme is paired with the genuine CodeMirror theme it is named
// after (or the closest real one when no official port exists).
const THEME_MAP: Record<string, { light: Extension; dark: Extension }> = {
  default: { light: githubLight, dark: githubDark },
  midnight: { light: vscodeLight, dark: vscodeDark },
  dracula: { light: dracula, dark: dracula },
  "one-dark": { light: atomone, dark: atomone },
  monokai: { light: monokai, dark: monokai },
  "night-owl": { light: quietlight, dark: tokyoNightStorm },
  "tokyo-night": { light: tokyoNightDay, dark: tokyoNight },
  "material-palenight": { light: materialLight, dark: materialDark },
  "shades-of-purple": { light: aura, dark: aura },
  vesper: { light: whiteLight, dark: whiteDark },
  "tomorrow-night": { light: bbedit, dark: tomorrowNightBlue },
  nord: { light: nord, dark: nord },
  ocean: { light: quietlight, dark: abyss },
  ayu: { light: bespin, dark: bespin },
  github: { light: githubLight, dark: githubDark },
  material: { light: materialLight, dark: materialDark },
  cobalt2: { light: eclipse, dark: abyss },
  vue: { light: duotoneLight, dark: duotoneDark },
  papercolor: { light: quietlight, dark: vscodeDark },
  zenburn: { light: bbedit, dark: kimbie },
  forest: { light: duotoneLight, dark: duotoneDark },
  gruvbox: { light: gruvboxLight, dark: gruvboxDark },
  solarized: { light: solarizedLight, dark: solarizedDark },
  "rose-pine": { light: noctisLilac, dark: aura },
  everforest: { light: quietlight, dark: kimbie },
  kanagawa: { light: bbedit, dark: tokyoNightStorm },
  horizon: { light: noctisLilac, dark: red },
  catppuccin: { light: duotoneLight, dark: duotoneDark },
  sepia: { light: bbedit, dark: kimbie },
  "synthwave-84": { light: noctisLilac, dark: aura },
  "high-contrast": { light: whiteLight, dark: whiteDark },
}

export function cmThemeFor(
  paletteId: string,
  colorMode: "light" | "dark",
): Extension {
  const entry = THEME_MAP[paletteId]
  if (!entry) return colorMode === "dark" ? githubDark : githubLight
  return colorMode === "dark" ? entry.dark : entry.light
}
