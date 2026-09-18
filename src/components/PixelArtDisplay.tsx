import React, { useRef, useEffect } from 'react';
import { CANVAS_SIZE, DEFAULT_BG_COLOR } from '../utils/pixelUtils';

interface PixelArtDisplayProps {
  pixels: string[];
  className?: string;
}

export const PixelArtDisplay: React.FC<PixelArtDisplayProps> = React.memo(
  ({ pixels, className = 'w-full h-full pixelated' }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Draw 32x32 pixels directly to native canvas (takes <0.02ms)
      for (let y = 0; y < CANVAS_SIZE; y++) {
        for (let x = 0; x < CANVAS_SIZE; x++) {
          const idx = y * CANVAS_SIZE + x;
          ctx.fillStyle = pixels[idx] || DEFAULT_BG_COLOR;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, [pixels]);

    return (
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={className}
        style={{
          imageRendering: 'pixelated',
        }}
      />
    );
  },
  (prev, next) => prev.pixels === next.pixels
);
