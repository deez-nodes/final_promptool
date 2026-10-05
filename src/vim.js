import { reactive, computed } from 'vue'

// ═══════════════ VIM ENGINE ═══════════════
// Reactive part drives the HUD and field classes; buf holds register/undo/anchor.
export const vim = reactive({ on: localStorage.getItem('promptor_vim')==='1', mode:'off', pending:'', lastAction:'', fieldKey:null })
const buf = { reg:'', undo:[], anchor:0, g:false }
vim.mode = vim.on ? 'insert' : 'off'

const HINTS={
  off:'vim editing is off — flip the VIM switch to drill modal editing',
  insert:'<b>INSERT</b> — type freely · <b>Esc</b> back to NORMAL · Enter still inserts a newline here',
  normal:'<b>NORMAL</b> — move <b>hjkl w e b 0 $ ^ gg G</b> · edit <b>x dd dw cc cw D C yy p u</b> · <b>i a o</b> insert · <b>v</b> visual',
  visual:'<b>VISUAL</b> — extend with motions · <b>d</b> delete · <b>y</b> yank · <b>c</b> change · <b>Esc</b> cancel',
};
const BADGE={off:['vm-off','VIM OFF'],insert:['vm-insert','INSERT'],normal:['vm-normal','NORMAL'],visual:['vm-visual','VISUAL']};
export const vimBadge = computed(()=>BADGE[vim.mode]||BADGE.off)
export const vimHint = computed(()=>{
  const h=HINTS[vim.mode]||HINTS.off;
  if(vim.pending) return `<b>${vim.pending}</b> pending — motion? <b>w e b $ 0 ^</b> or <b>${vim.pending}${vim.pending}</b> for whole line`;
  if(vim.lastAction) return `<b>${vim.lastAction}</b> · `+h;
  return h;
})

export function setVimMode(m,fieldKey){ vim.mode=m; vim.pending=''; vim.fieldKey=fieldKey; }
export function setVim(on){
  vim.on=on; localStorage.setItem('promptor_vim',on?'1':'0');
  if(on){ const ae=document.activeElement; const ta=ae&&ae.classList.contains('field-ta')?ae:document.querySelector('.field-ta');
    if(ta){ta.focus(); setVimMode('normal',ta.dataset.key);} else setVimMode('insert',null); }
  else setVimMode('off',null);
}

// textarea helpers
export function autoResize(ta){ ta.style.height='auto'; ta.style.height=Math.max(70,ta.scrollHeight)+'px'; }
function lnStart(v,p){return v.lastIndexOf('\n',p-1)+1;}
function lnEnd(v,p){const i=v.indexOf('\n',p);return i<0?v.length:i;}
function col(v,p){return p-lnStart(v,p);}
function wordFwd(v,p){const n=v.length; while(p<n&&/\w/.test(v[p]))p++; while(p<n&&/\s/.test(v[p])&&v[p]!=='\n')p++; if(p<n&&!/\w/.test(v[p])&&!/\s/.test(v[p]))while(p<n&&!/\w/.test(v[p])&&!/\s/.test(v[p]))p++; while(p<n&&/\s/.test(v[p])&&v[p]!=='\n')p++; return p;}
function wordBack(v,p){p--; while(p>0&&/\s/.test(v[p]))p--; while(p>0&&/\w/.test(v[p-1]))p--; return Math.max(0,p);}
function wordEnd(v,p){const n=v.length; p++; while(p<n&&/\s/.test(v[p]))p++; while(p+1<n&&/\w/.test(v[p+1]))p++; return Math.min(n,p);}
function pushUndo(ta){ buf.undo.push({v:ta.value,p:ta.selectionStart}); if(buf.undo.length>100)buf.undo.shift(); }
function setCur(ta,p){ p=Math.max(0,Math.min(ta.value.length,p)); ta.selectionStart=ta.selectionEnd=p; }

// commit() pushes ta.value back into the store and resizes the textarea
export function onFieldKeydown(e,ta,key,commit){
  if(!vim.on){ handleTabNav(e,commit); return; }
  if(vim.mode==='insert'){ if(e.key==='Escape'){e.preventDefault(); pushUndo(ta); setVimMode('normal',key); vim.lastAction='→normal'; return;} handleTabNav(e,commit); return; }
  // NORMAL / VISUAL
  if(e.key==='Shift'||e.key==='Control'||e.key==='Alt'||e.key==='Meta')return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  e.preventDefault();
  const v=ta.value; let p=ta.selectionStart; const k=e.key; const vis=vim.mode==='visual';
  const moveTo=(np)=>{ if(vis){ if(np<buf.anchor){ta.selectionStart=np;ta.selectionEnd=buf.anchor;} else {ta.selectionStart=buf.anchor;ta.selectionEnd=np;} }
      else setCur(ta,np); };
  const delRange=(a,b,enterInsert)=>{ pushUndo(ta); buf.reg=v.slice(a,b); ta.value=v.slice(0,a)+v.slice(b); setCur(ta,a); commit();
      setVimMode(enterInsert?'insert':'normal',key); };

  // operator pending (d/c/y already pressed)
  if(vim.pending){
    const op=vim.pending; vim.pending='';
    let a=p,b=p;
    if(k===op){ a=lnStart(v,p); b=Math.min(v.length,lnEnd(v,p)+1); } // dd/cc/yy
    else if(k==='w'){ b=wordFwd(v,p); } else if(k==='e'){ b=wordEnd(v,p)+1; }
    else if(k==='b'){ a=wordBack(v,p); } else if(k==='$'){ b=lnEnd(v,p); }
    else if(k==='0'){ a=lnStart(v,p); } else if(k==='^'){ a=lnStart(v,p); }
    else return;
    if(op==='y'){ buf.reg=v.slice(a,b); vim.lastAction='yank'; return; }
    delRange(a,b,op==='c'); vim.lastAction=op==='c'?'change':'delete'; return;
  }
  switch(k){
    case 'Escape': if(vis){setVimMode('normal',key);} vim.lastAction=''; break;
    case 'h': moveTo(p-(col(v,p)>0?1:0)); break;
    case 'l': moveTo(p<lnEnd(v,p)?p+1:p); break;
    case ' ': moveTo(p+1); break;
    case 'j':{ const c=col(v,p); const ne=lnEnd(v,p); if(ne<v.length){const ns=ne+1; moveTo(Math.min(ns+c,lnEnd(v,ns)));} break; }
    case 'k':{ const ls=lnStart(v,p); if(ls>0){const c=col(v,p); const ps=lnStart(v,ls-1); moveTo(Math.min(ps+c,lnEnd(v,ps)));} break; }
    case 'w': moveTo(wordFwd(v,p)); break;
    case 'e': moveTo(wordEnd(v,p)); break;
    case 'b': moveTo(wordBack(v,p)); break;
    case '0': moveTo(lnStart(v,p)); break;
    case '$': moveTo(lnEnd(v,p)); break;
    case '^':{ let s=lnStart(v,p); while(s<v.length&&/[ \t]/.test(v[s]))s++; moveTo(s); break; }
    case 'G': moveTo(lnStart(v,v.length)); break;
    case 'g': if(buf.g){buf.g=false; moveTo(0);} else {buf.g=true; setTimeout(()=>buf.g=false,400);} break;
    case 'x': delRange(p,Math.min(v.length,p+1),false); vim.lastAction='x'; break;
    case 'D': delRange(p,lnEnd(v,p),false); vim.lastAction='D'; break;
    case 'C': delRange(p,lnEnd(v,p),true); vim.lastAction='C'; break;
    case 'd': if(vis){delRange(ta.selectionStart,ta.selectionEnd,false); vim.lastAction='delete';} else vim.pending='d'; break;
    case 'c': if(vis){delRange(ta.selectionStart,ta.selectionEnd,true); vim.lastAction='change';} else vim.pending='c'; break;
    case 'y': if(vis){buf.reg=v.slice(ta.selectionStart,ta.selectionEnd); setVimMode('normal',key); vim.lastAction='yank';} else vim.pending='y'; break;
    case 'p':{ pushUndo(ta); const ins=p<v.length?p+1:p; ta.value=v.slice(0,ins)+buf.reg+v.slice(ins); setCur(ta,ins+buf.reg.length-1); commit(); vim.lastAction='paste'; break; }
    case 'P':{ pushUndo(ta); ta.value=v.slice(0,p)+buf.reg+v.slice(p); setCur(ta,p+buf.reg.length-1); commit(); vim.lastAction='paste'; break; }
    case 'i': setVimMode('insert',key); break;
    case 'I': setCur(ta,(()=>{let s=lnStart(v,p);while(s<v.length&&/[ \t]/.test(v[s]))s++;return s;})()); setVimMode('insert',key); break;
    case 'a': setCur(ta,p+1); setVimMode('insert',key); break;
    case 'A': setCur(ta,lnEnd(v,p)); setVimMode('insert',key); break;
    case 'o':{ pushUndo(ta); const le=lnEnd(v,p); ta.value=v.slice(0,le)+'\n'+v.slice(le); setCur(ta,le+1); commit(); setVimMode('insert',key); break; }
    case 'O':{ pushUndo(ta); const ls=lnStart(v,p); ta.value=v.slice(0,ls)+'\n'+v.slice(ls); setCur(ta,ls); commit(); setVimMode('insert',key); break; }
    case 'v': buf.anchor=p; ta.selectionStart=p; ta.selectionEnd=Math.min(v.length,p+1); setVimMode('visual',key); break;
    case 'u': if(buf.undo.length){const s=buf.undo.pop(); ta.value=s.v; setCur(ta,s.p); commit(); vim.lastAction='undo';} break;
  }
}

// Tab indent / list continuation (non-vim and INSERT)
export function handleTabNav(e,commit){
  const ta=e.target;
  if(e.key==='Tab'){ e.preventDefault(); const s=ta.selectionStart,en=ta.selectionEnd,val=ta.value;
    if(s===en){ if(e.shiftKey){const ls=val.lastIndexOf('\n',s-1)+1;const line=val.slice(ls);const sp=line.match(/^ {1,2}/);if(sp){ta.value=val.slice(0,ls)+line.slice(sp[0].length);ta.selectionStart=ta.selectionEnd=Math.max(ls,s-sp[0].length);}}
      else{ta.value=val.slice(0,s)+'  '+val.slice(en);ta.selectionStart=ta.selectionEnd=s+2;} }
    else{ const ls=val.lastIndexOf('\n',s-1)+1; const blk=val.slice(ls,en); const r=e.shiftKey?blk.replace(/^( {1,2})/gm,''):blk.replace(/^/gm,'  ');
      ta.value=val.slice(0,ls)+r+val.slice(en); ta.selectionStart=ls; ta.selectionEnd=ls+r.length; }
    commit(); return; }
  if(e.key==='Enter'){ const s=ta.selectionStart,val=ta.value; const ls=val.lastIndexOf('\n',s-1)+1; const line=val.slice(ls,s);
    const m=line.match(/^(\s*)([-*]\s|(\d+)\.\s)/); if(m){ const indent=m[1],bullet=m[2],num=m[3]; const content=line.slice(m[0].length);
      if(!content.trim()){e.preventDefault();ta.value=val.slice(0,ls)+'\n'+val.slice(s);ta.selectionStart=ta.selectionEnd=ls+1;commit();return;}
      e.preventDefault(); const next=num?indent+(parseInt(num)+1)+'. ':indent+bullet;
      ta.value=val.slice(0,s)+'\n'+next+val.slice(s); ta.selectionStart=ta.selectionEnd=s+1+next.length; commit(); } }
}
