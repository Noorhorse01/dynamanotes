export type TemplateType =
  | 'blank'
  | 'squaredGrid'
  | 'lined'
  | 'dotGrid'
  | 'cornell'
  | 'darkBlank'
  | 'darkGrid';

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Notebook {
  id: string;
  title: string;
  folderId?: string | null;
  coverColor: string;
  coverStyle: string;
  pageCount: number;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Page {
  id: string;
  notebookId: string;
  pageNumber: number;
  template: TemplateType;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  time?: number;
}

export type ToolType =
  | 'lasso'
  | 'pen'
  | 'fountainPen'
  | 'highlighter'
  | 'eraser'
  | 'shape'
  | 'text'
  | 'laser';

export type EraserMode = 'stroke' | 'standard' | 'highlighterOnly';

export interface Stroke {
  id: string;
  pageId: string;
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  points: StrokePoint[];
  isShape: boolean;
  shapeType?: string | null;
  createdAt: number;
}

export interface ToolSettings {
  activeTool: ToolType;
  penColor: string;
  penSize: number;
  fountainPenColor: string;
  fountainPenSize: number;
  highlighterColor: string;
  highlighterSize: number;
  eraserSize: number;
  eraserMode: EraserMode;
  autoDeselectEraser: boolean;
  shapeSnap: boolean;
  shapeFill: boolean;
  shapeFillColor: string;
  colorPresets: string[];
  sizePresets: number[];
}

export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}

export type ActiveView = 'library' | 'editor';
export type LibraryFilter = 'all' | 'notebooks' | 'folders' | 'favorites' | 'shared';
