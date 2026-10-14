use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use crate::db::Database;
use crate::models::{Page, Stroke, TemplateType};

#[tauri::command]
pub fn get_pages(notebook_id: String, db: State<Database>) -> Result<Vec<Page>, String> {
    db.get_pages(&notebook_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_page(
    notebook_id: String,
    template: Option<String>,
    width: Option<f64>,
    height: Option<f64>,
    db: State<Database>,
) -> Result<Page, String> {
    let pages = db.get_pages(&notebook_id).map_err(|e| e.to_string())?;
    let next_page_num = pages.len() + 1;

    let tpl = match template.as_deref() {
        Some("blank") => TemplateType::Blank,
        Some("lined") => TemplateType::Lined,
        Some("dotGrid") => TemplateType::DotGrid,
        Some("cornell") => TemplateType::Cornell,
        Some("darkBlank") => TemplateType::DarkBlank,
        Some("darkGrid") => TemplateType::DarkGrid,
        _ => TemplateType::SquaredGrid,
    };

    let page = Page {
        id: Uuid::new_v4().to_string(),
        notebook_id,
        page_number: next_page_num,
        template: tpl,
        width: width.unwrap_or(800.0),
        height: height.unwrap_or(1100.0),
        created_at: Utc::now().timestamp_millis(),
        updated_at: Utc::now().timestamp_millis(),
    };

    db.insert_page(&page).map_err(|e| e.to_string())?;
    Ok(page)
}

#[tauri::command]
pub fn delete_page(page_id: String, notebook_id: String, db: State<Database>) -> Result<(), String> {
    db.delete_page(&page_id, &notebook_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_strokes(page_id: String, db: State<Database>) -> Result<Vec<Stroke>, String> {
    db.get_strokes(&page_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_strokes(page_id: String, strokes: Vec<Stroke>, db: State<Database>) -> Result<(), String> {
    db.save_strokes(&page_id, &strokes).map_err(|e| e.to_string())
}
