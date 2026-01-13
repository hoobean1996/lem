/**
 * StudentCard Component
 *
 * Mini preview of a student's progress for teacher dashboard.
 */

import { Check, Star, User } from 'lucide-react';
import type { StudentInfo } from '../../../../core/classroom';
import type { LevelDefinition } from '../../../../core/engine';
import { GridRenderer } from '../../../../core/renderer/GridRenderer';
import { defaultTheme } from '../../../../infrastructure/themes';

interface StudentCardProps {
  student: StudentInfo;
  level: LevelDefinition;
}

export function StudentCard({ student, level }: StudentCardProps) {
  const { name, connected, progress } = student;

  // Only show maze preview if we have real Entity[] from progress
  const hasProgressEntities = progress.entities.length > 0;

  // Calculate dimensions (support both new grid and old entities format)
  const gridWidth = level.grid?.[0]?.length ?? level.width ?? 7;
  const gridHeight = level.grid?.length ?? level.height ?? 6;

  // Calculate mini cell size
  const cellSize = Math.min(16, Math.floor(120 / Math.max(gridWidth, gridHeight)));

  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-3 transition-all ${
        progress.completed
          ? 'border-green-400 bg-green-50'
          : connected
            ? 'border-gray-200'
            : 'border-gray-200 opacity-50'
      }`}
    >
      {/* Disconnected badge */}
      {!connected && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
          Offline
        </div>
      )}

      {/* Completed badge */}
      {progress.completed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
          <Check className="w-3 h-3" />
          Done
        </div>
      )}

      {/* Student name */}
      <div className="font-medium text-gray-800 mb-2 truncate pr-16">{name}</div>

      {/* Mini maze preview */}
      <div
        className="bg-gray-100 rounded-lg p-1 mb-2 flex items-center justify-center overflow-hidden"
        style={{ minHeight: 60 }}
      >
        {hasProgressEntities ? (
          <GridRenderer
            width={gridWidth}
            height={gridHeight}
            entities={progress.entities}
            cellSize={cellSize}
            theme={defaultTheme}
            animationDuration={0}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-600">
            <User className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Stars collected */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < progress.starsCollected ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
