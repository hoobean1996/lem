/**
 * Code Cell Component
 *
 * Contains code editor, toolbar, and output display.
 */

import { useCallback } from 'react';
import type { CodeCell as CodeCellType, GameType } from '../../types';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { CellToolbar } from './CellToolbar';
import { CellOutput } from './CellOutput';

interface CodeCellProps {
  cell: CodeCellType;
  isExecuting: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onRun: () => void;
  onClearOutput: () => void;
  onGameTypeChange: (gameType: GameType | undefined) => void;
}

export function CodeCell({
  cell,
  isExecuting,
  onUpdate,
  onDelete,
  onRun,
  onClearOutput,
  onGameTypeChange,
}: CodeCellProps) {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Shift+Enter to run
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        onRun();
      }
    },
    [onRun]
  );

  // Determine border color based on execution state
  const borderColor = {
    idle: 'border-gray-200',
    running: 'border-yellow-400',
    success: 'border-green-400',
    error: 'border-red-400',
  }[cell.executionState];

  const indicatorColor = {
    idle: 'bg-green-600',
    running: 'bg-yellow-500',
    success: 'bg-green-600',
    error: 'bg-red-500',
  }[cell.executionState];

  return (
    <div
      className={`group relative bg-white rounded-lg border ${borderColor} hover:border-gray-300 transition-colors overflow-hidden`}
      onKeyDown={handleKeyDown}
    >
      {/* Cell type indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorColor}`} />

      {/* Toolbar */}
      <div className="pl-3">
        <CellToolbar
          isExecuting={isExecuting}
          executionCount={cell.executionCount}
          gameType={cell.gameType}
          onRun={onRun}
          onDelete={onDelete}
          onGameTypeChange={onGameTypeChange}
        />
      </div>

      {/* Code editor */}
      <div className="pl-3">
        <div className="py-2">
          <CodeEditor
            code={cell.content}
            onChange={onUpdate}
            disabled={isExecuting}
            placeholder="# Write your code here...&#10;print('Hello, World!')"
            className="min-h-[60px]"
          />
        </div>
      </div>

      {/* Output */}
      <div className="pl-3">
        <CellOutput outputs={cell.outputs} onClear={onClearOutput} />
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Shift+Enter to run
      </div>
    </div>
  );
}
