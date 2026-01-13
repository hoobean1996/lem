/**
 * Notebook Storage Hook
 *
 * Manages localStorage persistence for notebooks with autosave.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Notebook, NotebookStorageData, NotebookVersion, NotebookHistoryData } from '../types';

// ============ Storage Keys ============

const STORAGE_KEYS = {
  NOTEBOOKS: 'minijupyter_notebooks',
  HISTORY: 'minijupyter_history',
} as const;

// ============ Constants ============

const AUTOSAVE_DELAY = 2000; // 2 seconds
const MAX_VERSIONS = 50; // Keep last 50 versions

// ============ Storage Access ============

function getStorageData(): NotebookStorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
    return data ? JSON.parse(data) : { notebooks: {} };
  } catch {
    return { notebooks: {} };
  }
}

function setStorageData(data: NotebookStorageData): void {
  localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(data));
}

function getHistoryData(): NotebookHistoryData {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setHistoryData(data: NotebookHistoryData): void {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data));
}

// ============ CRUD Operations ============

export function getAllNotebooks(): Notebook[] {
  const data = getStorageData();
  return Object.values(data.notebooks).sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
}

export function getNotebook(id: string): Notebook | null {
  const data = getStorageData();
  return data.notebooks[id] || null;
}

export function saveNotebook(notebook: Notebook): Notebook {
  const data = getStorageData();
  const updatedNotebook: Notebook = {
    ...notebook,
    metadata: {
      ...notebook.metadata,
      updatedAt: Date.now(),
    },
    version: notebook.version + 1,
  };

  data.notebooks[updatedNotebook.id] = updatedNotebook;
  data.lastOpenedId = updatedNotebook.id;
  setStorageData(data);

  // Save version history
  saveVersion(updatedNotebook);

  return updatedNotebook;
}

export function deleteNotebook(id: string): void {
  const data = getStorageData();
  delete data.notebooks[id];
  if (data.lastOpenedId === id) {
    data.lastOpenedId = undefined;
  }
  setStorageData(data);

  // Clean up history
  const history = getHistoryData();
  delete history[id];
  setHistoryData(history);
}

export function getLastOpenedId(): string | undefined {
  const data = getStorageData();
  return data.lastOpenedId;
}

// ============ Version History ============

function saveVersion(notebook: Notebook): void {
  const history = getHistoryData();
  const versions = history[notebook.id] || [];

  versions.push({
    version: notebook.version,
    cells: JSON.parse(JSON.stringify(notebook.cells)), // Deep clone
    timestamp: Date.now(),
  });

  // Trim to max versions
  while (versions.length > MAX_VERSIONS) {
    versions.shift();
  }

  history[notebook.id] = versions;
  setHistoryData(history);
}

export function getVersionHistory(notebookId: string): NotebookVersion[] {
  const history = getHistoryData();
  return history[notebookId] || [];
}

export function restoreVersion(notebookId: string, version: number): Notebook | null {
  const history = getHistoryData();
  const versions = history[notebookId] || [];
  const versionData = versions.find((v) => v.version === version);

  if (!versionData) return null;

  const notebook = getNotebook(notebookId);
  if (!notebook) return null;

  const restoredNotebook: Notebook = {
    ...notebook,
    cells: JSON.parse(JSON.stringify(versionData.cells)),
    metadata: {
      ...notebook.metadata,
      updatedAt: Date.now(),
    },
    version: notebook.version + 1,
  };

  return saveNotebook(restoredNotebook);
}

// ============ Autosave Hook ============

export function useNotebookAutosave(
  notebook: Notebook | null,
  onSaved?: (notebook: Notebook) => void
) {
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const save = useCallback(
    (notebookToSave: Notebook) => {
      const serialized = JSON.stringify(notebookToSave.cells);

      // Skip if no changes
      if (serialized === lastSavedRef.current) return;

      // Clear existing timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      // Set new timer
      autosaveTimerRef.current = setTimeout(() => {
        isSavingRef.current = true;
        try {
          const saved = saveNotebook(notebookToSave);
          lastSavedRef.current = JSON.stringify(saved.cells);
          onSaved?.(saved);
        } catch (error) {
          console.error('Failed to save notebook:', error);
        } finally {
          isSavingRef.current = false;
        }
      }, AUTOSAVE_DELAY);
    },
    [onSaved]
  );

  // Trigger save when notebook changes
  useEffect(() => {
    if (notebook) {
      save(notebook);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [notebook, save]);

  // Force immediate save
  const saveNow = useCallback(() => {
    if (!notebook) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    const saved = saveNotebook(notebook);
    lastSavedRef.current = JSON.stringify(saved.cells);
    onSaved?.(saved);
    return saved;
  }, [notebook, onSaved]);

  return { saveNow, isSaving: isSavingRef.current };
}
