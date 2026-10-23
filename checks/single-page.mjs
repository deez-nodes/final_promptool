#!/usr/bin/env node
/**
 * checks/single-page.mjs — zero-dependency check for LAYOUT_SPEC F0 ("One studio page").
 *
 *   node checks/single-page.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * [struct] The string `preview-pane` must appear in exactly one file under
 * pages/ + components/ + layouts/. Two hits means the studio shell has been
 * duplicated again; zero means the preview pane lost its anchor.
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
const NEEDLE = 'preview-pane';

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
const hits = files
  .filter(f => fs.readFileSync(f, 'utf8').includes(NEEDLE))
  .map(f => path.relative(ROOT, f).split(path.sep).join('/'));

const ok = hits.length === 1;
const lines = [
  '',
  `── F0. One studio page ${'─'.repeat(50)}`,
  `${ok ? 'ok  ' : 'FAIL'}  [struct] \`${NEEDLE}\` appears in exactly one file under ${SCAN_DIRS.join('/ + ')}/`,
];
if (!ok) {
  lines.push(`        expected: 1 file`);
  lines.push(`        actual:   ${hits.length} file(s)${hits.length ? ' → ' + hits.join(', ') : ''}`);
} else {
  lines.push(`        found in ${hits[0]} (${files.length} files scanned)`);
}
lines.push('');
lines.push(`TOTAL ${ok ? 1 : 0}/1 passed, ${ok ? 0 : 1} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = ok ? 0 : 1;
