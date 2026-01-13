/**
 * Badge Checker
 *
 * Checks user progress against badge conditions and returns newly earned badges.
 */

import type { UserData, UserProgress } from '../../infrastructure/storage/types';
import { parseEarnedBadge } from './types';

const SESSION_STREAK_KEY = 'shenbi_session_streak';

/**
 * Context for badge checking
 */
export interface BadgeCheckContext {
  userData: UserData;
  currentAdventureId?: string;
  currentLevelId?: string;
  starsJustEarned?: number;
  adventureTotalLevels?: number;
  isCustomAdventure?: boolean;
  gameType?: 'maze' | 'turtle';
}

/**
 * Get current session streak (levels completed in this browser session)
 */
export function getSessionStreak(): number {
  return parseInt(sessionStorage.getItem(SESSION_STREAK_KEY) || '0', 10);
}

/**
 * Increment session streak
 */
export function incrementSessionStreak(): number {
  const streak = getSessionStreak() + 1;
  sessionStorage.setItem(SESSION_STREAK_KEY, streak.toString());
  return streak;
}

/**
 * Get set of already earned badge IDs
 */
function getEarnedBadgeIds(achievements: string[]): Set<string> {
  const ids = new Set<string>();
  for (const str of achievements) {
    const badge = parseEarnedBadge(str);
    if (badge) {
      ids.add(badge.id);
    }
  }
  return ids;
}

/**
 * Count levels with 3 stars (perfect levels)
 */
function countPerfectLevels(progress: UserProgress): number {
  let count = 0;
  for (const adventure of Object.values(progress.adventures)) {
    for (const level of Object.values(adventure.levels)) {
      if (level.starsCollected >= 3) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Check if any adventure is fully completed
 */
function hasCompletedAdventure(
  progress: UserProgress,
  adventureId: string,
  totalLevels: number
): boolean {
  const adventure = progress.adventures[adventureId];
  if (!adventure) return false;

  const completedCount = Object.values(adventure.levels).filter((l) => l.completed).length;
  return completedCount >= totalLevels;
}

/**
 * Check if user has completed any maze level
 */
function hasCompletedMazeLevel(progress: UserProgress): boolean {
  // Math-explorer is the maze adventure
  const mazeAdventure = progress.adventures['math-explorer'];
  if (!mazeAdventure) return false;
  return Object.values(mazeAdventure.levels).some((l) => l.completed);
}

/**
 * Check if user has completed any turtle level
 */
function hasCompletedTurtleLevel(progress: UserProgress): boolean {
  // Turtle-adventure is the turtle graphics adventure
  const turtleAdventure = progress.adventures['turtle-adventure'];
  if (!turtleAdventure) return false;
  return Object.values(turtleAdventure.levels).some((l) => l.completed);
}

/**
 * Check all badge conditions and return newly earned badge IDs
 */
export function checkBadges(context: BadgeCheckContext): string[] {
  const { userData, currentAdventureId, starsJustEarned, adventureTotalLevels, gameType } = context;
  const { progress, achievements } = userData;

  const earnedIds = getEarnedBadgeIds(achievements);
  const newBadges: string[] = [];

  // Helper to check and add badge
  const checkBadge = (id: string, condition: boolean) => {
    if (!earnedIds.has(id) && condition) {
      newBadges.push(id);
    }
  };

  // Increment streak and get current value
  const sessionStreak = incrementSessionStreak();

  // ========== Progress Badges ==========

  // First Level - complete any level
  checkBadge('first_level', progress.completedLevels >= 1);

  // First Star - collect at least 1 star total
  checkBadge('first_star', progress.totalStars >= 1);

  // Ten Stars - collect 10 total stars
  checkBadge('ten_stars', progress.totalStars >= 10);

  // Fifty Stars - collect 50 total stars
  checkBadge('fifty_stars', progress.totalStars >= 50);

  // ========== Mastery Badges ==========

  // Perfect Level - get 3 stars on any level
  checkBadge('perfect_level', starsJustEarned !== undefined && starsJustEarned >= 3);

  // Five Perfect - get 3 stars on 5 different levels
  checkBadge('five_perfect', countPerfectLevels(progress) >= 5);

  // ========== Completion Badges ==========

  // Adventure Complete - complete all levels in any adventure
  if (currentAdventureId && adventureTotalLevels) {
    checkBadge(
      'adventure_complete',
      hasCompletedAdventure(progress, currentAdventureId, adventureTotalLevels)
    );
  }

  // ========== Streak Badges ==========

  // On Fire - complete 3 levels in one session
  checkBadge('streak_3', sessionStreak >= 3);

  // Unstoppable - complete 5 levels in one session
  checkBadge('streak_5', sessionStreak >= 5);

  // ========== Special Badges ==========

  // Maze First - complete first maze level
  if (gameType === 'maze' || hasCompletedMazeLevel(progress)) {
    checkBadge('maze_first', hasCompletedMazeLevel(progress));
  }

  // Turtle First - complete first turtle graphics level
  if (gameType === 'turtle' || hasCompletedTurtleLevel(progress)) {
    checkBadge('turtle_first', hasCompletedTurtleLevel(progress));
  }

  return newBadges;
}

/**
 * Parse achievements array to get earned badges with timestamps
 */
export function getEarnedBadges(achievements: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const str of achievements) {
    const badge = parseEarnedBadge(str);
    if (badge) {
      map.set(badge.id, badge.earnedAt);
    }
  }
  return map;
}
