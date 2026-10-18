export const uid = () => globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const point = (text = '') => ({ id: uid(), text });
export const quoteGroup = (quote = '') => ({ id: uid(), quote, points: [] });
export const section = (title, body = '', points = []) => ({ id: uid(), title, kind: 'section', body, points: points.map(point), groups: [] });
export const responses = () => ({ ...section('Responding To'), kind: 'responses', groups: [quoteGroup()] });
export function newDocument(mode = 'prompt', projectId = '') {
  return { id: uid(), title: '', mode, projectId, starred: false, sections: mode === 'reply'
    ? [responses(), ...['Agreements', 'Proposed Edits', 'Questions'].map(t => section(t))]
    : ['Role', 'Context', 'Task', 'Constraints', 'Output Format'].map(t => section(t)), savedAt: null };
}
export function initialState() {
  const projectId = uid();
  const doc = { ...newDocument('prompt', projectId), title: 'Optimize good parts pre-migration', sections: [
    section('Context', "This file has a lot of good about it, but there are clear deficiencies even in the things it gets right. This file’s redeeming qualities will be iterated on before extraction. This app is simple enough to work around what it’s lacking before extracting the features. The things the user intends to extract here will make addressing the other features much easier than working from those files first."),
    section('What to Keep', 'What to hone before extracting as a feature from this app. The features themselves might not migrate as code. The main idea is that what is a good feature listed here becomes the idealized version before transitioning or moving around into another incomplete app.', [
      'Body text above the added points list.',
      'Clear, colored headers as the only text on the top line. Custom does not currently carry any coloring. Some coloring system needs to be addressed later.',
      'When styling sticks, these are the best functional cards in functionality. Some prototypes are more robust but the main features that add the most benefit are missing what is here.',
      'In response to starts as the top section. What is a numbered point needs to be altered. Multiple tags like this need to exist in a single “Responding To” or “Responses” addressing multiple points.'
    ]),
    section('Proposed Edits', 'Not everything is something to change. There needs to be a way to send these off to another section (todo, kanban, issue tracking system) as backlog items that are tagged or straight to the appropriate section.', [
      'Tab from the body or last point adds a point. Show the cursor hint “Tab adds point.”',
      'Make it clear that the preview button toggles the preview pane.',
      'Make New and Save easy to find.',
      'Use the supplied library sidebar reference as the starting point.',
      'Resizable panes for any and all designs.'
    ]),
    section('Questions')
  ] };
  return { version: 1, draft: doc, documents: [clone(doc)], snippets: [], projects: [{ id: projectId, name: 'Promptor' }], ui: { left: 260, right: 360, library: true, preview: false, format: 'xml' } };
}
export function hasContent(s) {
  return Boolean(s.body.trim() || s.points.some(p => p.text.trim()) || s.groups.some(g => g.quote.trim() || g.points.some(p => p.text.trim())));
}
export function xmlName(title) {
  let name = title.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'section';
  if (/^[0-9]/.test(name) || /^xml/i.test(name)) name = `section_${name}`;
  return name;
}
export const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export function compile(doc, format = 'xml') {
  return doc.sections.filter(hasContent).map(s => {
    const points = s.points.filter(p => p.text.trim());
    if (format === 'markdown') {
      const groups = s.groups.filter(g => g.quote.trim() || g.points.some(p => p.text.trim())).map((g, i) =>
        `### Response ${i + 1}\n\n${g.quote.split('\n').map(l => `> ${l}`).join('\n')}\n\n${g.points.filter(p => p.text.trim()).map((p, n) => `${n + 1}. ${p.text.replace(/\n/g, '\n   ')}`).join('\n')}`);
      return [`## ${s.title}`, s.body, ...groups, points.map((p, n) => `${n + 1}. ${p.text.replace(/\n/g, '\n   ')}`).join('\n')].filter(Boolean).join('\n\n');
    }
    const tag = xmlName(s.title);
    const content = [];
    if (s.body.trim()) content.push(escapeXml(s.body));
    if (s.kind === 'responses') {
      for (const group of s.groups) {
        if (!group.quote.trim() && !group.points.some(p => p.text.trim())) continue;
        content.push(`  <response>\n    <quote>${escapeXml(group.quote)}</quote>\n    <points>\n${group.points.filter(p => p.text.trim()).map(p => `      <point>${escapeXml(p.text)}</point>`).join('\n')}\n    </points>\n  </response>`);
      }
    }
    points.forEach((p, i) => content.push(`${i + 1}. ${escapeXml(p.text)}`));
    return `<${tag}>\n${content.join('\n')}\n</${tag}>`;
  }).join('\n\n');
}
export function documentText(doc) { return `${doc.title}\n${doc.sections.map(s => `${s.title}\n${s.body}\n${s.points.map(p => p.text).join('\n')}\n${s.groups.map(g => `${g.quote}\n${g.points.map(p => p.text).join('\n')}`).join('\n')}`).join('\n')}`; }
export function reidentifySection(s) { return { ...clone(s), id: uid(), points: s.points.map(p => ({ ...p, id: uid() })), groups: s.groups.map(g => ({ ...g, id: uid(), points: g.points.map(p => ({ ...p, id: uid() })) })) }; }
export function insertSection(doc, fresh) {
  const existing = fresh.kind === 'responses' ? doc.sections.find(s => s.kind === 'responses') : null;
  if (!existing) return { ...doc, sections: fresh.kind === 'responses' ? [fresh, ...doc.sections] : [...doc.sections, fresh] };
  return { ...doc, sections: doc.sections.map(s => s.id !== existing.id ? s : { ...s, body: [s.body, fresh.body].filter(Boolean).join('\n\n'), points: [...s.points, ...fresh.points], groups: [...s.groups, ...fresh.groups] }) };
}
export function moveItem(items, id, direction) {
  const index = items.findIndex(item => item.id === id), target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const result = [...items]; [result[index], result[target]] = [result[target], result[index]]; return result;
}
const isString = x => typeof x === 'string';
const validPoint = p => p && isString(p.id) && isString(p.text);
const unique = items => new Set(items.map(x => x.id)).size === items.length;
const validPoints = points => Array.isArray(points) && points.every(validPoint) && unique(points);
export function validSection(s) { return s && isString(s.id) && isString(s.title) && isString(s.body) && ['section', 'responses'].includes(s.kind) && validPoints(s.points) && Array.isArray(s.groups) && unique(s.groups) && s.groups.every(g => g && isString(g.id) && isString(g.quote) && validPoints(g.points)); }
function validDoc(d) { return d && isString(d.id) && isString(d.title) && ['prompt', 'reply'].includes(d.mode) && isString(d.projectId) && typeof d.starred === 'boolean' && Array.isArray(d.sections) && d.sections.every(validSection) && unique(d.sections); }
export function validateState(value) {
  if (!value || value.version !== 1 || !validDoc(value.draft) || !Array.isArray(value.documents) || !value.documents.every(validDoc) || !unique(value.documents) || !Array.isArray(value.snippets) || !value.snippets.every(s => s && isString(s.id) && isString(s.name) && validSection(s.section)) || !unique(value.snippets) || !Array.isArray(value.projects) || !value.projects.every(p => p && isString(p.id) && isString(p.name)) || !unique(value.projects)) throw Error('This is not a valid Promptor backup. Current work has not been replaced.');
  const ui = value.ui || {};
  return { ...clone(value), ui: { left: Math.max(180, Math.min(550, Number(ui.left) || 260)), right: Math.max(240, Math.min(650, Number(ui.right) || 360)), library: ui.library !== false, preview: Boolean(ui.preview), format: ui.format === 'markdown' ? 'markdown' : 'xml' } };
}
export function convertLegacy(old) {
  if (!old?.docs || !old.docs.prompt || !old.docs.reply || !old.lib || !Array.isArray(old.lib.pieces) || !Array.isArray(old.lib.prompts)) throw Error('Unrecognized v1 data.');
  function convertSection(s) {
    if (!s || !isString(s.title) || !isString(s.lead) || !Array.isArray(s.points) || !s.points.every(p => p && isString(p.text))) throw Error('Invalid v1 section.');
    const result = section(s.title, s.lead, s.points.map(p => p.text));
    if (xmlName(s.title) === 'in_response_to') {
      result.kind = 'responses'; result.title = 'Responding To'; result.body = '';
      result.groups = [s.lead, ...s.points.map(p => p.text)].filter(Boolean).map(quoteGroup); result.points = [];
    }
    return result;
  }
  function convertDoc(d, mode) {
    if (!isString(d.title) || !Array.isArray(d.sections)) throw Error('Invalid v1 document.');
    return { ...newDocument(mode), title: d.title, sections: d.sections.map(convertSection) };
  }
  const drafts = ['prompt', 'reply'].map(mode => convertDoc(old.docs[mode], mode));
  const documents = [...drafts, ...old.lib.prompts.map(p => convertDoc(p.doc, p.mode === 'reply' ? 'reply' : 'prompt'))];
  const snippets = old.lib.pieces.map(p => {
    if (!isString(p.section) || !isString(p.title) || !isString(p.lead) || !Array.isArray(p.points) || !p.points.every(isString)) throw Error('Invalid v1 library item.');
    return { id: uid(), name: p.title, section: convertSection({ title: p.section, lead: p.lead, points: p.points.map(text => ({ text })) }) };
  });
  return validateState({ version: 1, draft: drafts[old.mode === 'reply' ? 1 : 0], documents, snippets, projects: [], ui: { left: 260, right: 360, library: true, preview: Boolean(old.ui?.xml), format: 'xml' } });
}
