import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, compile, section, responses, point, quoteGroup, reidentifySection, insertSection, validateState, moveItem, convertLegacy, xmlName } from '../src/model.js';
import { parseImport, readState, writeState, STORAGE_KEY } from '../src/storage.js';

test('literal text is preserved through backup and XML safely escapes delimiters', () => {
  const state = initialState();
  state.draft.sections = [section('1 < custom', 'line one\n  <script>& "quoted"\nline three', ['x < y & y > z'])];
  const restored = parseImport(JSON.stringify(state));
  assert.deepEqual(restored.draft, state.draft);
  const output = compile(restored.draft);
  assert.match(output, /<section_1_custom>/);
  assert.match(output, /&lt;script&gt;&amp; &quot;quoted&quot;/);
  assert.equal(xmlName('!!!'), 'section');
});
test('multiple quotes retain the correct response points in both output formats', () => {
  const state = initialState(), s = responses();
  s.groups = [{ ...quoteGroup('First quote'), points: [point('First A'), point('First B')] }, { ...quoteGroup('Second quote'), points: [point('Second A'), point('Second B')] }];
  state.draft.sections = [s];
  assert.match(compile(state.draft), /First quote<\/quote>[\s\S]*First A[\s\S]*First B[\s\S]*<\/response>\n  <response>\n    <quote>Second quote/);
  assert.match(compile(state.draft, 'markdown'), /> First quote\n\n1\. First A\n2\. First B\n\n### Response 2/);
  assert.deepEqual(parseImport(JSON.stringify(state)).draft.sections, [s]);
});
test('inserting a reusable section gives every nested object a new identity', () => {
  const s = responses(); s.groups[0].points = [point('Keep me')]; s.points = [point('Body point')];
  const copy = reidentifySection(s);
  assert.notEqual(copy.id, s.id); assert.notEqual(copy.groups[0].id, s.groups[0].id);
  assert.notEqual(copy.groups[0].points[0].id, s.groups[0].points[0].id);
  copy.groups[0].points[0].text = 'Changed'; assert.equal(s.groups[0].points[0].text, 'Keep me');
});
test('invalid imports are rejected without changing the existing state', () => {
  const state = initialState(), before = JSON.stringify(state);
  const invalid = JSON.parse(before); invalid.draft.sections[0].points = [{ text: 'missing id' }];
  assert.throws(() => validateState(invalid)); assert.equal(JSON.stringify(state), before);
  assert.throws(() => parseImport('{oops')); assert.throws(() => validateState({ version: 1 }));
});
test('corrupt storage is blocked and never overwritten on read', () => {
  let writes = 0; const storage = { getItem: () => '{oops', setItem: () => { writes++; } };
  const result = readState(storage); assert.equal(result.blocked, true); assert.equal(result.raw, '{oops'); assert.equal(writes, 0);
});
test('autosave uses an independent key and round-trips content', () => {
  const map = new Map([['prompttor.v1', 'original']]);
  const storage = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) };
  const state = initialState(); writeState(storage, state);
  assert.ok(map.has(STORAGE_KEY)); assert.equal(map.get('prompttor.v1'), 'original'); assert.deepEqual(readState(storage).state, state);
});
test('legacy import preserves both modes, library pieces, and response quotations', () => {
  const legacy = { mode: 'reply', docs: { prompt: { title: 'P', sections: [{ title: 'Context', lead: 'intro', points: [{ text: 'step' }] }] }, reply: { title: 'R', sections: [{ title: 'In Response To', lead: 'quote body', points: [{ text: 'quote point' }] }] } }, lib: { pieces: [{ section: 'Task', title: 'Useful', lead: 'lead', points: ['keep'] }], prompts: [] }, ui: { xml: true } };
  const before = JSON.stringify(legacy), result = convertLegacy(legacy);
  assert.equal(result.documents.length, 2); assert.equal(result.draft.mode, 'reply');
  assert.deepEqual(result.draft.sections[0].groups.map(g => g.quote), ['quote body', 'quote point']);
  assert.equal(result.snippets[0].section.points[0].text, 'keep'); assert.equal(JSON.stringify(legacy), before);
});
test('move operations preserve identity and safely handle boundaries', () => {
  const points = [point('A'), point('B')]; const moved = moveItem(points, points[1].id, -1);
  assert.equal(moved[0], points[1]); assert.equal(moveItem(points, points[0].id, -1), points);
});
test('layout import clamps unusable widths and unknown formats', () => {
  const state = initialState(); state.ui = { left: -100, right: 999999, format: 'executable' };
  const clean = validateState(state); assert.equal(clean.ui.left, 180); assert.equal(clean.ui.right, 650); assert.equal(clean.ui.format, 'xml');
});
test('response snippets join the existing response section without losing either body', () => {
  const state = initialState(), first = responses(), next = responses();
  first.body = 'Existing'; next.body = 'Inserted';
  first.groups = [{ ...quoteGroup('One'), points: [point('Answer one')] }];
  next.groups = [{ ...quoteGroup('Two'), points: [point('Answer two')] }];
  state.draft.sections = [first];
  const result = insertSection(state.draft, next);
  assert.equal(result.sections.length, 1); assert.equal(result.sections[0].body, 'Existing\n\nInserted');
  assert.deepEqual(result.sections[0].groups.map(g => g.points[0].text), ['Answer one', 'Answer two']);
  assert.equal(first.groups.length, 1);
});
