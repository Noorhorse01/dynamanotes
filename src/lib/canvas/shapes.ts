import type { StrokePoint } from '../types';

export interface RecognizedShape {
  type: 'line' | 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'arrow';
  points: StrokePoint[];
  confidence: number;
}

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function getBoundingBox(points: StrokePoint[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * High-accuracy geometric shape recognizer inspired by GoodNotes & Apple Notes.
 * Accurately detects circles, ellipses, rectangles, and straight lines.
 */
export function detectShape(points: StrokePoint[]): RecognizedShape | null {
  if (!points || points.length < 5) return null;

  const first = points[0];
  const last = points[points.length - 1];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += distance(points[i - 1], points[i]);
  }
  if (totalLength < 10) return null;

  const directDistance = distance(first, last);
  const bbox = getBoundingBox(points);

  // 1. Straight Line Check: direct endpoint distance is >= 88% of total path length
  if (directDistance / totalLength > 0.88) {
    return {
      type: 'line',
      confidence: directDistance / totalLength,
      points: [
        { x: first.x, y: first.y, pressure: 0.5 },
        { x: last.x, y: last.y, pressure: 0.5 },
      ],
    };
  }

  // Check if stroke is closed or roughly closed loop
  const isClosed = directDistance / totalLength < 0.28 || directDistance < Math.max(30, totalLength * 0.2);

  if (isClosed) {
    const { centerX, centerY, width, height } = bbox;
    const avgRadius = (width + height) / 4;

    if (avgRadius > 5) {
      // Calculate radial variance from centroid
      let radiusVariance = 0;
      for (const p of points) {
        const d = Math.hypot(p.x - centerX, p.y - centerY);
        radiusVariance += Math.abs(d - avgRadius);
      }
      const circleError = radiusVariance / (points.length * avgRadius);
      const aspectRatio = width / (height || 1);

      // Circle detection: low radial variance + aspect ratio near 1:1
      if (circleError < 0.28 && aspectRatio >= 0.7 && aspectRatio <= 1.42) {
        const circlePoints: StrokePoint[] = [];
        const steps = 48;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          circlePoints.push({
            x: centerX + Math.cos(theta) * avgRadius,
            y: centerY + Math.sin(theta) * avgRadius,
            pressure: 0.5,
          });
        }
        return {
          type: 'circle',
          confidence: 1 - circleError,
          points: circlePoints,
        };
      }

      // Ellipse detection
      if (circleError < 0.35) {
        const rx = width / 2;
        const ry = height / 2;
        const ellipsePoints: StrokePoint[] = [];
        const steps = 48;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          ellipsePoints.push({
            x: centerX + Math.cos(theta) * rx,
            y: centerY + Math.sin(theta) * ry,
            pressure: 0.5,
          });
        }
        return {
          type: 'ellipse',
          confidence: 1 - circleError,
          points: ellipsePoints,
        };
      }

      // Rectangle detection
      return {
        type: 'rectangle',
        confidence: 0.85,
        points: [
          { x: bbox.minX, y: bbox.minY, pressure: 0.5 },
          { x: bbox.maxX, y: bbox.minY, pressure: 0.5 },
          { x: bbox.maxX, y: bbox.maxY, pressure: 0.5 },
          { x: bbox.minX, y: bbox.maxY, pressure: 0.5 },
          { x: bbox.minX, y: bbox.minY, pressure: 0.5 },
        ],
      };
    }
  }

  return null;
}

/**
 * Creates explicit geometric shapes from drag start and end coordinates.
 */
export function createShape(
  type: 'circle' | 'rectangle' | 'line' | 'arrow' | 'triangle',
  start: { x: number; y: number },
  end: { x: number; y: number }
): StrokePoint[] {
  if (type === 'line') {
    return [
      { x: start.x, y: start.y, pressure: 0.5 },
      { x: end.x, y: end.y, pressure: 0.5 },
    ];
  }

  if (type === 'circle') {
    const radius = Math.hypot(end.x - start.x, end.y - start.y);
    const points: StrokePoint[] = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      points.push({
        x: start.x + Math.cos(theta) * radius,
        y: start.y + Math.sin(theta) * radius,
        pressure: 0.5,
      });
    }
    return points;
  }

  if (type === 'rectangle') {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    return [
      { x: minX, y: minY, pressure: 0.5 },
      { x: maxX, y: minY, pressure: 0.5 },
      { x: maxX, y: maxY, pressure: 0.5 },
      { x: minX, y: maxY, pressure: 0.5 },
      { x: minX, y: minY, pressure: 0.5 },
    ];
  }

  if (type === 'triangle') {
    const topX = (start.x + end.x) / 2;
    const topY = Math.min(start.y, end.y);
    const bottomY = Math.max(start.y, end.y);
    return [
      { x: topX, y: topY, pressure: 0.5 },
      { x: end.x, y: bottomY, pressure: 0.5 },
      { x: start.x, y: bottomY, pressure: 0.5 },
      { x: topX, y: topY, pressure: 0.5 },
    ];
  }

  if (type === 'arrow') {
    const headLen = 18;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    return [
      { x: start.x, y: start.y, pressure: 0.5 },
      { x: end.x, y: end.y, pressure: 0.5 },
      {
        x: end.x - headLen * Math.cos(angle - Math.PI / 6),
        y: end.y - headLen * Math.sin(angle - Math.PI / 6),
        pressure: 0.5,
      },
      { x: end.x, y: end.y, pressure: 0.5 },
      {
        x: end.x - headLen * Math.cos(angle + Math.PI / 6),
        y: end.y - headLen * Math.sin(angle + Math.PI / 6),
        pressure: 0.5,
      },
    ];
  }

  return [];
}
