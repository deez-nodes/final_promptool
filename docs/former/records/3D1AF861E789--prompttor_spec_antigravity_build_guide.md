# PromptTOR Studio — Product Specification & Antigravity Build Document

This document defines the architectural specification, data model, state machine, and the exact agent prompt required to construct **PromptTOR Studio** as an agent-driven build inside Google Antigravity.

---

## 1. Product Requirements Document (PRD)

### 1.1 Objective & Problem Statement
Engineers interacting with frontier LLMs switch constantly between formulating base system architectures and composing mid-task review responses. Existing chat interfaces enforce low-density layouts, lack dynamic block structuring, and require external tools to calculate token budgets and serialize prompts into machine-ready XML, JSON, or Markdown.

**PromptTOR** provides a high-density, low-latency prompt engineering environment focused on:
- Fast visual scanning via dark matte surfaces and semantic edge-rails.
- Dual-workflow switching between **Base Prompts** and **Mid-Task Iteration Replies**.
- Deterministic schema serialization (XML, Markdown, JSON AST).
- Zero-overhead desktop integration (global hotkey wake-up, system tray residence).

### 1.2 Target Personas & Workflows
- **Primary Persona:** AI Engineers, System Architects, and Prompt Engineers.
- **Workflow A (Base Prompt):** Rapid creation of hierarchical system prompts containing system directives, constraints, dynamic parameter slots (`{{var}}`), and contextual references.
- **Workflow B (Mid-Task Reply):** Side-by-side reference of an incoming agent message with structured response components: Agreements, In-Response-To citations, Proposed Edits, and Decision Gates.

---

## 2. Technical Architecture & Constraints

### 2.1 Stack Architecture
- **Runtime Target:** Tauri v2 (Rust backend shell) + Static Web Frontend (Vite / Tailwind CSS / Vanilla JS or Preact).
- **Alternative Target:** Self-contained single-file HTML/JS executable for direct local execution via Antigravity preview.
- **Storage Layer:** Local storage or local JSON file system persistence (`~/.prompttor/prompts.json`).
- **Memory Footprint:** $< 60\text{ MB}$ resident memory.
- **Hot-key Wake Latency:** $< 30\text{ ms}$ to foreground window.

### 2.2 Visual Design System (Terminal-Grade Utilitarian)
- **Base Canvas:** Surface matte `#090d12` (zinc-950 equivalent); cards at `#0f151e`.
- **Borders:** High-definition 1px lines (`#1b2637`); zero soft ambient blur or smoked translucent overlays.
- **Left-Rail Semantic Accent Rules:**
  - `<system>` / Core Identity: **Emerald** (`#10b981`)
  - `<instructions>` / In-Response-To: **Cyan** (`#06b6d4`)
  - `<parameters>` / Proposed Edits: **Amber** (`#f59e0b`)
  - `<context>` / Questions & Gates: **Violet** (`#8b5cf6`)
  - Critical Stop / Overrides: **Rose** (`#f43f5e`)
- **Typography:** Fixed-width tabular figures (`JetBrains Mono`, `Fira Code`) for counters and tags; system sans-serif (`Inter`, `system-ui`) for long-form prompt editing.

---

## 3. Data Schema & Serialization Specification

### 3.1 Data Model (TypeScript Definition)
```typescript
export type SectionType = 'system' | 'instructions' | 'parameters' | 'context' | 'in_response_to' | 'agreements' | 'proposed_edits' | 'questions';

export interface PromptSection {
  id: string;
  tag: string;
  label: string;
  color: 'emerald' | 'cyan' | 'amber' | 'violet' | 'rose';
  symbol: string;
  content?: string;
  points?: string[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  type: 'base' | 'midtask';
  tags: string;
  theirReply?: string;
  sections: PromptSection[];
  createdAt: number;
  updatedAt: number;
}
```

### 3.2 Output Compilers

#### XML Dialect
```xml
<system>
  You are a Principal Software Engineer.
</system>

<instructions>
  1. Structure all code outputs in single-file deliverables.
</instructions>
```

#### Markdown Dialect
```markdown
### SYSTEM
You are a Principal Software Engineer.

### INSTRUCTIONS
- Structure all code outputs in single-file deliverables.
```

#### JSON Dialect
```json
{
  "template": "Full-Stack Software Architect",
  "sections": [
    { "tag": "system", "body": "You are a Principal Software Engineer." }
  ]
}
```

---

## 4. Spec-Driven Implementation Tasks

1. **Phase 1: Shell & State Layer**
   - Implement storage service using `localStorage` with fallback to in-memory state.
   - Set up reactive state store for active prompt, current mode (`base` vs `midtask`), and compilation format (`xml`, `markdown`, `json`).

2. **Phase 2: High-Density Canvas Components**
   - Build section rendering engine supporting both single textarea blocks and dynamic numbered list items (`01`, `02`, `03`).
   - Implement live parameter interpolation (`{{target_language}}`).
   - Build the reference-only "Their reply" pinned block for mid-task mode.

3. **Phase 3: Telemetry Engine**
   - Character count: Real-time string length monitoring.
   - Token estimation heuristic: $\text{Tokens} \approx \lceil \frac{\text{Chars}}{3.8} \rceil$.
   - Cost projection: $\text{Cost} = \text{Tokens} \times 0.000003$.

4. **Phase 4: Output Inspector & Native Bridges**
   - Real-time compiler running on every input event.
   - Clipboard integration with notification toast.
   - Global keyboard shortcuts (`Ctrl+Enter` / `Cmd+Enter` to copy active compiled prompt).

---

## 5. Master Prompt for Google Antigravity

Copy and paste the block below directly into Antigravity to scaffold or extend the project:

```text
/goal Build the PromptTOR Studio prompt architect application as a production-ready, self-contained desktop web tool.

CONTEXT & SPECIFICATION:
Read the technical design requirements below before modifying files or running commands:

1. PALETTE & AESTHETIC DISCIPLINE:
   - Base canvas: Dark matte charcoal (#090d12, #0f151e).
   - High-contrast 1px borders (#1b2637) with sharp 2px-4px border radii.
   - Strict left-rail accent system (3px border-left) to encode semantic roles:
     * System / Core Identity: Emerald (#10b981)
     * Instructions / In-Response-To: Cyan (#06b6d4)
     * Parameters / Proposed Edits: Amber (#f59e0b)
     * Context / Questions & Decisions: Violet (#8b5cf6)
   - Do NOT use low-contrast blue/purple washes, translucent frosted glass, or oversized padding.

2. CORE CAPABILITIES:
   - Dual-Mode Switcher:
     * "Base prompt" mode: Standard hierarchical prompt blocks with parameter slots.
     * "Mid-task reply" mode: Pinned reference box ("Their reply") + structured sub-point arrays (01, 02, etc.).
   - Live Output Inspector:
     * Real-time compiled output panel updating simultaneously with user input.
     * Instant toggle between XML, Markdown, and JSON formats.
     * Variable interpolation toggle for {{variables}}.
   - Telemetry Bar:
     * Live token count (~Chars / 3.8).
     * Character count and estimated cost per run calculation.
   - Desktop Ergonomics:
     * Keyboard shortcut Ctrl+Enter (or Cmd+Enter) copies the compiled output directly to the system clipboard.
     * Library search bar with filter capability.
     * Add/remove/reorder section blocks dynamically.

VERIFICATION STEPS:
1. Validate that switching between "Base prompt" and "Mid-task reply" swaps the canvas and inspector output immediately.
2. Confirm that editing text inside any section instantly recalculates the token counter and updates the compiled inspector panel.
3. Test XML, Markdown, and JSON serialization toggles to verify valid syntax structure.
4. Verify clipboard copy behavior on Ctrl+Enter.
```