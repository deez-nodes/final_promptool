#!/usr/bin/env node
/**
 * checks/no-export.mjs: zero-dependency check for DECIDED.md "What it is":
 * "Local only: no cloud, accounts or sync, no import or export. File uploads from the side are allowed."
 *
 *   node checks/no-export.mjs [root]
 *
 * Exit code 0 = passed, 1 = failed (CI-usable).
 *
 * Scans app code: app.vue, app.config.ts and every .vue/.ts/.js/.mjs file under layouts/,
 * pages/, components/, composables/, plugins/, utils/, middleware/, server/, types/.
 * Grep rules (each hit fails, with file:line):
 *
 *   1. camelCase identifiers that start with export / import / download, e.g.
 *      exportJson, importStoreJson, downloadWorkspaceJson. (The `export` and `import`
 *      keywords are followed by a space or brace, so they never match.)
 *   2. `application/json`: a JSON file picker accept= or a JSON download payload.
 *   3. `createObjectURL`, `new Blob(`, `.download =`, `showSaveFilePicker`: the ways a
 *      browser page hands the user a file.
 *   4. a `download` attribute on an element in a template.
 *   5. the words Export or Import (any case) in template text or attributes, i.e. anything
 *      the user can see. <script> and <style> blocks are not part of this rule.
 *
 * Reading a file the user picks (an upload from the side) is allowed: FileReader and
 * <input type="file"> are not banned on their own.
 *
 * An explicit root may be passed so the check can be pointed at a copy of the tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));

const SCAN_DIRS = ['layouts', 'pages', 'components', 'composables', 'plugins', 'utils', 'middleware', 'server', 'types'];
const SCAN_FILES = ['app.vue', 'app.config.ts'];
const EXT = /\.(vue|ts|tsx|js|mjs|jsx)$/;

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

const CODE_RULES = [
  { label: 'export/import/download identifier', re: /\b(?:export|import|download)[A-Z]\w*/g },
  { label: 'application/json', re: /application\/json/g },
  { label: 'createObjectURL', re: /\bcreateObjectURL\b/g },
  { label: 'new Blob(', re: /\bnew\s+Blob\s*\(/g },
  { label: '.download =', re: /\.download\s*=/g },
  { label: 'showSaveFilePicker', re: /\bshowSaveFilePicker\b/g },
];
const TEMPLATE_RULES = [
  { label: 'download attribute', re: /<[a-zA-Z][^>]*\s:?download(?=[\s=>/])/g },
  { label: 'Export/Import text', re: /\b(?:export|import)(?:s|ed|ing)?\b/gi },
];

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const files = [
  ...SCAN_FILES.map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f)),
  ...SCAN_DIRS.flatMap(d => walk(path.join(ROOT, d))),
].filter(f => EXT.test(f));

const hits = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const src = fs.readFileSync(f, 'utf8');
  for (const r of CODE_RULES) {
    for (const m of src.matchAll(r.re)) hits.push(`${rel}:${lineOf(src, m.index)} ${r.label}: ${m[0]}`);
  }
  if (f.endsWith('.vue')) {
    const tpl = src.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, m => m.replace(/[^\n]/g, ' '));
    for (const r of TEMPLATE_RULES) {
      for (const m of tpl.matchAll(r.re)) hits.push(`${rel}:${lineOf(tpl, m.index)} ${r.label}: ${m[0].slice(0, 60)}`);
    }
  }
}

const ok = hits.length === 0;
const lines = [
  '',
  `── Local only. No import or export ${'─'.repeat(38)}`,
  `${ok ? 'ok  ' : 'FAIL'}  [struct] no export, import or download path in app code`,
];
if (ok) lines.push(`        ${files.length} files scanned`);
else for (const h of hits) lines.push(`        ${h}`);
lines.push('');
lines.push(`TOTAL ${ok ? 1 : 0}/1 passed, ${ok ? 0 : 1} failed`);
lines.push('');

process.stdout.write(lines.join('\n') + '\n');
process.exitCode = ok ? 0 : 1;
