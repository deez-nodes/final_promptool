/**
 * Paste from file: DECIDED.md "What it is", "File uploads from the side are allowed".
 *
 * The user picks one local text file; its text goes INTO the app as points of the focused
 * section (or of a new untyped section named after the file when none is focused). Nothing is
 * written anywhere: this only reads.
 *
 * Desktop (Tauri v2): @tauri-apps/plugin-dialog `open` picks the file and
 * @tauri-apps/plugin-fs `readTextFile` reads it (capability: dialog:allow-open,
 * fs:allow-read-text-file under $HOME). Browser build: a hidden `<input type="file">`, read
 * with FileReader.
 */

const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'text', 'xml', 'csv', 'log']
const ACCEPT = TEXT_EXTENSIONS.map(e => '.' + e).join(',') + ',text/plain,text/markdown'

const inTauri = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

const baseName = (path: string): string => {
  const name = path.split(/[\\/]/).pop() || path
  return name.replace(/\.[^.]+$/, '') || name
}

/** Desktop: the native open dialog, then a read-only text read. Null when cancelled. */
async function pickInTauri(): Promise<{ name: string; text: string } | null> {
  const { open } = await import('@tauri-apps/plugin-dialog')
  const picked = await open({
    multiple: false,
    directory: false,
    title: 'Paste from file',
    filters: [{ name: 'Text', extensions: TEXT_EXTENSIONS }]
  })
  const path = Array.isArray(picked) ? picked[0] : picked
  if (!path) return null
  const { readTextFile } = await import('@tauri-apps/plugin-fs')
  return { name: baseName(path), text: await readTextFile(path) }
}

/** Browser: a hidden file input, read with FileReader. Null when cancelled. */
function pickInBrowser(): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ACCEPT
    input.hidden = true
    input.id = 'paste-file-input'
    const done = () => input.remove()
    input.addEventListener('cancel', () => {
      done()
      resolve(null)
    })
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      done()
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ name: baseName(file.name), text: String(reader.result ?? '') })
      reader.onerror = () => reject(reader.error ?? new Error('could not read the file'))
      reader.readAsText(file)
    })
    document.getElementById('paste-file-input')?.remove()
    document.body.appendChild(input)
    input.click()
  })
}

export function useFilePaste() {
  const store = useWorkspace()

  /**
   * Pick a file and paste its lines as points into `sectionId` (default: the focused section),
   * or into a new untyped section named after the file when there is none.
   */
  const pasteFromFile = async (sectionId: string | null = store.focusedId.value): Promise<boolean> => {
    const target = sectionId && store.ws.value.conversation.some(d => d.sections.some(s => s.id === sectionId)) ? sectionId : null
    try {
      const file = inTauri() ? await pickInTauri() : await pickInBrowser()
      if (!file) return false
      return store.pastePoints(file.text, target, file.name)
    } catch (e) {
      store.notice.value = 'Could not read the file: ' + ((e as Error)?.message || String(e))
      return false
    }
  }

  return { pasteFromFile }
}
