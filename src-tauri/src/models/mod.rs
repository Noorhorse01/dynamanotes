use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub color: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Notebook {
    pub id: String,
    pub title: String,
    pub folder_id: Option<String>,
    pub cover_color: String,
    pub cover_style: String,
    pub page_count: usize,
    pub is_favorite: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum TemplateType {
    Blank,
    SquaredGrid,
    Lined,
    DotGrid,
    Cornell,
    DarkBlank,
    DarkGrid,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub id: String,
    pub notebook_id: String,
    pub page_number: usize,
    pub template: TemplateType,
    pub width: f64,
    pub height: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct StrokePoint {
    pub x: f64,
    pub y: f64,
    pub pressure: f64,
    pub time: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ToolType {
    Pen,
    FountainPen,
    Highlighter,
    Eraser,
    Shape,
    Lasso,
    Text,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Stroke {
    pub id: String,
    pub page_id: String,
    pub tool: ToolType,
    pub color: String,
    pub size: f64,
    pub opacity: f64,
    pub points: Vec<StrokePoint>,
    pub is_shape: bool,
    pub shape_type: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotebookDetail {
    pub notebook: Notebook,
    pub pages: Vec<Page>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageWithStrokes {
    pub page: Page,
    pub strokes: Vec<Stroke>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportPayload {
    pub notebook: Notebook,
    pub pages: Vec<PageWithStrokes>,
    pub exported_at: i64,
    pub app_version: String,
}
