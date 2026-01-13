/**
 * Badge System Types and Definitions
 *
 * Defines all badges, their conditions, and display properties.
 */

import type { TranslationKey } from '../../infrastructure/i18n';

export type BadgeCategory = 'progress' | 'mastery' | 'completion' | 'streak' | 'special';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
}

export interface EarnedBadge {
  id: string;
  earnedAt: number;
}

/**
 * All badge definitions
 */
export const BADGES: BadgeDefinition[] = [
  // Progress badges
  {
    id: 'first_level',
    nameKey: 'badges.firstLevel',
    descriptionKey: 'badges.firstLevelDesc',
    icon: '🎯',
    category: 'progress',
    rarity: 'common',
  },
  {
    id: 'first_star',
    nameKey: 'badges.firstStar',
    descriptionKey: 'badges.firstStarDesc',
    icon: '⭐',
    category: 'progress',
    rarity: 'common',
  },
  {
    id: 'ten_stars',
    nameKey: 'badges.tenStars',
    descriptionKey: 'badges.tenStarsDesc',
    icon: '🌟',
    category: 'progress',
    rarity: 'rare',
  },
  {
    id: 'fifty_stars',
    nameKey: 'badges.fiftyStars',
    descriptionKey: 'badges.fiftyStarsDesc',
    icon: '💫',
    category: 'progress',
    rarity: 'epic',
  },

  // Mastery badges
  {
    id: 'perfect_level',
    nameKey: 'badges.perfectLevel',
    descriptionKey: 'badges.perfectLevelDesc',
    icon: '🏆',
    category: 'mastery',
    rarity: 'rare',
  },
  {
    id: 'five_perfect',
    nameKey: 'badges.fivePerfect',
    descriptionKey: 'badges.fivePerfectDesc',
    icon: '👑',
    category: 'mastery',
    rarity: 'epic',
  },

  // Completion badges
  {
    id: 'adventure_complete',
    nameKey: 'badges.adventureComplete',
    descriptionKey: 'badges.adventureCompleteDesc',
    icon: '🗺️',
    category: 'completion',
    rarity: 'epic',
  },

  // Streak badges
  {
    id: 'streak_3',
    nameKey: 'badges.streak3',
    descriptionKey: 'badges.streak3Desc',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'streak_5',
    nameKey: 'badges.streak5',
    descriptionKey: 'badges.streak5Desc',
    icon: '⚡',
    category: 'streak',
    rarity: 'epic',
  },

  // Special badges
  {
    id: 'turtle_first',
    nameKey: 'badges.turtleFirst',
    descriptionKey: 'badges.turtleFirstDesc',
    icon: '🐢',
    category: 'special',
    rarity: 'common',
  },
  {
    id: 'maze_first',
    nameKey: 'badges.mazeFirst',
    descriptionKey: 'badges.mazeFirstDesc',
    icon: '🐰',
    category: 'special',
    rarity: 'common',
  },
];

/**
 * Get badge definition by ID
 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

/**
 * Parse earned badge string (format: "badgeId:timestamp")
 */
export function parseEarnedBadge(str: string): EarnedBadge | null {
  const [id, timestamp] = str.split(':');
  if (!id) return null;
  return {
    id,
    earnedAt: timestamp ? parseInt(timestamp, 10) : Date.now(),
  };
}

/**
 * Format earned badge for storage
 */
export function formatEarnedBadge(id: string): string {
  return `${id}:${Date.now()}`;
}
