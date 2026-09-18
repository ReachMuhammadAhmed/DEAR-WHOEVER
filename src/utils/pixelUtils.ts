export const CANVAS_SIZE = 32;
export const TOTAL_PIXELS = CANVAS_SIZE * CANVAS_SIZE;
export const DEFAULT_BG_COLOR = '#FDFBF7';

export function createEmptyCanvas(bgColor: string = DEFAULT_BG_COLOR): string[] {
  return new Array(TOTAL_PIXELS).fill(bgColor);
}

// 4-way flood fill algorithm
export function floodFill(
  pixels: string[],
  startIndex: number,
  targetColor: string,
  fillColor: string
): string[] {
  if (startIndex < 0 || startIndex >= TOTAL_PIXELS) return pixels;
  if (targetColor.toLowerCase() === fillColor.toLowerCase()) return pixels;

  const newPixels = [...pixels];
  const queue: number[] = [startIndex];
  const visited = new Uint8Array(TOTAL_PIXELS);
  visited[startIndex] = 1;

  const normalizedTarget = targetColor.toLowerCase();

  while (queue.length > 0) {
    const idx = queue.pop()!;
    newPixels[idx] = fillColor;

    const x = idx % CANVAS_SIZE;
    const y = Math.floor(idx / CANVAS_SIZE);

    // Neighbors: North, South, West, East
    const neighbors = [
      y > 0 ? idx - CANVAS_SIZE : -1,
      y < CANVAS_SIZE - 1 ? idx + CANVAS_SIZE : -1,
      x > 0 ? idx - 1 : -1,
      x < CANVAS_SIZE - 1 ? idx + 1 : -1,
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n]) {
        if (newPixels[n].toLowerCase() === normalizedTarget) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  return newPixels;
}

// Convert flat pixel array to an offscreen canvas and return data URL
export function pixelsToDataURL(pixels: string[], scale: number = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE * scale;
  canvas.height = CANVAS_SIZE * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      const idx = y * CANVAS_SIZE + x;
      ctx.fillStyle = pixels[idx] || DEFAULT_BG_COLOR;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  return canvas.toDataURL('image/png');
}

// Download postcard artwork as a crisp PNG
export function downloadPixelArt(pixels: string[], filename: string = 'pixel-postcard.png', scale: number = 16) {
  const dataUrl = pixelsToDataURL(pixels, scale);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Bresenham's line algorithm to connect discrete pointer movements smoothly without gaps
export function bresenhamLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  callback: (x: number, y: number) => void
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;

  while (true) {
    callback(currX, currY);
    if (currX === x1 && currY === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }
}

// Ultra-fast 2D canvas blitter for 32x32 pixel art
export function drawPixelsToCanvas(
  ctx: CanvasRenderingContext2D,
  pixels: string[],
  width: number,
  height: number,
  options?: {
    showGrid?: boolean;
    gridColor?: string;
    hoverPixel?: { x: number; y: number } | null;
    hoverColor?: string;
  }
): void {
  const cellSizeX = width / CANVAS_SIZE;
  const cellSizeY = height / CANVAS_SIZE;

  // Clear background
  ctx.fillStyle = DEFAULT_BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Draw each pixel
  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      const idx = y * CANVAS_SIZE + x;
      const color = pixels[idx] || DEFAULT_BG_COLOR;
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);
    }
  }

  // Optional grid lines
  if (options?.showGrid) {
    ctx.strokeStyle = options.gridColor || 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < CANVAS_SIZE; i++) {
      const posX = Math.round(i * cellSizeX);
      const posY = Math.round(i * cellSizeY);
      // Vertical lines
      ctx.moveTo(posX + 0.5, 0);
      ctx.lineTo(posX + 0.5, height);
      // Horizontal lines
      ctx.moveTo(0, posY + 0.5);
      ctx.lineTo(width, posY + 0.5);
    }
    ctx.stroke();
  }

  // Optional hover highlight
  if (options?.hoverPixel) {
    const { x, y } = options.hoverPixel;
    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      ctx.strokeStyle = options.hoverColor || 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        x * cellSizeX + 0.5,
        y * cellSizeY + 0.5,
        cellSizeX - 1,
        cellSizeY - 1
      );
    }
  }
}
