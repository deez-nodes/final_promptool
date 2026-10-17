# prompTOR Desktop

Tauri v2 app: your files + editor on the left, a real terminal running **Claude Code** on the right.
When Claude edits files, the tree and open file refresh live (filesystem watcher).

## One-time setup (Windows)

1. **Rust** — install via https://rustup.rs (run `rustup-init.exe`, accept defaults).
2. **Microsoft C++ Build Tools** — rustup will prompt for them; otherwise install
   "Desktop development with C++" from the Visual Studio Build Tools installer.
   (WebView2 is preinstalled on Windows 11.)
3. Restart your terminal so `cargo` is on PATH.

## Run

```powershell
cd C:\Dev\WorkflowTemplate\promptor-desktop
npm install
npm run tauri dev
```

First build compiles Tauri from source — expect several minutes. After that it's seconds.

## Use

- `⌂ Open Folder` — mount your vault/repo. The shell (PowerShell) spawns cwd'd there.
- `▶ Claude` — types `claude` into the shell; talk to Claude Code in the right pane.
- Left: file tree (click folder = expand + becomes new-file target). Editor autosaves
  800 ms after you stop typing; Ctrl+S forces. VIM toggle = same modal subset as promptor.html.
- Claude's edits appear automatically: tree rescans, and the open file reloads
  (unless you have unsaved edits — then you get a warning toast instead).

## Build a real .exe

```powershell
npm run tauri build
```
Installer lands in `src-tauri/target/release/bundle/`.

## Notes / known limits

- Rust side was written blind (no Windows toolchain in the sandbox that generated it).
  If `cargo` complains about a portable-pty or tauri API mismatch, the fix is almost
  certainly one-line; paste the error back into Claude.
- File pane treats everything as text; binaries show an error toast.
- Prompt-template editor (promptor.html) port is slice 2 — planned, not included.
