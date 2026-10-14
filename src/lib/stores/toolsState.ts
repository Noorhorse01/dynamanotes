import { writable } from 'svelte/store';
import type { ToolSettings, ToolType } from '../types';

export const initialToolSettings: ToolSettings = {
  activeTool: 'pen',
  penColor: '#000000',
  penSize: 3,
  fountainPenColor: '#1d4ed8',
  fountainPenSize: 3.5,
  highlighterColor: '#facc15', // Neon yellow highlighter
  highlighterSize: 18,
  eraserSize: 16,
  eraserMode: 'stroke',
  autoDeselectEraser: false,
  shapeSnap: true,
  shapeFill: false,
  shapeFillColor: '#93c5fd',
  // GoodNotes style quick color presets
  colorPresets: [
    '#000000', // Black
    '#2563eb', // Royal Blue
    '#dc2626', // Crimson Red
    '#059669', // Emerald Green
    '#7c3aed', // Purple
    '#ea580c', // Orange
  ],
  // 3 thickness presets (Thin, Medium, Bold)
  sizePresets: [2, 4, 8],
};

export const toolSettings = writable<ToolSettings>(initialToolSettings);

export function selectTool(tool: ToolType) {
  toolSettings.update((s) => ({ ...s, activeTool: tool }));
}

export function setPenColor(color: string) {
  toolSettings.update((s) => ({
    ...s,
    penColor: color,
    fountainPenColor: color,
  }));
}

export function setPenSize(size: number) {
  toolSettings.update((s) => ({
    ...s,
    penSize: size,
    fountainPenSize: size * 1.15,
  }));
}

export function setHighlighterColor(color: string) {
  toolSettings.update((s) => ({ ...s, highlighterColor: color }));
}

export function setHighlighterSize(size: number) {
  toolSettings.update((s) => ({ ...s, highlighterSize: size }));
}

export function setEraserMode(mode: 'stroke' | 'standard' | 'highlighterOnly') {
  toolSettings.update((s) => ({ ...s, eraserMode: mode }));
}
