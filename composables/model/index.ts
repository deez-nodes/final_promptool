// Package D2: data model and XML output. Plain TypeScript, no framework imports, no I/O.
// Implements DECIDED.md "What it is" L7-L15 and L17, Layout L23-L24 and L28,
// "Colour and type" L34-L42. See each module's header for the exact lines.
//
// Names avoid the auto-imports composables/usePromptStore.ts already exports (newSection,
// cloneSection, toXml, newId, slugTag …), because Nuxt also auto-imports this index file.

export * from './types'
export * from './skeletons'
export * from './points'
export * from './xml'
export * from './doc'
export * from './reuse'
export * from './undo'
