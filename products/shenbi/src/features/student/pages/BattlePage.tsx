/**
 * BattlePage Component
 *
 * Real-time multiplayer battle mode where two players compete
 * to finish the same level first.
 * Uses polling-based API instead of WebRTC for reliability.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trophy, Star, RotateCcw, XCircle } from 'lucide-react';
import { useBattle, BattleStatus } from '../../../core/battle';
import { BattleLobby, BattleCountdown } from '../components/battle';
import { MazeAdventure } from '../components/adventures';
import { LevelDefinition } from '../../../core/engine';
import { parseLevel, loadLocalAdventures } from '../../../infrastructure/levels/loader';
import { useProfile } from '../../../infrastructure/storage';
import { useLanguage } from '../../../infrastructure/i18n';
import { defaultTheme } from '../../../infrastructure/themes';
import { ConnectionError } from '../../shared/components/ConnectionError';
import { error as logError } from '../../../infrastructure/logging';

// Default battle level (a simple maze)
const DEFAULT_BATTLE_LEVEL = {
  id: 'battle-01',
  name: 'Battle Arena',
  description: 'Race to the goal!',
  grid: ['#######', '#>...*#', '#.###.#', '#.*...#', '#.###.#', '#....*G', '#######'],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['atGoal', 'wallAhead'],
  availableBlocks: ['command', 'repeat'],
  teachingGoal: 'Battle mode test',
  hints: ['Race to collect all stars and reach the goal!'],
};

export default function BattlePage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode?: string }>();

  // Player name from profile
  const { profile } = useProfile();
  const playerName = profile?.name || 'Player';

  // Use the new polling-based battle hook
  const {
    state: battleState,
    loading: battleLoading,
    error: battleError,
    createRoom,
    joinRoom,
    startBattle,
    completeBattle,
    leaveBattle,
    isHost,
    isConnected,
    opponentName,
    iWon,
  } = useBattle({
    playerName,
    onError: (_err) => {
      // Navigate to /battle on error if we were trying to join via URL
      if (urlRoomCode) {
        navigate('/battle', { replace: true });
      }
    },
  });

  // Local UI state
  const [showCountdown, setShowCountdown] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [myCompleted, setMyCompleted] = useState(false);

  // Level selection state
  const [mazeLevels, setMazeLevels] = useState<LevelDefinition[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelDefinition | null>(null);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Game state for MazeAdventure
  const [resetKey, setResetKey] = useState(0);
  const [showFailure, setShowFailure] = useState(false);
  const [collectCount, setCollectCount] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Derive status for UI (map new status to what UI expects)
  const getUIStatus = (
    status: BattleStatus
  ): 'lobby' | 'waiting' | 'ready' | 'playing' | 'finished' => {
    switch (status) {
      case 'idle':
      case 'creating':
      case 'joining':
        return 'lobby';
      case 'waiting':
        return 'waiting';
      case 'ready':
        return 'ready';
      case 'playing':
        return 'playing';
      case 'finished':
        return 'finished';
      default:
        return 'lobby';
    }
  };

  const uiStatus = getUIStatus(battleState.status);

  // Load maze levels on mount
  useEffect(() => {
    setIsLoadingLevels(true);
    setLoadError(null);
    try {
      const { adventures } = loadLocalAdventures();
      const levels: LevelDefinition[] = [];

      for (const adventure of adventures) {
        // Only include maze-type adventures (or adventures without explicit gameType)
        if (!adventure.gameType || adventure.gameType === 'maze') {
          // Filter to levels that have grid (new format) or entities (old format)
          const mazeLevelsFromAdventure = adventure.levels.filter(
            (l: LevelDefinition) => l.grid && l.grid.length > 0
          );
          levels.push(...mazeLevelsFromAdventure);
        }
      }

      // Add the default battle level as first option
      const defaultParsed = parseLevel(DEFAULT_BATTLE_LEVEL);
      setMazeLevels([defaultParsed, ...levels]);
      setSelectedLevel(defaultParsed);
    } catch (err) {
      logError('Failed to load levels', err, undefined, 'BattlePage');
      setLoadError(err instanceof Error ? err.message : 'Failed to load levels');
    } finally {
      setIsLoadingLevels(false);
    }
  }, []);

  // Auto-join when visiting /battle/:roomCode
  useEffect(() => {
    if (urlRoomCode && battleState.status === 'idle' && !battleLoading && !battleError) {
      // Try to join as guest
      joinRoom(urlRoomCode);
    }
  }, [urlRoomCode, battleState.status, battleLoading, battleError, joinRoom]);

  // Navigate to room URL when room is created
  useEffect(() => {
    if (battleState.roomCode && !urlRoomCode) {
      navigate(`/battle/${battleState.roomCode}`, { replace: true });
    }
  }, [battleState.roomCode, urlRoomCode, navigate]);

  // Handle create room
  const handleCreateRoom = useCallback(async () => {
    await createRoom();
  }, [createRoom]);

  // Handle join room
  const handleJoinRoom = useCallback(
    async (code: string) => {
      await joinRoom(code);
    },
    [joinRoom]
  );

  // Handle start game (host only)
  const handleStartGame = useCallback(async () => {
    if (!selectedLevel) return;
    setShowCountdown(true);
    await startBattle(selectedLevel);
  }, [selectedLevel, startBattle]);

  // Handle countdown complete
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
  }, []);

  // Handle play again
  const handlePlayAgain = useCallback(async () => {
    await leaveBattle();
    setMyCompleted(false);
    setResetKey((k) => k + 1);
    setShowFailure(false);
    setCollectCount(0);
    setShowExitModal(false);
    navigate('/battle', { replace: true });
  }, [leaveBattle, navigate]);

  // Handle exit button click
  const handleExitClick = useCallback(() => {
    setShowExitModal(true);
  }, []);

  // Handle go home
  const handleGoHome = useCallback(async () => {
    await leaveBattle();
    navigate('/');
  }, [leaveBattle, navigate]);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle level completion for MazeAdventure
  const handleLevelComplete = useCallback(
    async (stars: number) => {
      setCollectCount(stars);
      setMyCompleted(true);
      await completeBattle();
    },
    [completeBattle]
  );

  // Handle level failure
  const handleFail = useCallback(() => {
    setShowFailure(true);
  }, []);

  // Reset level
  const resetLevel = useCallback(() => {
    setShowFailure(false);
    setResetKey((k) => k + 1);
  }, []);

  // Determine winner from API response
  const didIWin = iWon === true;
  const didOpponentWin = iWon === false;

  // Check if opponent left (guest_id becomes null or status changes unexpectedly)
  const opponentLeft = battleState.status === 'finished' && battleState.winnerId === null;

  // Get the current level (from API state or selected level for host)
  const currentLevel = battleState.level || (isHost ? selectedLevel : null);

  // Loading state
  if (isLoadingLevels) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#4a7a2a]" />
          <div className="text-gray-600 text-xl">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Error state - server down
  if (loadError) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center p-4">
        <ConnectionError message={loadError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Render lobby (idle, creating, joining, waiting for opponent)
  if (uiStatus === 'lobby' || uiStatus === 'waiting') {
    return (
      <BattleLobby
        roomCode={battleState.roomCode}
        isConnected={isConnected}
        isHost={isHost}
        error={battleError}
        playerName={playerName}
        levels={mazeLevels}
        selectedLevel={selectedLevel}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onSelectLevel={setSelectedLevel}
      />
    );
  }

  // Render ready screen (both players connected, waiting for host to start)
  if (uiStatus === 'ready') {
    return (
      <div className="flex flex-col items-center min-h-full bg-white p-4 pt-16">
        {/* Countdown overlay */}
        {showCountdown && <BattleCountdown onComplete={handleCountdownComplete} />}

        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            <span className="inline-block animate-bounce">
              {isHost ? t('battle.startTheBattle') : t('battle.waitingForHost')}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isHost ? t('battle.bothPlayersConnected') : t('battle.connected')}
          </h2>

          <p className="text-gray-600 mb-2">
            {playerName} vs {opponentName || '...'}
          </p>
          <p className="text-gray-500 mb-6">{selectedLevel?.name || 'Battle Arena'}</p>

          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={showCountdown || battleLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors text-xl"
            >
              {battleLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                t('battle.startBattle')
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('battle.waitingForHostToStart')}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render game (playing or finished)
  if (uiStatus === 'playing' || uiStatus === 'finished') {
    return (
      <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
        {/* Top Bar - Battle Info */}
        <div className="flex-shrink-0 bg-white border-b shadow-sm px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Exit & Level Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleExitClick}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('battle.exit')}
              </button>
              <div>
                <h1 className="text-lg font-bold text-[#4a7a2a]">
                  {t('battle.title')}: {battleState.roomCode}
                </h1>
                <p className="text-sm text-gray-600">{currentLevel?.name || 'Battle Arena'}</p>
              </div>
            </div>

            {/* Center: VS indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium text-blue-700">{playerName}</span>
              </div>
              <span className="text-gray-600 font-bold">VS</span>
              <div className="text-sm">
                <span className="font-medium text-orange-600">{opponentName || 'Opponent'}</span>
              </div>
            </div>

            {/* Right: End Battle */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitClick}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                {t('battle.endBattle')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 h-full overflow-hidden relative">
          {currentLevel && (
            <MazeAdventure
              level={currentLevel}
              theme={defaultTheme}
              resetKey={resetKey}
              isLargeScreen={isLargeScreen}
              onComplete={handleLevelComplete}
              onFail={handleFail}
              onCodeChange={() => {}}
            />
          )}
        </div>

        {/* Victory Modal */}
        {uiStatus === 'finished' && didIWin && (
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

              <h2 className="text-3xl font-bold text-[#4a7a2a] mb-2">{t('battle.youWin')}</h2>
              <p className="text-gray-600 mb-2">You defeated {opponentName}!</p>

              {collectCount > 0 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-[#4a7a2a]">
                    {collectCount} {t('adventure.stars')}
                  </span>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105"
                >
                  {t('battle.playAgain')}
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 bg-[#e8f5e0] hover:bg-[#d4ecc8] text-[#4a7a2a] font-medium rounded-2xl transition-all"
                >
                  {t('battle.goHome')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Defeat Modal */}
        {uiStatus === 'finished' && didOpponentWin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
              <div className="text-8xl mb-4">😢</div>

              <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('battle.youLose')}</h2>
              <p className="text-gray-600 mb-6">{opponentName} finished first!</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-6 h-6" />
                  {t('battle.playAgain')}
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 bg-[#e8f5e0] hover:bg-[#d4ecc8] text-[#4a7a2a] font-medium rounded-2xl transition-all"
                >
                  {t('battle.goHome')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failure Modal */}
        {showFailure && !myCompleted && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
              <div className="text-8xl mb-4">😢</div>

              <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('adventure.notDoneYet')}</h2>
              <p className="text-gray-600 mb-6">{t('adventure.thinkAgain')}</p>

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

        {/* Opponent Left Modal */}
        {opponentLeft && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
              <div className="text-8xl mb-4">👋</div>

              <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('battle.opponentLeft')}</h2>
              <p className="text-gray-600 mb-6">
                {opponentName || 'Opponent'} {t('battle.hasLeftTheBattle')}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105"
                >
                  {t('battle.playAgain')}
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 bg-[#e8f5e0] hover:bg-[#d4ecc8] text-[#4a7a2a] font-medium rounded-2xl transition-all"
                >
                  {t('battle.goHome')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Modal */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[bounceIn_0.5s_ease-out]">
              <div className="text-8xl mb-4">⚔️</div>

              <h2 className="text-2xl font-bold text-[#4a7a2a] mb-2">{t('battle.wellDone')}</h2>
              <p className="text-gray-600 mb-6">{t('battle.battleEnded')}</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="w-full py-4 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white text-xl font-bold rounded-2xl hover:opacity-90 shadow-lg transition-all hover:scale-105"
                >
                  {t('battle.playAgain')}
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 bg-[#e8f5e0] hover:bg-[#d4ecc8] text-[#4a7a2a] font-medium rounded-2xl transition-all"
                >
                  {t('battle.goHome')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
