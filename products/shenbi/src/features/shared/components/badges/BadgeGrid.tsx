/**
 * BadgeGrid Component
 *
 * Displays a grid of all badges with earned/locked states.
 */

import { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { useLanguage } from '../../../../infrastructure/i18n';
import { BADGES } from '../../../../core/badges/types';
import type { BadgeDefinition, BadgeRarity } from '../../../../core/badges/types';
import { BadgeCard } from './BadgeCard';

interface BadgeGridProps {
  earnedBadges: Map<string, number>; // badgeId -> earnedAt timestamp
}

const RARITY_STYLES: Record<BadgeRarity, { bg: string; text: string; label: string }> = {
  common: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Common' },
  rare: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Rare' },
  epic: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Epic' },
  legendary: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Legendary' },
};

export function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const { t } = useLanguage();
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  const earnedCount = earnedBadges.size;
  const totalCount = BADGES.length;

  const handleBadgeClick = (badge: BadgeDefinition) => {
    setSelectedBadge(badge);
  };

  const closeDetail = () => {
    setSelectedBadge(null);
  };

  const isEarned = selectedBadge ? earnedBadges.has(selectedBadge.id) : false;
  const earnedAt = selectedBadge ? earnedBadges.get(selectedBadge.id) : undefined;
  const rarityStyle = selectedBadge ? RARITY_STYLES[selectedBadge.rarity] : null;

  return (
    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>🏅</span>
          {t('badges.title')}
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {earnedCount}/{totalCount}
        </span>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {BADGES.map((badge) => {
          const badgeEarnedAt = earnedBadges.get(badge.id);
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={badgeEarnedAt !== undefined}
              earnedAt={badgeEarnedAt}
              onClick={() => handleBadgeClick(badge)}
            />
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className={`relative ${!isEarned ? 'grayscale opacity-60' : ''}`}>
                <span className="text-6xl">{selectedBadge.icon}</span>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Badge Name & Rarity */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-800">{t(selectedBadge.nameKey)}</h3>
              {rarityStyle && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${rarityStyle.bg} ${rarityStyle.text}`}
                >
                  {rarityStyle.label}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{t(selectedBadge.descriptionKey)}</p>

            {/* Status */}
            {isEarned ? (
              <div className="flex items-center gap-2 p-3 bg-[#e8f5e0] rounded-xl">
                <div className="w-8 h-8 bg-[#4a7a2a] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#4a7a2a]">{t('badges.earned')}</div>
                  {earnedAt && (
                    <div className="text-xs text-[#5a8a3a]">
                      {new Date(earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">{t('badges.locked')}</div>
                  <div className="text-xs text-gray-500">{t('badges.keepPlaying')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
