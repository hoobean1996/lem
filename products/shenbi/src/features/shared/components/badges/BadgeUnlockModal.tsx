/**
 * BadgeUnlockModal Component
 *
 * Celebration modal shown when a badge is unlocked.
 */

import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../infrastructure/i18n';
import { getBadgeById } from '../../../../core/badges/types';
import type { BadgeDefinition } from '../../../../core/badges/types';

interface BadgeUnlockModalProps {
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeUnlockModal({ badgeIds, onClose }: BadgeUnlockModalProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const badges = badgeIds
    .map((id) => getBadgeById(id))
    .filter((b): b is BadgeDefinition => b !== undefined);

  const currentBadge = badges[currentIndex];

  useEffect(() => {
    // Reset animation when badge changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!currentBadge) {
    return null;
  }

  const handleNext = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const isLast = currentIndex === badges.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all duration-500 ${
          isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Celebration header */}
        <div className="text-2xl font-bold text-[#4a7a2a] mb-2">🎉 {t('badges.unlocked')} 🎉</div>

        {/* Badge display */}
        <div
          className={`text-7xl my-6 transform transition-all duration-700 ${
            isAnimating ? 'scale-50 rotate-12' : 'scale-100 rotate-0'
          }`}
        >
          {currentBadge.icon}
        </div>

        {/* Badge name */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t(currentBadge.nameKey)}</h2>

        {/* Badge description */}
        <p className="text-gray-600 mb-6">{t(currentBadge.descriptionKey)}</p>

        {/* Progress indicator for multiple badges */}
        {badges.length > 1 && (
          <div className="flex justify-center gap-1.5 mb-4">
            {badges.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-[#4a7a2a]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-[#4a7a2a] hover:bg-[#3a6a1a] text-white font-bold rounded-xl transition-colors text-lg"
        >
          {isLast ? t('common.done') : t('common.next')}
        </button>
      </div>
    </div>
  );
}
