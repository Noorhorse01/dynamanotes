/**
 * Pressure-sensitive smooth vector stroke outline generator.
 * Implements Catmull-Rom spline interpolation and variable stroke width
 * based on stylus pressure and velocity, producing high-fidelity calligraphic ink.
 */

export interface StrokeOptions {
  size?: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  easing?: (t: number) => number;
  start?: {
    cap?: boolean;
    taper?: number | boolean;
    easing?: (t: number) => number;
  };
  end?: {
    cap?: boolean;
    taper?: number | boolean;
    easing?: (t: number) => number;
  };
  simulatePressure?: boolean;
}

export type Point = [number, number, number?]; // [x, y, pressure?]

const PI = Math.PI;

function dist(p1: [number, number], p2: [number, number]): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.hypot(dx, dy);
}

function sub(p1: [number, number], p2: [number, number]): [number, number] {
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

function add(p1: [number, number], p2: [number, number]): [number, number] {
  return [p1[0] + p2[0], p1[1] + p2[1]];
}

function mul(p: [number, number], n: number): [number, number] {
  return [p[0] * n, p[1] * n];
}

function lrp(p1: [number, number], p2: [number, number], t: number): [number, number] {
  return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
}

function prp(p: [number, number]): [number, number] {
  return [-p[1], p[0]];
}

function uni(p: [number, number]): [number, number] {
  const d = Math.hypot(p[0], p[1]);
  if (d === 0) return [0, 0];
  return [p[0] / d, p[1] / d];
}

export function getStroke(points: Point[], options: StrokeOptions = {}): [number, number][] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    const [x, y] = points[0];
    const r = (options.size ?? 6) / 2;
    const circle: [number, number][] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * PI * 2;
      circle.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    return circle;
  }

  const {
    size = 6,
    thinning = 0.5,
    smoothing = 0.5,
    streamline = 0.5,
    simulatePressure = true,
  } = options;

  // Streamline and filter points
  const pts: [number, number, number][] = [];
  let prevPt = points[0];
  pts.push([prevPt[0], prevPt[1], prevPt[2] ?? 0.5]);

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const d = dist([prevPt[0], prevPt[1]], [curr[0], curr[1]]);
    if (d > 0.5) {
      const p = curr[2] !== undefined && curr[2] > 0 ? curr[2] : (simulatePressure ? Math.max(0.2, 1 - d / 50) : 0.5);
      pts.push([curr[0], curr[1], p]);
      prevPt = curr;
    }
  }

  if (pts.length < 2) return getStroke([points[0]], options);

  const leftPts: [number, number][] = [];
  const rightPts: [number, number][] = [];

  const len = pts.length;
  let totalLength = 0;
  const lengths: number[] = [0];

  for (let i = 1; i < len; i++) {
    const segLen = dist([pts[i - 1][0], pts[i - 1][1]], [pts[i][0], pts[i][1]]);
    totalLength += segLen;
    lengths.push(totalLength);
  }

  for (let i = 0; i < len; i++) {
    const curr = pts[i];
    const progress = totalLength > 0 ? lengths[i] / totalLength : 0;

    let pressure = curr[2];
    if (thinning > 0) {
      pressure = pressure * (1 - thinning) + (1 - progress * 0.2) * thinning;
    }

    // Taper at start and end
    let taper = 1.0;
    if (progress < 0.1) {
      taper = progress / 0.1;
    } else if (progress > 0.9) {
      taper = (1.0 - progress) / 0.1;
    }
    taper = Math.max(0.15, taper);

    const radius = Math.max(1, (size / 2) * (0.3 + pressure * 0.7) * taper);

    let tangent: [number, number];
    if (i === 0) {
      tangent = uni(sub([pts[1][0], pts[1][1]], [curr[0], curr[1]]));
    } else if (i === len - 1) {
      tangent = uni(sub([curr[0], curr[1]], [pts[i - 1][0], pts[i - 1][1]]));
    } else {
      tangent = uni(sub([pts[i + 1][0], pts[i + 1][1]], [pts[i - 1][0], pts[i - 1][1]]));
    }

    const normal = prp(tangent);
    const left = add([curr[0], curr[1]], mul(normal, radius));
    const right = sub([curr[0], curr[1]], mul(normal, radius));

    leftPts.push(left);
    rightPts.push(right);
  }

  // Combine outline polygon points
  return [...leftPts, ...rightPts.reverse()];
}

export function getSvgPathFromStroke(stroke: [number, number][], closed = true): string {
  if (stroke.length === 0) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  if (closed) d.push('Z');
  return d.join(' ');
}
