/**
 * Notebook Toolbar Component
 *
 * Contains title, save/export buttons, run all, undo/redo.
 */

import { useState, useRef, useEffect } from 'react';
import {
  Save,
  Download,
  PlayCircle,
  RotateCcw,
  Undo2,
  Redo2,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';

interface NotebookToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onRunAll: () => void;
  onClearAll: () => void;
  onResetKernel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  onBack?: () => void;
}

export function NotebookToolbar({
  title,
  onTitleChange,
  onSave,
  onExportPDF,
  onRunAll,
  onClearAll,
  onResetKernel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaving = false,
  isExporting = false,
  onBack,
}: NotebookToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setEditedTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
      {/* Left: Back button and title */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Back to notebooks"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
            className="text-lg font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
            title="Click to edit title"
          >
            {title}
          </h1>
        )}
      </div>

      {/* Center: Execution controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onRunAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md transition-colors"
          title="Run all cells"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Run All</span>
        </button>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Clear all outputs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>

        <button
          onClick={onResetKernel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
          title="Reset kernel (clear all variables)"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent rounded-md transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent rounded-md transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Save and export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:text-gray-400 rounded-md transition-colors"
          title="Save notebook"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:text-gray-400 rounded-md transition-colors"
          title="Export as PDF"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
        </button>
      </div>
    </div>
  );
}
