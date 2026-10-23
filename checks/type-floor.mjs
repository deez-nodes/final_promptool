#!/usr/bin/env node
/**
 * checks/type-floor.mjs: zero-dependency check for DECIDED.md "Colour and type":
 * "Body text 16px, nothing under 14px."
 *
 *   node checks/type-floor.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * App CSS = every .css file under assets/css/ (tokens.css included), every *.module.css
 * and every <style> block in .vue files under app.vue, layouts/, pages/, components/.
 *
 * [struct] every `font-size:` and `font:` shorthand size in app CSS resolves to >= 14px.
 *          px as is; rem/em x16; pt x4/3; % of 16px. var(--x) is resolved through the
 *          custom properties defined in app CSS. calc()/min()/max()/clamp() count their
 *          smallest length. Keywords xx-small, x-small, small, smaller fail.
 * [struct] every --fs-* / --font-size* / --text-* size token resolves to >= 14px.
 * [struct] no Tailwind text size under 14px (`text-xs`, `text-2xs`, `text-[13px]`, ...)
 *          in app CSS (@apply) or in .vue templates (inline style font-size included).
 * [struct] body text is 16px: --fs-body resolves to exactly 16px.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));

const FLOOR = 14;
const BODY = 16;
const VUE_DIRS = ['layouts', 'pages', 'components'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// Collect CSS sources: [{ name, css, offsetLine }]
const sources = [];
for (const f of walk(path.join(ROOT, 'assets/css')).filter(f => f.endsWith('.css'))) {
  sources.push({ name: rel(f), css: fs.readFileSync(f, 'utf8') });
}
const vueRoots = [path.join(ROOT, 'app.vue'), ...VUE_DIRS.flatMap(d => walk(path.join(ROOT, d)))];
const vueFiles = vueRoots.filter(f => f.endsWith('.vue') && fs.existsSync(f));
for (const f of vueRoots.filter(f => f.endsWith('.module.css'))) {
  sources.push({ name: rel(f), css: fs.readFileSync(f, 'utf8') });
}
for (const f of vueFiles) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
    const pad = '\n'.repeat(lineOf(src, m.index + m[0].indexOf('>') + 1) - 1);
    sources.push({ name: rel(f), css: pad + m[1] });
  }
}

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

// Custom properties (last definition wins per name; all definitions checked below).
const props = new Map();
const propDefs = [];
for (const s of sources) {
  const css = stripComments(s.css);
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
    props.set(m[1], m[2].trim());
    propDefs.push({ name: m[1], value: m[2].trim(), where: `${s.name}:${lineOf(css, m.index)}` });
  }
}

/** Smallest px size a CSS size value can produce, or null if it has no length. */
function minPx(value, depth = 0) {
  if (depth > 20) return null;
  let v = value.trim().replace(/!important/, '').trim();
  if (/^(xx-small|x-small|small|smaller)$/i.test(v)) return 0;
  if (/^(medium|inherit|initial|unset|revert|larger|large|x-large|xx-large)$/i.test(v)) return null;
  // Resolve var(--x[, fallback]) innermost first.
  let guard = 0;
  while (/var\(/.test(v) && guard++ < 50) {
    v = v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/, (_, name, fb) => {
      const resolved = props.has(name) ? props.get(name) : (fb ?? '');
      return resolved;
    });
  }
  const sizes = [];
  for (const m of v.matchAll(/(-?\d*\.?\d+)(px|rem|em|pt|%)/g)) {
    const n = parseFloat(m[1]);
    const px = m[2] === 'px' ? n : m[2] === 'pt' ? (n * 4) / 3 : m[2] === '%' ? (n / 100) * 16 : n * 16;
    sizes.push(px);
  }
  if (/\b(xx-small|x-small|smaller|small)\b/i.test(v)) sizes.push(0);
  return sizes.length ? Math.min(...sizes) : null;
}

/** The size part of a `font:` shorthand: the token just before the family / after style. */
function fontShorthandSize(value) {
  const m = value.match(/(?:^|\s)((?:var\([^)]*\)|calc\([^)]*\)|[\d.]+(?:px|rem|em|pt|%)|xx-small|x-small|smaller|small))(?:\s*\/\s*[^\s]+)?\s/);
  return m ? m[1] : null;
}

const hits = [];
let declCount = 0;

for (const s of sources) {
  const css = stripComments(s.css);
  for (const m of css.matchAll(/(?<![\w-])font-size\s*:\s*([^;}]+)/g)) {
    declCount++;
    const px = minPx(m[1]);
    if (px !== null && px < FLOOR) hits.push(`${s.name}:${lineOf(css, m.index)} font-size ${m[1].trim()} → ${+px.toFixed(2)}px`);
  }
  for (const m of css.matchAll(/(?<![\w-])font\s*:\s*([^;}]+)/g)) {
    const size = fontShorthandSize(m[1] + ' ');
    if (!size) continue;
    declCount++;
    const px = minPx(size);
    if (px !== null && px < FLOOR) hits.push(`${s.name}:${lineOf(css, m.index)} font ${m[1].trim()} → ${+px.toFixed(2)}px`);
  }
}

for (const d of propDefs) {
  if (!/^--(fs|font-size|text)(-|$)/.test(d.name)) continue;
  if (/^--text-[\w-]*(color|weight|line|shadow)/.test(d.name)) continue;
  const px = minPx(d.value);
  if (px !== null && px < FLOOR) hits.push(`${d.where} ${d.name}: ${d.value} → ${+px.toFixed(2)}px`);
}

const TW_SMALL = /(?<![\w-])text-(xs|2xs|3xs|\[(\d*\.?\d+)(px|rem|em)\])(?![\w-])/g;
const twTooSmall = m => {
  if (!m[2]) return true;
  const n = parseFloat(m[2]);
  return (m[3] === 'px' ? n : n * 16) < FLOOR;
};
for (const s of sources) {
  const css = stripComments(s.css);
  for (const m of css.matchAll(TW_SMALL)) if (twTooSmall(m)) hits.push(`${s.name}:${lineOf(css, m.index)} Tailwind ${m[0]}`);
}
for (const f of vueFiles) {
  const tpl = fs.readFileSync(f, 'utf8').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, x => x.replace(/[^\n]/g, ' '));
  for (const m of tpl.matchAll(TW_SMALL)) if (twTooSmall(m)) hits.push(`${rel(f)}:${lineOf(tpl, m.index)} Tailwind ${m[0]}`);
  for (const m of tpl.matchAll(/font-?[sS]ize['"]?\s*:\s*['"]?([^;"'}]+)/g)) {
    declCount++;
    const px = minPx(m[1]);
    if (px !== null && px < FLOOR) hits.push(`${rel(f)}:${lineOf(tpl, m.index)} inline font-size ${m[1].trim()}`);
  }
}

const body = props.has('--fs-body') ? minPx('var(--fs-body)') : null;
const bodyOk = body === BODY;

const ok = hits.length === 0 && bodyOk;
const lines = [
  '',
  `── Type. Nothing under ${FLOOR}px ${'─'.repeat(46)}`,
  `${hits.length === 0 ? 'ok  ' : 'FAIL'}  [struct] no font size under ${FLOOR}px in app CSS or templates`,
];
if (hits.length === 0) lines.push(`        ${declCount} size declaration(s) in ${sources.length} CSS source(s) and ${vueFiles.length} template(s)`);
else for (const h of hits) lines.push(`        ${h}`);
lines.push(`${bodyOk ? 'ok  ' : 'FAIL'}  [struct] body text is ${BODY}px (--fs-body)`);
if (!bodyOk) lines.push(`        actual: ${body === null ? 'no --fs-body defined' : body + 'px'}`);
const passed = (hits.length === 0 ? 1 : 0) + (bodyOk ? 1 : 0);
lines.push('');
lines.push(`TOTAL ${passed}/2 passed, ${2 - passed} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = ok ? 0 : 1;
