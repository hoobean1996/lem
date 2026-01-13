/**
 * Adventure List Page
 *
 * Shows all available adventures for the user to choose from.
 * Route: /adventure
 */

import { Link } from 'react-router-dom';
import { Loader2, Check, ChevronRight, Users, Code, BadgeCheck } from 'lucide-react';
import { useAdventureContext } from '../../shared/contexts/AdventureContext';
import { useUserProgress } from '../../../infrastructure/storage';
import { useLanguage } from '../../../infrastructure/i18n';
import { ConnectionError } from '../../shared/components/ConnectionError';

export default function AdventureListPage() {
  const { t } = useLanguage();
  const { adventures, isLoading, loadError } = useAdventureContext();
  const { isLevelCompleted } = useUserProgress();

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

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('adventure.chooseAdventure')}</h1>
        <p className="text-gray-600 mb-8">{t('home.eachStoryTeaches')}</p>

        <div className="space-y-4">
          {adventures.map((adventure) => {
            const completedCount = adventure.levels.filter((l) =>
              isLevelCompleted(adventure.id, l.id)
            ).length;
            const totalLevels = adventure.levels.length;

            return (
              <Link
                key={adventure.id}
                to={`/adventure/${adventure.id}/levels`}
                className="w-full bg-gray-50 rounded-3xl p-5 border border-gray-200 hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all hover:scale-[1.01] text-left group block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#e8f5e0] flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                    {adventure.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-800 text-lg">{adventure.name}</span>
                      {/* Official badge for system adventures */}
                      {(adventure.userId === 0 || adventure.userId === undefined) && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          {t('adventure.official')}
                        </span>
                      )}
                      {adventure.complexity && (
                        <span className="px-2 py-0.5 bg-[#e8f5e0] text-[#4a7a2a] text-xs font-medium rounded-full">
                          {t(`home.${adventure.complexity}`)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{adventure.description}</p>
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
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" />
                        {totalLevels} {t('home.levels')}
                      </span>
                      {adventure.ageRange && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {t('home.ages')} {adventure.ageRange}
                        </span>
                      )}
                      {completedCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="w-3.5 h-3.5" />
                          {completedCount}/{totalLevels} {t('adventure.complete')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#7dad4c] flex-shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
