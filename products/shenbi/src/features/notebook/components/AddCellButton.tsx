/**
 * Add Cell Button
 *
 * Appears between cells or at the end to add new cells.
 */

import { useState } from 'react';
import { Plus, FileText, Code } from 'lucide-react';
import type { CellType } from '../types';

interface AddCellButtonProps {
  onAdd: (type: CellType) => void;
  className?: string;
}

export function AddCellButton({ onAdd, className = '' }: AddCellButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`relative flex justify-center py-2 ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Separator line */}
      <div className="absolute left-4 right-4 top-1/2 h-px bg-gray-200" />

      {/* Button group */}
      <div className="relative z-10 flex items-center gap-1 bg-white px-2">
        {isExpanded ? (
          <>
            <button
              onClick={() => onAdd('markdown')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 bg-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Markdown</span>
            </button>
            <button
              onClick={() => onAdd('code')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md border border-gray-200 bg-white transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
          </>
        ) : (
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
