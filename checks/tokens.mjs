#!/usr/bin/env node
/**
 * checks/tokens.mjs — zero-dependency check for LAYOUT_SPEC F1 ("One token source").
 *
 *   node checks/tokens.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * [struct] Every six-digit hex literal in tailwind.config.ts and
 *          assets/css/main.css is the value of a color token in
 *          myfiles/tokens.json (case-insensitive). A hex that is not a token
 *          is drift: a second source of truth.
 * [struct] The generated regions of both files are exactly what
 *          scripts/gen-tokens.mjs would write now. A hand edit inside the
 *          markers, or a tokens.json change without `npm run tokens`, fails.
 *
 * An explicit root may be passed so the check can be pointed at a copy of the
 * tree (used to mutation-test the check itself).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, loadTokens, TAILWIND_FILE, CSS_FILE } from '../scripts/gen-tokens.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));

const HEX6 = /#[0-9a-fA-F]{6}(?![0-9a-zA-Z])/g;

const results = [];
function check(label, ok, detail) {
  results.push({ label, ok, detail });
}

// 1. drift
const tokens = loadTokens(ROOT);
const known = new Set(Object.values(tokens.color || {}).map(t => String(t.value).toLowerCase()));
const strays = [];
let seen = 0;
for (const rel of [TAILWIND_FILE, CSS_FILE]) {
  const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(HEX6)) {
      seen++;
      if (!known.has(m[0].toLowerCase())) strays.push(`${rel}:${i + 1} ${m[0]}`);
    }
  });
}
check(
  `[struct] every hex in ${TAILWIND_FILE} and ${CSS_FILE} is a tokens.json color`,
  strays.length === 0,
  strays.length ? strays.map(s => `not in tokens.json: ${s}`) : [`${seen} hex literal(s) checked against ${known.size} tokens`],
);

// 2. generated regions are current
let stale = [];
try {
  stale = Object.entries(render(ROOT)).filter(([, f]) => f.before !== f.after).map(([rel]) => rel);
} catch (err) {
  stale = [String(err.message)];
}
check(
  '[struct] generated regions match myfiles/tokens.json',
  stale.length === 0,
  stale.length ? stale.map(s => `stale: ${s} (run npm run tokens)`) : [`${TAILWIND_FILE}, ${CSS_FILE} up to date`],
);

const passed = results.filter(r => r.ok).length;
const lines = ['', `── F1. One token source ${'─'.repeat(49)}`];
for (const r of results) {
  lines.push(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.label}`);
  for (const d of r.detail) lines.push(`        ${d}`);
}
lines.push('');
lines.push(`TOTAL ${passed}/${results.length} passed, ${results.length - passed} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = passed === results.length ? 0 : 1;
