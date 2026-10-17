export const inTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export async function copyText(text: string): Promise<void> {
  if (inTauri()) {
    const { writeText } = await import('@tauri-apps/plugin-clipboard-manager')
    await writeText(text)
    return
  }
  await navigator.clipboard.writeText(text)
}

const KEY = 'promptor.state.v1'
const FILE = 'state.json'

export async function loadState(): Promise<string | null> {
  if (inTauri()) {
    try {
      const fs = await import('@tauri-apps/plugin-fs')
      if (await fs.exists(FILE, { baseDir: fs.BaseDirectory.AppData })) {
        return await fs.readTextFile(FILE, { baseDir: fs.BaseDirectory.AppData })
      }
      return null
    } catch (e) {
      console.warn('tauri fs load failed, using localStorage', e)
    }
  }
  return localStorage.getItem(KEY)
}

export async function saveState(json: string): Promise<void> {
  localStorage.setItem(KEY, json)
  if (inTauri()) {
    try {
      const fs = await import('@tauri-apps/plugin-fs')
      if (!(await fs.exists('', { baseDir: fs.BaseDirectory.AppData }))) {
        await fs.mkdir('', { baseDir: fs.BaseDirectory.AppData, recursive: true })
      }
      await fs.writeTextFile(FILE, json, { baseDir: fs.BaseDirectory.AppData })
    } catch (e) {
      console.warn('tauri fs save failed', e)
    }
  }
}

/** Pick text files from disk. Returns [name, contents]. */
export async function pickTextFiles(): Promise<[string, string][]> {
  if (inTauri()) {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const fs = await import('@tauri-apps/plugin-fs')
    const picked = await open({ multiple: true })
    const paths = Array.isArray(picked) ? picked : picked ? [picked] : []
    const out: [string, string][] = []
    for (const p of paths) out.push([p.split(/[\\/]/).pop() ?? p, await fs.readTextFile(p)])
    return out
  }
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async () => {
      const files = Array.from(input.files ?? [])
      resolve(await Promise.all(files.map(async (f) => [f.name, await f.text()] as [string, string])))
    }
    input.click()
  })
}
