// PreToolUse hook for Bash and PowerShell.
// Denies inline scripts and any shell command that creates, changes or deletes
// files, so every file change goes through the Write/Edit tools and their hooks.

import { readFileSync } from 'node:fs'

const NULL_SINK = String.raw`(?:\/dev\/null|\$null|NUL)\b`

/** Shell syntax. Checked with quoted strings removed, so text inside quotes cannot trip them. */
const SYNTAX_RULES = [
  [/<</, 'heredoc or here-string'],
  [/\b(?:for|while|until)\b[^;]*;\s*do\b/, 'shell loop'],
  [/\b(?:node|deno|bun|python[\d.]*|py|perl|ruby|php)(?:\.exe)?\s+(?:-\w*[ecp]\b|--eval\b|--print\b|-(?:\s|$))/i, 'inline interpreter script'],
  [/\b(?:bash|sh|zsh|dash)\s+-\w*c\b/, 'inline shell script'],
  [/\bcmd(?:\.exe)?\s+\/c\b/i, 'inline cmd script'],
  [/\b(?:pwsh|powershell)(?:\.exe)?\b[^|;&]*\s-(?:c|command|e|ec|encodedcommand)\b/i, 'inline PowerShell script'],
  [/\b(?:Invoke-Expression|iex|eval)\b/i, 'evaluated script'],
  [new RegExp(String.raw`(?:^|[^-=<>])(?:\d|&)?>>?(?!&)\s*(?!${NULL_SINK})[^\s>&|;)]`), 'output redirected to a file'],
  [/(?:^|[;&|(]|\b(?:xargs|sudo|then|do)\s)\s*(?:rm|rmdir|mv|cp|touch|mkdir|truncate|ln|tee|del|erase|rd|md|ni|ri|copy|move|ren)\b/i, 'file command'],
  [/\b(?:sed\s+(?:-[a-z]*i|--in-place)|perl\s+-[a-z]*i)/i, 'in-place edit'],
  [/\b(?:Set-Content|Add-Content|Clear-Content|Out-File|Tee-Object|New-Item|Remove-Item|Move-Item|Copy-Item|Rename-Item|Export-\w+|Expand-Archive|Compress-Archive)\b/i, 'file cmdlet'],
  [/\bcurl\b[^|;&]*\s(?:-o|--output|--remote-name)\b|\bwget\b|-OutFile\b/i, 'download to a file'],
]

/** File-writing calls. Checked on the whole command, quotes included. */
const API_RULES = [
  [/\b(?:writeFile|appendFile|createWriteStream|rmSync|unlinkSync|mkdirSync|copyFileSync|renameSync|WriteAll(?:Text|Lines|Bytes)|AppendAllText)/, 'file-writing API call'],
]

const stripQuoted = (command) => command.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, '""')

function violation(command) {
  if (command.trim().includes('\n')) return 'multi-line script'
  const bare = stripQuoted(command)
  for (const [pattern, reason] of SYNTAX_RULES) if (pattern.test(bare)) return reason
  for (const [pattern, reason] of API_RULES) if (pattern.test(command)) return reason
  return null
}

const input = JSON.parse(readFileSync(0, 'utf8'))
const reason = violation(String(input.tool_input?.command ?? ''))

if (reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Blocked (${reason}). Shell commands may not run scripts or create, change or delete files. Use Write/Edit for files and run one plain command at a time.`,
    },
  }
  process.stdout.write(JSON.stringify(output))
}
