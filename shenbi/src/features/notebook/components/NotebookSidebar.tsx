/**
 * Notebook Sidebar Component
 *
 * Shows Table of Contents extracted from markdown headings.
 */

import { useMemo } from 'react';
import { Code, ChevronRight } from 'lucide-react';
import type { Cell } from '../types';
import { isMarkdownCell, isCodeCell } from '../utils/cellHelpers';

interface TocEntry {
  id: string;
  cellId: string;
  level: number;
  text: string;
  type: 'heading' | 'code';
}

interface NotebookSidebarProps {
  cells: Cell[];
  onCellClick: (cellId: string) => void;
  activeCellId?: string;
}

export function NotebookSidebar({ cells, onCellClick, activeCellId }: NotebookSidebarProps) {
  // Extract TOC entries from cells
  const tocEntries = useMemo(() => {
    const entries: TocEntry[] = [];

    cells.forEach((cell, index) => {
      if (isMarkdownCell(cell)) {
        // Extract headings from markdown content
        const lines = cell.content.split('\n');
        for (const line of lines) {
          const match = line.match(/^(#{1,6})\s+(.+)$/);
          if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            entries.push({
              id: `${cell.id}-${entries.length}`,
              cellId: cell.id,
              level,
              text,
              type: 'heading',
            });
          }
        }
      } else if (isCodeCell(cell)) {
        // Add code cells with a label
        const firstLine = cell.content.split('\n')[0]?.trim() || '';
        const label = firstLine.startsWith('#')
          ? firstLine.replace(/^#\s*/, '').slice(0, 30)
          : `Code [${index + 1}]`;
        entries.push({
          id: cell.id,
          cellId: cell.id,
          level: 0,
          text: label,
          type: 'code',
        });
      }
    });

    return entries;
  }, [cells]);

  if (tocEntries.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400 italic">
        No headings yet. Add markdown cells with # headings.
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Contents
      </div>
      <nav className="space-y-0.5">
        {tocEntries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onCellClick(entry.cellId)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 ${
              activeCellId === entry.cellId
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-700'
            }`}
            style={{
              paddingLeft: entry.type === 'heading' ? `${12 + (entry.level - 1) * 12}px` : '12px',
            }}
          >
            {entry.type === 'heading' ? (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className={`truncate ${entry.level === 1 ? 'font-medium' : ''}`}>
                  {entry.text}
                </span>
              </>
            ) : (
              <>
                <Code className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="truncate text-gray-500">{entry.text}</span>
              </>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
