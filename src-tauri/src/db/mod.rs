use std::path::PathBuf;
use std::sync::Mutex;
use rusqlite::{params, Connection, Result};
use chrono::Utc;
use crate::models::{Folder, Notebook, Page, Stroke, TemplateType, ToolType};

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        let conn = Connection::open(&db_path)?;
        
        // Performance optimizations
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;"
        )?;

        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT,
                color TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS notebooks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                folder_id TEXT,
                cover_color TEXT NOT NULL,
                cover_style TEXT NOT NULL DEFAULT 'standard',
                page_count INTEGER NOT NULL DEFAULT 1,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS pages (
                id TEXT PRIMARY KEY,
                notebook_id TEXT NOT NULL,
                page_number INTEGER NOT NULL,
                template TEXT NOT NULL,
                width REAL NOT NULL,
                height REAL NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS strokes (
                id TEXT PRIMARY KEY,
                page_id TEXT NOT NULL,
                tool TEXT NOT NULL,
                color TEXT NOT NULL,
                size REAL NOT NULL,
                opacity REAL NOT NULL,
                points_json TEXT NOT NULL,
                is_shape INTEGER NOT NULL DEFAULT 0,
                shape_type TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_notebooks_folder ON notebooks(folder_id);
            CREATE INDEX IF NOT EXISTS idx_pages_notebook ON pages(notebook_id);
            CREATE INDEX IF NOT EXISTS idx_strokes_page ON strokes(page_id);
            "
        )?;
        Ok(())
    }

    // Folders
    pub fn get_folders(&self) -> Result<Vec<Folder>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, parent_id, color, created_at, updated_at FROM folders ORDER BY name ASC")?;
        let rows = stmt.query_map([], |row| {
            Ok(Folder {
                id: row.get(0)?,
                name: row.get(1)?,
                parent_id: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;

        let mut folders = Vec::new();
        for folder in rows {
            folders.push(folder?);
        }
        Ok(folders)
    }

    pub fn insert_folder(&self, folder: &Folder) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO folders (id, name, parent_id, color, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![folder.id, folder.name, folder.parent_id, folder.color, folder.created_at, folder.updated_at],
        )?;
        Ok(())
    }

    pub fn delete_folder(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM folders WHERE id = ?1", params![id])?;
        Ok(())
    }

    // Notebooks
    pub fn get_notebooks(&self) -> Result<Vec<Notebook>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, folder_id, cover_color, cover_style, page_count, is_favorite, created_at, updated_at 
             FROM notebooks ORDER BY updated_at DESC"
        )?;
        let rows = stmt.query_map([], |row| {
            let fav_int: i32 = row.get(6)?;
            Ok(Notebook {
                id: row.get(0)?,
                title: row.get(1)?,
                folder_id: row.get(2)?,
                cover_color: row.get(3)?,
                cover_style: row.get(4)?,
                page_count: row.get(5)?,
                is_favorite: fav_int != 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;

        let mut notebooks = Vec::new();
        for nb in rows {
            notebooks.push(nb?);
        }
        Ok(notebooks)
    }

    pub fn get_notebook(&self, id: &str) -> Result<Option<Notebook>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, folder_id, cover_color, cover_style, page_count, is_favorite, created_at, updated_at 
             FROM notebooks WHERE id = ?1"
        )?;
        let mut rows = stmt.query_map(params![id], |row| {
            let fav_int: i32 = row.get(6)?;
            Ok(Notebook {
                id: row.get(0)?,
                title: row.get(1)?,
                folder_id: row.get(2)?,
                cover_color: row.get(3)?,
                cover_style: row.get(4)?,
                page_count: row.get(5)?,
                is_favorite: fav_int != 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;

        if let Some(row) = rows.next() {
            Ok(Some(row?))
        } else {
            Ok(None)
        }
    }

    pub fn insert_notebook(&self, nb: &Notebook) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO notebooks (id, title, folder_id, cover_color, cover_style, page_count, is_favorite, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                nb.id,
                nb.title,
                nb.folder_id,
                nb.cover_color,
                nb.cover_style,
                nb.page_count,
                if nb.is_favorite { 1 } else { 0 },
                nb.created_at,
                nb.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn update_notebook(&self, nb: &Notebook) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE notebooks SET title = ?1, folder_id = ?2, cover_color = ?3, cover_style = ?4, 
             page_count = ?5, is_favorite = ?6, updated_at = ?7 WHERE id = ?8",
            params![
                nb.title,
                nb.folder_id,
                nb.cover_color,
                nb.cover_style,
                nb.page_count,
                if nb.is_favorite { 1 } else { 0 },
                nb.updated_at,
                nb.id
            ],
        )?;
        Ok(())
    }

    pub fn delete_notebook(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM notebooks WHERE id = ?1", params![id])?;
        Ok(())
    }

    // Pages
    pub fn get_pages(&self, notebook_id: &str) -> Result<Vec<Page>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, notebook_id, page_number, template, width, height, created_at, updated_at 
             FROM pages WHERE notebook_id = ?1 ORDER BY page_number ASC"
        )?;
        let rows = stmt.query_map(params![notebook_id], |row| {
            let tpl_str: String = row.get(3)?;
            let template = match tpl_str.as_str() {
                "squaredGrid" => TemplateType::SquaredGrid,
                "lined" => TemplateType::Lined,
                "dotGrid" => TemplateType::DotGrid,
                "cornell" => TemplateType::Cornell,
                "darkBlank" => TemplateType::DarkBlank,
                "darkGrid" => TemplateType::DarkGrid,
                _ => TemplateType::Blank,
            };
            Ok(Page {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                page_number: row.get(2)?,
                template,
                width: row.get(4)?,
                height: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?;

        let mut pages = Vec::new();
        for page in rows {
            pages.push(page?);
        }
        Ok(pages)
    }

    pub fn insert_page(&self, page: &Page) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let tpl_str = match page.template {
            TemplateType::SquaredGrid => "squaredGrid",
            TemplateType::Lined => "lined",
            TemplateType::DotGrid => "dotGrid",
            TemplateType::Cornell => "cornell",
            TemplateType::DarkBlank => "darkBlank",
            TemplateType::DarkGrid => "darkGrid",
            TemplateType::Blank => "blank",
        };
        conn.execute(
            "INSERT INTO pages (id, notebook_id, page_number, template, width, height, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                page.id,
                page.notebook_id,
                page.page_number,
                tpl_str,
                page.width,
                page.height,
                page.created_at,
                page.updated_at
            ],
        )?;

        // update page count in notebook
        conn.execute(
            "UPDATE notebooks SET page_count = (SELECT COUNT(*) FROM pages WHERE notebook_id = ?1), updated_at = ?2 WHERE id = ?1",
            params![page.notebook_id, Utc::now().timestamp_millis()],
        )?;

        Ok(())
    }

    pub fn delete_page(&self, id: &str, notebook_id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM pages WHERE id = ?1", params![id])?;
        conn.execute(
            "UPDATE notebooks SET page_count = (SELECT COUNT(*) FROM pages WHERE notebook_id = ?1), updated_at = ?2 WHERE id = ?1",
            params![notebook_id, Utc::now().timestamp_millis()],
        )?;
        Ok(())
    }

    // Strokes
    pub fn get_strokes(&self, page_id: &str) -> Result<Vec<Stroke>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, page_id, tool, color, size, opacity, points_json, is_shape, shape_type, created_at 
             FROM strokes WHERE page_id = ?1 ORDER BY created_at ASC"
        )?;
        let rows = stmt.query_map(params![page_id], |row| {
            let tool_str: String = row.get(2)?;
            let tool = match tool_str.as_str() {
                "fountainPen" => ToolType::FountainPen,
                "highlighter" => ToolType::Highlighter,
                "eraser" => ToolType::Eraser,
                "shape" => ToolType::Shape,
                "lasso" => ToolType::Lasso,
                "text" => ToolType::Text,
                _ => ToolType::Pen,
            };
            let points_json: String = row.get(6)?;
            let points = serde_json::from_str(&points_json).unwrap_or_default();
            let is_shape_int: i32 = row.get(7)?;

            Ok(Stroke {
                id: row.get(0)?,
                page_id: row.get(1)?,
                tool,
                color: row.get(3)?,
                size: row.get(4)?,
                opacity: row.get(5)?,
                points,
                is_shape: is_shape_int != 0,
                shape_type: row.get(8)?,
                created_at: row.get(9)?,
            })
        })?;

        let mut strokes = Vec::new();
        for stroke in rows {
            strokes.push(stroke?);
        }
        Ok(strokes)
    }

    pub fn save_strokes(&self, page_id: &str, strokes: &[Stroke]) -> Result<()> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()?;

        tx.execute("DELETE FROM strokes WHERE page_id = ?1", params![page_id])?;

        for stroke in strokes {
            let tool_str = match stroke.tool {
                ToolType::FountainPen => "fountainPen",
                ToolType::Highlighter => "highlighter",
                ToolType::Eraser => "eraser",
                ToolType::Shape => "shape",
                ToolType::Lasso => "lasso",
                ToolType::Text => "text",
                ToolType::Pen => "pen",
            };
            let points_json = serde_json::to_string(&stroke.points).unwrap_or_else(|_| "[]".to_string());
            tx.execute(
                "INSERT INTO strokes (id, page_id, tool, color, size, opacity, points_json, is_shape, shape_type, created_at) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                params![
                    stroke.id,
                    stroke.page_id,
                    tool_str,
                    stroke.color,
                    stroke.size,
                    stroke.opacity,
                    points_json,
                    if stroke.is_shape { 1 } else { 0 },
                    stroke.shape_type,
                    stroke.created_at
                ],
            )?;
        }

        // update page updated_at
        tx.execute(
            "UPDATE pages SET updated_at = ?1 WHERE id = ?2",
            params![Utc::now().timestamp_millis(), page_id],
        )?;

        tx.commit()?;
        Ok(())
    }
}
