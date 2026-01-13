/**
 * Code Cell Toolbar
 *
 * Contains run button, game type selector, and other actions.
 */

import { Play, Trash2, Loader2 } from 'lucide-react';
import type { GameType } from '../../types';

interface CellToolbarProps {
  isExecuting: boolean;
  executionCount: number | null;
  gameType?: GameType;
  onRun: () => void;
  onDelete: () => void;
  onGameTypeChange: (gameType: GameType | undefined) => void;
}

export function CellToolbar({
  isExecuting,
  executionCount,
  gameType,
  onRun,
  onDelete,
  onGameTypeChange,
}: CellToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* Left side: execution count and run button */}
      <div className="flex items-center gap-2">
        {/* Execution count badge */}
        <div className="w-8 text-center">
          {executionCount !== null ? (
            <span className="text-xs font-mono text-gray-500">[{executionCount}]</span>
          ) : (
            <span className="text-xs font-mono text-gray-400">[ ]</span>
          )}
        </div>

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded transition-colors"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Game type selector */}
        <select
          value={gameType || ''}
          onChange={(e) =>
            onGameTypeChange(e.target.value ? (e.target.value as GameType) : undefined)
          }
          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">No Canvas</option>
          <option value="turtle">Turtle</option>
        </select>
      </div>

      {/* Right side: delete button */}
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete cell"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
