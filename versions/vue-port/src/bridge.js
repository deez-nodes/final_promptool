import { reactive } from 'vue'
import { state, output, showToast } from './store'

// ═══════════════ BRIDGE (one live claude session, piped) ═══════════════
const BRIDGE_TOKEN = window.__PROMPTOR_TOKEN__ || null;   // present only when served by bridge.js
let es=null;
// Opt-in: editing never needs the bridge. Nothing connects until the user enables it.
export const bridge = reactive({
  enabled: localStorage.getItem('promptor_bridge')==='1',
  up:false, model:'sonnet', effort:'medium',
  msgs:[{role:'sys',text:'start the bridge, then Optimize ✦ or Run ▶'}],
})
const MODELS=['sonnet','opus','fable'], EFFORTS=['low','medium','high'];

function post(path,body){ return fetch(path,{method:'POST',headers:{'Content-Type':'application/json','x-promptor-token':BRIDGE_TOKEN},body:JSON.stringify(body||{})}); }
function cmsg(role,text){ bridge.msgs.push({role,text}); }

function handleEvent(evt){
  if(evt.type==='system'&&evt.subtype==='init'){ if(evt.model){
      const alias=evt.model.includes('opus')?'opus':evt.model.includes('fable')?'fable':'sonnet';
      if(MODELS.includes(alias))bridge.model=alias; } return; }
  if(evt.type==='assistant'&&evt.message&&Array.isArray(evt.message.content)){
    const txt=evt.message.content.filter(c=>c.type==='text').map(c=>c.text).join(''); if(txt)cmsg('bot',txt); return; }
  if(evt.type==='result'){ const c=evt.total_cost_usd?` · $${evt.total_cost_usd.toFixed(4)}`:'';
    cmsg('cost',`— ${evt.subtype||'done'}${c} · ${bridge.model}/${bridge.effort}`); return; }
  if(evt.type==='system'&&evt.subtype==='engine_exit'){ cmsg('sys',`engine exited (code ${evt.code})`); bridge.up=false; } }
function openStream(){ if(es)es.close();
  es=new EventSource('/stream?t='+encodeURIComponent(BRIDGE_TOKEN));
  es.onmessage=e=>{ try{ handleEvent(JSON.parse(e.data)); }catch(_){} }; }

export function setBridge(on){
  bridge.enabled=on; localStorage.setItem('promptor_bridge',on?'1':'0');
  if(on) initBridge();
  else { if(es){es.close();es=null;} bridge.up=false; if(state.preview==='chat')state.preview='prompt'; }
}
export async function initBridge(){ if(!bridge.enabled)return; if(!BRIDGE_TOKEN){ bridge.up=false; return; }
  try{ const r=await fetch('/health'); if(!r.ok)throw 0; const h=await r.json();
    if(h&&h.ok){ bridge.up=true; if(h.effort&&EFFORTS.includes(h.effort))bridge.effort=h.effort; openStream(); }
    else bridge.up=false;
  }catch(_){ bridge.up=false; } }
export function optimizeViaBridge(){ if(!bridge.up)return; const draft=output.value; if(!draft){showToast('Nothing to optimize');return;}
  state.preview='chat'; cmsg('you','✦ optimize this draft');
  post('/send',{text:'/promptor optimize this draft. Show the optimized prompt labeled SYSTEM: and USER: with XML-tagged sections, then a short "why, by rule ID" list.\n\n'+draft}).catch(()=>cmsg('sys','send failed')); }
export function runViaBridge(){ if(!bridge.up)return; const draft=output.value; if(!draft){showToast('Nothing to run');return;}
  state.preview='chat'; cmsg('you','▶ run this draft');
  post('/send',{text:'Run this prompt as a fresh task and show the result under a "--- RUN OUTPUT ---" line:\n\n'+draft}).catch(()=>cmsg('sys','send failed')); }
export function chatSend(text){ if(!bridge.up)return; text=text.trim(); if(!text)return;
  cmsg('you',text); post('/send',{text}).catch(()=>cmsg('sys','send failed')); }
export function onRunCfgChange(){ if(!bridge.up)return; const {model,effort}=bridge;
  cmsg('sys',`restarting session → ${model} / ${effort}`); post('/restart',{model,effort}).catch(()=>cmsg('sys','restart failed')); }
