/**
 * Storage Provider Interface
 *
 * Abstract interface for data persistence.
 * Uses API-based storage with device identification.
 */

import type {
  UserData,
  UserSettings,
  UserProfile,
  AdventureProgress,
  LevelProgress,
  TeacherContent,
  CustomAdventure,
  BattleSession,
  ClassroomSession,
} from './types';
import { ApiStorageProvider } from './ApiStorageProvider';

export interface StorageProvider {
  // Full data access
  getUserData(): Promise<UserData>;
  saveUserData(data: UserData): Promise<void>;

  // Progress shortcuts
  getAdventureProgress(adventureSlug: string): Promise<AdventureProgress | null>;
  saveLevelProgress(adventureSlug: string, levelSlug: string, progress: LevelProgress): Promise<void>;
  markLevelComplete(
    adventureSlug: string,
    levelSlug: string,
    starsCollected: number,
    code?: string
  ): Promise<void>;
  updateCurrentLevel(adventureSlug: string, levelIndex: number): Promise<void>;

  // Settings shortcuts
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<void>;

  // Profile shortcuts
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: Partial<UserProfile>): Promise<void>;

  // Achievements
  getAchievements(): Promise<string[]>;
  addAchievement(achievementId: string): Promise<void>;

  // Teacher Content (Level Creator)
  getTeacherContent(): Promise<TeacherContent>; // All adventures with userId for filtering
  saveCustomAdventure(adventure: CustomAdventure): Promise<CustomAdventure>;
  deleteCustomAdventure(adventureId: string): Promise<void>;
  getCustomAdventure(adventureId: string): Promise<CustomAdventure | null>;

  // Sessions (Battle & Classroom)
  getBattleSession(): Promise<BattleSession | null>;
  saveBattleSession(session: BattleSession): Promise<void>;
  clearBattleSession(): Promise<void>;
  getClassroomSession(): Promise<ClassroomSession | null>;
  saveClassroomSession(session: ClassroomSession): Promise<void>;
  clearClassroomSession(): Promise<void>;
}

// Singleton API storage instance
let storageInstance: ApiStorageProvider | null = null;

/**
 * Get the storage provider (API-based)
 */
export function getStorage(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new ApiStorageProvider();
  }
  return storageInstance;
}
