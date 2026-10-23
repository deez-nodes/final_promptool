#!/usr/bin/env node
/**
 * checks/no-class-strings.mjs: zero-dependency check for DECIDED.md "Code":
 * "Tailwind and shadcn only through CSS Modules ... No class strings, and no template literals."
 *
 *   node checks/no-class-strings.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * Scans app.vue and every .vue file under layouts/, pages/, components/. <script> and
 * <style> blocks are skipped; the rest (the template) must satisfy:
 *
 * [struct] no static class attribute: `class="..."`, `class='...'`, `className=`.
 * [struct] every bound class (`:class=` / `v-bind:class=`) and every bound Nuxt UI
 *          `:ui=` / `:*-class=` prop holds no string literal and no template literal
 *          (no ' or ` inside the expression). Class names come only from the module.
 * [struct] every `:class=` expression reads the module: it contains `$style.` or `styles.`.
 *
 * An explicit root may be passed so the check can be pointed at a copy of the tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));

const SCAN_DIRS = ['layouts', 'pages', 'components'];
const SCAN_FILES = ['app.vue'];

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

/** Blank out <script> and <style> blocks, keeping line numbers. */
function templateOnly(src) {
  return src.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, m => m.replace(/[^\n]/g, ' '));
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const files = [
  ...SCAN_FILES.map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f)),
  ...SCAN_DIRS.flatMap(d => walk(path.join(ROOT, d))),
].filter(f => f.endsWith('.vue'));

const STATIC = /(?<![:\w-])(?:class|className)\s*=\s*["'`]/g;
const BOUND = /(?:\s:|\sv-bind:)(class|ui|[\w-]+-class|[\w]+Class)\s*=\s*"([^"]*)"/g;

const hits = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const tpl = templateOnly(fs.readFileSync(f, 'utf8'));

  for (const m of tpl.matchAll(STATIC)) {
    hits.push(`${rel}:${lineOf(tpl, m.index)} static class attribute: ${m[0].trim()}`);
  }
  for (const m of tpl.matchAll(BOUND)) {
    const [, prop, expr] = m;
    const line = lineOf(tpl, m.index);
    if (/['`]/.test(expr)) {
      hits.push(`${rel}:${line} :${prop} holds a string or template literal: ${expr.replace(/\s+/g, ' ').trim()}`);
    }
    if (prop === 'class' && !/\$style\.|\bstyles\./.test(expr)) {
      hits.push(`${rel}:${line} :class does not read the CSS module ($style. / styles.): ${expr.trim()}`);
    }
  }
}

const ok = hits.length === 0;
const lines = [
  '',
  `── Code. No class strings ${'─'.repeat(47)}`,
  `${ok ? 'ok  ' : 'FAIL'}  [struct] classes come only from CSS Modules in app.vue + ${SCAN_DIRS.join('/ + ')}/`,
];
if (ok) lines.push(`        ${files.length} .vue files scanned`);
else for (const h of hits) lines.push(`        ${h}`);
lines.push('');
lines.push(`TOTAL ${ok ? 1 : 0}/1 passed, ${ok ? 0 : 1} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = ok ? 0 : 1;
