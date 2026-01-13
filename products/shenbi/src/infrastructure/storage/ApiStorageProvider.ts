/**
 * API-based Storage Provider
 *
 * Implements StorageProvider interface using the backend API.
 * Uses device-based identification - no login required.
 */

import type { StorageProvider } from './StorageProvider';
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
import {
  profileApi,
  progressApi,
  settingsApi,
  achievementsApi,
  sessionsApi,
  stripeApi,
} from '../services/api';
import type { ProgressResponse } from '../services/api';

/**
 * Convert API progress to frontend LevelProgress format
 */
function convertApiProgressToLevelProgress(apiProgress: ProgressResponse): LevelProgress {
  return {
    completed: apiProgress.completed,
    starsCollected: apiProgress.stars,
    bestCode: apiProgress.best_code || undefined,
    attempts: apiProgress.attempts,
    completedAt: apiProgress.first_completed_at
      ? new Date(apiProgress.first_completed_at).getTime()
      : undefined,
  };
}

/**
 * API-based Storage Provider
 */
export class ApiStorageProvider implements StorageProvider {
  private userDataCache: UserData | null = null;
  private settingsCache: UserSettings | null = null;

  /**
   * Get full user data (combines multiple API calls)
   */
  async getUserData(): Promise<UserData> {
    if (this.userDataCache) {
      return this.userDataCache;
    }

    const [user, allProgress, settings, achievements, subscription] = await Promise.all([
      profileApi.get(),
      progressApi.getAll(),
      settingsApi.get(),
      achievementsApi.list(),
      stripeApi.getCurrentSubscription().catch(() => null),
    ]);

    // Convert progress to adventure-based structure
    const adventures: Record<string, AdventureProgress> = {};
    let totalStars = 0;
    let completedLevels = 0;

    for (const p of allProgress) {
      const adventureKey = p.adventure_slug;
      const levelKey = p.level_slug;
      if (!adventures[adventureKey]) {
        adventures[adventureKey] = {
          levels: {},
          currentLevelIndex: 0,
          startedAt: p.last_attempt_at ? new Date(p.last_attempt_at).getTime() : Date.now(),
        };
      }
      adventures[adventureKey].levels[levelKey] = convertApiProgressToLevelProgress(p);
      totalStars += p.stars;
      if (p.completed) completedLevels++;
    }

    // Find last played adventure
    let lastPlayedAdventure: string | undefined;
    let lastPlayedAt: number | undefined;
    for (const p of allProgress) {
      if (!p.last_attempt_at) continue;
      const attemptTime = new Date(p.last_attempt_at).getTime();
      if (!lastPlayedAt || attemptTime > lastPlayedAt) {
        lastPlayedAt = attemptTime;
        lastPlayedAdventure = p.adventure_slug;
      }
    }

    // Determine subscription tier from subscription status
    const isPremium =
      subscription && (subscription.status === 'active' || subscription.status === 'trialing');

    this.userDataCache = {
      userId: String(user.id),
      profile: {
        name: user.display_name || 'Student',
        avatar: user.avatar_url || undefined,
        grade: user.grade || undefined,
        age: user.age || undefined,
        subscriptionTier: isPremium ? 'premium' : 'free',
        subscriptionStartedAt: subscription?.current_period_start
          ? new Date(subscription.current_period_start).getTime()
          : undefined,
        subscriptionExpiresAt: subscription?.current_period_end
          ? new Date(subscription.current_period_end).getTime()
          : undefined,
      },
      progress: {
        adventures,
        totalStars,
        completedLevels,
        lastPlayedAdventure,
        lastPlayedAt,
      },
      settings: {
        soundEnabled: settings.sound_enabled,
        preferredTheme: settings.preferred_theme || undefined,
        language: 'en', // SDK doesn't have language
        tourCompleted: (settings.tour_completed as unknown as Record<string, boolean>) || {},
      },
      achievements: achievements.map((a) => a.achievement_id),
      createdAt: new Date(user.created_at).getTime(),
    };

    return this.userDataCache;
  }

  async saveUserData(data: UserData): Promise<void> {
    // This is a no-op for API - individual save methods are used
    this.userDataCache = data;
  }

  async getAdventureProgress(adventureSlug: string): Promise<AdventureProgress | null> {
    try {
      const progress = await progressApi.getByAdventure(adventureSlug);

      const levels: Record<string, LevelProgress> = {};
      for (const p of progress) {
        levels[p.level_slug] = convertApiProgressToLevelProgress(p);
      }

      return {
        levels,
        currentLevelIndex: 0, // Not tracked in API yet
        startedAt: Date.now(),
      };
    } catch {
      return null;
    }
  }

  async saveLevelProgress(
    adventureSlug: string,
    levelSlug: string,
    progress: LevelProgress
  ): Promise<void> {
    await progressApi.save({
      adventure_slug: adventureSlug,
      level_slug: levelSlug,
      stars: progress.starsCollected,
      completed: progress.completed,
      code: progress.bestCode,
    });

    // Invalidate cache
    this.userDataCache = null;
  }

  async markLevelComplete(
    adventureSlug: string,
    levelSlug: string,
    starsCollected: number,
    code?: string
  ): Promise<void> {
    await progressApi.save({
      adventure_slug: adventureSlug,
      level_slug: levelSlug,
      stars: starsCollected,
      completed: true,
      code,
    });

    // Invalidate cache
    this.userDataCache = null;
  }

  async updateCurrentLevel(_adventureId: string, _levelIndex: number): Promise<void> {
    // Not tracked in API - could add later
    // For now, just invalidate cache
    this.userDataCache = null;
  }

  async getSettings(): Promise<UserSettings> {
    if (this.settingsCache) {
      return this.settingsCache;
    }

    const apiSettings = await settingsApi.get();

    this.settingsCache = {
      soundEnabled: apiSettings.sound_enabled,
      preferredTheme: apiSettings.preferred_theme || undefined,
      language: 'en',
      tourCompleted: (apiSettings.tour_completed as unknown as Record<string, boolean>) || {},
    };

    return this.settingsCache;
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    // Update sound/theme settings if provided
    if (settings.soundEnabled !== undefined || settings.preferredTheme !== undefined) {
      await settingsApi.update({
        sound_enabled: settings.soundEnabled,
        preferred_theme: settings.preferredTheme,
      });
    }

    // Handle tour completion separately using the dedicated API
    if (settings.tourCompleted) {
      const currentCache = this.settingsCache?.tourCompleted || {};
      for (const [tourId, completed] of Object.entries(settings.tourCompleted)) {
        // Only call API for newly completed tours
        if (completed && !currentCache[tourId]) {
          await settingsApi.completeTour(tourId);
        }
      }
    }

    // Invalidate cache
    this.settingsCache = null;
    this.userDataCache = null;
  }

  async getProfile(): Promise<UserProfile> {
    const [user, subscription] = await Promise.all([
      profileApi.get(),
      stripeApi.getCurrentSubscription().catch(() => null),
    ]);

    const isPremium =
      subscription && (subscription.status === 'active' || subscription.status === 'trialing');

    return {
      name: user.display_name || 'Student',
      avatar: user.avatar_url || undefined,
      grade: user.grade || undefined,
      age: user.age || undefined,
      role: user.role as UserProfile['role'],
      subscriptionTier: isPremium ? 'premium' : 'free',
      subscriptionStartedAt: subscription?.current_period_start
        ? new Date(subscription.current_period_start).getTime()
        : undefined,
      subscriptionExpiresAt: subscription?.current_period_end
        ? new Date(subscription.current_period_end).getTime()
        : undefined,
    };
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    await profileApi.update({
      display_name: profile.name,
      avatar_url: profile.avatar,
      grade: profile.grade,
      age: profile.age,
    });

    // Invalidate cache
    this.userDataCache = null;
  }

  async getAchievements(): Promise<string[]> {
    const achievements = await achievementsApi.list();
    return achievements.map((a) => a.achievement_id);
  }

  async addAchievement(achievementId: string): Promise<void> {
    await achievementsApi.award({ achievement_id: achievementId });

    // Invalidate cache
    this.userDataCache = null;
  }

  // ============================================
  // Teacher Content Methods (deprecated - adventures now in TypeScript)
  // ============================================

  async getTeacherContent(): Promise<TeacherContent> {
    // Custom adventures are no longer supported via API
    return { adventures: [] };
  }

  async saveCustomAdventure(_adventure: CustomAdventure): Promise<CustomAdventure> {
    throw new Error('Custom adventures are no longer supported. Adventures are now managed in TypeScript.');
  }

  async deleteCustomAdventure(_adventureId: string): Promise<void> {
    throw new Error('Custom adventures are no longer supported. Adventures are now managed in TypeScript.');
  }

  async getCustomAdventure(_adventureId: string): Promise<CustomAdventure | null> {
    return null;
  }

  // ============================================
  // Session Methods (Battle & Classroom)
  // ============================================

  async getBattleSession(): Promise<BattleSession | null> {
    const session = await sessionsApi.getBattle();
    if (!session) return null;

    return {
      roomCode: session.room_code,
      isHost: session.is_host,
      playerName: session.player_name || '',
      createdAt: new Date(session.created_at).getTime(),
    };
  }

  async saveBattleSession(session: BattleSession): Promise<void> {
    await sessionsApi.createBattle({
      room_code: session.roomCode,
      is_host: session.isHost,
      player_name: session.playerName,
    });
  }

  async clearBattleSession(): Promise<void> {
    await sessionsApi.endBattle();
  }

  async getClassroomSession(): Promise<ClassroomSession | null> {
    const session = await sessionsApi.getClassroom();
    if (!session) return null;

    return {
      classroomId: session.classroom_id,
      roomCode: session.room_code,
      role: session.role as 'teacher' | 'student',
      userName: '', // SDK doesn't have user_name
      createdAt: new Date(session.created_at).getTime(),
    };
  }

  async saveClassroomSession(session: ClassroomSession): Promise<void> {
    await sessionsApi.createClassroom({
      classroom_id: session.classroomId,
      room_code: session.roomCode,
      role: session.role,
    });
  }

  async clearClassroomSession(): Promise<void> {
    await sessionsApi.endClassroom();
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.userDataCache = null;
    this.settingsCache = null;
  }
}
