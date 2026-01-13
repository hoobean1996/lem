/**
 * Turtle Canvas Component
 *
 * Renders the turtle world with its drawing and turtle position.
 */

import { useEffect, useRef, useState } from 'react';
import { TurtleWorld, Line } from './TurtleWorld';

interface TurtleCanvasProps {
  world: TurtleWorld;
  className?: string;
  size?: number; // Optional display size (scales the canvas)
  targetLines?: Line[]; // Optional target lines to show as goal preview
  showTarget?: boolean; // Whether to show target lines
}

export function TurtleCanvas({
  world,
  className = '',
  size,
  targetLines = [],
  showTarget = false,
}: TurtleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, forceUpdate] = useState({});

  // Subscribe to world changes
  useEffect(() => {
    const unsubscribe = world.onChange(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, [world]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = world.getWidth();
    const height = world.getHeight();

    // Clear canvas
    ctx.fillStyle = '#f8fafc'; // Light gray background
    ctx.fillRect(0, 0, width, height);

    // Origin point (center of canvas)
    const originX = width / 2;
    const originY = height / 2;
    const gridSize = 20; // Must match TurtleWorld.stepSize

    // Draw grid centered on origin
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Vertical lines (from origin outward)
    for (let x = originX; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let x = originX - gridSize; x >= 0; x -= gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines (from origin outward)
    for (let y = originY; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let y = originY - gridSize; y >= 0; y -= gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes (through origin) - slightly darker
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw target lines (goal preview) - solid lines, same width, different color
    if (showTarget && targetLines.length > 0) {
      for (const line of targetLines) {
        ctx.beginPath();
        ctx.strokeStyle = '#a5b4fc'; // Light indigo for target
        ctx.lineWidth = line.width; // Same width as student's lines
        ctx.lineCap = 'round';
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.stroke();
      }
    }

    // Draw lines
    const lines = world.getLines();
    for (const line of lines) {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    }

    // Draw origin point (small dot, drawn last so it's always visible)
    ctx.beginPath();
    ctx.arc(originX, originY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444'; // Red dot for visibility
    ctx.fill();
  }, [world, world.getLines().length, targetLines, showTarget]);

  // Calculate display dimensions
  const worldWidth = world.getWidth();
  const worldHeight = world.getHeight();
  const displaySize = size || worldWidth;
  const scale = displaySize / worldWidth;

  return (
    <canvas
      ref={canvasRef}
      width={worldWidth}
      height={worldHeight}
      style={{
        width: displaySize,
        height: worldHeight * scale,
      }}
      className={`border border-gray-300 rounded-lg ${className}`}
    />
  );
}
