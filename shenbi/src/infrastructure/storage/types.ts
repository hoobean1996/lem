/**
 * Storage Types
 *
 * Simple data structures for user progress tracking.
 * Designed for easy migration from localStorage to cloud storage later.
 */

import type { CompactLevelData } from '../levels/types';

export interface LevelProgress {
  completed: boolean;
  starsCollected: number;
  bestCode?: string; // Best solution (optional)
  attempts: number; // How many times tried
  completedAt?: number; // Timestamp when first completed
}

export interface AdventureProgress {
  levels: Record<string, LevelProgress>; // levelId -> progress
  currentLevelIndex: number; // Last played level
  startedAt: number; // When started this adventure
}

export interface UserProgress {
  adventures: Record<string, AdventureProgress>; // adventureId -> progress
  totalStars: number;
  completedLevels: number;
  lastPlayedAdventure?: string;
  lastPlayedAt?: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  preferredTheme?: string;
  language?: string; // 'en' | 'zh'
  tourCompleted: Record<string, boolean>; // tourId -> completed
}

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string; // URL or emoji
  grade?: string; // e.g., "Grade 1", "Kindergarten"
  age?: number;
  role?: UserRole; // User role: student, teacher, parent, admin
  subscriptionTier?: string; // "free" or "premium"
  subscriptionStartedAt?: number; // timestamp when subscription started
  subscriptionExpiresAt?: number; // timestamp when subscription expires
}

export interface UserData {
  userId: string;
  profile: UserProfile;
  progress: UserProgress;
  settings: UserSettings;
  achievements: string[];
  createdAt: number;
}

// ============================================
// Teacher Content Types (Level Creator)
// ============================================

/**
 * Custom Level created by teacher
 * Uses CompactLevelData format for storage efficiency
 */
export interface CustomLevel {
  id: string;
  data: CompactLevelData;
  createdAt: number;
  updatedAt: number;
}

/**
 * Custom Adventure containing custom levels
 */
export interface CustomAdventure {
  id: string;
  userId: string; // Creator's user ID
  name: string;
  description?: string;
  icon: string;
  gameType: 'maze'; // MVP: maze only
  levels: CustomLevel[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Teacher's custom content storage
 */
export interface TeacherContent {
  adventures: CustomAdventure[];
}

// ============================================
// Session Types (Battle & Classroom)
// ============================================

/**
 * Battle room session (for P2P reconnection)
 */
export interface BattleSession {
  roomCode: string;
  isHost: boolean;
  playerName: string;
  createdAt: number;
}

/**
 * Classroom room session (for P2P reconnection)
 */
export interface ClassroomSession {
  classroomId: number;
  roomCode: string;
  role: 'teacher' | 'student';
  userName: string;
  createdAt: number;
}
