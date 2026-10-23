#!/usr/bin/env node
/**
 * checks/contrast.mjs — zero-dependency check for LAYOUT_SPEC F1 ("Contrast").
 *
 *   node checks/contrast.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * [struct] Every color token used for text under 14px clears WCAG 2.1 AA,
 *          4.5:1, against --bg. The ratios this script prints are the values
 *          recorded in myfiles/DESIGN_SYSTEM.md.
 *
 * Token values come from myfiles/tokens.json (the single source). Contrast is
 * WCAG 2.1: relative luminance of sRGB, (L1 + 0.05) / (L2 + 0.05).
 *
 * HOW "USED FOR TEXT UNDER 14px" IS DECIDED — a static scan, no browser:
 *
 *  1. Files: every .vue file under pages/, components/, layouts/, plus app.vue
 *     and error.vue. Only the <template> is read. Elements are tracked with a
 *     tag stack so font size is inherited down the tree.
 *  2. Classes: the static `class="..."` attribute plus every string literal
 *     inside `:class="..."` (both ternary branches count).
 *  3. A text-color use is any class `text-<token>`, `placeholder-<token>`, with
 *     any variant prefix (`hover:`, `focus:`, `placeholder:`), where <token> is
 *     a key of tokens.json `color`. An opacity modifier (`text-muted/50`) is
 *     composited over the background it is measured against.
 *  4. Font size: the element's own unprefixed size utility (text-xs = 12px,
 *     text-sm = 14px, text-base = 16px, ..., text-[Npx], text-[Nrem]), else
 *     the nearest ancestor's in the same file. At a file's root the size is
 *     unknown and is assumed to be under 14px: a component cannot know where
 *     it is mounted, and the studio shell sets text-xs. A use counts when the
 *     size is under 14px or unknown.
 *  5. CSS: `color: var(--<token>)` in assets/css/main.css or a <style> block
 *     counts (size unknown, so assumed under 14px).
 *  6. Background: --bg. One exception: a text token whose value equals --bg
 *     (`text-bg`) is inverse text by construction and is measured against the
 *     opaque `bg-<token>` fill on the same element (no fill = measured against
 *     --bg, and fails, because it would be invisible).
 *  7. Decoration is not text: an element with no child elements whose only
 *     content is separator punctuation (| · • / — – : ,) is listed as
 *     decorative and not gated (WCAG 1.4.3 "incidental").
 *
 * Informational, not gated: a use sitting on an opaque raised fill (its own or
 * an ancestor's `bg-<token>` in the same file) is also measured against that
 * fill and listed when below 4.5:1. The spec's gate is --bg.
 *
 * An explicit root may be passed so the check can be pointed at a copy of the
 * tree (used to mutation-test the check itself).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));
const MIN = 4.5;
const SMALL = 14;

/* ── tokens & color math ─────────────────────────────────────────────────── */

const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'myfiles/tokens.json'), 'utf8'));
const COLORS = Object.fromEntries(Object.entries(tokens.color).map(([k, v]) => [k, v.value.toLowerCase()]));
const BG = COLORS.bg;

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const toHex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
function luminance(hex) {
  const [r, g, b] = rgb(hex).map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const over = (fg, alpha, bg) => (alpha === 1 ? fg : toHex(rgb(fg).map((v, i) => v * alpha + rgb(bg)[i] * (1 - alpha))));

/* ── class parsing ───────────────────────────────────────────────────────── */

const NAMED_SIZE = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 };

function fontSize(classes) {
  let px = null;
  for (const c of classes) {
    let m;
    if ((m = /^text-(xs|sm|base|lg|[2-5]?xl)$/.exec(c))) px = NAMED_SIZE[m[1]];
    else if ((m = /^text-\[(\d*\.?\d+)px\]$/.exec(c))) px = Number(m[1]);
    else if ((m = /^text-\[(\d*\.?\d+)rem\]$/.exec(c))) px = Number(m[1]) * 16;
  }
  return px;
}

function textColors(classes) {
  const out = [];
  for (const c of classes) {
    const m = /^((?:[\w-]+:)*)(?:text|placeholder)-([\w-]+?)(?:\/(\d+))?$/.exec(c);
    if (m && COLORS[m[2]]) out.push({ cls: c, token: m[2], alpha: m[3] ? Number(m[3]) / 100 : 1 });
  }
  return out;
}

function opaqueFill(classes) {
  let fill = null;
  for (const c of classes) {
    const m = /^bg-([\w-]+)$/.exec(c);
    if (m && COLORS[m[1]]) fill = m[1];
  }
  return fill;
}

function classList(attrs) {
  const out = [];
  for (const m of attrs.matchAll(/(?:^|\s)(:|v-bind:)?class\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const val = m[2] ?? m[3];
    if (!m[1]) out.push(val);
    else for (const s of val.matchAll(/'([^']*)'|`([^`]*)`|"([^"]*)"/g)) out.push((s[1] ?? s[2] ?? s[3]).replace(/\$\{[^}]*\}/g, ' '));
  }
  return out.join(' ').split(/\s+/).filter(Boolean);
}

/* ── template walk ───────────────────────────────────────────────────────── */

const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'source', 'col', 'area', 'wbr']);
const DECOR = /^[|·•\/\\—–:,]+$/u;

const uses = [];       // { token, alpha, cls, file, line, size, against, fill }
const decorative = []; // { token, file, line, text }

function lineAt(text, idx) {
  return text.slice(0, idx).split('\n').length;
}

function scanTemplate(rel, src) {
  const start = src.indexOf('<template');
  const end = src.lastIndexOf('</template>');
  if (start < 0 || end < 0) return;
  const tpl = src.slice(0, end);
  const stack = [{ tag: '#root', size: null, fill: null }];

  const finish = el => {
    if (!el.colors.length) return;
    const small = el.size === null || el.size < SMALL;
    if (!small) return;
    const isDecor = el.children === 0 && DECOR.test(el.text.trim());
    for (const c of el.colors) {
      if (isDecor) {
        decorative.push({ token: c.token, file: rel, line: el.line, text: el.text.trim() });
        continue;
      }
      const inverse = COLORS[c.token] === BG;
      const against = inverse && el.ownFill ? el.ownFill : 'bg';
      uses.push({ ...c, file: rel, line: el.line, size: el.size, against, fill: el.fill });
    }
  };

  const RE = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][\w.:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/g;
  RE.lastIndex = start;
  let m;
  while ((m = RE.exec(tpl))) {
    if (m[0].startsWith('<!--')) continue;
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) {
      if (top.text !== undefined) top.text += m[4];
      continue;
    }
    const [, closing, tag, attrs] = m;
    if (closing) {
      const i = stack.map(e => e.tag).lastIndexOf(tag);
      if (i > 0) while (stack.length > i) finish(stack.pop());
      continue;
    }
    if (top.children !== undefined) top.children++;
    const classes = classList(attrs);
    const ownFill = opaqueFill(classes);
    const el = {
      tag,
      line: lineAt(src, m.index),
      size: fontSize(classes) ?? top.size,
      ownFill,
      fill: ownFill ?? top.fill,
      colors: textColors(classes),
      text: '',
      children: 0,
    };
    if (attrs.trim().endsWith('/') || VOID.has(tag.toLowerCase())) finish(el);
    else stack.push(el);
  }
  while (stack.length > 1) finish(stack.pop());
}

function scanCss(rel, css) {
  css.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/(?<![\w-])color\s*:\s*var\(--([\w-]+)\)/g)) {
      if (COLORS[m[1]]) uses.push({ cls: `color: var(--${m[1]})`, token: m[1], alpha: 1, file: rel, line: i + 1, size: null, against: 'bg', fill: null });
    }
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && p.endsWith('.vue')) out.push(p);
  }
  return out;
}

const files = [
  ...['pages', 'components', 'layouts'].flatMap(d => walk(path.join(ROOT, d))),
  ...['app.vue', 'error.vue'].map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f)),
];
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const src = fs.readFileSync(f, 'utf8');
  scanTemplate(rel, src);
  for (const s of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) scanCss(rel, s[1]);
}
const CSS = 'assets/css/main.css';
if (fs.existsSync(path.join(ROOT, CSS))) scanCss(CSS, fs.readFileSync(path.join(ROOT, CSS), 'utf8'));

/* ── evaluate ────────────────────────────────────────────────────────────── */

// One row per (token, alpha, background) combination.
const rows = new Map();
for (const u of uses) {
  const key = `${u.token}|${u.alpha}|${u.against}`;
  if (!rows.has(key)) {
    const bgHex = COLORS[u.against];
    const fg = over(COLORS[u.token], u.alpha, bgHex);
    rows.set(key, { token: u.token, alpha: u.alpha, against: u.against, fg, ratio: contrast(fg, bgHex), where: [] });
  }
  const sz = u.size === null ? '?px' : `${u.size}px`;
  rows.get(key).where.push(`${u.file}:${u.line} ${u.cls} @${sz}`);
}
const sorted = [...rows.values()].sort((a, b) => a.ratio - b.ratio);
const failing = sorted.filter(r => r.ratio < MIN);

const pad = (s, n) => String(s).padEnd(n);
const fmt = r => r.toFixed(2) + ':1';
const label = r => r.token + (r.alpha < 1 ? `/${Math.round(r.alpha * 100)}` : '');

const lines = ['', `── F1. Contrast (text under ${SMALL}px vs --bg ${BG}) ${'─'.repeat(30)}`];
lines.push(`${failing.length ? 'FAIL' : 'ok  '}  [struct] every token used for text under ${SMALL}px clears ${MIN}:1`);
lines.push(`        considered (rule: see header; ${files.length} .vue files + ${CSS}, ${uses.length} uses):`);
for (const r of sorted) {
  const bgNote = r.against === 'bg' ? '--bg' : `bg-${r.against} fill`;
  lines.push(`        ${r.ratio < MIN ? 'FAIL' : 'ok  '}  ${pad(label(r), 10)} ${r.fg}  ${pad(fmt(r.ratio), 9)} vs ${pad(bgNote, 16)} ${r.where.length} use(s), e.g. ${r.where[0]}`);
  if (r.ratio < MIN) for (const w of r.where) lines.push(`                ${w}`);
}

lines.push('');
lines.push('        all color tokens vs --bg (the values DESIGN_SYSTEM.md records):');
const onBg = new Set(uses.filter(u => u.against === 'bg').map(u => u.token));
const onFillTok = new Set(uses.filter(u => u.against !== 'bg').map(u => u.token));
for (const [name, hex] of Object.entries(COLORS)) {
  const role = onBg.has(name) ? 'gated: text under 14px on --bg' : onFillTok.has(name) ? 'inverse text on accent fills only' : 'not used for small text';
  lines.push(`          ${pad(name, 9)} ${hex}  ${pad(fmt(contrast(hex, BG)), 9)} ${role}`);
}

if (decorative.length) {
  lines.push('');
  lines.push('        decorative separators (not gated):');
  for (const d of decorative) lines.push(`          text-${d.token} "${d.text}" ${d.file}:${d.line}  ${fmt(contrast(COLORS[d.token], BG))}`);
}

const onFill = new Map();
for (const u of uses) {
  if (!u.fill || u.fill === 'bg' || u.against !== 'bg') continue;
  const fg = over(COLORS[u.token], u.alpha, COLORS[u.fill]);
  const r = contrast(fg, COLORS[u.fill]);
  if (r >= MIN) continue;
  const key = `${label(u)} on bg-${u.fill}`;
  if (!onFill.has(key)) onFill.set(key, { r, where: new Set() });
  onFill.get(key).where.add(`${u.file}:${u.line}`);
}
if (onFill.size) {
  lines.push('');
  lines.push(`        info, not gated: uses on an opaque raised fill below ${MIN}:1 against that fill:`);
  for (const [k, v] of [...onFill].sort((a, b) => a[1].r - b[1].r)) {
    lines.push(`          ${pad(k, 22)} ${pad(fmt(v.r), 9)} ${v.where.size} place(s), e.g. ${[...v.where][0]}`);
  }
}

lines.push('');
lines.push(`TOTAL ${failing.length ? 0 : 1}/1 passed, ${failing.length ? 1 : 0} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = failing.length ? 1 : 0;
