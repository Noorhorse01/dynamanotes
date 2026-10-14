import type { TemplateType } from '../types';

export interface PageTemplateConfig {
  backgroundColor: string;
  lineColor: string;
  marginColor?: string;
  gridSize: number;
}

export function getTemplateConfig(template: TemplateType): PageTemplateConfig {
  switch (template) {
    case 'squaredGrid':
      return {
        backgroundColor: '#faf8f0', // GoodNotes signature warm ivory paper
        lineColor: '#d6e4f0',       // Subtle sky blue-gray grid
        gridSize: 24,
      };
    case 'lined':
      return {
        backgroundColor: '#faf8f0',
        lineColor: '#cbd5e1',
        marginColor: '#fca5a5',
        gridSize: 28,
      };
    case 'dotGrid':
      return {
        backgroundColor: '#faf8f0',
        lineColor: '#94a3b8',
        gridSize: 22,
      };
    case 'cornell':
      return {
        backgroundColor: '#faf8f0',
        lineColor: '#cbd5e1',
        marginColor: '#3b82f6',
        gridSize: 26,
      };
    case 'darkGrid':
      return {
        backgroundColor: '#18181b',
        lineColor: '#27272a',
        gridSize: 24,
      };
    case 'darkBlank':
      return {
        backgroundColor: '#18181b',
        lineColor: 'transparent',
        gridSize: 24,
      };
    case 'blank':
    default:
      return {
        backgroundColor: '#faf8f0',
        lineColor: 'transparent',
        gridSize: 24,
      };
  }
}

export function drawPageTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: TemplateType
) {
  const config = getTemplateConfig(template);

  // 1. Draw page paper background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  if (template === 'squaredGrid' || template === 'darkGrid') {
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = 1;

    // Header margin line (matching Goodnotes Screenshot 2: bold rule near top)
    const headerTop = 40;
    ctx.beginPath();
    ctx.moveTo(0, headerTop);
    ctx.lineTo(width, headerTop);
    ctx.stroke();

    // Grid lines
    ctx.beginPath();
    const size = config.gridSize;

    // Vertical lines
    for (let x = size; x < width; x += size) {
      ctx.moveTo(x, headerTop);
      ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = headerTop + size; y < height; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (template === 'lined') {
    const size = config.gridSize;
    const topMargin = 70;
    const leftMargin = 70;

    // Horizontal writing lines
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = topMargin; y < height - 30; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Left vertical margin line
    if (config.marginColor) {
      ctx.strokeStyle = config.marginColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin, 0);
      ctx.lineTo(leftMargin, height);
      ctx.stroke();
    }
  } else if (template === 'dotGrid') {
    ctx.fillStyle = config.lineColor;
    const size = config.gridSize;
    const dotRadius = 1;

    for (let x = size; x < width; x += size) {
      for (let y = size; y < height; y += size) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (template === 'cornell') {
    const headerHeight = 70;
    const cueWidth = 200;
    const summaryHeight = 140;

    ctx.strokeStyle = config.marginColor || '#3b82f6';
    ctx.lineWidth = 1.5;

    // Header divider
    ctx.beginPath();
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(width, headerHeight);
    ctx.stroke();

    // Cue column divider
    ctx.beginPath();
    ctx.moveTo(cueWidth, headerHeight);
    ctx.lineTo(cueWidth, height - summaryHeight);
    ctx.stroke();

    // Summary footer divider
    ctx.beginPath();
    ctx.moveTo(0, height - summaryHeight);
    ctx.lineTo(width, height - summaryHeight);
    ctx.stroke();

    // Lined notes area
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = headerHeight + 28; y < height - summaryHeight; y += 28) {
      ctx.moveTo(cueWidth, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  ctx.restore();
}
