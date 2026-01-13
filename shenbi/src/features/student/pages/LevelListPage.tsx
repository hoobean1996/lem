/**
 * Level List Page
 *
 * Shows all levels within a selected adventure.
 * Route: /adventure/:adventureId/levels
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Check, Play, Lock, BadgeCheck, Crown } from 'lucide-react';
import { useAdventureContext } from '../../shared/contexts/AdventureContext';
import { useUserProgress, useProfile } from '../../../infrastructure/storage';
import { useLanguage } from '../../../infrastructure/i18n';
import { ConnectionError } from '../../shared/components/ConnectionError';
import { UpgradeModal } from '../../shared/components/UpgradeModal';

export default function LevelListPage() {
  const { t } = useLanguage();
  const { adventureId } = useParams<{ adventureId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { adventures, isLoading, loadError } = useAdventureContext();
  const { profile } = useProfile();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get user's subscription tier (default to 'free')
  const userTier = profile?.subscriptionTier || 'free';

  // Determine base path (teacher vs student) and preserve query string
  const isTeacherRoute = location.pathname.startsWith('/t/');
  const basePath = isTeacherRoute ? '/t/adventure' : '/adventure';
  const queryString = searchParams.toString();
  const queryPart = queryString ? `?${queryString}` : '';
  const { isLevelCompleted } = useUserProgress();

  // Find the adventure by ID
  const adventure = adventures.find((a) => a.id === adventureId);
  const levels = adventure?.levels || [];

  // Redirect if adventure not found after loading
  useEffect(() => {
    if (!isLoading && !adventure && adventures.length > 0) {
      navigate(basePath, { replace: true });
    }
  }, [isLoading, adventure, adventures.length, navigate, basePath]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <Loader2 className="w-16 h-16 animate-spin text-[#5a8a3a]" />
          <div className="text-2xl font-bold text-[#4a7a2a]">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center p-4">
        <ConnectionError message={loadError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Adventure not found
  if (!adventure) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-[#4a7a2a]">{t('common.loading')}</div>
      </div>
    );
  }

  const completedCount = levels.filter((l) =>
    isLevelCompleted(adventure.id, l.id)
  ).length;

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to={`${basePath}${queryPart}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('adventure.allAdventures')}
        </Link>

        {/* Adventure Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f5e0] flex items-center justify-center text-5xl shadow-inner flex-shrink-0">
            {adventure.icon || '📖'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-800">{adventure.name}</h1>
              {/* Official badge for system adventures */}
              {(adventure.userId === 0 || adventure.userId === undefined) && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  {t('adventure.official')}
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-2">{adventure.description}</p>
            {/* Tags */}
            {adventure.tags && adventure.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {adventure.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-[#f0f9e8] text-[#4a7a2a] text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">
                {levels.length} {t('home.levels')}
              </span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  {completedCount} {t('adventure.complete')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level List */}
        <div className="space-y-3">
          {levels.map((level, index) => {
            const isCompleted = isLevelCompleted(adventure.id, level.id);
            const prevLevel = index > 0 ? levels[index - 1] : null;
            const isProgressLocked =
              prevLevel !== null && !isLevelCompleted(adventure.id, prevLevel.id);
            const isPremiumLevel = level.requiredTier === 'premium';
            const isPremiumLocked = isPremiumLevel && userTier !== 'premium';
            const isLocked = isProgressLocked || isPremiumLocked;

            const handleClick = (e: React.MouseEvent) => {
              if (isPremiumLocked) {
                e.preventDefault();
                setShowUpgradeModal(true);
              } else if (isProgressLocked) {
                e.preventDefault();
              }
            };

            return (
              <Link
                key={level.id}
                to={isLocked ? '#' : `${basePath}/${adventure.id}/levels/${level.id}${queryPart}`}
                onClick={handleClick}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 block ${
                  isLocked
                    ? isPremiumLocked
                      ? 'border-amber-200 bg-amber-50/50 cursor-pointer hover:border-amber-300'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isCompleted
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-gray-200 bg-white hover:border-[#7dad4c] hover:bg-[#f8fdf5]'
                }`}
              >
                {/* Level Number */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    isPremiumLocked
                      ? 'bg-amber-100 text-amber-600'
                      : isProgressLocked
                        ? 'bg-gray-200 text-gray-600'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-[#e8f5e0] text-[#4a7a2a]'
                  }`}
                >
                  {isPremiumLocked ? (
                    <Crown className="w-5 h-5" />
                  ) : isProgressLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Level Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{level.name}</span>
                    {isPremiumLevel && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-0.5">
                        <Crown className="w-3 h-3" />
                        {t('subscription.premium')}
                      </span>
                    )}
                  </div>
                  {level.description && (
                    <div className="text-sm text-gray-600 truncate">{level.description}</div>
                  )}
                </div>

                {/* Play Button */}
                {!isLocked && (
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCompleted ? 'bg-green-100 text-green-600' : 'bg-[#e8f5e0] text-[#4a7a2a]'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                  </div>
                )}
                {isPremiumLocked && (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}
