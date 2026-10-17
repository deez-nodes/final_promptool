import { useLayoutEffect, useRef, useState } from 'react';

const paths = {
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14', close: 'M6 6l12 12M6 18L18 6',
  chevron: 'M9 5l7 7-7 7', folder: 'M3 6h7l2 3h9v11H3z',
  document: 'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
  snippet: 'm12 3 9 9-9 9-9-9zM8 12h8',
  library: 'M3 5h4v16H3zM10 3h4v18h-4zM17 6l4-1 3 15-4 1z',
  panel: 'M3 4h18v16H3zM9 4v16',
  preview: 'M3 4h18v16H3zM15 4v16',
  copy: 'M9 9h12v12H9zM15 6V3H3v12h3',
  save: 'M4 3h14l3 3v15H3V3zM7 3v6h9V3M7 21v-8h10v8',
  up: 'm6 14 6-6 6 6', down: 'm6 10 6 6 6-6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  quote: 'M4 6h6v8H5v4H2v-7l2-5M15 6h6v8h-5v4h-3v-7z',
  edit: 'm4 16 12-12 4 4L8 20H4zM13 7l4 4',
  check: 'm4 12 5 5L20 6',
};
export function Icon({ name, size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.document} /></svg>; }
export function Action({ icon, children, tone = 'quiet', ...props }) { return <button className={`action action-${tone}`} {...props}>{icon && <Icon name={icon} />}{children}</button>; }
export function IconButton({ icon, label, ...props }) { return <button type="button" className="icon-button" title={label} aria-label={label} {...props}><Icon name={icon} /></button>; }

function caretPosition(el) {
  const rect = el.getBoundingClientRect();
  const mirror = document.createElement('div');
  const computed = getComputedStyle(el);
  for (const name of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderWidth', 'boxSizing', 'tabSize']) mirror.style[name] = computed[name];
  Object.assign(mirror.style, { position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, whiteSpace: 'pre-wrap', overflowWrap: 'break-word', visibility: 'hidden', pointerEvents: 'none' });
  mirror.textContent = el.value.slice(0, el.selectionStart);
  const marker = document.createElement('span'); marker.textContent = el.value.slice(el.selectionStart, el.selectionStart + 1) || '\u200b';
  mirror.append(marker); document.body.append(mirror);
  const pos = marker.getBoundingClientRect(); mirror.remove();
  return { left: Math.max(8, Math.min(window.innerWidth - 218, pos.left)), top: Math.max(6, Math.min(window.innerHeight - 56, pos.bottom - el.scrollTop + 8)) };
}
export function TextArea({ value, onChange, onAdd, onAltAdd, onMove, onEmptyBackspace, label, id, placeholder = 'Write here…', className = '' }) {
  const ref = useRef(null), escaped = useRef(false);
  const [hint, setHint] = useState(null);
  const [focused, setFocused] = useState(false);
  const updateHint = () => { if (ref.current && onAdd && document.activeElement === ref.current && !escaped.current) setHint(caretPosition(ref.current)); };
  useLayoutEffect(() => {
    const hide = () => setHint(null);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    const size = () => { el.style.height = '0px'; el.style.height = `${Math.max(el.scrollHeight, 30)}px`; };
    size(); let width = el.clientWidth;
    const observer = new ResizeObserver(() => { if (width !== el.clientWidth) { width = el.clientWidth; size(); setHint(null); } }); observer.observe(el);
    return () => observer.disconnect();
  }, [value]);
  return <>
    <textarea ref={ref} id={id} className={`text-editor ${className}`} rows={1} value={value} aria-label={label} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => { setFocused(true); escaped.current = false; updateHint(); }}
      onBlur={() => { setFocused(false); setHint(null); escaped.current = false; }}
      onSelect={updateHint} onKeyUp={updateHint} onClick={updateHint}
      onKeyDown={e => {
        if (e.key === 'Escape') { escaped.current = true; setHint(null); e.stopPropagation(); return; }
        if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && onAdd && !escaped.current) { e.preventDefault(); onAdd(); return; }
        if (e.altKey && e.key === 'Enter' && (onAltAdd || onAdd)) { e.preventDefault(); (onAltAdd || onAdd)(); return; }
        if (e.altKey && ['ArrowUp', 'ArrowDown'].includes(e.key) && onMove) { e.preventDefault(); onMove(e.key === 'ArrowUp' ? -1 : 1); return; }
        if (e.key === 'Backspace' && !value && onEmptyBackspace) { e.preventDefault(); onEmptyBackspace(); }
      }} />
    {focused && hint && onAdd && <div className="caret-hint" role="tooltip" style={{ left: hint.left, top: hint.top }}><kbd>Tab</kbd> adds point<span>Esc, then Tab to leave</span></div>}
  </>;
}
export function Points({ items, label, onChange, onAdd, onRemove, onMove }) {
  return <div className="points-list">{items.map((p, i) => <div className="point-row" key={p.id}>
    <span className="point-number">{String(i + 1).padStart(2, '0')}</span>
    <TextArea id={`field-${p.id}`} value={p.text} label={`${label} point ${i + 1}`} placeholder="Write a point…" onChange={text => onChange(p.id, text)} onAdd={i === items.length - 1 ? () => onAdd() : undefined} onAltAdd={() => onAdd(p.id)} onMove={direction => onMove(p.id, direction)} onEmptyBackspace={() => onRemove(p.id)} />
    <div className="point-actions"><IconButton icon="up" label={`Move point ${i + 1} up`} disabled={i === 0} onClick={() => onMove(p.id, -1)} /><IconButton icon="down" label={`Move point ${i + 1} down`} disabled={i === items.length - 1} onClick={() => onMove(p.id, 1)} /><IconButton icon="close" label={`Remove point ${i + 1}`} onClick={() => onRemove(p.id)} /></div>
  </div>)}</div>;
}
export function SectionCard({ section: s, index, total, update, addPoint, editPoint, removePoint, movePoint, save, remove, move, addGroup, updateGroup, removeGroup, moveGroup, collapsed, toggleCollapse, onDrop }) {
  const [dragging, setDragging] = useState(false);
  return <section className={`section-card ${dragging ? 'drop-target' : ''}`} id={`section-${s.id}`} aria-label={`${s.title || 'Untitled'} section`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); onDrop(e.dataTransfer, s.id); }}>
    <div className="section-heading"><input aria-label={`Section ${index + 1} title`} value={s.title} onChange={e => update({ title: e.target.value })} placeholder="Section name" /></div>
    {!collapsed && <div className="section-content">
      <TextArea id={`field-${s.id}`} value={s.body} onChange={body => update({ body })} label={`${s.title} body`} placeholder={s.kind === 'responses' ? 'Optional context for these responses…' : 'Add context here, then break out individual points…'} onAdd={() => addPoint(s.kind === 'responses' ? s.groups.at(-1)?.id || 'new-group' : undefined)} onMove={move} />
      {s.kind === 'responses' ? <div className="response-groups">{s.groups.map((g, i) => <div className="response-group" key={g.id}>
        <div className="quote-label"><span><Icon name="quote" /> Quote {i + 1}</span><div><IconButton icon="up" label={`Move quote ${i + 1} up`} disabled={i === 0} onClick={() => moveGroup(g.id, -1)} /><IconButton icon="down" label={`Move quote ${i + 1} down`} disabled={i === s.groups.length - 1} onClick={() => moveGroup(g.id, 1)} /><IconButton icon="close" label={`Remove quote ${i + 1}`} onClick={() => removeGroup(g.id)} /></div></div>
        <TextArea id={`field-${g.id}`} value={g.quote} label={`Quote ${i + 1}`} placeholder="Paste the passage you’re responding to…" className="quote-editor" onChange={quote => updateGroup(g.id, { quote })} onAdd={() => addPoint(g.id)} />
        <div className="response-label">Your response</div>
        <Points items={g.points} label={`Quote ${i + 1} response`} onChange={(id, text) => editPoint(id, text, g.id)} onAdd={after => addPoint(g.id, after)} onRemove={id => removePoint(id, g.id)} onMove={(id, d) => movePoint(id, d, g.id)} />
        <button className="add-point" onClick={() => addPoint(g.id)}><Icon name="plus" /> Response point</button>
      </div>)}</div> : <Points items={s.points} label={s.title} onChange={editPoint} onAdd={after => addPoint(undefined, after)} onRemove={removePoint} onMove={movePoint} />}
      <button className="add-point" onClick={() => s.kind === 'responses' ? addGroup() : addPoint()}><Icon name="plus" />{s.kind === 'responses' ? 'Add quote' : 'Add point'}<kbd>{s.kind === 'responses' ? '' : 'Tab'}</kbd></button>
    </div>}
    <div className="section-footer"><button className="text-button" onClick={save}><Icon name="snippet" /> Save section</button><span className="section-footer-spacer" /><button className="text-button" onClick={toggleCollapse}>{collapsed ? 'Expand' : 'Collapse'}</button><IconButton icon="up" label={`Move ${s.title} up`} disabled={index === 0} onClick={() => move(-1)} /><IconButton icon="down" label={`Move ${s.title} down`} disabled={index === total - 1} onClick={() => move(1)} /><IconButton icon="close" label={`Remove ${s.title} section`} onClick={remove} /></div>
  </section>;
}
export function Splitter({ label, value, min, max, onChange, onCollapse, reverse = false }) {
  const start = useRef(null);
  return <div className="splitter" role="separator" aria-label={label} aria-orientation="vertical" aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max} tabIndex={0} title="Drag to resize · double-click to collapse"
    onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); start.current = { x: e.clientX, value }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (start.current) onChange(Math.max(min, Math.min(max, start.current.value + (e.clientX - start.current.x) * (reverse ? -1 : 1)))); }}
    onPointerUp={e => { start.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onLostPointerCapture={() => { start.current = null; }}
    onDoubleClick={onCollapse} onKeyDown={e => {
      if (e.key === 'Enter') onCollapse();
      if (e.key === 'Home') { e.preventDefault(); onChange(min); }
      if (e.key === 'End') { e.preventDefault(); onChange(max); }
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); onChange(Math.max(min, Math.min(max, value + (e.key === 'ArrowRight' ? 20 : -20) * (reverse ? -1 : 1)))); }
    }}><span /></div>;
}

export function Sidebar({ state, search, setSearch, tab, setTab, filter, setFilter, load, star, deleteDocument, insert, editSnippet, deleteSnippet, onProject, onExport, onImport, onLegacy, onClose, onDrop, matches }) {
  const [closed, setClosed] = useState({}), [projectForm, setProjectForm] = useState(false), [name, setName] = useState('');
  const query = search.trim().toLowerCase();
  const documents = state.documents.filter(matches);
  const snippets = state.snippets.filter(s => !query || `${s.name} ${s.section.title} ${s.section.body} ${s.section.points.map(p => p.text).join(' ')} ${s.section.groups.map(g => `${g.quote} ${g.points.map(p => p.text).join(' ')}`).join(' ')}`.toLowerCase().includes(query));
  const row = doc => <div className={`library-row ${doc.id === state.draft.id ? 'selected' : ''}`} key={doc.id}>
    <button className="document-link" onClick={() => load(doc)} title={doc.title || 'Untitled prompt'}><Icon name="document" /><span>{doc.title || 'Untitled prompt'}</span></button>
    <button className={`row-star ${doc.starred ? 'is-starred' : ''}`} aria-label={`${doc.starred ? 'Unstar' : 'Star'} ${doc.title || 'Untitled prompt'}`} onClick={() => star(doc.id)}><Icon name="star" size={13} /></button>
    <button className="row-delete" aria-label={`Delete saved ${doc.title || 'Untitled prompt'}`} title="Delete saved prompt" onClick={() => deleteDocument(doc)}><Icon name="close" size={12} /></button>
  </div>;
  return <aside className="sidebar" aria-label="Prompt library" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onDrop(e.dataTransfer); }}>
    <div className="sidebar-brand"><span className="brand-symbol">‹›</span><div><strong>PROMP<span>TOR</span></strong><small>Workspace</small></div><IconButton icon="panel" label="Hide library" onClick={onClose} /></div>
    <label className="search-field"><Icon name="search" /><input id="library-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your library" aria-label="Search library" /><kbd>Ctrl K</kbd></label>
    <div className="sidebar-tabs" role="tablist" aria-label="Sidebar view"><button role="tab" aria-selected={tab === 'library'} onClick={() => setTab('library')}>Library</button><button role="tab" aria-selected={tab === 'outline'} onClick={() => setTab('outline')}>Outline</button></div>
    <div className="sidebar-scroll">
      {tab === 'outline' ? <div className="outline-list"><p className="sidebar-caption">This draft</p>{state.draft.sections.map((s, i) => <button key={s.id} onClick={() => { document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (window.innerWidth < 800) onClose(); }}><span>{String(i + 1).padStart(2, '0')}</span>{s.title || 'Untitled section'}</button>)}</div> : <>
        <nav className="library-filters" aria-label="Library filters">{[['all', 'library', 'All prompts', state.documents.length], ['starred', 'star', 'Starred', state.documents.filter(d => d.starred).length], ['snippets', 'snippet', 'Snippets', state.snippets.length]].map(([key, icon, title, count]) => <button key={key} className={filter === key ? 'active-filter' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}><Icon name={icon} /><span>{title}</span><small>{count}</small></button>)}</nav>
        {filter !== 'snippets' && <>
          <div className="sidebar-caption"><span>{filter === 'starred' ? 'Starred prompts' : query ? 'Search results' : 'Projects'}</span>{filter === 'all' && <IconButton icon="plus" label="New project" onClick={() => setProjectForm(!projectForm)} />}</div>
          {projectForm && <form className="project-form" onSubmit={e => { e.preventDefault(); if (name.trim()) { onProject(name.trim()); setName(''); setProjectForm(false); } }}><input aria-label="Project name" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} autoFocus /><IconButton icon="check" label="Create project" type="submit" /></form>}
          {filter === 'starred' ? documents.filter(d => d.starred).map(row) : query ? documents.map(row) : <>
            {state.projects.map(p => { const docs = documents.filter(d => d.projectId === p.id); return <div className="project-group" key={p.id}><button className="project-heading" aria-expanded={!closed[p.id]} onClick={() => setClosed(c => ({ ...c, [p.id]: !c[p.id] }))}><span className={!closed[p.id] ? 'chevron-open' : ''}><Icon name="chevron" size={12} /></span><Icon name="folder" size={14} /><span>{p.name}</span><small>{docs.length}</small></button>{!closed[p.id] && <div className="project-documents">{docs.map(row)}{!docs.length && <p className="sidebar-empty">Assign a prompt to this project above its title.</p>}</div>}</div>; })}
            {documents.some(d => !state.projects.some(p => p.id === d.projectId)) && <div className="unfiled-list"><p className="sidebar-caption">Unfiled</p>{documents.filter(d => !state.projects.some(p => p.id === d.projectId)).map(row)}</div>}
          </>}
          {!(filter === 'starred' ? documents.filter(d => d.starred) : documents).length && <p className="sidebar-empty">{query ? 'No matching prompts.' : filter === 'starred' ? 'Star a saved prompt to find it here.' : 'Save your first prompt to build your library.'}</p>}
        </>}
        <div className="sidebar-caption"><span>Reusable snippets</span><small>{snippets.length}</small></div>
        {snippets.map(s => <div className="snippet-row" key={s.id}><button className="snippet-link" onClick={() => insert(s)} title={`Insert ${s.name}`}><Icon name="snippet" size={14} /><span>{s.name}</span></button><div className="snippet-tools"><IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => editSnippet(s)} /><IconButton icon="close" label={`Delete ${s.name}`} onClick={() => deleteSnippet(s.id)} /></div></div>)}
        {!snippets.length && <p className="sidebar-empty">{query ? 'No matching snippets.' : 'Save any section to reuse its body and points. You can also drop a text file here.'}</p>}
      </>}
    </div>
    <div className="sidebar-bottom"><div className="backup-actions"><button className="text-button" onClick={onImport}><Icon name="upload" /> Import</button><button className="text-button" onClick={onExport}><Icon name="download" /> Backup</button></div><button className="legacy-button" onClick={onLegacy}>Import from original v1</button><span className="local-note"><i /> Local workspace · no account needed</span></div>
  </aside>;
}
