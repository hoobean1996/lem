/**
 * Notebook History Hook
 *
 * Provides undo/redo functionality for notebook editing.
 * Based on the pattern from BlockEditor's useBlockHistory.
 */

import { useState, useCallback, useRef } from 'react';
import type { Notebook } from '../types';

const MAX_HISTORY = 50;

interface HistoryState {
  past: Notebook[];
  present: Notebook;
  future: Notebook[];
}

export function useNotebookHistory(initialNotebook: Notebook) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialNotebook,
    future: [],
  });

  // Flag to skip recording history for certain updates
  const skipHistoryRef = useRef(false);

  // Update the notebook with history tracking
  const updateNotebook = useCallback((updater: (prev: Notebook) => Notebook) => {
    setHistory((prev) => {
      const newNotebook = updater(prev.present);

      // Skip if no actual change
      if (newNotebook === prev.present) return prev;

      // Skip history recording if flagged
      if (skipHistoryRef.current) {
        skipHistoryRef.current = false;
        return { ...prev, present: newNotebook };
      }

      // Add current state to past
      const newPast = [...prev.past, prev.present];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newNotebook,
        future: [], // Clear future on new change
      };
    });
  }, []);

  // Undo last change
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const previous = newPast.pop()!;

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo last undone change
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const next = newFuture.shift()!;

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Reset history with a new notebook
  const resetHistory = useCallback((notebook: Notebook) => {
    setHistory({
      past: [],
      present: notebook,
      future: [],
    });
  }, []);

  // Update without recording history (for things like cursor position)
  const updateWithoutHistory = useCallback(
    (updater: (prev: Notebook) => Notebook) => {
      skipHistoryRef.current = true;
      updateNotebook(updater);
    },
    [updateNotebook]
  );

  return {
    notebook: history.present,
    updateNotebook,
    updateWithoutHistory,
    undo,
    redo,
    resetHistory,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
  };
}
