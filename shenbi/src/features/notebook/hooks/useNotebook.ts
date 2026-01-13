/**
 * Main Notebook Hook
 *
 * Combines state management, history, storage, and execution.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Notebook, CodeCell, CellType, GameType } from '../types';
import { useNotebookHistory } from './useNotebookHistory';
import { useNotebookAutosave, getNotebook } from './useNotebookStorage';
import { useNotebookExecution } from './useNotebookExecution';
import {
  createNotebook,
  createMarkdownCell,
  createCodeCell,
  insertCellAfter,
  removeCell,
  moveCell,
  isCodeCell,
  updateCell,
} from '../utils/cellHelpers';

interface UseNotebookOptions {
  notebookId?: string;
  author?: string;
  authorId?: string;
}

export function useNotebook(options: UseNotebookOptions = {}) {
  const { notebookId, author = 'Anonymous', authorId = 'unknown' } = options;

  // Load or create notebook
  const [isLoading, setIsLoading] = useState(true);
  const [initialNotebook, setInitialNotebook] = useState<Notebook | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let notebook: Notebook;

    if (notebookId) {
      const existing = getNotebook(notebookId);
      notebook = existing || createNotebook('Untitled Notebook', author, authorId);
    } else {
      notebook = createNotebook('Untitled Notebook', author, authorId);
    }

    setInitialNotebook(notebook);
    setIsLoading(false);
  }, [notebookId, author, authorId]);

  // History management
  const {
    notebook,
    updateNotebook,
    updateWithoutHistory,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  } = useNotebookHistory(initialNotebook || createNotebook());

  // Update history when initial notebook loads
  useEffect(() => {
    if (initialNotebook) {
      resetHistory(initialNotebook);
    }
  }, [initialNotebook, resetHistory]);

  // Autosave
  const { saveNow } = useNotebookAutosave(notebook);

  // Execution
  const { executeCell: runCell, resetContext, getGlobals, executionCount } = useNotebookExecution();

  // Currently executing cell
  const [executingCellId, setExecutingCellId] = useState<string | null>(null);

  // ============ Cell Operations ============

  const updateTitle = useCallback(
    (title: string) => {
      updateNotebook((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, title },
      }));
    },
    [updateNotebook]
  );

  const addCell = useCallback(
    (type: CellType, afterId: string | null = null, gameType?: GameType) => {
      const newCell = type === 'markdown' ? createMarkdownCell() : createCodeCell('', gameType);
      updateNotebook((prev) => ({
        ...prev,
        cells: insertCellAfter(prev.cells, afterId, newCell),
      }));
      return newCell.id;
    },
    [updateNotebook]
  );

  const deleteCell = useCallback(
    (cellId: string) => {
      updateNotebook((prev) => {
        if (prev.cells.length <= 1) return prev; // Keep at least one cell
        return {
          ...prev,
          cells: removeCell(prev.cells, cellId),
        };
      });
    },
    [updateNotebook]
  );

  const updateCellContent = useCallback(
    (cellId: string, content: string) => {
      updateWithoutHistory((prev) => ({
        ...prev,
        cells: prev.cells.map((cell) =>
          cell.id === cellId ? updateCell(cell, { content }) : cell
        ),
      }));
    },
    [updateWithoutHistory]
  );

  const updateCellGameType = useCallback(
    (cellId: string, gameType: GameType | undefined) => {
      updateNotebook((prev) => ({
        ...prev,
        cells: prev.cells.map((cell) =>
          cell.id === cellId && isCodeCell(cell)
            ? updateCell(cell, { gameType } as Partial<CodeCell>)
            : cell
        ),
      }));
    },
    [updateNotebook]
  );

  const toggleMarkdownEdit = useCallback(
    (cellId: string, isEditing: boolean) => {
      updateWithoutHistory((prev) => ({
        ...prev,
        cells: prev.cells.map((cell) =>
          cell.id === cellId && cell.type === 'markdown' ? { ...cell, isEditing } : cell
        ),
      }));
    },
    [updateWithoutHistory]
  );

  const moveCellByIndex = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateNotebook((prev) => ({
        ...prev,
        cells: moveCell(prev.cells, fromIndex, toIndex),
      }));
    },
    [updateNotebook]
  );

  // ============ Execution ============

  const executeCodeCell = useCallback(
    async (cellId: string) => {
      const cell = notebook.cells.find((c) => c.id === cellId);
      if (!cell || !isCodeCell(cell)) return;

      setExecutingCellId(cellId);

      // Update cell to running state
      updateWithoutHistory((prev) => ({
        ...prev,
        cells: prev.cells.map((c) =>
          c.id === cellId
            ? updateCell(
                c as CodeCell,
                {
                  executionState: 'running',
                  outputs: [],
                } as Partial<CodeCell>
              )
            : c
        ),
      }));

      try {
        const result = await runCell(cell);

        // Update cell with results
        updateNotebook((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? updateCell(
                  c as CodeCell,
                  {
                    executionState: result.success ? 'success' : 'error',
                    executionCount: executionCount + 1,
                    outputs: result.outputs,
                  } as Partial<CodeCell>
                )
              : c
          ),
        }));
      } catch {
        updateNotebook((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? updateCell(
                  c as CodeCell,
                  {
                    executionState: 'error',
                  } as Partial<CodeCell>
                )
              : c
          ),
        }));
      } finally {
        setExecutingCellId(null);
      }
    },
    [notebook.cells, runCell, executionCount, updateNotebook, updateWithoutHistory]
  );

  const runAllCells = useCallback(async () => {
    for (const cell of notebook.cells) {
      if (isCodeCell(cell)) {
        await executeCodeCell(cell.id);
      }
    }
  }, [notebook.cells, executeCodeCell]);

  const clearAllOutputs = useCallback(() => {
    updateNotebook((prev) => ({
      ...prev,
      cells: prev.cells.map((cell) =>
        isCodeCell(cell)
          ? updateCell(cell, {
              outputs: [],
              executionState: 'idle',
              executionCount: null,
            } as Partial<CodeCell>)
          : cell
      ),
    }));
    resetContext();
  }, [updateNotebook, resetContext]);

  const clearCellOutput = useCallback(
    (cellId: string) => {
      updateNotebook((prev) => ({
        ...prev,
        cells: prev.cells.map((cell) =>
          cell.id === cellId && isCodeCell(cell)
            ? updateCell(cell, {
                outputs: [],
                executionState: 'idle',
              } as Partial<CodeCell>)
            : cell
        ),
      }));
    },
    [updateNotebook]
  );

  return {
    // State
    notebook,
    isLoading,
    executingCellId,

    // Metadata
    updateTitle,

    // Cell operations
    addCell,
    deleteCell,
    updateCellContent,
    updateCellGameType,
    toggleMarkdownEdit,
    moveCellByIndex,

    // Execution
    executeCodeCell,
    runAllCells,
    clearAllOutputs,
    clearCellOutput,
    resetContext,
    getGlobals,

    // History
    undo,
    redo,
    canUndo,
    canRedo,

    // Storage
    saveNow,
  };
}
