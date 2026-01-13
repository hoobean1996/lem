/**
 * BadgeCard Component
 *
 * Displays a single badge with locked/unlocked state.
 */

import { Lock } from 'lucide-react';
import { useLanguage } from '../../../../infrastructure/i18n';
import type { BadgeDefinition, BadgeRarity } from '../../../../core/badges/types';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: number;
  onClick?: () => void;
}

const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; glow: string }> = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    glow: 'shadow-blue-200',
  },
  epic: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    glow: 'shadow-purple-200',
  },
  legendary: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    glow: 'shadow-amber-200',
  },
};

export function BadgeCard({ badge, earned, earnedAt, onClick }: BadgeCardProps) {
  const { t } = useLanguage();
  const colors = RARITY_COLORS[badge.rarity];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!earned) {
    // Locked badge - show preview with grayscale icon
    return (
      <div
        className="group relative flex flex-col items-center p-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 cursor-default hover:border-gray-300 hover:bg-gray-100 transition-all"
        title={t(badge.descriptionKey)}
        onClick={onClick}
      >
        {/* Grayscale badge icon */}
        <div className="relative w-12 h-12 flex items-center justify-center mb-1">
          <span className="text-3xl grayscale opacity-30 group-hover:opacity-40 transition-opacity">
            {badge.icon}
          </span>
          {/* Small lock indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
            <Lock className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        {/* Badge name (visible but muted) */}
        <span className="text-xs text-gray-400 text-center leading-tight line-clamp-2">
          {t(badge.nameKey)}
        </span>
      </div>
    );
  }

  // Unlocked badge
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105 ${colors.bg} ${colors.border} ${colors.glow ? `shadow-lg ${colors.glow}` : ''}`}
    >
      <div className="text-3xl mb-1">{badge.icon}</div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {t(badge.nameKey)}
      </span>
      {earnedAt && <span className="text-[10px] text-gray-500 mt-0.5">{formatDate(earnedAt)}</span>}
    </button>
  );
}
