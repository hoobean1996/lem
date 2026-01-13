/**
 * React Hook for Storage Access
 *
 * Provides easy access to storage operations in React components.
 * Falls back to defaults if API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorage } from './StorageProvider';
import type { UserData, UserProfile, AdventureProgress } from './types';
import { warn } from '../logging';

// Default user data when API is unavailable
const defaultUserData: UserData = {
  userId: 'offline',
  profile: { name: 'Student', avatar: '🧒' },
  progress: { adventures: {}, totalStars: 0, completedLevels: 0 },
  settings: { soundEnabled: true, tourCompleted: {} },
  achievements: [],
  createdAt: Date.now(),
};

/**
 * Hook to access and manage user progress
 */
export function useUserProgress() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    getStorage()
      .getUserData()
      .then((data) => {
        setUserData(data);
        setError(null);
      })
      .catch((err: unknown) => {
        warn('Failed to load user data, using defaults', { error: err }, 'useStorage');
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Refresh data from storage
  const refresh = useCallback(async () => {
    try {
      const data = await getStorage().getUserData();
      setUserData(data);
      setError(null);
    } catch (err) {
      warn('Failed to refresh user data', { error: err }, 'useStorage');
    }
  }, []);

  // Mark a level as complete
  const markLevelComplete = useCallback(
    async (
      adventureSlug: string,
      levelSlug: string,
      starsCollected: number,
      code?: string
    ) => {
      // Update local state immediately
      setUserData((prev) => {
        const newData = { ...prev };
        const progressData = {
          completed: true,
          starsCollected,
          bestCode: code,
          attempts: 1,
          completedAt: Date.now(),
        };

        if (!newData.progress.adventures[adventureSlug]) {
          newData.progress.adventures[adventureSlug] = {
            levels: {},
            currentLevelIndex: 0,
            startedAt: Date.now(),
          };
        }
        newData.progress.adventures[adventureSlug].levels[levelSlug] = progressData;

        return newData;
      });

      // Persist to API
      try {
        await getStorage().markLevelComplete(
          adventureSlug,
          levelSlug,
          starsCollected,
          code
        );
        await refresh();
      } catch (err) {
        warn('Failed to save level completion', { error: err }, 'useStorage');
      }
    },
    [refresh]
  );

  // Get progress for a specific adventure
  const getAdventureProgress = useCallback(
    async (adventureId: string): Promise<AdventureProgress | null> => {
      try {
        return await getStorage().getAdventureProgress(adventureId);
      } catch (err) {
        warn('Failed to get adventure progress', { error: err, adventureId }, 'useStorage');
        return userData?.progress?.adventures?.[adventureId] || null;
      }
    },
    [userData]
  );

  // Check if a level is completed
  const isLevelCompleted = useCallback(
    (adventureSlug: string, levelSlug: string): boolean => {
      if (!userData?.progress?.adventures) return false;
      return userData.progress.adventures[adventureSlug]?.levels[levelSlug]?.completed ?? false;
    },
    [userData]
  );

  // Get stars for a level
  const getLevelStars = useCallback(
    (adventureId: string, levelId: string): number => {
      if (!userData?.progress?.adventures) return 0;
      return userData.progress.adventures[adventureId]?.levels[levelId]?.starsCollected || 0;
    },
    [userData]
  );

  // Get total stats
  const getTotalStats = useCallback(() => {
    if (!userData) return { totalStars: 0, completedLevels: 0 };
    return {
      totalStars: userData.progress.totalStars,
      completedLevels: userData.progress.completedLevels,
    };
  }, [userData]);

  // Update current level index for an adventure
  const updateCurrentLevel = useCallback(
    async (adventureId: string, levelIndex: number) => {
      try {
        await getStorage().updateCurrentLevel(adventureId, levelIndex);
        await refresh();
      } catch (err) {
        warn(
          'Failed to update current level',
          { error: err, adventureId, levelIndex },
          'useStorage'
        );
      }
    },
    [refresh]
  );

  // Get current level index for an adventure
  const getCurrentLevelIndex = useCallback(
    (adventureId: string): number => {
      if (!userData?.progress?.adventures) return 0;
      return userData.progress.adventures[adventureId]?.currentLevelIndex || 0;
    },
    [userData]
  );

  return {
    userData,
    loading,
    error,
    refresh,
    markLevelComplete,
    getAdventureProgress,
    isLevelCompleted,
    getLevelStars,
    getTotalStats,
    updateCurrentLevel,
    getCurrentLevelIndex,
  };
}

/**
 * Hook to access achievements
 */
export function useAchievements() {
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load achievements on mount
  useEffect(() => {
    getStorage()
      .getAchievements()
      .then((a) => {
        setAchievements(a);
      })
      .catch((err) => {
        warn('Failed to load achievements', { error: err }, 'useStorage');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add an achievement
  const addAchievement = useCallback(async (achievementId: string) => {
    // Update local state immediately
    setAchievements((prev) => (prev.includes(achievementId) ? prev : [...prev, achievementId]));

    try {
      await getStorage().addAchievement(achievementId);
      const updated = await getStorage().getAchievements();
      setAchievements(updated);
    } catch (err) {
      warn('Failed to save achievement', { error: err, achievementId }, 'useStorage');
    }
  }, []);

  // Check if has achievement
  const hasAchievement = useCallback(
    (achievementId: string): boolean => {
      return achievements.includes(achievementId);
    },
    [achievements]
  );

  return {
    achievements,
    loading,
    addAchievement,
    hasAchievement,
  };
}

/**
 * Hook to access and manage user profile
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>({ name: 'Student', avatar: '🧒' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    getStorage()
      .getProfile()
      .then((p) => {
        setProfile(p);
        setError(null);
      })
      .catch((err: unknown) => {
        warn('Failed to load profile', { error: err }, 'useStorage');
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    // Update local state immediately
    setProfile((prev) => ({ ...prev, ...updates }));

    try {
      await getStorage().updateProfile(updates);
      const newProfile = await getStorage().getProfile();
      setProfile(newProfile);
    } catch (err) {
      warn('Failed to save profile', { error: err, updates }, 'useStorage');
    }
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
