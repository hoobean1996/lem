/**
 * Markdown Cell Component
 *
 * Switches between edit and preview modes.
 */

import { Trash2, Edit3, Eye } from 'lucide-react';
import type { MarkdownCell as MarkdownCellType } from '../../types';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

interface MarkdownCellProps {
  cell: MarkdownCellType;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onToggleEdit: (isEditing: boolean) => void;
}

export function MarkdownCell({ cell, onUpdate, onDelete, onToggleEdit }: MarkdownCellProps) {
  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Cell toolbar */}
      <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
        <button
          onClick={() => onToggleEdit(!cell.isEditing)}
          className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-100 shadow-sm"
          title={cell.isEditing ? 'Preview' : 'Edit'}
        >
          {cell.isEditing ? (
            <Eye className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <Edit3 className="w-3.5 h-3.5 text-gray-600" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-200 shadow-sm"
          title="Delete cell"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-600" />
        </button>
      </div>

      {/* Cell type indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />

      {/* Content */}
      <div className="pl-3">
        {cell.isEditing ? (
          <MarkdownEditor
            content={cell.content}
            onChange={onUpdate}
            onBlur={() => onToggleEdit(false)}
            onShiftEnter={() => onToggleEdit(false)}
          />
        ) : (
          <MarkdownPreview content={cell.content} onDoubleClick={() => onToggleEdit(true)} />
        )}
      </div>
    </div>
  );
}
