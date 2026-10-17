// ═══════════════ TEMPLATES ═══════════════
export const TEMPLATES = {
  promptology:{label:'Promptology',isTask:false,
    fields:[
      {key:'role',label:'Role / Context',hint:'who you are + constraints',hasFiles:false,placeholder:'Active day trader. MES/ES futures...'},
      {key:'goal',label:'Goal',hint:'session-level objective',hasFiles:false,placeholder:'Build a gap scanner...'},
      {key:'theory',label:'Background / Theory',hint:'what you believe is true',hasFiles:false,placeholder:'High volume gaps over $2 tend to hold...'},
      {key:'state',label:'Current State',hint:'code / data / prior output',hasFiles:false,placeholder:'Paste existing code, output, or context...'},
      {key:'task',label:'Task',hint:'exact imperative ask',hasFiles:false,placeholder:'Write a Python scanner that...'},
      {key:'output',label:'Response',hint:'tone, style, bullets or not',hasFiles:false,placeholder:'Code only. Inline comments...'},
    ]},
  general:{label:'General',isTask:false,
    fields:[
      {key:'role',label:'Persona',hint:'who the AI acts as',hasFiles:false,placeholder:'Senior Architect...'},
      {key:'context',label:'Context',hint:'background information',hasFiles:false,placeholder:'We are building a...'},
      {key:'goal',label:'Goal',hint:'the outcome you want',hasFiles:false,placeholder:'Ship a clear summary for...'},
      {key:'task',label:'Task',hint:'the active imperative ask',hasFiles:false,placeholder:'Write a summary...'},
      {key:'output',label:'Response',hint:'tone, style, bullets or not',hasFiles:false,placeholder:'Concise and direct. No bullets. No em dashes...'},
      {key:'format',label:'Output Format',hint:'json · markdown · xml · yaml',hasFiles:false,placeholder:'JSON with keys: title, summary...'},
    ]},
  dev:{label:'Dev / Code',isTask:false,
    fields:[
      {key:'env',label:'Tech Stack',hint:'tools, versions, platforms',hasFiles:false,placeholder:'Python 3.12, FastAPI, Nuxt 4...'},
      {key:'files',label:'Reference Files',hint:'files to read',hasFiles:true,placeholder:''},
      {key:'state',label:'Reference Code',hint:'raw code',hasFiles:false,placeholder:'Paste existing code here...'},
      {key:'task',label:'Specific Task',hint:'the active imperative ask',hasFiles:false,placeholder:'Refactor this function for...'},
      {key:'rules',label:'Constraints',hint:'what NOT to do',hasFiles:false,placeholder:'Keep architecture minimalist...'},
    ]},
  claude_code:{label:'Claude Code Task',isTask:true,
    fields:[
      {key:'task_id',label:'Task ID',hint:'e.g. S1-03',hasFiles:false,placeholder:'S1-03'},
      {key:'objective',label:'Objective',hint:'one sentence goal',hasFiles:false,placeholder:'Wire useTradeLog to GET /trades'},
      {key:'files',label:'Files to Change',hint:'exact paths only',hasFiles:true,placeholder:''},
      {key:'depends',label:'Depends On',hint:'task IDs this needs',hasFiles:false,placeholder:'S1-01, S1-02'},
      {key:'scope',label:'Scope / Rules',hint:'what NOT to touch',hasFiles:false,placeholder:'Do not touch anything outside listed files.'},
      {key:'notes',label:'Implementation Notes',hint:'context for claude',hasFiles:false,placeholder:'useTradeLog exposes: trades ref...'},
    ]},
  // ── Anthropic best-practice templates ──
  pe_general:{label:'PE — General Task',isTask:false,evalGrader:'llm',blocks:[],blockOptions:['self-check','no-preamble','avoid-markdown'],
    fields:[
      {key:'role',label:'Role',hint:'system: who Claude is (D1)',hasFiles:false,placeholder:'a senior technical writer...'},
      {key:'task',label:'Task',hint:'specific ask; request "above and beyond" (A1)',hasFiles:false,placeholder:'Write X. Go beyond the basics.'},
      {key:'context',label:'Context / Why',hint:'motivation sharpens output (A2)',hasFiles:false,placeholder:'This will be read aloud, so...'},
      {key:'examples',label:'Examples',hint:'3–5, wrapped in <example> (B1)',hasFiles:false,placeholder:'<example>\ninput: ...\noutput: ...\n</example>'},
      {key:'output',label:'Response',hint:'tone + style; say what TO do (F1)',hasFiles:false,placeholder:'Smoothly flowing prose.',prefill:'Respond directly, without preamble.'},
    ]},
  pe_extract:{label:'PE — Structured Extract',isTask:false,evalGrader:'json',blocks:['no-preamble'],blockOptions:['no-preamble','self-check'],
    fields:[
      {key:'input',label:'Input',hint:'text to process, in <input> (C1)',hasFiles:false,placeholder:'{{the text}}'},
      {key:'fields',label:'Fields to Extract',hint:'keys + types',hasFiles:false,placeholder:'name (string), amount (number)'},
      {key:'labels',label:'Labels (if class.)',hint:'enum of valid labels',hasFiles:false,placeholder:'positive | negative | neutral'},
      {key:'output',label:'Output Format',hint:'Structured Outputs, not prefill (F5)',hasFiles:false,placeholder:'',prefill:'Return strict JSON matching the schema. Choose exactly one label. No prose.'},
    ]},
  pe_longdoc:{label:'PE — Long Document',isTask:false,evalGrader:'llm',blocks:[],blockOptions:['self-check'],
    fields:[
      {key:'documents',label:'Documents',hint:'data at top, <document> tags (E1)',hasFiles:true,placeholder:''},
      {key:'paste',label:'Or Paste Docs',hint:'inline document text',hasFiles:false,placeholder:'<document index="1">...</document>'},
      {key:'question',label:'Question',hint:'the actual task (asked last)',hasFiles:false,placeholder:'Identify strategic advantages...'},
      {key:'instructions',label:'Instructions',hint:'quote-ground first (E3)',hasFiles:false,placeholder:'',prefill:'First find quotes relevant to the question in <quotes> tags. Then answer using only those quotes in <answer> tags.'},
    ]},
  pe_agentic:{label:'PE — Agentic Coding',isTask:false,evalGrader:'code',
    blocks:['investigate-first','no-overengineering','general-solution','cleanup-temp-files'],
    blockOptions:['investigate-first','no-overengineering','general-solution','cleanup-temp-files','autonomy-safety','conservative-action','parallel-tools','self-check'],
    fields:[
      {key:'env',label:'Environment',hint:'stack / harness',hasFiles:false,placeholder:'Claude Code, Python 3.12'},
      {key:'files',label:'Files to Read',hint:'exact paths (read before edit)',hasFiles:true,placeholder:''},
      {key:'task',label:'Task',hint:'EXPLICIT action ask, not "suggest" (G1)',hasFiles:false,placeholder:'Change this function to improve perf.'},
      {key:'rules',label:'Scope / Rules',hint:'kept minimal by default (I2)',hasFiles:false,placeholder:'',prefill:"Only change what is requested or clearly necessary. Don't touch unrelated code."},
    ]},
  pe_research:{label:'PE — Research',isTask:false,evalGrader:'llm',blocks:[],blockOptions:['self-check','no-preamble'],
    fields:[
      {key:'question',label:'Research Question',hint:'what to find out',hasFiles:false,placeholder:'What is the current state of X?'},
      {key:'success',label:'Success Criteria',hint:'what a complete answer covers (I8)',hasFiles:false,placeholder:'A complete answer names..., cites...'},
      {key:'approach',label:'Approach',hint:'verify + hypotheses (I8)',hasFiles:false,placeholder:'',prefill:'Verify key facts across multiple independent sources. Track competing hypotheses and confidence; self-critique before concluding.'},
    ]},
  pe_role:{label:'PE — Role Assistant',isTask:false,evalGrader:'llm',blocks:[],blockOptions:['avoid-markdown','no-preamble','self-check'],
    fields:[
      {key:'role',label:'Role + Specialty',hint:'system prompt (D1)',hasFiles:false,placeholder:'a patient customer-support agent...'},
      {key:'tone',label:'Tone & Style',hint:'how it should sound',hasFiles:false,placeholder:'Empathetic, concise, never defensive.'},
      {key:'behavior',label:'Behavior Rules',hint:'do/avoid, escalation, limits',hasFiles:false,placeholder:'Confirm order number before acting.'},
      {key:'identity',label:'Identity (opt.)',hint:'only if it must self-identify (D2)',hasFiles:false,placeholder:'The assistant is Claude, created by Anthropic.'},
    ]},
};

export const TEMPLATE_GROUPS = [
  {label:'── Prompt Templates ──', keys:['promptology','general','dev']},
  {label:'── Best-Practice (Anthropic) ──', keys:['pe_general','pe_extract','pe_longdoc','pe_agentic','pe_research','pe_role']},
  {label:'── Tasks ──', keys:['claude_code']},
];

// ═══════════════ BEST-PRACTICE BLOCKS ═══════════════
export const BLOCKS = {
  'investigate-first':{label:'investigate-first',text:'<investigate_before_answering>\nNever speculate about code you have not opened. If the user references a specific file, read it before answering. Investigate relevant files BEFORE making any claim about the codebase. Give grounded, hallucination-free answers.\n</investigate_before_answering>'},
  'no-overengineering':{label:'no-overengineering',text:"Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Don't add features, refactors, docs, defensive code, or abstractions beyond the task. The right amount of complexity is the minimum needed."},
  'general-solution':{label:'general-solution',text:"Write a high-quality, general-purpose solution using standard tools. Don't hard-code to specific test inputs; implement logic that works for all valid inputs. Tests verify correctness — they don't define the solution. If a task is infeasible or a test is wrong, say so rather than working around it."},
  'autonomy-safety':{label:'autonomy-safety',text:'Take local, reversible actions freely (editing files, running tests), but for actions that are hard to reverse, affect shared systems, or are destructive (deleting files/branches, dropping tables, rm -rf, git push --force, posting to PRs/issues), ask before proceeding. Never use destructive shortcuts like --no-verify.'},
  'cleanup-temp-files':{label:'cleanup-temp-files',text:'If you create any temporary files, scripts, or helper files for iteration, remove them at the end of the task.'},
  'parallel-tools':{label:'parallel-tools',text:'<use_parallel_tool_calls>\nIf you intend to call multiple tools with no dependencies between them, make all the independent calls in parallel. If a call depends on a previous result, call them sequentially. Never use placeholders or guess missing parameters.\n</use_parallel_tool_calls>'},
  'conservative-action':{label:'conservative-action',text:'<do_not_act_before_instructions>\nDo not change files unless clearly instructed. When intent is ambiguous, default to information, research, and recommendations rather than action.\n</do_not_act_before_instructions>'},
  'self-check':{label:'self-check',text:'Before you finish, verify your answer against the success criteria / constraints above.'},
  'avoid-markdown':{label:'avoid-markdown',text:'<avoid_excessive_markdown>\nWrite in clear flowing prose using complete paragraphs. Reserve markdown for inline code, code blocks, and simple headings. Avoid bullet/numbered lists unless presenting truly discrete items or asked for a list.\n</avoid_excessive_markdown>'},
  'no-preamble':{label:'no-preamble',text:'Respond directly without preamble. Do not start with phrases like "Here is..." or "Based on...".'},
};

// ═══════════════ CHEATSHEET ═══════════════
export const CHEAT = [
  ['grp','Modes'],['i / I','insert before / line-start'],['a / A','insert after / line-end'],['o / O','open line below / above'],['Esc','back to NORMAL'],['v','visual select'],
  ['grp','Move'],['h j k l','left down up right'],['w / e / b','word fwd / end / back'],['0 / $','line start / end'],['^','first non-blank'],['gg / G','top / bottom'],
  ['grp','Edit'],['x','delete char'],['dd / D','delete line / to end'],['cc / C','change line / to end'],['dw cw db','operator + motion'],['yy / p / P','yank / paste after / before'],['u','undo'],
  ['grp','Not supported'],['macros q@','—'],['marks m','—'],[':ex / :s','—'],['ctrl-v block','—'],
];
