/**
 * useBlockHistory Hook
 *
 * Provides undo/redo functionality for block state management.
 * Uses past/present/future stacks pattern.
 */

import { useState, useCallback, useRef } from 'react';
import type { Block } from '../types';

const MAX_HISTORY = 50;

interface HistoryState {
  past: Block[][];
  present: Block[];
  future: Block[][];
}

export interface UseBlockHistoryReturn {
  blocks: Block[];
  setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetHistory: (blocks: Block[]) => void;
}

export function useBlockHistory(initialBlocks: Block[] = []): UseBlockHistoryReturn {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialBlocks,
    future: [],
  });

  // Use ref to track if we should skip history push (for undo/redo operations)
  const skipHistoryRef = useRef(false);

  const setBlocks = useCallback((newBlocksOrUpdater: Block[] | ((prev: Block[]) => Block[])) => {
    setHistory((prev) => {
      const newBlocks =
        typeof newBlocksOrUpdater === 'function'
          ? newBlocksOrUpdater(prev.present)
          : newBlocksOrUpdater;

      // Skip if blocks haven't actually changed (shallow comparison)
      if (newBlocks === prev.present) {
        return prev;
      }

      // Skip history push during undo/redo
      if (skipHistoryRef.current) {
        skipHistoryRef.current = false;
        return {
          ...prev,
          present: newBlocks,
        };
      }

      // Normal update: push current to past, clear future
      const newPast = [...prev.past, prev.present];

      // Limit history size
      if (newPast.length > MAX_HISTORY) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newBlocks,
        future: [], // Clear future on new change
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const previousState = newPast.pop()!;

      return {
        past: newPast,
        present: previousState,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const nextState = newFuture.shift()!;

      return {
        past: [...prev.past, prev.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);

  const resetHistory = useCallback((blocks: Block[]) => {
    setHistory({
      past: [],
      present: blocks,
      future: [],
    });
  }, []);

  return {
    blocks: history.present,
    setBlocks,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    resetHistory,
  };
}
