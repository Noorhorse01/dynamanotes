use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use crate::db::Database;
use crate::models::{Folder, Notebook, Page, TemplateType};

#[tauri::command]
pub fn get_folders(db: State<Database>) -> Result<Vec<Folder>, String> {
    db.get_folders().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_folder(name: String, parent_id: Option<String>, color: Option<String>, db: State<Database>) -> Result<Folder, String> {
    let folder = Folder {
        id: Uuid::new_v4().to_string(),
        name,
        parent_id,
        color: color.unwrap_or_else(|| "#38bdf8".to_string()),
        created_at: Utc::now().timestamp_millis(),
        updated_at: Utc::now().timestamp_millis(),
    };
    db.insert_folder(&folder).map_err(|e| e.to_string())?;
    Ok(folder)
}

#[tauri::command]
pub fn delete_folder(id: String, db: State<Database>) -> Result<(), String> {
    db.delete_folder(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notebooks(db: State<Database>) -> Result<Vec<Notebook>, String> {
    db.get_notebooks().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notebook(id: String, db: State<Database>) -> Result<Option<Notebook>, String> {
    db.get_notebook(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_notebook(
    title: String,
    folder_id: Option<String>,
    cover_color: Option<String>,
    cover_style: Option<String>,
    template: Option<String>,
    db: State<Database>,
) -> Result<Notebook, String> {
    let now = Utc::now().timestamp_millis();
    let notebook_id = Uuid::new_v4().to_string();

    let notebook = Notebook {
        id: notebook_id.clone(),
        title,
        folder_id,
        cover_color: cover_color.unwrap_or_else(|| "#1e3a5f".to_string()),
        cover_style: cover_style.unwrap_or_else(|| "standard".to_string()),
        page_count: 1,
        is_favorite: false,
        created_at: now,
        updated_at: now,
    };
    db.insert_notebook(&notebook).map_err(|e| e.to_string())?;

    // Create initial page
    let tpl = match template.as_deref() {
        Some("squaredGrid") => TemplateType::SquaredGrid,
        Some("lined") => TemplateType::Lined,
        Some("dotGrid") => TemplateType::DotGrid,
        Some("cornell") => TemplateType::Cornell,
        Some("darkBlank") => TemplateType::DarkBlank,
        Some("darkGrid") => TemplateType::DarkGrid,
        _ => TemplateType::SquaredGrid, // default Goodnotes grid
    };

    let initial_page = Page {
        id: Uuid::new_v4().to_string(),
        notebook_id,
        page_number: 1,
        template: tpl,
        width: 800.0,
        height: 1100.0,
        created_at: now,
        updated_at: now,
    };
    db.insert_page(&initial_page).map_err(|e| e.to_string())?;

    Ok(notebook)
}

#[tauri::command]
pub fn update_notebook(notebook: Notebook, db: State<Database>) -> Result<Notebook, String> {
    let mut updated = notebook;
    updated.updated_at = Utc::now().timestamp_millis();
    db.update_notebook(&updated).map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
pub fn toggle_favorite(id: String, db: State<Database>) -> Result<bool, String> {
    let mut nb = db.get_notebook(&id).map_err(|e| e.to_string())?
        .ok_or_else(|| "Notebook not found".to_string())?;
    nb.is_favorite = !nb.is_favorite;
    nb.updated_at = Utc::now().timestamp_millis();
    db.update_notebook(&nb).map_err(|e| e.to_string())?;
    Ok(nb.is_favorite)
}

#[tauri::command]
pub fn delete_notebook(id: String, db: State<Database>) -> Result<(), String> {
    db.delete_notebook(&id).map_err(|e| e.to_string())
}
