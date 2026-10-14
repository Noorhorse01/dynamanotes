import type { Page, Stroke, StrokePoint, ToolSettings, ViewportTransform } from '../types';
import { detectShape, createShape } from './shapes';
import { drawPageTemplate } from './templates';

export class CanvasEngine {
  private container: HTMLElement;
  private bgCanvas: HTMLCanvasElement;
  private highlighterCanvas: HTMLCanvasElement;
  private strokesCanvas: HTMLCanvasElement;
  private activeCanvas: HTMLCanvasElement;

  private bgCtx: CanvasRenderingContext2D;
  private highlighterCtx: CanvasRenderingContext2D;
  private strokesCtx: CanvasRenderingContext2D;
  private activeCtx: CanvasRenderingContext2D;

  private page: Page;
  private strokes: Stroke[] = [];
  private undoStack: Stroke[][] = [];
  private redoStack: Stroke[][] = [];

  private isDrawing = false;
  private rawPoints: StrokePoint[] = [];
  private smoothedPoints: StrokePoint[] = [];
  private toolSettings: ToolSettings;

  public viewport: ViewportTransform = { scale: 1.0, x: 0, y: 0 };
  private dpr = window.devicePixelRatio || 1;

  // Hold-to-Snap
  private holdTimer: any = null;
  private hasSnapped = false;

  // Lasso selection
  private selectedStrokeIds = new Set<string>();
  private lassoPolygon: StrokePoint[] = [];
  private isDraggingSelection = false;
  private dragStartPos = { x: 0, y: 0 };

  private onStrokesChanged?: (strokes: Stroke[]) => void;

  constructor(
    container: HTMLElement,
    page: Page,
    toolSettings: ToolSettings,
    onStrokesChanged?: (strokes: Stroke[]) => void
  ) {
    this.container = container;
    this.page = page;
    this.toolSettings = toolSettings;
    this.onStrokesChanged = onStrokesChanged;

    // 4 layered canvases: Background -> Highlighter -> Ink -> Active Overlay
    this.bgCanvas = document.createElement('canvas');
    this.highlighterCanvas = document.createElement('canvas');
    this.strokesCanvas = document.createElement('canvas');
    this.activeCanvas = document.createElement('canvas');

    const canvases = [
      this.bgCanvas,
      this.highlighterCanvas,
      this.strokesCanvas,
      this.activeCanvas,
    ];
    canvases.forEach((c) => {
      c.style.position = 'absolute';
      c.style.top = '0';
      c.style.left = '0';
      c.style.width = '100%';
      c.style.height = '100%';
      c.style.touchAction = 'none';
    });

    this.activeCanvas.style.cursor = 'crosshair';

    container.appendChild(this.bgCanvas);
    container.appendChild(this.highlighterCanvas);
    container.appendChild(this.strokesCanvas);
    container.appendChild(this.activeCanvas);

    this.bgCtx = this.bgCanvas.getContext('2d')!;
    this.highlighterCtx = this.highlighterCanvas.getContext('2d')!;
    this.strokesCtx = this.strokesCanvas.getContext('2d')!;
    this.activeCtx = this.activeCanvas.getContext('2d')!;

    this.resize();
    this.attachEvents();
  }

  public updateToolSettings(settings: ToolSettings) {
    this.toolSettings = settings;
    if (settings.activeTool === 'lasso') {
      this.activeCanvas.style.cursor = 'default';
    } else if (settings.activeTool === 'eraser') {
      this.activeCanvas.style.cursor = 'cell';
    } else {
      this.activeCanvas.style.cursor = 'crosshair';
    }
  }

  public setPage(page: Page, strokes: Stroke[]) {
    this.page = page;
    this.strokes = [...strokes];
    this.undoStack = [];
    this.redoStack = [];
    this.selectedStrokeIds.clear();
    this.resize();
  }

  public resize() {
    const width = this.page.width;
    const height = this.page.height;
    this.dpr = window.devicePixelRatio || 1;

    [
      this.bgCanvas,
      this.highlighterCanvas,
      this.strokesCanvas,
      this.activeCanvas,
    ].forEach((c) => {
      c.width = width * this.dpr;
      c.height = height * this.dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
    });

    [this.bgCtx, this.highlighterCtx, this.strokesCtx, this.activeCtx].forEach(
      (ctx) => {
        ctx.resetTransform?.();
        ctx.scale(this.dpr, this.dpr);
      }
    );

    this.renderBackground();
    this.renderStrokes();
  }

  private renderBackground() {
    this.bgCtx.clearRect(0, 0, this.page.width, this.page.height);
    drawPageTemplate(
      this.bgCtx,
      this.page.width,
      this.page.height,
      this.page.template
    );
  }

  public renderStrokes() {
    this.highlighterCtx.clearRect(0, 0, this.page.width, this.page.height);
    this.strokesCtx.clearRect(0, 0, this.page.width, this.page.height);

    const highlighters = this.strokes.filter((s) => s.tool === 'highlighter');
    const pens = this.strokes.filter((s) => s.tool !== 'highlighter');

    highlighters.forEach((s) => this.drawSingleStroke(this.highlighterCtx, s));
    pens.forEach((s) => this.drawSingleStroke(this.strokesCtx, s));

    if (this.selectedStrokeIds.size > 0) {
      this.drawSelectionOverlay(this.strokesCtx);
    }
  }

  // Smooth low-pass coordinate filter
  private smoothPoint(
    prev: StrokePoint | null,
    curr: StrokePoint,
    alpha = 0.65
  ): StrokePoint {
    if (!prev) return { ...curr };
    return {
      x: prev.x + alpha * (curr.x - prev.x),
      y: prev.y + alpha * (curr.y - prev.y),
      pressure: curr.pressure,
      time: curr.time,
    };
  }

  private drawSingleStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (!stroke.points || stroke.points.length === 0) return;
    const pts = stroke.points;

    ctx.save();
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Catmull-Rom to Cubic Bezier curve fitting
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      const xc = (pts[i - 1].x + pts[i].x) / 2;
      const yc = (pts[i - 1].y + pts[i].y) / 2;
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();

    ctx.restore();
  }

  private drawSelectionOverlay(ctx: CanvasRenderingContext2D) {
    ctx.save();
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    for (const stroke of this.strokes) {
      if (this.selectedStrokeIds.has(stroke.id)) {
        for (const p of stroke.points) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
      }
    }

    if (minX !== Infinity) {
      const pad = 8;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        minX - pad,
        minY - pad,
        maxX - minX + pad * 2,
        maxY - minY + pad * 2
      );
    }
    ctx.restore();
  }

  private attachEvents() {
    this.activeCanvas.addEventListener('pointerdown', this.handlePointerDown);
    this.activeCanvas.addEventListener('pointermove', this.handlePointerMove);
    this.activeCanvas.addEventListener('pointerup', this.handlePointerUp);
    this.activeCanvas.addEventListener('pointercancel', this.handlePointerUp);
  }

  public destroy() {
    this.activeCanvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.activeCanvas.removeEventListener('pointermove', this.handlePointerMove);
    this.activeCanvas.removeEventListener('pointerup', this.handlePointerUp);
    this.activeCanvas.removeEventListener('pointercancel', this.handlePointerUp);
    if (this.holdTimer) clearTimeout(this.holdTimer);
    this.container.innerHTML = '';
  }

  private getCanvasPoint(e: PointerEvent): StrokePoint {
    const rect = this.activeCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.page.width / rect.width);
    const y = (e.clientY - rect.top) * (this.page.height / rect.height);
    const pressure = e.pressure > 0 ? e.pressure : 0.5;
    return { x, y, pressure, time: Date.now() };
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.activeCanvas.setPointerCapture(e.pointerId);
    this.isDrawing = true;
    this.hasSnapped = false;
    const pt = this.getCanvasPoint(e);

    if (this.toolSettings.activeTool === 'lasso') {
      if (this.selectedStrokeIds.size > 0 && this.isPointInsideSelection(pt)) {
        this.isDraggingSelection = true;
        this.dragStartPos = { x: pt.x, y: pt.y };
      } else {
        this.selectedStrokeIds.clear();
        this.lassoPolygon = [pt];
      }
      return;
    }

    if (this.toolSettings.activeTool === 'eraser') {
      this.handleEraser(pt);
      return;
    }

    this.rawPoints = [pt];
    this.smoothedPoints = [pt];

    // GoodNotes 380ms Hold-to-Snap Timer
    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      if (
        this.isDrawing &&
        this.rawPoints.length > 5 &&
        !this.hasSnapped &&
        (this.toolSettings.activeTool === 'pen' ||
          this.toolSettings.activeTool === 'fountainPen' ||
          this.toolSettings.activeTool === 'shape')
      ) {
        const recognized = detectShape(this.smoothedPoints);
        if (recognized) {
          this.hasSnapped = true;
          this.smoothedPoints = recognized.points;
          this.drawActiveStroke();
        }
      }
    }, 380);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isDrawing) return;
    const events = (
      e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
    ) as PointerEvent[];

    for (const ev of events) {
      const pt = this.getCanvasPoint(ev);

      if (this.toolSettings.activeTool === 'eraser') {
        this.handleEraser(pt);
        continue;
      }

      if (this.toolSettings.activeTool === 'lasso') {
        if (this.isDraggingSelection) {
          const dx = pt.x - this.dragStartPos.x;
          const dy = pt.y - this.dragStartPos.y;
          this.dragStartPos = { x: pt.x, y: pt.y };

          for (const s of this.strokes) {
            if (this.selectedStrokeIds.has(s.id)) {
              s.points = s.points.map((p) => ({
                ...p,
                x: p.x + dx,
                y: p.y + dy,
              }));
            }
          }
          this.renderStrokes();
        } else {
          this.lassoPolygon.push(pt);
          this.drawLassoActive();
        }
        continue;
      }

      // Reset hold timer if user moved fast
      const lastPt = this.rawPoints[this.rawPoints.length - 1];
      if (
        lastPt &&
        Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) > 8 &&
        !this.hasSnapped
      ) {
        clearTimeout(this.holdTimer);
        this.holdTimer = setTimeout(() => {
          if (
            this.isDrawing &&
            this.rawPoints.length > 5 &&
            !this.hasSnapped &&
            (this.toolSettings.activeTool === 'pen' ||
              this.toolSettings.activeTool === 'fountainPen' ||
              this.toolSettings.activeTool === 'shape')
          ) {
            const recognized = detectShape(this.smoothedPoints);
            if (recognized) {
              this.hasSnapped = true;
              this.smoothedPoints = recognized.points;
              this.drawActiveStroke();
            }
          }
        }, 380);
      }

      this.rawPoints.push(pt);
      const prevSmoothed =
        this.smoothedPoints[this.smoothedPoints.length - 1];
      const smoothed = this.smoothPoint(
        prevSmoothed,
        pt,
        this.toolSettings.activeTool === 'pen' ? 0.65 : 0.8
      );
      this.smoothedPoints.push(smoothed);

      this.drawActiveStroke();
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    clearTimeout(this.holdTimer);

    try {
      this.activeCanvas.releasePointerCapture(e.pointerId);
    } catch {}

    this.activeCtx.clearRect(0, 0, this.page.width, this.page.height);

    if (this.toolSettings.activeTool === 'lasso') {
      if (this.isDraggingSelection) {
        this.isDraggingSelection = false;
        this.recordUndo();
        this.notifyChange();
      } else if (this.lassoPolygon.length > 2) {
        this.finalizeLassoSelection();
      }
      this.lassoPolygon = [];
      return;
    }

    if (this.toolSettings.activeTool === 'eraser') return;

    if (this.smoothedPoints.length < 1) {
      this.rawPoints = [];
      this.smoothedPoints = [];
      return;
    }

    this.recordUndo();

    const tool = this.toolSettings.activeTool;
    const color =
      tool === 'highlighter'
        ? this.toolSettings.highlighterColor
        : tool === 'fountainPen'
        ? this.toolSettings.fountainPenColor
        : this.toolSettings.penColor;

    const size =
      tool === 'highlighter'
        ? this.toolSettings.highlighterSize
        : tool === 'fountainPen'
        ? this.toolSettings.fountainPenSize
        : this.toolSettings.penSize;

    const newStroke: Stroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      pageId: this.page.id,
      tool,
      color,
      size,
      opacity: tool === 'highlighter' ? 0.4 : 1.0,
      points: [...this.smoothedPoints],
      isShape: this.hasSnapped,
      shapeType: this.hasSnapped ? 'recognized' : null,
      createdAt: Date.now(),
    };

    this.strokes.push(newStroke);
    this.rawPoints = [];
    this.smoothedPoints = [];
    this.renderStrokes();
    this.notifyChange();
  };

  private drawActiveStroke() {
    this.activeCtx.clearRect(0, 0, this.page.width, this.page.height);

    const tool = this.toolSettings.activeTool;
    const color =
      tool === 'highlighter'
        ? this.toolSettings.highlighterColor
        : tool === 'fountainPen'
        ? this.toolSettings.fountainPenColor
        : this.toolSettings.penColor;

    const size =
      tool === 'highlighter'
        ? this.toolSettings.highlighterSize
        : tool === 'fountainPen'
        ? this.toolSettings.fountainPenSize
        : this.toolSettings.penSize;

    const tempStroke: Stroke = {
      id: 'active',
      pageId: this.page.id,
      tool,
      color,
      size,
      opacity: tool === 'highlighter' ? 0.4 : 1.0,
      points: this.smoothedPoints,
      isShape: false,
      createdAt: 0,
    };

    this.drawSingleStroke(this.activeCtx, tempStroke);
  }

  private drawLassoActive() {
    this.activeCtx.clearRect(0, 0, this.page.width, this.page.height);
    if (this.lassoPolygon.length < 2) return;

    this.activeCtx.save();
    this.activeCtx.strokeStyle = '#06b6d4';
    this.activeCtx.lineWidth = 1.5;
    this.activeCtx.setLineDash([4, 4]);
    this.activeCtx.fillStyle = 'rgba(6, 182, 212, 0.08)';

    this.activeCtx.beginPath();
    this.activeCtx.moveTo(this.lassoPolygon[0].x, this.lassoPolygon[0].y);
    for (let i = 1; i < this.lassoPolygon.length; i++) {
      this.activeCtx.lineTo(this.lassoPolygon[i].x, this.lassoPolygon[i].y);
    }
    this.activeCtx.closePath();
    this.activeCtx.fill();
    this.activeCtx.stroke();
    this.activeCtx.restore();
  }

  private finalizeLassoSelection() {
    this.selectedStrokeIds.clear();
    for (const stroke of this.strokes) {
      const isInside = stroke.points.some((p) =>
        this.pointInPolygon(p, this.lassoPolygon)
      );
      if (isInside) {
        this.selectedStrokeIds.add(stroke.id);
      }
    }
    this.renderStrokes();
  }

  private pointInPolygon(
    point: StrokePoint,
    polygon: StrokePoint[]
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || 1) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private isPointInsideSelection(pt: StrokePoint): boolean {
    for (const s of this.strokes) {
      if (this.selectedStrokeIds.has(s.id)) {
        for (const p of s.points) {
          if (Math.hypot(p.x - pt.x, p.y - pt.y) < 20) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private handleEraser(pt: StrokePoint) {
    const eraserRadius = this.toolSettings.eraserSize;
    let modified = false;

    const prevCount = this.strokes.length;
    this.strokes = this.strokes.filter((s) => {
      if (
        this.toolSettings.eraserMode === 'highlighterOnly' &&
        s.tool !== 'highlighter'
      ) {
        return true;
      }
      const intersects = s.points.some(
        (p) => Math.hypot(p.x - pt.x, p.y - pt.y) <= eraserRadius
      );
      return !intersects;
    });

    if (this.strokes.length !== prevCount) {
      modified = true;
      this.renderStrokes();
      this.notifyChange();
    }
  }

  private recordUndo() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }

  public undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    this.strokes = this.undoStack.pop()!;
    this.selectedStrokeIds.clear();
    this.renderStrokes();
    this.notifyChange();
  }

  public redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    this.strokes = this.redoStack.pop()!;
    this.selectedStrokeIds.clear();
    this.renderStrokes();
    this.notifyChange();
  }

  public clearPage() {
    if (this.strokes.length === 0) return;
    this.recordUndo();
    this.strokes = [];
    this.selectedStrokeIds.clear();
    this.renderStrokes();
    this.notifyChange();
  }

  public getStrokes(): Stroke[] {
    return this.strokes;
  }

  public exportImage(format: 'png' | 'jpeg' = 'png'): string {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.page.width * 2;
    exportCanvas.height = this.page.height * 2;
    const ctx = exportCanvas.getContext('2d')!;
    ctx.scale(2, 2);

    drawPageTemplate(
      ctx,
      this.page.width,
      this.page.height,
      this.page.template
    );
    const highlighters = this.strokes.filter((s) => s.tool === 'highlighter');
    const pens = this.strokes.filter((s) => s.tool !== 'highlighter');
    highlighters.forEach((s) => this.drawSingleStroke(ctx, s));
    pens.forEach((s) => this.drawSingleStroke(ctx, s));

    return exportCanvas.toDataURL(`image/${format}`);
  }

  private notifyChange() {
    this.onStrokesChanged?.(this.strokes);
  }
}
