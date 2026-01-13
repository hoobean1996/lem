/**
 * BattleLevelPicker Component
 *
 * Grid of level cards for host to select battle level.
 */

import { Check } from 'lucide-react';
import { LevelDefinition } from '../../../../core/engine';

interface BattleLevelPickerProps {
  levels: LevelDefinition[];
  selectedLevel: LevelDefinition | null;
  onSelectLevel: (level: LevelDefinition) => void;
}

export function BattleLevelPicker({
  levels,
  selectedLevel,
  onSelectLevel,
}: BattleLevelPickerProps) {
  if (levels.length === 0) {
    return <div className="text-center text-gray-600 py-4">Loading levels...</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Select Level</h3>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {levels.map((level) => {
          const isSelected = selectedLevel?.id === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level)}
              className={`
                relative p-3 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-[#7dad4c] bg-[#e8f5e0]'
                    : 'border-gray-200 bg-white hover:border-[#7dad4c] hover:bg-[#e8f5e0]/50'
                }
              `}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-[#4a7a2a] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Level info */}
              <div className="font-medium text-gray-800 text-sm truncate pr-6">{level.name}</div>

              {/* Mini grid preview */}
              {(level.grid || level.entities) && (
                <div className="mt-2 text-xs text-gray-600">
                  {level.grid
                    ? `${level.grid[0]?.length ?? 0}x${level.grid.length}`
                    : `${level.width ?? 0}x${level.height ?? 0}`}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
