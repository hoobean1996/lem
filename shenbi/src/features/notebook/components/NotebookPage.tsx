/**
 * Notebook Page Component
 *
 * Main page for editing and viewing notebooks.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { MultiBackend, TouchTransition, MouseTransition } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useNotebook } from '../hooks';
import { NotebookToolbar } from './NotebookToolbar';
import { NotebookSidebar } from './NotebookSidebar';
import { CellList } from './CellList';
import { downloadNotebookPDF } from '../utils/pdfExport';

// Multi-backend configuration for mouse and touch support
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

export function NotebookPage() {
  const { id: notebookId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const {
    notebook,
    isLoading,
    executingCellId,
    updateTitle,
    addCell,
    deleteCell,
    updateCellContent,
    updateCellGameType,
    toggleMarkdownEdit,
    moveCellByIndex,
    executeCodeCell,
    runAllCells,
    clearAllOutputs,
    clearCellOutput,
    resetContext,
    undo,
    redo,
    canUndo,
    canRedo,
    saveNow,
  } = useNotebook({ notebookId });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveNow]);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    if (!notebook) return;

    setIsExporting(true);
    try {
      await downloadNotebookPDF(notebook);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  }, [notebook]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate('/notebooks');
  }, [navigate]);

  // Scroll to cell when clicked in sidebar
  const handleCellClick = useCallback((cellId: string) => {
    const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading notebook...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Toolbar */}
        <NotebookToolbar
          title={notebook.metadata.title}
          onTitleChange={updateTitle}
          onSave={saveNow}
          onExportPDF={handleExportPDF}
          onRunAll={runAllCells}
          onClearAll={clearAllOutputs}
          onResetKernel={resetContext}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          isExporting={isExporting}
          onBack={handleBack}
        />

        {/* Main content with sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Table of Contents */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <NotebookSidebar
              cells={notebook.cells}
              onCellClick={handleCellClick}
              activeCellId={executingCellId || undefined}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div ref={contentRef} className="max-w-4xl mx-auto py-6 px-4">
              <CellList
                cells={notebook.cells}
                executingCellId={executingCellId}
                onUpdateContent={updateCellContent}
                onDeleteCell={deleteCell}
                onMoveCell={moveCellByIndex}
                onAddCell={addCell}
                onRunCell={executeCodeCell}
                onClearOutput={clearCellOutput}
                onToggleMarkdownEdit={toggleMarkdownEdit}
                onGameTypeChange={updateCellGameType}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
