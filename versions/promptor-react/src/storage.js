import { initialState, validateState, convertLegacy } from './model.js';
export const STORAGE_KEY = 'promptor.react.local.v1';
export function readState(storage) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
    return { state: raw ? validateState(JSON.parse(raw)) : initialState(), error: '', blocked: false, raw: '' };
  } catch {
    return { state: initialState(), error: 'Browser data could not be read. It has not been overwritten. Export your work or import a valid backup.', blocked: true, raw: raw || '' };
  }
}
export function writeState(storage, state) { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
export function parseImport(text) {
  const value = JSON.parse(text);
  return value?.docs ? convertLegacy(value) : validateState(value);
}
export function download(filename, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* file: clipboard fallback */ }
  const previous = document.activeElement;
  const field = document.createElement('textarea'); field.value = text; field.className = 'clipboard-fallback';
  document.body.append(field); field.select();
  let success = false;
  try { success = document.execCommand('copy'); } catch { /* report failure to the caller */ }
  field.remove(); previous?.focus(); return success;
}
