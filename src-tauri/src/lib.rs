// No custom commands: the app is local only, with no model calls and no bridge.
// The dialog and fs plugins exist for "file uploads from the side":
// pick a local file and read its text into the editor.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
