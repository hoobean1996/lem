/**
 * Game Page
 *
 * The actual gameplay view for a specific level.
 * Route: /adventure/:adventureId/levels/:levelId
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  Trophy,
  Star,
  Loader2,
  HelpCircle,
  Check,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';
import { defaultTheme } from '../../../infrastructure/themes';
import { GuidedTour, useTour } from '../../shared/components/GuidedTour';
import type { TourStep } from '../../shared/components/GuidedTour';
import { HintModal } from '../../shared/components/HintModal';
import { MazeAdventure, TurtleAdventure } from '../components/adventures';
import { SoundManager } from '../../../infrastructure/sounds';
import { useUserProgress, useAchievements, getStorage } from '../../../infrastructure/storage';
import { useGlobalSettings } from '../../shared/contexts/SettingsContext';
import { useAdventureContext } from '../../shared/contexts/AdventureContext';
import { useLanguage } from '../../../infrastructure/i18n';
import { checkBadges, formatEarnedBadge } from '../../../core/badges';
import { BadgeUnlockModal } from '../../shared/components/badges';
import { ConnectionError } from '../../shared/components/ConnectionError';

export default function LevelPage() {
  const { t } = useLanguage();
  const { adventureId, levelId } = useParams<{ adventureId: string; levelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine base path (teacher vs student) and preserve query string
  const isTeacherRoute = location.pathname.startsWith('/t/');
  const basePath = isTeacherRoute ? '/t/adventure' : '/adventure';
  const queryString = searchParams.toString();
  const queryPart = queryString ? `?${queryString}` : '';

  // Context and hooks
  const { adventures, isLoading, loadError } = useAdventureContext();
  const { markLevelComplete, isLevelCompleted, updateCurrentLevel } = useUserProgress();
  const { soundEnabled } = useGlobalSettings();
  const { addAchievement } = useAchievements();

  // Find adventure and level
  const adventure = adventures.find((a) => a.id === adventureId);
  const levels = adventure?.levels || [];
  const levelIndex = levels.findIndex((l) => l.id === levelId);
  const level = levelIndex >= 0 ? levels[levelIndex] : null;
  const gameType = adventure?.gameType || 'maze';

  // Game state
  const [resetKey, setResetKey] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [collectCount, setCollectCount] = useState(0);
  const [_code, setCode] = useState('');

  // Badge/Achievement state
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Hint state
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(0); // Seconds remaining

  // Responsive screen size
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Guided tour
  const {
    isActive: isTourActive,
    hasCompleted: hasTourCompleted,
    startTour,
    completeTour,
    resetTour,
  } = useTour('first-level');

  // Redirect if adventure/level not found after loading
  useEffect(() => {
    if (!isLoading && adventures.length > 0) {
      if (!adventure) {
        navigate(`${basePath}${queryPart}`, { replace: true });
      } else if (!level) {
        navigate(`${basePath}/${adventureId}/levels${queryPart}`, { replace: true });
      }
    }
  }, [isLoading, adventure, level, adventures.length, navigate, adventureId, basePath, queryPart]);

  // Reset hint index when level changes
  useEffect(() => {
    setCurrentHintIndex(0);
    setShowHintModal(false);
    setHintCooldown(0);
  }, [levelId]);

  // Hint cooldown timer
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const timer = setInterval(() => {
      setHintCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hintCooldown]);

  // Sync sound enabled state
  useEffect(() => {
    SoundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Start tour on first level
  useEffect(() => {
    if (levelIndex === 0 && !hasTourCompleted && !isLoading) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [levelIndex, hasTourCompleted, startTour, isLoading]);

  // Tour steps
  const tourSteps: TourStep[] = useMemo(
    () => [
      {
        target: '[data-tour="game-world"]',
        title: t('tour.welcome'),
        description: t('tour.welcomeDesc'),
        position: 'right',
        actionText: t('tour.gotIt'),
      },
      {
        target: '[data-tour="block-editor"]',
        title: t('tour.blockEditor'),
        description: t('tour.blockEditorDesc'),
        position: 'left',
        actionText: t('tour.understood'),
      },
      {
        target: '[data-tour="first-block"]',
        title: t('tour.firstBlock'),
        description: t('tour.firstBlockDesc'),
        position: 'bottom',
        actionText: t('tour.letMeTry'),
      },
      {
        target: '[data-tour="run-button"]',
        title: t('tour.runButton'),
        description: t('tour.runButtonDesc'),
        position: 'bottom',
        actionText: t('tour.startCoding'),
      },
    ],
    [t]
  );

  // Handlers
  const handleReplayTour = () => {
    resetTour();
    startTour();
  };

  const handleComplete = useCallback(
    async (stars: number) => {
      setCollectCount(stars);
      setIsComplete(true);

      // Save progress
      if (adventure && level) {
        await markLevelComplete(
          adventure.id,
          level.id,
          stars
        );

        // Check for new badges after progress is saved
        const freshUserData = await getStorage().getUserData();
        const earnedBadges = checkBadges({
          userData: freshUserData,
          currentAdventureId: adventure.id,
          currentLevelId: level.id,
          starsJustEarned: stars,
          adventureTotalLevels: levels.length,
          gameType: gameType as 'maze' | 'turtle',
        });

        // Award new badges
        if (earnedBadges.length > 0) {
          for (const badgeId of earnedBadges) {
            await addAchievement(formatEarnedBadge(badgeId));
          }
          setNewBadges(earnedBadges);
        }
      }
    },
    [adventure, level, markLevelComplete, levels.length, gameType, addAchievement]
  );

  const handleFail = useCallback(() => {
    setShowFailure(true);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const resetLevel = () => {
    setIsComplete(false);
    setShowFailure(false);
    setResetKey((k) => k + 1);
  };

  const goToNextLevel = () => {
    if (levelIndex < levels.length - 1) {
      const nextLevel = levels[levelIndex + 1];
      setIsComplete(false);
      setShowFailure(false);
      setResetKey((k) => k + 1); // Reset the CodeRunner to clear blocks
      if (adventure) {
        updateCurrentLevel(adventure.id, levelIndex + 1);
      }
      navigate(`${basePath}/${adventureId}/levels/${nextLevel.id}${queryPart}`);
    }
  };

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

  // Level not found
  if (!adventure || !level) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-[#4a7a2a]">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Top Bar - Level Info */}
      <div className="flex-shrink-0 px-4 py-2 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Back & Level Info */}
          <div className="flex items-center gap-2">
            <Link
              to={`${basePath}/${adventureId}/levels${queryPart}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
              <span className="text-sm">{adventure.icon || '📖'}</span>
              <span className="font-medium text-[#4a7a2a] text-sm">{adventure.name}</span>
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="font-medium text-gray-700 text-sm">{level.name}</span>
              <span className="text-gray-600 text-xs">
                ({levelIndex + 1}/{levels.length})
              </span>
              {isLevelCompleted(adventure.id, level.id) && (
                <Check className="w-4 h-4 text-[#4a7a2a]" />
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Hint button - only show if hints available and not all used */}
            {level.hints && level.hints.length > 0 && currentHintIndex < level.hints.length && (
              <button
                onClick={() => hintCooldown === 0 && setShowHintModal(true)}
                disabled={hintCooldown > 0}
                className={`relative flex items-center justify-center rounded-full shadow-sm border transition-all ${
                  hintCooldown > 0
                    ? 'w-12 h-8 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                    : 'w-8 h-8 bg-amber-100 border-amber-200 hover:shadow-md hover:scale-110'
                }`}
                title={t('creator.hint')}
              >
                <Lightbulb
                  className={`w-4 h-4 ${hintCooldown > 0 ? 'text-gray-400' : 'text-amber-600'}`}
                />
                {hintCooldown > 0 && (
                  <span className="ml-0.5 text-xs font-medium text-gray-500">{hintCooldown}</span>
                )}
              </button>
            )}
            <button
              onClick={handleReplayTour}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md hover:scale-110 transition-all"
              title={t('adventure.helpTour')}
            >
              <HelpCircle className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 h-full overflow-hidden relative">
        {/* Game-specific component */}
        {gameType === 'maze' && (
          <MazeAdventure
            level={level}
            theme={defaultTheme}
            resetKey={resetKey}
            isLargeScreen={isLargeScreen}
            stdlibFunctions={adventure?.stdlibFunctions}
            onComplete={handleComplete}
            onFail={handleFail}
            onCodeChange={handleCodeChange}
          />
        )}
        {gameType === 'turtle' && (
          <TurtleAdventure
            level={level}
            theme={defaultTheme}
            resetKey={resetKey}
            isLargeScreen={isLargeScreen}
            stdlibFunctions={adventure?.stdlibFunctions}
            onComplete={handleComplete}
            onFail={handleFail}
            onCodeChange={handleCodeChange}
          />
        )}
      </div>

      {/* Victory Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
            <div className="relative mb-4">
              <div className="absolute -top-2 -left-2 text-4xl animate-ping">✨</div>
              <div
                className="absolute -top-2 -right-2 text-4xl animate-ping"
                style={{ animationDelay: '0.2s' }}
              >
                ✨
              </div>
              <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
            </div>

            <h2 className="text-3xl font-bold text-[#4a7a2a] mb-2">{t('adventure.awesome')}</h2>
            <p className="text-gray-600 mb-2">
              {level.name} {t('adventure.complete')}
            </p>

            {collectCount > 0 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-[#4a7a2a]">
                  {t('adventure.collected')} {collectCount} {t('adventure.stars')}
                </span>
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {levelIndex < levels.length - 1 ? (
                <button
                  onClick={goToNextLevel}
                  className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105"
                >
                  {t('adventure.nextLevel')} →
                </button>
              ) : (
                <>
                  <div className="py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl shadow-lg">
                    🎉 {t('adventure.congratulations')} 🎉
                  </div>
                  <Link
                    to="/"
                    className="w-full py-3 bg-[#e8f5e0] hover:bg-[#d4ecc8] text-[#4a7a2a] font-medium rounded-2xl transition-all block"
                  >
                    {t('adventure.backToHome')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {showFailure && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
            <div className="text-8xl mb-4">😢</div>

            <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('adventure.notDoneYet')}</h2>
            <p className="text-gray-600 mb-6">
              {adventure.id === 'math-explorer'
                ? t('adventure.bunnyNotHome')
                : t('adventure.thinkAgain')}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-amber-700 text-sm">💡 {t('adventure.hint')}</p>
            </div>

            <button
              onClick={resetLevel}
              className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              {t('adventure.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Guided Tour */}
      <GuidedTour steps={tourSteps} isActive={isTourActive} onComplete={completeTour} />

      {/* Hint Modal */}
      {showHintModal && level.hints && level.hints[currentHintIndex] && (
        <HintModal
          hint={level.hints[currentHintIndex]}
          currentIndex={currentHintIndex}
          totalHints={level.hints.length}
          onClose={() => {
            setShowHintModal(false);
            const nextIndex = currentHintIndex + 1;
            setCurrentHintIndex(nextIndex);
            // Start 30s cooldown if there are more hints
            if (nextIndex < level.hints!.length) {
              setHintCooldown(30);
            }
          }}
        />
      )}

      {/* Badge Unlock Modal */}
      {newBadges.length > 0 && (
        <BadgeUnlockModal badgeIds={newBadges} onClose={() => setNewBadges([])} />
      )}
    </div>
  );
}
