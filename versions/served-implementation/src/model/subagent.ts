/**
 * Pure model layer for Subagent Work Packets (SWPs).
 * Enables decomposition of heavy Pro-model asks into bounded, contract-driven context units
 * that execute reliably across models (e.g. Gemini Flash, Claude Haiku, local LLMs).
 */

export type ModelTier = 'pro' | 'worker' | 'fast'
export type SubagentRole = 'investigator' | 'coder' | 'reviewer' | 'tester'

export interface BoundaryContract {
  readFiles: string[]
  writeFiles: string[]
  forbiddenActions: string[]
  tokenBudget: number
}

export interface ContextSnippet {
  path: string
  lines?: string
  content: string
}

export interface OutputContract {
  format: 'diff' | 'numbered_points' | 'json_schema' | 'xml_tags'
  schemaDescription: string
}

export interface SubagentWorkPacket {
  id: string
  parentTaskId?: string
  tier: ModelTier
  role: SubagentRole
  title: string
  objective: string
  boundaries: BoundaryContract
  contextSnippets: ContextSnippet[]
  outputContract: OutputContract
  verificationCommand?: string
  status?: 'pending' | 'dispatched' | 'completed' | 'failed'
}

/**
 * Serializes an SWP into a clean, rootless XML context packet that any LLM can parse
 * without ambiguity or prompt dilution.
 */
export function compileSubagentPacket(packet: SubagentWorkPacket): string {
  const lines: string[] = [
    `<subagent_packet id="${packet.id}" role="${packet.role}" tier="${packet.tier}">`,
    `  <title>${escapeXml(packet.title)}</title>`,
    `  <objective>${escapeXml(packet.objective)}</objective>`,
    `  <boundaries>`,
    `    <read_files>${packet.boundaries.readFiles.join(', ') || 'none'}</read_files>`,
    `    <write_files>${packet.boundaries.writeFiles.join(', ') || 'none'}</write_files>`,
    `    <forbidden>`,
    ...packet.boundaries.forbiddenActions.map((f) => `      <rule>${escapeXml(f)}</rule>`),
    `    </forbidden>`,
    `    <token_budget max="${packet.boundaries.tokenBudget}" />`,
    `  </boundaries>`,
  ]

  if (packet.contextSnippets.length) {
    lines.push(`  <context>`)
    for (const c of packet.contextSnippets) {
      const lineAttr = c.lines ? ` lines="${c.lines}"` : ''
      lines.push(`    <file path="${escapeXml(c.path)}"${lineAttr}>`)
      lines.push(c.content.trim())
      lines.push(`    </file>`)
    }
    lines.push(`  </context>`)
  }

  lines.push(
    `  <output_contract format="${packet.outputContract.format}">`,
    `    ${escapeXml(packet.outputContract.schemaDescription)}`,
    `  </output_contract>`,
  )

  if (packet.verificationCommand) {
    lines.push(`  <verification_command>${escapeXml(packet.verificationCommand)}</verification_command>`)
  }

  lines.push(`</subagent_packet>`)
  return lines.join('\n')
}

/**
 * Splits a broad high-level task into standard SWPs:
 * 1. An Investigation packet (scoped read-only reconnaissance)
 * 2. A Core Implementation packet (narrow write boundary)
 * 3. A Verification packet (clean verification check)
 */
export function decomposeTaskIntoPackets(
  taskId: string,
  taskTitle: string,
  objective: string,
  targetFiles: string[],
): SubagentWorkPacket[] {
  const invPacket: SubagentWorkPacket = {
    id: `${taskId}-01-inv`,
    parentTaskId: taskId,
    tier: 'fast',
    role: 'investigator',
    title: `Investigate: ${taskTitle}`,
    objective: `Examine target interfaces in ${targetFiles.join(', ')} and identify exact line numbers/types needed for ${objective}.`,
    boundaries: {
      readFiles: targetFiles,
      writeFiles: [],
      forbiddenActions: ['Do not edit any files', 'Do not run modifying commands', 'Do not suggest unrelated refactors'],
      tokenBudget: 600,
    },
    contextSnippets: [],
    outputContract: {
      format: 'numbered_points',
      schemaDescription: 'Return a concise numbered list of target functions, signatures, and line boundaries.',
    },
  }

  const codePacket: SubagentWorkPacket = {
    id: `${taskId}-02-code`,
    parentTaskId: taskId,
    tier: 'worker',
    role: 'coder',
    title: `Implement: ${taskTitle}`,
    objective: `Apply minimal, targeted changes to achieve: ${objective}.`,
    boundaries: {
      readFiles: targetFiles,
      writeFiles: targetFiles,
      forbiddenActions: [
        'Do not touch files outside write_files',
        'Do not add unasked npm dependencies or database layers',
        'Preserve all existing non-target comments and types',
      ],
      tokenBudget: 1200,
    },
    contextSnippets: [],
    outputContract: {
      format: 'diff',
      schemaDescription: 'Return a standard unified diff against the targeted files only.',
    },
    verificationCommand: 'npm run build',
  }

  const testPacket: SubagentWorkPacket = {
    id: `${taskId}-03-verify`,
    parentTaskId: taskId,
    tier: 'fast',
    role: 'tester',
    title: `Verify: ${taskTitle}`,
    objective: `Verify that the implementation passes all type checks and satisfies: ${objective}.`,
    boundaries: {
      readFiles: targetFiles,
      writeFiles: [],
      forbiddenActions: ['Do not modify implementation code'],
      tokenBudget: 400,
    },
    contextSnippets: [],
    outputContract: {
      format: 'numbered_points',
      schemaDescription: 'Report PASS/FAIL with any error logs or confirmation of successful test output.',
    },
    verificationCommand: 'npm run build',
  }

  return [invPacket, codePacket, testPacket]
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
