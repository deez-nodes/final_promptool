# src-tauri: prompTOR desktop wrapper

Tauri v2 shell around the Nuxt app (DECIDED.md: desktop app, Tauri v2, local only).

## Run

```sh
bun install
bun run tauri:dev     # starts `bun run dev` (Nuxt, port 3000) and opens the window
bun run tauri:build   # runs `bun run generate`, bundles ../.output/public
```

## Requirements

- Rust toolchain (`cargo`, `rustc`; stable via rustup).
- Tauri v2 system dependencies for your OS: on Linux, webkit2gtk-4.1 and friends
  (see https://v2.tauri.app/start/prerequisites/). macOS and Windows need only the
  platform toolchain (Xcode CLT / MSVC + WebView2).

The JavaScript side (`@tauri-apps/cli`, `@tauri-apps/api`) comes from `bun install`.

## What is here

- `tauri.conf.json`: window "main", titled prompTOR, 1500x950 (min 1000x600).
- `capabilities/default.json`: `core:default`, `dialog:allow-open`,
  `fs:allow-read-text-file` scoped to `$HOME/**`. That is enough to pick a local
  file and paste its contents. Nothing for network, no file writes.
- `src/lib.rs`: registers the dialog and fs plugins. No custom commands.
- `icons/`: carried over from the archived build.

## Effect on the web build

None. `bun run dev`, `bun run build` and `bun run generate` behave exactly as
before; this folder is only used by the `tauri*` scripts.
