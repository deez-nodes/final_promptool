import { reactive, computed, watch } from 'vue'
import { TEMPLATES } from './templates'
import { buildOutput, generateEval } from './output'

// ═══════════════ STATE ═══════════════
export const state = reactive({
  items: JSON.parse(localStorage.getItem('promptor_items') || '{}'),
  activeId: null,
  mode: 'prompt',       // 'prompt' | 'task'
  preview: 'prompt',    // 'prompt' | 'eval' | 'chat'
  baseDir: localStorage.getItem('promptor_basedir') || '~/Projects/',
  fmt: localStorage.getItem('promptor_fmt') || 'xml',   // 'xml' | 'md'
  cheatOpen: false,
  toast: '', toastShow: false,
})

watch(() => state.items, v => localStorage.setItem('promptor_items', JSON.stringify(v)), { deep: true })
watch(() => state.baseDir, v => localStorage.setItem('promptor_basedir', v))
watch(() => state.fmt, v => localStorage.setItem('promptor_fmt', v))

export const active = computed(() => state.activeId ? state.items[state.activeId] || null : null)
export const activeTpl = computed(() => active.value ? TEMPLATES[active.value.template] || TEMPLATES.promptology : null)
export const sidebarItems = computed(() =>
  Object.values(state.items).filter(i => (i.mode || 'prompt') === state.mode)
    .sort((a, b) => (b.updated || b.created) - (a.updated || a.created)))
export const output = computed(() => buildOutput(active.value, state.fmt))

function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

export function touch(item){ item.updated = Date.now() }

export function applyTemplateDefaults(item,{resetBlocks=false}={}){
  const tpl=TEMPLATES[item.template]; if(!tpl)return;
  (tpl.fields||[]).forEach(f=>{ if(f.prefill && !(item.fields[f.key]||'').trim()) item.fields[f.key]=f.prefill; });
  if(resetBlocks || !Array.isArray(item.blocks)) item.blocks=[...(tpl.blocks||[])];
}

// ═══════════════ MODE / CRUD ═══════════════
export function setMode(m){
  state.mode=m;
  const item=active.value;
  if(item){ item.template = m==='task'?'claude_code':'general'; applyTemplateDefaults(item,{resetBlocks:true}); }
}
export function newItem(){
  const id=genId(); const tpl=state.mode==='task'?'claude_code':'general';
  state.items[id]={id,name:'',template:tpl,mode:state.mode,status:'ready',created:Date.now(),fields:{},files:{},blocks:[]};
  applyTemplateDefaults(state.items[id],{resetBlocks:true}); state.activeId=id;
}
export function loadItem(id){ if(state.items[id]) state.activeId=id; }
export function deleteItem(id){
  delete state.items[id];
  if(state.activeId===id) state.activeId=null;
}
export function changeTemplate(tpl){
  const item=active.value; if(!item)return;
  item.template=tpl; applyTemplateDefaults(item,{resetBlocks:true});
}
export function toggleBlock(key){
  const item=active.value; if(!item)return;
  if(!Array.isArray(item.blocks))item.blocks=[];
  const j=item.blocks.indexOf(key); if(j>=0)item.blocks.splice(j,1); else item.blocks.push(key);
}
export function addFile(key,raw){
  const item=active.value; if(!item)return;
  const res=(raw.startsWith('/')||raw.startsWith('~')||raw.startsWith('.'))?raw:state.baseDir.replace(/\/$/,'')+'/'+raw;
  if(!item.files[key])item.files[key]=[];
  if(!item.files[key].includes(res)) item.files[key].push(res);
}
export function removeFile(key,fp){
  const item=active.value; if(!item)return;
  item.files[key]=(item.files[key]||[]).filter(x=>x!==fp);
}

// open on a blank General prompt (reuse an untouched one rather than piling up)
const isBlank = i => (i.mode||'prompt')==='prompt' && i.template==='general' && !i.name && !Object.values(i.fields).some(v=>(v||'').trim())
const blank = Object.values(state.items).find(isBlank)
if(blank) state.activeId=blank.id; else newItem()

// ═══════════════ COPY / SAVE ═══════════════
export function showToast(msg){ state.toast=msg; state.toastShow=true; setTimeout(()=>state.toastShow=false,2000); }
export function copyPreview(){
  if(state.preview==='eval'){ if(!active.value)return; navigator.clipboard.writeText(generateEval(active.value,state.fmt)).then(()=>showToast('Eval stub copied')); }
  else navigator.clipboard.writeText(output.value).then(()=>showToast('Prompt copied'));
}
export function saveMd(){
  const item=active.value; if(!item)return;
  const ext=state.fmt==='xml'?'xml':'md'; const nm=(item.name||'prompt').replace(/[^a-z0-9_\-]/gi,'_').toLowerCase();
  const blob=new Blob([output.value],{type:'text/plain'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=`${nm}.${ext}`; a.click(); showToast('Saved .'+ext);
}
