import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  Pipette,
  Undo2,
  Redo2,
  Trash2,
  Grid3X3,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { ToolType } from '../types';
import {
  CANVAS_SIZE,
  TOTAL_PIXELS,
  DEFAULT_BG_COLOR,
  floodFill,
  bresenhamLine,
  drawPixelsToCanvas,
} from '../utils/pixelUtils';
import { PALETTES } from '../data/colorPalettes';

interface PixelCanvasProps {
  pixels: string[];
  onChange: (pixels: string[]) => void;
  onClear: () => void;
}

const CANVAS_INTERNAL_SIZE = 384; // 384 / 32 = exactly 12px per cell

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  pixels,
  onChange,
  onClear,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [selectedColor, setSelectedColor] = useState<string>('#1C1917');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState<number>(0);
  const [recentColors, setRecentColors] = useState<string[]>([
    '#1C1917',
    '#DC2626',
    '#EA580C',
    '#F59E0B',
    '#10B981',
    '#2563EB',
    '#9333EA',
    '#FDFBF7',
  ]);

  // History stack for undo/redo
  const [history, setHistory] = useState<string[][]>([pixels]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Performance references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelsRef = useRef<string[]>([...pixels]);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hoverPixelRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Sync external pixels (e.g. on remix, load, undo, redo)
  useEffect(() => {
    if (!isDrawingRef.current) {
      pixelsRef.current = [...pixels];
      redrawCanvas();
    }
  }, [pixels]);

  // Full redraw of HTML5 2D canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    drawPixelsToCanvas(ctx, pixelsRef.current, CANVAS_INTERNAL_SIZE, CANVAS_INTERNAL_SIZE, {
      showGrid,
      gridColor: 'rgba(28, 25, 23, 0.08)',
      hoverPixel: !isDrawingRef.current ? hoverPixelRef.current : null,
      hoverColor:
        activeTool === 'eraser'
          ? 'rgba(239, 68, 68, 0.7)'
          : activeTool === 'picker'
          ? 'rgba(16, 185, 129, 0.7)'
          : activeTool === 'bucket'
          ? 'rgba(245, 158, 11, 0.8)'
          : 'rgba(28, 25, 23, 0.8)',
    });
  }, [showGrid, activeTool]);

  // Redraw when grid or tool changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Push new state to history & notify parent
  const pushHistory = useCallback(
    (newPixels: string[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced.length >= 30) sliced.shift();
        return [...sliced, newPixels];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
      onChange(newPixels);
    },
    [historyIndex, onChange]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      pixelsRef.current = [...prev];
      onChange(prev);
      redrawCanvas();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      pixelsRef.current = [...next];
      onChange(next);
      redrawCanvas();
    }
  };

  // Keyboard shortcut for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const rememberColor = (color: string) => {
    if (!recentColors.includes(color)) {
      setRecentColors((prev) => [color, ...prev.slice(0, 7)]);
    }
  };

  // Efficient coordinate conversion without layout thrashing
  const getPixelCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const rect = canvasRectRef.current || canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    if (
      clientX < rect.left ||
      clientX >= rect.right ||
      clientY < rect.top ||
      clientY >= rect.bottom
    ) {
      return null;
    }

    const x = Math.floor(((clientX - rect.left) / rect.width) * CANVAS_SIZE);
    const y = Math.floor(((clientY - rect.top) / rect.height) * CANVAS_SIZE);

    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      return { x, y };
    }
    return null;
  };

  // Fast direct blit of a single cell to context
  const paintPixelDirect = (x: number, y: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const cellSize = CANVAS_INTERNAL_SIZE / CANVAS_SIZE;
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvasRectRef.current = canvas.getBoundingClientRect();

    const coords = getPixelCoords(e.clientX, e.clientY);
    if (!coords) return;

    const { x, y } = coords;
    const idx = y * CANVAS_SIZE + x;

    // Eyedropper tool
    if (activeTool === 'picker') {
      const pickedColor = pixelsRef.current[idx] || DEFAULT_BG_COLOR;
      setSelectedColor(pickedColor);
      rememberColor(pickedColor);
      setActiveTool('pencil');
      return;
    }

    // Flood fill bucket tool
    if (activeTool === 'bucket') {
      const targetColor = pixelsRef.current[idx] || DEFAULT_BG_COLOR;
      const filled = floodFill(pixelsRef.current, idx, targetColor, selectedColor);
      pixelsRef.current = filled;
      rememberColor(selectedColor);
      redrawCanvas();
      pushHistory(filled);
      return;
    }

    // Pencil or Eraser
    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    canvas.setPointerCapture(e.pointerId);

    const applyColor = activeTool === 'eraser' ? DEFAULT_BG_COLOR : selectedColor;
    if (pixelsRef.current[idx] !== applyColor) {
      pixelsRef.current[idx] = applyColor;
      paintPixelDirect(x, y, applyColor);
      if (activeTool === 'pencil') rememberColor(selectedColor);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getPixelCoords(e.clientX, e.clientY);

    // If currently drawing (pencil or eraser), connect with Bresenham's line
    if (isDrawingRef.current && (activeTool === 'pencil' || activeTool === 'eraser')) {
      if (!coords) return;
      const { x, y } = coords;
      const last = lastPointRef.current || { x, y };
      const applyColor = activeTool === 'eraser' ? DEFAULT_BG_COLOR : selectedColor;

      // Connect previous point to current point to prevent discrete gaps on fast strokes
      bresenhamLine(last.x, last.y, x, y, (px, py) => {
        const pIdx = py * CANVAS_SIZE + px;
        if (pixelsRef.current[pIdx] !== applyColor) {
          pixelsRef.current[pIdx] = applyColor;
          paintPixelDirect(px, py, applyColor);
        }
      });

      lastPointRef.current = { x, y };
      return;
    }

    // Hover mode (cursor indicator)
    if (!isDrawingRef.current) {
      const prevHover = hoverPixelRef.current;
      const isDifferent =
        (!prevHover && coords) ||
        (prevHover && !coords) ||
        (prevHover && coords && (prevHover.x !== coords.x || prevHover.y !== coords.y));

      if (isDifferent) {
        hoverPixelRef.current = coords;
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          redrawCanvas();
        });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      // Commit stroke to history & parent state once per continuous gesture
      const finalSnapshot = [...pixelsRef.current];
      pushHistory(finalSnapshot);
      redrawCanvas();
    }

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  };

  const handlePointerLeave = () => {
    if (!isDrawingRef.current && hoverPixelRef.current !== null) {
      hoverPixelRef.current = null;
      redrawCanvas();
    }
  };

  const handleClear = () => {
    const fresh = new Array(TOTAL_PIXELS).fill(DEFAULT_BG_COLOR);
    pixelsRef.current = fresh;
    pushHistory(fresh);
    onClear();
    redrawCanvas();
  };

  const activePalette = PALETTES[selectedPaletteIdx];

  return (
    <div id="pixel-canvas-workspace" className="flex flex-col gap-4">
      {/* Top Toolbar: Tools & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-lg border border-stone-200">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            id="tool-pencil"
            type="button"
            onClick={() => setActiveTool('pencil')}
            title="Pencil (Draw pixel)"
            className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === 'pencil'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span className="hidden sm:inline">Pencil</span>
          </button>

          <button
            id="tool-eraser"
            type="button"
            onClick={() => setActiveTool('eraser')}
            title="Eraser (Erase pixel)"
            className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <button
            id="tool-bucket"
            type="button"
            onClick={() => setActiveTool('bucket')}
            title="Bucket (Fill area)"
            className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === 'bucket'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <PaintBucket className="w-4 h-4" />
            <span className="hidden sm:inline">Fill</span>
          </button>

          <button
            id="tool-picker"
            type="button"
            onClick={() => setActiveTool('picker')}
            title="Eyedropper (Pick color from canvas)"
            className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === 'picker'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Pipette className="w-4 h-4" />
            <span className="hidden sm:inline">Pick</span>
          </button>

          <div className="h-4 w-[1px] bg-stone-200 mx-1" />

          {/* Grid Toggle */}
          <button
            id="toggle-grid"
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle pixel grid lines"
            className={`p-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showGrid
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo & Clear */}
        <div className="flex items-center gap-1">
          <button
            id="btn-undo"
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            id="btn-redo"
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
            className="p-2 rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            id="btn-clear-canvas"
            type="button"
            onClick={handleClear}
            title="Clear canvas & art review (Undo available with Ctrl+Z)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Clear Art</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Area & Controls */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* 32x32 Grid Canvas Viewport */}
        <div className="flex flex-col items-center">
          <div
            className="relative p-3 rounded-xl bg-white border border-stone-200"
            style={{ touchAction: 'none' }}
          >
            <canvas
              id="pixel-grid-canvas"
              ref={canvasRef}
              width={CANVAS_INTERNAL_SIZE}
              height={CANVAS_INTERNAL_SIZE}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              className="w-[320px] h-[320px] sm:w-[384px] sm:h-[384px] select-none cursor-crosshair rounded-md overflow-hidden block"
              style={{
                imageRendering: 'pixelated',
                backgroundColor: DEFAULT_BG_COLOR,
              }}
            />

            {/* Canvas Footer Stamp Status */}
            <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] font-mono-stamp text-stone-400">
              <span>32 × 32 PIXELS</span>
              <span>1024 DOTS</span>
              <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-xs inline-block border border-stone-300"
                  style={{ backgroundColor: selectedColor }}
                />
                {selectedColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Side Panel: Palettes & Drawing Shortcuts */}
        <div className="flex flex-col gap-4 w-full lg:w-72">
          {/* Color Palette Selector */}
          <div className="p-3.5 bg-white rounded-lg border border-stone-200">
            {/* Palette Tabs */}
            <div className="flex items-center justify-between mb-2.5">
              <label htmlFor="palette-select" className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Palette
              </label>
              <select
                id="palette-select"
                value={selectedPaletteIdx}
                onChange={(e) => setSelectedPaletteIdx(Number(e.target.value))}
                className="text-xs font-medium bg-stone-100 border border-stone-200 rounded-md px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                {PALETTES.map((p, idx) => (
                  <option key={p.name} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {activePalette.colors.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      rememberColor(color);
                      if (activeTool === 'eraser') setActiveTool('pencil');
                    }}
                    className={`w-7 h-7 rounded-xs transition-transform flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'scale-110 ring-2 ring-stone-900 ring-offset-1 z-10'
                        : 'hover:scale-105 border border-stone-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>

            {/* Custom Color Picker & Recent Colors */}
            <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono-stamp text-stone-400">Recent:</span>
                <div className="flex items-center gap-1">
                  {recentColors.slice(0, 5).map((rc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedColor(rc);
                        if (activeTool === 'eraser') setActiveTool('pencil');
                      }}
                      className="w-5 h-5 rounded-xs border border-stone-300 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: rc }}
                      title={rc}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Hex / Color Input */}
              <label
                htmlFor="custom-color-input"
                className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                title="Choose custom color"
              >
                <div
                  className="w-5 h-5 rounded-xs border border-stone-300"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-[11px] font-mono-stamp">Custom</span>
                <input
                  id="custom-color-input"
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    rememberColor(e.target.value);
                    if (activeTool === 'eraser') setActiveTool('pencil');
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Artboard Tips & Controls */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5 mb-1.5 uppercase font-mono-stamp text-[10px] tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-600" /> Artboard Tips
            </span>
            <ul className="space-y-1 text-[11px] text-stone-500 list-disc list-inside">
              <li>Drag freely to paint continuous pixel lines</li>
              <li>Use <span className="font-mono bg-stone-200/80 px-1 py-0.2 rounded-xs text-[10px]">Ctrl+Z</span> / <span className="font-mono bg-stone-200/80 px-1 py-0.2 rounded-xs text-[10px]">Ctrl+Shift+Z</span> to undo/redo</li>
              <li>Bucket fill works on any contiguous color block</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
