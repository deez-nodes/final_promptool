import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Action, Icon, IconButton, Sidebar, SectionCard, Splitter, TextArea } from './components.jsx';
import { clone, uid, point, section, quoteGroup, responses, newDocument, compile, documentText, reidentifySection, insertSection, moveItem, convertLegacy, hasContent } from './model.js';
import { readState, writeState, parseImport, download, copyText } from './storage.js';

function Modal({ title, children, close }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="modal" onCancel={e => { e.preventDefault(); close(); }}><div className="modal-heading"><h2>{title}</h2><IconButton icon="close" label="Close dialog" onClick={close} /></div>{children}</dialog>;
}
function App() {
  const [loaded] = useState(() => { try { return readState(localStorage); } catch { return readState({ getItem() { throw Error(); } }); } });
  const [state, setState] = useState(loaded.state), [storageError, setStorageError] = useState(loaded.error), [saving, setSaving] = useState(false);
  const blocked = useRef(loaded.blocked), undoRef = useRef(null), current = useRef(state); current.current = state;
  const [message, setMessage] = useState(''), [canUndo, setCanUndo] = useState(false);
  const [search, setSearch] = useState(''), [tab, setTab] = useState('library'), [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({}), [sectionName, setSectionName] = useState('');
  const [modal, setModal] = useState(null), [snippetName, setSnippetName] = useState(''), [snippetContent, setSnippetContent] = useState(null);
  const [viewport, setViewport] = useState(window.innerWidth);
  const importRef = useRef(null), editorRef = useRef(null);
  const draft = state.draft;
  const output = useMemo(() => compile(draft, state.ui.format), [draft, state.ui.format]);
  useEffect(() => { const resize = () => setViewport(window.innerWidth); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  useEffect(() => {
    if (blocked.current) return;
    setSaving(true);
    const timer = setTimeout(() => { try { writeState(localStorage, state); setStorageError(''); } catch { setStorageError('Browser storage is unavailable or full. Download a backup before closing.'); } setSaving(false); }, 250);
    return () => clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const saveOnClose = () => { if (!blocked.current) { try { writeState(localStorage, current.current); } catch { /* visible error is handled during normal persistence */ } } };
    window.addEventListener('pagehide', saveOnClose);
    return () => window.removeEventListener('pagehide', saveOnClose);
  }, []);
  function notify(text) { setMessage(text); }
  function checkpoint(text) { undoRef.current = clone(current.current); setCanUndo(true); notify(text); }
  function undo() { if (undoRef.current) { setState(undoRef.current); undoRef.current = null; setCanUndo(false); notify('Restored previous workspace.'); } }
  function focus(id) { requestAnimationFrame(() => { const el = document.getElementById(`field-${id}`); el?.focus(); }); }
  function updateDraft(fn) { setState(s => ({ ...s, draft: fn(s.draft) })); }
  function updateSection(id, fn) { updateDraft(d => ({ ...d, sections: d.sections.map(s => s.id === id ? fn(s) : s) })); }
  function changeUi(patch) { setState(s => ({ ...s, ui: { ...s.ui, ...patch } })); }
  function saveDocument() {
    const saved = { ...clone(current.current.draft), savedAt: new Date().toISOString() };
    setState(s => ({ ...s, draft: saved, documents: s.documents.some(d => d.id === saved.id) ? s.documents.map(d => d.id === saved.id ? saved : d) : [...s.documents, saved] }));
    notify('Saved to your library.');
  }
  function keepDraft(s) {
    const d = clone(s.draft);
    return s.documents.some(p => p.id === d.id) ? s.documents.map(p => p.id === d.id ? d : p) : [...s.documents, d];
  }
  function createDocument(mode = draft.mode) {
    checkpoint('New draft. Previous work is kept in the library.');
    const doc = newDocument(mode, draft.projectId);
    setState(s => ({ ...s, documents: keepDraft(s), draft: doc, ui: { ...s.ui, library: viewport < 800 ? false : s.ui.library } }));
    setCollapsed({}); focus(doc.sections[0].id);
  }
  function loadDocument(doc) {
    if (doc.id === draft.id) return;
    checkpoint('Opened prompt. Previous draft is kept in the library.');
    setState(s => ({ ...s, documents: keepDraft(s), draft: clone(doc), ui: { ...s.ui, library: viewport < 800 ? false : s.ui.library } })); setCollapsed({}); editorRef.current?.scrollTo(0, 0);
  }
  function star(id) {
    setState(s => { const currentStar = s.draft.id === id ? s.draft.starred : s.documents.find(d => d.id === id)?.starred; return { ...s, draft: s.draft.id === id ? { ...s.draft, starred: !currentStar } : s.draft, documents: s.documents.map(d => d.id === id ? { ...d, starred: !currentStar } : d) }; });
  }
  function addPoint(sectionId, groupId, afterId) {
    const next = point();
    const insert = list => { const copy = [...list]; const index = afterId ? list.findIndex(p => p.id === afterId) + 1 : list.length; copy.splice(index, 0, next); return copy; };
    updateSection(sectionId, s => groupId === 'new-group' ? { ...s, groups: [...s.groups, { ...quoteGroup(), points: [next] }] } : groupId ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, points: insert(g.points) } : g) } : { ...s, points: insert(s.points) });
    focus(next.id);
  }
  function mapPoints(sectionId, groupId, fn) { updateSection(sectionId, s => groupId ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, points: fn(g.points) } : g) } : { ...s, points: fn(s.points) }); }
  function removePoint(sectionId, id, groupId) {
    const s = draft.sections.find(s => s.id === sectionId), list = groupId ? s.groups.find(g => g.id === groupId).points : s.points;
    const i = list.findIndex(p => p.id === id), target = list[i - 1]?.id || groupId || sectionId;
    checkpoint('Point removed.'); mapPoints(sectionId, groupId, list => list.filter(p => p.id !== id)); focus(target);
  }
  function addGroup(sectionId) { const g = quoteGroup(); updateSection(sectionId, s => ({ ...s, groups: [...s.groups, g] })); focus(g.id); }
  function openSaveSnippet(s) { if (!hasContent(s)) { notify('Write something in the section before saving it.'); return; } setSnippetName(s.title || 'Untitled snippet'); setSnippetContent(clone(s)); setModal({ type: 'snippet' }); }
  function insertSnippet(snippet) { const s = reidentifySection(snippet.section); const target = s.kind === 'responses' ? draft.sections.find(x => x.kind === 'responses')?.id || s.id : s.id; checkpoint(`Inserted “${snippet.name}”.`); updateDraft(d => insertSection(d, s)); if (viewport < 800) changeUi({ library: false }); focus(target); }
  async function copy() { if (!output) { notify('Add some content before copying.'); return; } notify(await copyText(output) ? 'Copied to clipboard.' : 'Clipboard unavailable. Use Download in the preview.'); }
  function exportBackup() { download(`promptor-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(current.current, null, 2), 'application/json'); notify('Backup download requested.'); }
  function receiveImport(text) { try { const next = parseImport(text); setModal({ type: 'import', next }); } catch (e) { notify(e instanceof SyntaxError ? 'Invalid JSON. Current work has not been changed.' : e.message); } }
  function importLegacy() {
    try { const raw = localStorage.getItem('prompttor.v1'); if (!raw) { notify('No v1 data is accessible here. Import a JSON backup, or copy sections from the original file.'); return; } const next = convertLegacy(JSON.parse(raw)); setModal({ type: 'import', next }); }
    catch { notify('Could not read v1 data. The original data has not been changed.'); }
  }
  async function drop(dataTransfer, sectionId) {
    const docId = draft.id, files = [...dataTransfer.files];
    try {
      if (files.some(f => f.size > 2_000_000 || !(/^(text\/|application\/(json|xml))/.test(f.type) || /\.(txt|md|json|xml|csv|js|ts|jsx|tsx|css|html|py|yaml|yml|log)$/i.test(f.name)))) { notify('Drop text files smaller than 2 MB.'); return; }
      const items = files.length ? await Promise.all(files.map(async f => ({ name: f.name, text: await f.text() }))) : [{ name: 'Dropped text', text: dataTransfer.getData('text/plain') }];
      if (!items.some(i => i.text.trim())) return;
      if (sectionId && current.current.draft.id !== docId) { notify('The active draft changed. Drop the text again in the intended section.'); return; }
      checkpoint(sectionId ? 'Text added to section.' : 'Text saved as reusable snippets.');
      if (sectionId) updateSection(sectionId, s => s.kind === 'responses' ? { ...s, groups: [...s.groups, ...items.map(i => quoteGroup(i.text))] } : { ...s, body: [s.body, ...items.map(i => i.text)].filter(Boolean).join('\n\n') });
      else setState(s => ({ ...s, snippets: [...s.snippets, ...items.map(i => ({ id: uid(), name: i.name, section: section('Context', i.text) }))] }));
    } catch { notify('Could not read that file. Current content is unchanged.'); }
  }
  useEffect(() => {
    const handle = e => {
      if (document.querySelector('dialog[open]')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveDocument(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); changeUi({ library: true }); setTab('library'); requestAnimationFrame(() => document.getElementById('library-search')?.focus()); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); copy(); }
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  }, [state, output]);
  const leftMax = Math.max(180, Math.min(480, viewport - 500)), rightMax = Math.max(240, Math.min(620, viewport - 600));
  const leftWidth = Math.min(state.ui.left, leftMax), rightWidth = Math.min(state.ui.right, rightMax);
  const hasUnsaved = !state.documents.some(d => d.id === draft.id && JSON.stringify(d) === JSON.stringify(draft));
  return <div className="app-shell">
    <header className="topbar"><a className="wordmark" href="#" onClick={e => e.preventDefault()} aria-label="Promptor">PROMP<span>TOR</span></a><span className="workbench-label">Your prompt workbench</span><div className="toolbar-spacer" />
      <Action icon="plus" tone="new" onClick={() => setModal({ type: 'new' })}>New</Action>
      <Action icon="save" tone="save" onClick={saveDocument} title="Save to library · Ctrl+S">Save</Action>
      <Action icon="preview" tone="secondary" onClick={() => changeUi({ preview: !state.ui.preview, library: viewport < 800 && !state.ui.preview ? false : state.ui.library })} aria-expanded={state.ui.preview}>{state.ui.preview ? 'Hide preview' : 'Show preview'}</Action>
      <Action icon="copy" tone="primary" onClick={copy} title="Copy output · Ctrl+Enter">Copy</Action>
    </header>
    {storageError && <div className="storage-alert" role="alert"><span>{storageError}</span><button onClick={exportBackup}>Download backup</button>{loaded.raw && <button onClick={() => download('promptor-unreadable-data.txt', loaded.raw)}>Download unreadable data</button>}</div>}
    <div className={`workspace ${state.ui.library ? 'with-library' : ''} ${state.ui.preview ? 'with-preview' : ''}`} style={{ '--library-width': `${leftWidth}px`, '--preview-width': `${rightWidth}px` }}>
      {state.ui.library && <><Sidebar state={state} search={search} setSearch={setSearch} tab={tab} setTab={setTab} filter={filter} setFilter={setFilter} load={loadDocument} star={star} deleteDocument={doc => setModal({ type: 'delete', doc })} insert={insertSnippet}
        editSnippet={s => { setSnippetName(s.name); setSnippetContent(clone(s.section)); setModal({ type: 'snippet', id: s.id }); }}
        deleteSnippet={id => { checkpoint('Snippet removed.'); setState(s => ({ ...s, snippets: s.snippets.filter(p => p.id !== id) })); }}
        onProject={name => { const p = { id: uid(), name }; setState(s => ({ ...s, projects: [...s.projects, p] })); notify(`Created “${name}”. Assign a prompt using its project selector.`); }}
        onExport={exportBackup} onImport={() => importRef.current.click()} onLegacy={importLegacy} onClose={() => changeUi({ library: false })} onDrop={drop} matches={d => !search.trim() || documentText(d).toLowerCase().includes(search.trim().toLowerCase())} />
        <Splitter label="Resize library" value={leftWidth} min={180} max={leftMax} onChange={left => changeUi({ left })} onCollapse={() => changeUi({ library: false })} /></>}
      <main className="main-pane">
        <div className="document-bar"><IconButton icon="panel" label={state.ui.library ? 'Hide library pane' : 'Show library pane'} onClick={() => changeUi({ library: !state.ui.library, preview: viewport < 800 && !state.ui.library ? false : state.ui.preview })} />
          <label className="project-select"><Icon name="folder" size={14} /><select aria-label="Document project" value={draft.projectId} onChange={e => updateDraft(d => ({ ...d, projectId: e.target.value }))}><option value="">Unfiled</option>{state.projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label><span className="breadcrumb-separator">/</span><span>{draft.mode === 'reply' ? 'Reply' : 'Prompt'}</span><span className="document-bar-spacer" /><button className={`favorite-button ${draft.starred ? 'is-starred' : ''}`} aria-label={draft.starred ? 'Unstar current prompt' : 'Star current prompt'} onClick={() => star(draft.id)}><Icon name="star" /></button><span className="compose-label">Compose</span>
        </div>
        <div className="editor-scroll" ref={editorRef}>
          <div className="editor-content"><div className="document-intro"><input className="document-title" value={draft.title} placeholder={draft.mode === 'reply' ? 'Untitled reply' : 'Untitled prompt'} aria-label="Document title" onChange={e => updateDraft(d => ({ ...d, title: e.target.value }))} /><div className="document-meta"><span>{draft.mode === 'reply' ? 'Reply' : 'Prompt'}<i />{draft.sections.length} sections<i />{hasUnsaved ? 'Draft' : 'In library'}</span><span>Context first. Then the details.</span></div></div>
            {draft.sections.map((s, i) => <SectionCard key={s.id} section={s} index={i} total={draft.sections.length} collapsed={Boolean(collapsed[s.id])} toggleCollapse={() => setCollapsed(c => ({ ...c, [s.id]: !c[s.id] }))}
              update={patch => updateSection(s.id, x => ({ ...x, ...patch }))} addPoint={(g, after) => addPoint(s.id, g, after)}
              editPoint={(id, text, g) => mapPoints(s.id, g, list => list.map(p => p.id === id ? { ...p, text } : p))}
              removePoint={(id, g) => removePoint(s.id, id, g)} movePoint={(id, dir, g) => { mapPoints(s.id, g, list => moveItem(list, id, dir)); focus(id); }}
              save={() => openSaveSnippet(s)} remove={() => { checkpoint(`Removed “${s.title}”.`); updateDraft(d => ({ ...d, sections: d.sections.filter(x => x.id !== s.id) })); }}
              move={direction => { updateDraft(d => ({ ...d, sections: moveItem(d.sections, s.id, direction) })); }}
              addGroup={() => addGroup(s.id)} updateGroup={(id, patch) => updateSection(s.id, x => ({ ...x, groups: x.groups.map(g => g.id === id ? { ...g, ...patch } : g) }))}
              removeGroup={id => { checkpoint('Quote and its response points removed.'); updateSection(s.id, x => ({ ...x, groups: x.groups.filter(g => g.id !== id) })); }}
              moveGroup={(id, direction) => updateSection(s.id, x => ({ ...x, groups: moveItem(x.groups, id, direction) }))} onDrop={drop} />)}
            {!draft.sections.length && <div className="empty-editor"><Icon name="document" size={30} /><h2>A clean page.</h2><p>Add a section to start writing.</p></div>}
            <form className="add-section-form" onSubmit={e => { e.preventDefault(); if (!sectionName.trim()) return; const s = section(sectionName.trim()); updateDraft(d => ({ ...d, sections: [...d.sections, s] })); setSectionName(''); focus(s.id); }}><Icon name="plus" /><input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="Name a new section…" aria-label="New section name" /><button type="submit" disabled={!sectionName.trim()}>Add section <kbd>↵</kbd></button></form>
            {!draft.sections.some(s => s.kind === 'responses') && <button className="add-responses" onClick={() => { const s = responses(); updateDraft(d => ({ ...d, sections: [s, ...d.sections] })); focus(s.groups[0].id); }}><Icon name="quote" /> Add Responding To</button>}
          </div>
        </div>
      </main>
      {state.ui.preview && <><Splitter label="Resize preview" value={rightWidth} min={240} max={rightMax} reverse onChange={right => changeUi({ right })} onCollapse={() => changeUi({ preview: false })} /><aside className="preview-pane" aria-label="Output preview"><div className="preview-heading"><span>Output preview</span><IconButton icon="close" label="Close preview" onClick={() => changeUi({ preview: false })} /></div><div className="preview-tools"><div className="format-switch" role="group" aria-label="Output format">{[['xml', 'XML'], ['markdown', 'Markdown']].map(([value, label]) => <button key={value} aria-pressed={state.ui.format === value} onClick={() => changeUi({ format: value })}>{label}</button>)}</div><IconButton icon="copy" label="Copy preview" onClick={copy} /></div><pre className="output-code" aria-label="Generated output">{output || 'Your structured output will appear here as you write.'}</pre><div className="preview-bottom"><span>{output.length.toLocaleString()} characters</span><button className="text-button" onClick={() => download(`promptor.${state.ui.format === 'xml' ? 'xml' : 'md'}`, state.ui.format === 'xml' ? `<prompt>\n${output}\n</prompt>` : output)}><Icon name="download" /> Download</button></div></aside></>}
    </div>
    <footer className="statusbar"><span className={`save-state ${storageError ? 'save-error' : ''}`}><i />{storageError ? 'Not saved · export backup' : saving ? 'Saving draft…' : 'Draft saved in this browser'}</span><div className="status-message" role="status" aria-live="polite">{message}{canUndo && <button onClick={undo}>Undo</button>}</div><span className="status-shortcut"><kbd>Ctrl ↵</kbd> Copy</span></footer>
    <input className="hidden-input" ref={importRef} type="file" accept=".json,application/json" aria-label="Import JSON backup" onChange={async e => { const file = e.target.files?.[0]; if (file) { try { receiveImport(await file.text()); } catch { notify('Could not read the backup file.'); } } e.target.value = ''; }} />
    {modal?.type === 'new' && <Modal title="Start a new draft" close={() => setModal(null)}><p>Your current draft stays in the library.</p><div className="new-options"><button onClick={() => { setModal(null); createDocument('prompt'); }}><Icon name="document" size={24} /><strong>Prompt</strong><span>Context, tasks, and constraints.</span></button><button onClick={() => { setModal(null); createDocument('reply'); }}><Icon name="quote" size={24} /><strong>Reply</strong><span>Quotes with their own response points.</span></button></div></Modal>}
    {modal?.type === 'delete' && <Modal title="Delete saved prompt?" close={() => setModal(null)}><p>Remove “{modal.doc.title || 'Untitled prompt'}” from the library{modal.doc.id === draft.id ? ' and close its current draft' : ''}? Undo is available after deletion.</p><div className="modal-actions"><Action onClick={() => setModal(null)}>Cancel</Action><Action tone="delete" onClick={() => { const id = modal.doc.id; checkpoint('Saved prompt deleted.'); setState(s => ({ ...s, documents: s.documents.filter(d => d.id !== id), draft: s.draft.id === id ? newDocument(s.draft.mode, s.draft.projectId) : s.draft })); setModal(null); }}>Delete prompt</Action></div></Modal>}
    {modal?.type === 'import' && <Modal title="Import workspace backup" close={() => setModal(null)}><p>This replaces the current workspace with {modal.next.documents.length} saved prompts and {modal.next.snippets.length} snippets. Download a backup first if you want to keep both.</p><div className="modal-actions"><Action onClick={exportBackup} icon="download">Backup current</Action><Action tone="secondary" onClick={() => { checkpoint('Workspace imported. Undo restores the previous workspace.'); blocked.current = false; setStorageError(''); setState(modal.next); setModal(null); }}>Replace workspace</Action></div></Modal>}
    {modal?.type === 'snippet' && <Modal title={modal.id ? 'Edit reusable snippet' : 'Save reusable section'} close={() => setModal(null)}><form onSubmit={e => { e.preventDefault(); if (!snippetName.trim()) return; const item = { id: modal.id || uid(), name: snippetName.trim(), section: clone(snippetContent) }; setState(s => ({ ...s, snippets: modal.id ? s.snippets.map(p => p.id === modal.id ? item : p) : [...s.snippets, item] })); setModal(null); notify('Section saved to reusable snippets.'); }}><label className="field-label">Library name<input autoFocus value={snippetName} onChange={e => setSnippetName(e.target.value)} required /></label><label className="field-label">Section title<input value={snippetContent.title} onChange={e => setSnippetContent(s => ({ ...s, title: e.target.value }))} /></label><p className="modal-help">The complete section is saved, including every point and quote.</p><TextArea value={snippetContent.body} label="Snippet body" onChange={body => setSnippetContent(s => ({ ...s, body }))} />{snippetContent.points.map((p, i) => <TextArea key={p.id} value={p.text} label={`Snippet point ${i + 1}`} onChange={text => setSnippetContent(s => ({ ...s, points: s.points.map(x => x.id === p.id ? { ...x, text } : x) }))} />)}{snippetContent.groups.map((g, i) => <div key={g.id} className="snippet-quote-edit"><label>Quote {i + 1}</label><TextArea value={g.quote} label={`Snippet quote ${i + 1}`} onChange={quote => setSnippetContent(s => ({ ...s, groups: s.groups.map(x => x.id === g.id ? { ...x, quote } : x) }))} />{g.points.map((p, j) => <TextArea key={p.id} value={p.text} label={`Snippet quote ${i + 1} response ${j + 1}`} onChange={text => setSnippetContent(s => ({ ...s, groups: s.groups.map(x => x.id === g.id ? { ...x, points: x.points.map(y => y.id === p.id ? { ...y, text } : y) } : x) }))} />)}</div>)}<div className="modal-actions"><Action type="submit" tone="save" icon="save">Save snippet</Action></div></form></Modal>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
