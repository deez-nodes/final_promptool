#!/usr/bin/env node
/**
 * checks/no-raw-hex.mjs — zero-dependency check for LAYOUT_SPEC F1 ("No raw hex").
 *
 *   node checks/no-raw-hex.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * [struct] No file under pages/, components/ or layouts/ contains a six-digit
 *          hex color literal (#rrggbb, or #rrggbbaa). Components reach colors
 *          through Tailwind token classes (text-muted, bg-surface2) or CSS
 *          custom properties (var(--muted)), so a token change reaches them.
 *          HTML numeric entities such as `&#123456;` are not colors and are
 *          skipped.
 *
 * An explicit root may be passed so the check can be pointed at a copy of the
 * tree (used to mutation-test the check itself).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));

const SCAN_DIRS = ['pages', 'components', 'layouts'];
const HEX = /(?<![&\w])#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?(?![0-9a-zA-Z])/g;

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

const files = SCAN_DIRS.flatMap(d => walk(path.join(ROOT, d)));
const hits = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(HEX)) hits.push(`${rel}:${i + 1} ${m[0]}`);
  });
}

const ok = hits.length === 0;
const lines = [
  '',
  `── F1. No raw hex ${'─'.repeat(55)}`,
  `${ok ? 'ok  ' : 'FAIL'}  [struct] no six-digit hex literal under ${SCAN_DIRS.join('/, ')}/`,
];
if (ok) lines.push(`        ${files.length} files scanned`);
else for (const h of hits) lines.push(`        raw hex: ${h}`);
lines.push('');
lines.push(`TOTAL ${ok ? 1 : 0}/1 passed, ${ok ? 0 : 1} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = ok ? 0 : 1;
