pub mod db;
pub mod models;
pub mod commands;

use std::path::PathBuf;
use tauri::Manager;
use db::Database;

fn get_db_path() -> PathBuf {
    if let Some(mut path) = dirs::data_dir() {
        path.push("com.dynamanotes.app");
        path.push("dynamanotes.db");
        path
    } else {
        PathBuf::from("dynamanotes.db")
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = get_db_path();
    let database = Database::new(db_path)
        .unwrap_or_else(|_| Database::new_in_memory().expect("Failed to initialize in-memory SQLite"));

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(database)
        .invoke_handler(tauri::generate_handler![
            commands::get_folders,
            commands::create_folder,
            commands::delete_folder,
            commands::get_notebooks,
            commands::get_notebook,
            commands::create_notebook,
            commands::update_notebook,
            commands::toggle_favorite,
            commands::delete_notebook,
            commands::get_pages,
            commands::add_page,
            commands::delete_page,
            commands::get_strokes,
            commands::save_strokes,
            commands::export_notebook_json,
            commands::import_notebook_json,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                // Optionally open devtools in debug
                // window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DynamaNotes application");
}
