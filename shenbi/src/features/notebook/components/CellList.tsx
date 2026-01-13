/**
 * Cell List Component
 *
 * Renders all cells with drag-and-drop reordering.
 */

import type { Cell, CellType, GameType } from '../types';
import { isMarkdownCell, isCodeCell } from '../utils/cellHelpers';
import { MarkdownCell } from './MarkdownCell';
import { CodeCell } from './CodeCell';
import { CellWrapper } from './CellWrapper';
import { AddCellButton } from './AddCellButton';

interface CellListProps {
  cells: Cell[];
  executingCellId: string | null;
  onUpdateContent: (cellId: string, content: string) => void;
  onDeleteCell: (cellId: string) => void;
  onMoveCell: (fromIndex: number, toIndex: number) => void;
  onAddCell: (type: CellType, afterId: string | null) => void;
  onRunCell: (cellId: string) => void;
  onClearOutput: (cellId: string) => void;
  onToggleMarkdownEdit: (cellId: string, isEditing: boolean) => void;
  onGameTypeChange: (cellId: string, gameType: GameType | undefined) => void;
}

export function CellList({
  cells,
  executingCellId,
  onUpdateContent,
  onDeleteCell,
  onMoveCell,
  onAddCell,
  onRunCell,
  onClearOutput,
  onToggleMarkdownEdit,
  onGameTypeChange,
}: CellListProps) {
  return (
    <div className="space-y-2">
      {/* Add cell button at top */}
      <AddCellButton onAdd={(type) => onAddCell(type, null)} />

      {cells.map((cell, index) => (
        <div key={cell.id}>
          <CellWrapper cellId={cell.id} index={index} onMove={onMoveCell}>
            {isMarkdownCell(cell) ? (
              <MarkdownCell
                cell={cell}
                onUpdate={(content) => onUpdateContent(cell.id, content)}
                onDelete={() => onDeleteCell(cell.id)}
                onToggleEdit={(isEditing) => onToggleMarkdownEdit(cell.id, isEditing)}
              />
            ) : isCodeCell(cell) ? (
              <CodeCell
                cell={cell}
                isExecuting={executingCellId === cell.id}
                onUpdate={(content) => onUpdateContent(cell.id, content)}
                onDelete={() => onDeleteCell(cell.id)}
                onRun={() => onRunCell(cell.id)}
                onClearOutput={() => onClearOutput(cell.id)}
                onGameTypeChange={(gameType) => onGameTypeChange(cell.id, gameType)}
              />
            ) : null}
          </CellWrapper>

          {/* Add cell button after each cell */}
          <AddCellButton onAdd={(type) => onAddCell(type, cell.id)} />
        </div>
      ))}
    </div>
  );
}
