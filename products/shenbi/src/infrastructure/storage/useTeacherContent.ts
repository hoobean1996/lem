/**
 * React Hook for Teacher Content (Level Creator)
 *
 * Provides easy access to custom adventures and levels created by teachers.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStorage } from './StorageProvider';
import type { TeacherContent, CustomAdventure, CustomLevel } from './types';
import type { CompactLevelData } from '../levels/types';

/**
 * Generate a unique ID for custom content
 */
function generateId(prefix: string = 'custom'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface UseTeacherContentOptions {
  /** If provided, filter adventures to only show those created by this user */
  filterByUserId?: string;
}

/**
 * Hook to access and manage teacher-created content.
 * Pass filterByUserId to show only adventures created by that user (for teacher dashboard).
 * Without filter, shows all adventures (for student view).
 */
export function useTeacherContent(options?: UseTeacherContentOptions) {
  const [content, setContent] = useState<TeacherContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all adventures on mount
  useEffect(() => {
    getStorage()
      .getTeacherContent()
      .then((c) => {
        setContent(c);
        setLoading(false);
      });
  }, []);

  // Refresh data from storage
  const refresh = useCallback(async () => {
    const c = await getStorage().getTeacherContent();
    setContent(c);
  }, []);

  // Get adventures, optionally filtered by user ID
  const adventures = useMemo(() => {
    const all = content?.adventures ?? [];
    if (options?.filterByUserId) {
      return all.filter((a) => a.userId === options.filterByUserId);
    }
    return all;
  }, [content, options?.filterByUserId]);

  // Get a specific adventure
  const getAdventure = useCallback(
    (adventureId: string): CustomAdventure | null => {
      return content?.adventures.find((a) => a.id === adventureId) ?? null;
    },
    [content]
  );

  // Create a new adventure
  const createAdventure = useCallback(
    async (data: {
      name: string;
      description?: string;
      icon: string;
    }): Promise<CustomAdventure> => {
      const now = Date.now();
      const adventure: CustomAdventure = {
        id: generateId('adventure'),
        userId: '', // Will be set by API based on authenticated user
        name: data.name,
        description: data.description,
        icon: data.icon,
        gameType: 'maze',
        levels: [],
        createdAt: now,
        updatedAt: now,
      };

      // Save and get the adventure with the real ID and userId from the API
      const savedAdventure = await getStorage().saveCustomAdventure(adventure);
      await refresh();
      return savedAdventure;
    },
    [refresh]
  );

  // Update an adventure
  const updateAdventure = useCallback(
    async (
      adventureId: string,
      updates: Partial<Pick<CustomAdventure, 'name' | 'description' | 'icon'>>
    ): Promise<void> => {
      const adventure = await getStorage().getCustomAdventure(adventureId);
      if (!adventure) return;

      const updated: CustomAdventure = {
        ...adventure,
        ...updates,
        updatedAt: Date.now(),
      };

      await getStorage().saveCustomAdventure(updated);
      await refresh();
    },
    [refresh]
  );

  // Delete an adventure
  const deleteAdventure = useCallback(
    async (adventureId: string): Promise<void> => {
      await getStorage().deleteCustomAdventure(adventureId);
      await refresh();
    },
    [refresh]
  );

  // Add a level to an adventure
  const addLevel = useCallback(
    async (adventureId: string, levelData: CompactLevelData): Promise<CustomLevel> => {
      const adventure = await getStorage().getCustomAdventure(adventureId);
      if (!adventure) throw new Error('Adventure not found');

      const now = Date.now();
      const level: CustomLevel = {
        id: generateId('level'),
        data: {
          ...levelData,
          id: levelData.id || generateId('level'),
        },
        createdAt: now,
        updatedAt: now,
      };

      const updated: CustomAdventure = {
        ...adventure,
        levels: [...adventure.levels, level],
        updatedAt: now,
      };

      await getStorage().saveCustomAdventure(updated);
      await refresh();
      return level;
    },
    [refresh]
  );

  // Update a level in an adventure
  const updateLevel = useCallback(
    async (adventureId: string, levelId: string, levelData: CompactLevelData): Promise<void> => {
      const adventure = await getStorage().getCustomAdventure(adventureId);
      if (!adventure) return;

      const now = Date.now();
      const updated: CustomAdventure = {
        ...adventure,
        levels: adventure.levels.map((l) =>
          l.id === levelId ? { ...l, data: levelData, updatedAt: now } : l
        ),
        updatedAt: now,
      };

      await getStorage().saveCustomAdventure(updated);
      await refresh();
    },
    [refresh]
  );

  // Delete a level from an adventure
  const deleteLevel = useCallback(
    async (adventureId: string, levelId: string): Promise<void> => {
      const adventure = await getStorage().getCustomAdventure(adventureId);
      if (!adventure) return;

      const updated: CustomAdventure = {
        ...adventure,
        levels: adventure.levels.filter((l) => l.id !== levelId),
        updatedAt: Date.now(),
      };

      await getStorage().saveCustomAdventure(updated);
      await refresh();
    },
    [refresh]
  );

  // Reorder levels in an adventure
  const reorderLevels = useCallback(
    async (adventureId: string, levelIds: string[]): Promise<void> => {
      const adventure = await getStorage().getCustomAdventure(adventureId);
      if (!adventure) return;

      // Create a map for quick lookup
      const levelMap = new Map(adventure.levels.map((l) => [l.id, l]));

      // Reorder based on provided IDs
      const reorderedLevels = levelIds
        .map((id) => levelMap.get(id))
        .filter((l): l is CustomLevel => l !== undefined);

      const updated: CustomAdventure = {
        ...adventure,
        levels: reorderedLevels,
        updatedAt: Date.now(),
      };

      await getStorage().saveCustomAdventure(updated);
      await refresh();
    },
    [refresh]
  );

  return {
    content,
    loading,
    adventures,
    refresh,
    getAdventure,
    createAdventure,
    updateAdventure,
    deleteAdventure,
    addLevel,
    updateLevel,
    deleteLevel,
    reorderLevels,
  };
}
