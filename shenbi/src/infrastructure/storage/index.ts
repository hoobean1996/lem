/**
 * Storage Module
 *
 * Provides persistent storage for user progress, settings, and achievements.
 * Uses API-based storage with device identification.
 *
 * Usage:
 *   import { useUserProgress, useAchievements } from '../storage';
 *
 *   // In a component:
 *   const { markLevelComplete, isLevelCompleted } = useUserProgress();
 *   const { achievements, unlockAchievement } = useAchievements();
 */

export * from './types';
export { getStorage } from './StorageProvider';
export type { StorageProvider } from './StorageProvider';
export * from './useStorage';
export * from './useTeacherContent';
