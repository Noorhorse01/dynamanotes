use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use crate::db::Database;
use crate::models::{ExportPayload, Notebook, PageWithStrokes};

#[tauri::command]
pub fn export_notebook_json(notebook_id: String, db: State<Database>) -> Result<String, String> {
    let notebook = db.get_notebook(&notebook_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Notebook not found".to_string())?;

    let pages = db.get_pages(&notebook_id).map_err(|e| e.to_string())?;
    let mut pages_with_strokes = Vec::new();

    for page in pages {
        let strokes = db.get_strokes(&page.id).map_err(|e| e.to_string())?;
        pages_with_strokes.push(PageWithStrokes { page, strokes });
    }

    let payload = ExportPayload {
        notebook,
        pages: pages_with_strokes,
        exported_at: Utc::now().timestamp_millis(),
        app_version: "1.0.0".to_string(),
    };

    serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_notebook_json(json_content: String, db: State<Database>) -> Result<Notebook, String> {
    let payload: ExportPayload = serde_json::from_str(&json_content)
        .map_err(|e| format!("Invalid notebook format: {}", e))?;

    let now = Utc::now().timestamp_millis();
    let new_nb_id = Uuid::new_v4().to_string();

    let mut notebook = payload.notebook;
    notebook.id = new_nb_id.clone();
    notebook.title = format!("{} (Imported)", notebook.title);
    notebook.created_at = now;
    notebook.updated_at = now;

    db.insert_notebook(&notebook).map_err(|e| e.to_string())?;

    for pws in payload.pages {
        let new_page_id = Uuid::new_v4().to_string();
        let mut page = pws.page;
        page.id = new_page_id.clone();
        page.notebook_id = new_nb_id.clone();
        page.created_at = now;
        page.updated_at = now;

        db.insert_page(&page).map_err(|e| e.to_string())?;

        let strokes: Vec<_> = pws.strokes
            .into_iter()
            .map(|mut s| {
                s.id = Uuid::new_v4().to_string();
                s.page_id = new_page_id.clone();
                s
            })
            .collect();

        db.save_strokes(&new_page_id, &strokes).map_err(|e| e.to_string())?;
    }

    Ok(notebook)
}
