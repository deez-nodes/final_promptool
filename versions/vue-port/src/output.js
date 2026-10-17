import { TEMPLATES, BLOCKS } from './templates'

export function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
export function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ═══════════════ BUILD ═══════════════
export function buildOutput(item, fmt){
  if(!item)return '';
  const tpl=TEMPLATES[item.template]||TEMPLATES.promptology; const xml=fmt==='xml';
  const lines=[];
  const sect=(label,body,{code=false}={})=>{
    const tag=slug(label);
    if(xml){ lines.push(`<${tag}>`); lines.push(body); lines.push(`</${tag}>`); }
    else { lines.push(`# ${label}`); if(code){lines.push('```');lines.push(body);lines.push('```');} else lines.push(body); }
    lines.push('');
  };
  if(tpl.isTask){
    const tid=(item.fields.task_id||'').trim(), nm=(item.name||'Untitled Task').trim(),
          st=(item.status||'ready').toUpperCase(), dep=(item.fields.depends||'').trim();
    if(tid||nm){ if(xml){ lines.push(`<task id="${tid||'??'}" status="${st}"${dep?` depends="${dep}"`:''}>`); lines.push(nm); lines.push('</task>'); }
      else { lines.push(`## [${tid||'??'}] ${nm}`); if(dep)lines.push(`Depends on: ${dep}`); lines.push(`Status: ${st}`); } lines.push(''); }
  }
  tpl.fields.forEach(f=>{
    if(f.key==='task_id'||f.key==='depends')return;
    if(f.hasFiles){ const files=item.files[f.key]||[]; if(!files.length)return;
      sect(f.label, files.map(fp=>`- ${fp}`).join('\n')); return; }
    const val=(item.fields[f.key]||'').trim(); if(!val)return;
    sect(f.label,val,{code:(f.key==='state'||f.key==='error')});
  });
  const bk=(item.blocks||[]).filter(k=>BLOCKS[k]);
  if(bk.length){ sect('Guidelines', bk.map(k=>BLOCKS[k].text).join('\n\n')); }
  return lines.join('\n').trim();
}

// ═══════════════ EVAL STUB ═══════════════
export function generateEval(item, fmt){
  const tpl=TEMPLATES[item.template]||{}; const grader=tpl.evalGrader||'llm';
  const sys=buildOutput(item, fmt).replace(/"""/g,"'''"); const name=item.name||tpl.label||'prompt';
  let criteria,cases,graderFn,graderName,pass;
  if(grader==='json'||grader==='exact'){
    criteria=`- Output is 100% valid & matches the expected shape (E-S1)\n- Accuracy >= {{0.90}} on the seed set (E-S2 — set threshold)\n- 0 spurious fields / hallucinated labels (E-S4)`;
    cases=[`{"input": "{{typical 1}}",        "expected": "{{answer}}"},`,
      `{"input": "{{typical 2}}",        "expected": "{{answer}}"},`,
      `{"input": "",                     "expected": "{{answer}}"},   # edge: empty`,
      `{"input": "{{very long input}}",  "expected": "{{answer}}"},   # edge: length`,
      `{"input": "{{ambiguous}}",        "expected": "{{answer}}"},   # edge: humans disagree`];
    graderName=grader==='json'?'grade_json':'grade_exact';
    graderFn=grader==='json'
      ?`def grade_json(out, case):            # E-G1 code: valid JSON w/ required keys\n    import json\n    try: obj = json.loads(out)\n    except json.JSONDecodeError: return False\n    return all(k in obj for k in case.get("required_keys", []))`
      :`def grade_exact(out, case):           # E-G1 code: exact match\n    return out.strip().lower() == case["expected"].strip().lower()`;
    pass=`v is True`;
  } else if(grader==='code'){
    criteria=`- All listed tests pass (E-G1 code-based)\n- Solution is general, not hard-coded (I3)\n- No edits outside declared scope (I2)`;
    cases=[`{"input": "{{run: pytest -q}}",        "expected": "all pass"},`,
      `{"input": "{{run: ruff / typecheck}}", "expected": "clean"},`,
      `{"input": "{{edge: empty/malformed}}", "expected": "handled, no crash"},  # edge`,
      `{"input": "{{edge: boundary value}}",  "expected": "correct"},            # edge`];
    graderName='grade_code';
    graderFn=`def grade_code(out, case):            # E-G1 code: wire to your test runner\n    # e.g. subprocess.run(["pytest","-q"]).returncode == 0\n    return "{{assert}}" in out`;
    pass=`v is True`;
  } else {
    criteria=`- Judge rates >= {{4}}/5 (or 'correct') vs the rubric (E-G3)\n- >= {{0.90}} of the seed set passes (E-S2)\n- Hard constraints (length/sections) also pass a cheap code check`;
    cases=[`{"input": "{{typical 1}}",        "rubric": "{{what a good answer must contain}}"},`,
      `{"input": "{{typical 2}}",        "rubric": "{{...}}"},`,
      `{"input": "",                     "rubric": "{{handles empty input gracefully}}"},   # edge`,
      `{"input": "{{very long}}",        "rubric": "{{stays on task}}"},                    # edge`,
      `{"input": "{{adversarial}}",      "rubric": "{{refuses or redirects}}"},             # edge`];
    graderName='grade_llm';
    graderFn=`def grade_llm(out, case):             # E-G3 LLM-as-judge: reason then verdict\n    p = (f"Grade the answer against the rubric.\\n<rubric>{case['rubric']}</rubric>\\n"\n         f"<answer>{out}</answer>\\nThink in <thinking> tags, then output exactly "\n         f"'correct' or 'incorrect' in <result> tags.")\n    v = client.messages.create(model=GRADER_MODEL, max_tokens=1024,\n            messages=[{"role":"user","content":p}]).content[0].text.lower()\n    return "<result>correct</result>" in v`;
    pass=`v is True`;
  }
  const py=`"""Eval stub for: ${name}\nAuto-generated by prompTOR. Grader: ${graderName} (template '${item.template}').\n  pip install anthropic ; export ANTHROPIC_API_KEY=... ; python eval_${item.template}.py\n"""\nimport anthropic\nclient = anthropic.Anthropic()\n\nCANDIDATE_MODEL = "claude-opus-4-8"\nGRADER_MODEL    = "claude-opus-4-8"   # E-G3.4: prefer a separate grader\n\nSYSTEM_PROMPT = """${sys}"""\n\n# E-D1: typical + labeled edge cases.  E-D3: seed — expand to dozens.\nTEST_CASES = [\n    ${cases.join('\n    ')}\n]\n\n${graderFn}\n\ndef get_completion(test_input):\n    return client.messages.create(\n        model=CANDIDATE_MODEL, max_tokens=1024, system=SYSTEM_PROMPT,\n        messages=[{"role":"user","content":str(test_input)}],\n    ).content[0].text\n\ndef main():\n    ok = 0\n    for case in TEST_CASES:\n        out = get_completion(case["input"])\n        v = ${graderName}(out, case)\n        passed = ${pass}\n        ok += passed\n        print(("PASS" if passed else "FAIL"), repr(str(case["input"])[:48]))\n    print(f"\\nScore: {ok/len(TEST_CASES)*100:.1f}%  ({ok}/{len(TEST_CASES)})")\n\nif __name__ == "__main__":\n    main()\n`;
  return `# Eval stub — ${name}\n# grader: ${graderName} (auto-selected from template)\n\n# Success criteria (S·M·A·R)\n${criteria}\n\n# Runnable harness (eval_${item.template}.py)\n\`\`\`python\n${py}\`\`\`\n`;
}

// ═══════════════ PREVIEW HTML ═══════════════
const dim=s=>`<span style="color:var(--surface3)">${s}</span>`;
export function previewHtml(mode, item, fmt){
  if(mode==='eval'){
    if(!item)return dim('// select a prompt to generate an eval');
    return escHtml(generateEval(item, fmt))
      .replace(/^(# .*)$/gm,'<span class="pv-head">$1</span>')
      .replace(/^(```.*)$/gm,'<span class="pv-fence">$1</span>');
  }
  const text=buildOutput(item, fmt);
  if(!text)return dim('// wrapped context appears here');
  return escHtml(text)
    .replace(/^(&lt;\/?[a-z0-9_]+(?:\s[^&]*?)?&gt;)$/gm,'<span class="pv-tag">$1</span>')
    .replace(/^(## \[.*?\].*)/gm,'<span class="pv-head">$1</span>')
    .replace(/^(# [A-Z].*)/gm,'<span class="pv-head">$1</span>')
    .replace(/^(- [~\/.].*)/gm,'<span class="pv-file">$1</span>')
    .replace(/^(Status: .*|Depends on: .*)$/gm,'<span class="pv-meta">$1</span>');
}
