# prompTOR / PrompTool: Architecture & Technical Specification

## 1. Executive Summary

**prompTOR** (also referred to as **PrompTool**) is an interactive, section-based prompt engineering IDE and AST architecture tool built with **Nuxt 3** and **Tailwind CSS**.

It solves prompt drift, unstructured LLM prompting, and vendor lock-in by treating prompts as structured, testable, and multi-target compilable software artifacts. Prompt engineers and AI developers can design modular prompt blocks, interpolate runtime variables (`{{variable}}`), enforce organizational lexicons through an autocomplete Term Bank, and compile directly to **Anthropic XML**, **OpenAI Messages JSON**, **Gemini System Instruction AST**, **Raw Markdown**, and executable **Python / TypeScript SDK snippets**.

---

## 2. Technical Architecture & Component Tree

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       prompTOR STUDIO ARCHITECTURE                                     │
├───────────────────┬──────────────────────────────────┬─────────────────────────────────────────────────┤
│  1. SPECIFICATION │ • Block AST & Role Taxonomies    │ • Dynamic Variable Matrix & Lexicon Terms       │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────────────────────┤
│  2. NUXT MODULES  │ • Vue 3 Reactive Store & Compos  │ • Tailwind Cyber-Editorial Visual Tokens        │
│                   │ • Client Persistence (Storage)   │ • Real-time Tiktoken & Multi-Target Compilers   │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────────────────────┤
│  3. STUDIO ENGINE │ • Drag & Reorder Block Composer  │ • Tab Lexicon Autocomplete Engine               │
│                   │ • Live {{var}} Matrix Playground │ • Multi-Target Compiler (XML, JSON, AST, SDK)   │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────────────────────┤
│  4. VERIFICATION  │ • Unit Tests for Serializer/AST  │ • Zero-Latency Reactive Token & Cost Breakdown │
└───────────────────┴──────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Core Functional Capabilities

### A. Section-Based Prompt Block Composer
- **Section Roles**:
  - `system`: Core persona, operating principles, and base behavioral constraints.
  - `instruction`: Concrete tasks, step-by-step reasoning triggers, and logic steps.
  - `context`: Grounding material, codebase structures, user state, and references.
  - `constraint`: Negative guardrails, safety rules, and anti-hallucination checks.
  - `few-shot`: High-fidelity input/output demonstration pairs.
  - `output-format`: Strict output specifications (JSON Schemas, XML syntax, clean prose).
- **Block Controls**:
  - Drag and hotkey reordering (`▲` Up / `▼` Down).
  - Slug-based semantic XML tags (`<system>`, `<instructions>`, `<guardrails>`, etc.).
  - Non-destructive `include` toggle (experiment without losing prompt content).
  - Live token count and character metrics calculated per individual block.
  - Inline variable detection (`{{user_query}}`, `{{language}}`, `{{schema}}`).

### B. Lexicon & Term Bank Autocomplete Engine (`Tab` / `Ctrl+K`)
- **Document & Lexicon Harvesting**:
  - Automatically extracts terms from existing prompt blocks and merges them with the curated Term Bank.
  - Curated categories: Role Personas, Chain-of-Thought Reasoning, Negative Guardrails, Format Contracts.
- **Tab Autocomplete**:
  - Pressing `Tab` inside any prompt block triggers auto-suggestions.
  - Bank terms rank above document terms; repeated `Tab` keypresses cycle through ranked candidates.
- **Term Bank Palette & Modal**:
  - Instant full-text search across predefined guardrails and custom terminology.
  - One-click insertion directly into the active cursor position or as a new prompt block.

### C. Live Dynamic Variable Matrix
- **Variable Detection**:
  - Automatically scans all active prompt sections for `{{var_name}}` patterns.
- **Interactive Playground**:
  - Allows the engineer to input sample test values for each detected variable.
  - Instantly toggles between **Raw Prompt Template** and **Live Interpolated Output**.

### D. Multi-Target Compiler & Token Inspector
- **Compilation Targets**:
  1. **Anthropic XML Format**: Clean tag-delimited format (`<system>...</system><instructions>...</instructions>`) favored by Claude 3.7 / Claude 3.5 Sonnet.
  2. **OpenAI Chat Messages JSON**: Structured array payload `[{ role: "system", content: "..." }, { role: "user", content: "..." }]`.
  3. **Gemini System Instruction AST**: Separated `systemInstruction` and user content parameters optimized for Gemini 2.5 Flash / Pro.
  4. **Raw / Markdown**: Direct concatenated document with configurable section separators.
  5. **Executable SDK Snippets**: Ready-to-copy Python (`anthropic`, `openai`, `google-genai`) and TypeScript code blocks.
- **Real-Time Token & Cost Estimator**:
  - Live token estimation based on character and subword heuristics.
  - Multi-model pricing matrix:
    - *Claude 3.7 Sonnet* ($3.00 / MTok)
    - *GPT-4o* ($2.50 / MTok)
    - *Gemini 2.5 Flash* ($0.075 / MTok)
    - *DeepSeek-R1* ($0.55 / MTok)
  - Visual context window utilization bar.

---

## 4. Workspace Portability & Storage

- **Local Storage Zero-Latency Cache**:
  - Automatic persistence of prompts, draft state, custom term bank entries, and variable values.
- **Export & Backup**:
  - **Export JSON Workspace**: Complete machine-readable archive of all prompts, templates, and lexicon terms.
  - **Export XML File**: Direct `.xml` file download for the current active prompt.
  - **Export Markdown**: Clean `.md` file for documentation or repository check-in.
  - **Import Workspace**: Safe schema validation and restoration from any previous JSON backup.
