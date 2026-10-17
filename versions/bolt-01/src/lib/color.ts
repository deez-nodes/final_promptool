export type RGB = [number, number, number]

export function parseHex(hex: string): RGB {
  const h = hex.replace("#", "")
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

export function toHex(rgb: RGB): string {
  return `#${rgb
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`
}

// t = 0 returns `a`, t = 1 returns `b`. Blends in OKLab so hues stay vivid —
// raw RGB blending desaturates and drifts toward brown, which is what made
// themes read as muddy.
export function mix(a: string, b: string, t: number): string {
  const A = parseHex(a)
  const B = parseHex(b)
  return toHex([
    A[0] + (B[0] - A[0]) * t,
    A[1] + (B[1] - A[1]) * t,
    A[2] + (B[2] - A[2]) * t,
  ])
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function rgbToOklab(rgb: RGB): [number, number, number] {
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255)) as RGB
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToRgb(lab: [number, number, number]): RGB {
  const [L, a, b] = lab
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return [r, g, bb].map((v) =>
    Math.max(0, Math.min(255, Math.round(255 * linearToSrgb(v)))),
  ) as RGB
}

// Perceptually uniform blend. Mixing white toward purple here yields a vivid
// lavender, not the gray-brown RGB produces.
export function mixOklab(a: string, b: string, t: number): string {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = rgbToOklab(parseHex(a))
  const B = rgbToOklab(parseHex(b))
  return toHex(
    oklabToRgb([
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t,
      A[2] + (B[2] - A[2]) * t,
    ]),
  )
}

export function luminance(hex: string): number {
  const channels = parseHex(hex).map((value) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

// Nudges `fg` toward `toward` until it reaches `min` against `bg`. Returns
// `fg` untouched when it already passes, so hand-picked values survive.
export function ensureContrast(
  fg: string,
  bg: string,
  min: number,
  toward: string,
): string {
  if (contrast(fg, bg) >= min) return fg
  let candidate = fg
  for (let step = 1; step <= 20; step++) {
    candidate = mixOklab(fg, toward, step / 20)
    if (contrast(candidate, bg) >= min) return candidate
  }
  return candidate
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, "#ffffff", amount)
}

export function darken(hex: string, amount: number): string {
  return mix(hex, "#000000", amount)
}

export function pickReadable(
  bg: string,
  light = "#ffffff",
  dark = "#0b0d12",
): string {
  return contrast(light, bg) >= contrast(dark, bg) ? light : dark
}
