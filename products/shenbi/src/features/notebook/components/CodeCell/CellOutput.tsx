/**
 * Cell Output Component
 *
 * Displays execution outputs: text, errors, and canvas.
 */

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CellOutput as CellOutputType, TurtleCanvasState } from '../../types';

interface CellOutputProps {
  outputs: CellOutputType[];
  onClear: () => void;
}

export function CellOutput({ outputs, onClear }: CellOutputProps) {
  if (outputs.length === 0) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Clear button */}
      <div className="flex justify-end p-1">
        <button
          onClick={onClear}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Clear output"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Outputs */}
      <div className="px-4 pb-4 space-y-2">
        {outputs.map((output) => (
          <OutputItem key={output.id} output={output} />
        ))}
      </div>
    </div>
  );
}

interface OutputItemProps {
  output: CellOutputType;
}

function OutputItem({ output }: OutputItemProps) {
  switch (output.type) {
    case 'text':
      return <TextOutput content={output.content} />;
    case 'error':
      return <ErrorOutput content={output.content} />;
    case 'turtle':
      return output.canvasState ? (
        <TurtleOutput canvasState={output.canvasState as TurtleCanvasState} />
      ) : null;
    default:
      return null;
  }
}

function TextOutput({ content }: { content: string }) {
  return (
    <pre className="font-mono text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
      {content}
    </pre>
  );
}

function ErrorOutput({ content }: { content: string }) {
  return (
    <pre className="font-mono text-sm bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 overflow-x-auto whitespace-pre-wrap">
      {content}
    </pre>
  );
}

function TurtleOutput({ canvasState }: { canvasState: TurtleCanvasState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, lines, turtle } = canvasState;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let x = centerX % gridSize; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = centerY % gridSize; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw lines
    for (const line of lines) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    }

    // Draw turtle
    ctx.save();
    ctx.translate(turtle.x, turtle.y);
    ctx.rotate((-turtle.angle * Math.PI) / 180); // Negative because canvas Y is inverted

    // Turtle shape (triangle pointing right)
    ctx.fillStyle = turtle.penDown ? '#22c55e' : '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [canvasState]);

  return (
    <div className="inline-block border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <canvas
        ref={canvasRef}
        width={canvasState.width}
        height={canvasState.height}
        className="block"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
