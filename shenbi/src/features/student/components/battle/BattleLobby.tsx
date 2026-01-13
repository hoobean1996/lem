/**
 * BattleLobby Component
 *
 * Room creation and joining UI for battle mode.
 */

import { useState } from 'react';
import { Swords, Copy, Check, Loader2, Users } from 'lucide-react';
import { LevelDefinition } from '../../../../core/engine';
import { BattleLevelPicker } from './BattleLevelPicker';
import { useLanguage } from '../../../../infrastructure/i18n';

interface BattleLobbyProps {
  roomCode: string | null;
  isConnected: boolean;
  isHost: boolean;
  error: string | null;
  playerName?: string;
  levels?: LevelDefinition[];
  selectedLevel?: LevelDefinition | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onSelectLevel?: (level: LevelDefinition) => void;
}

export function BattleLobby({
  roomCode,
  isConnected,
  isHost,
  error,
  playerName,
  levels,
  selectedLevel,
  onCreateRoom,
  onJoinRoom,
  onSelectLevel,
}: BattleLobbyProps) {
  const { t } = useLanguage();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (roomCode) {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim());
    }
  };

  // Waiting for opponent (host mode)
  if (roomCode && isHost && !isConnected) {
    return (
      <div className="flex flex-col items-center min-h-full bg-white p-4 pt-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">
              <Loader2 className="w-16 h-16 mx-auto text-[#4a7a2a] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('battle.waitingForOpponent')}
            </h2>
            <p className="text-gray-600 mb-4">{t('battle.shareCode')}</p>

            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold text-[#4a7a2a] tracking-widest">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-[#e8f5e0] hover:bg-[#d4ecc8] rounded-lg transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#4a7a2a]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Level Picker for Host */}
          {levels && levels.length > 0 && onSelectLevel && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <BattleLevelPicker
                levels={levels}
                selectedLevel={selectedLevel || null}
                onSelectLevel={onSelectLevel}
              />
            </div>
          )}

          <p className="text-sm text-gray-600 text-center mt-4">
            {selectedLevel
              ? `${t('battle.selected')} ${selectedLevel.name}`
              : t('battle.selectLevelWhileWaiting')}
          </p>
        </div>
      </div>
    );
  }

  // Connecting to host (guest mode)
  if (roomCode && !isHost && !isConnected) {
    return (
      <div className="flex flex-col items-center min-h-full bg-white p-4 pt-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 mx-auto text-[#4a7a2a] animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('battle.connecting')}</h2>
          <p className="text-gray-600">
            {t('battle.joiningRoom')} {roomCode}
          </p>
        </div>
      </div>
    );
  }

  // Main lobby UI
  return (
    <div className="flex flex-col items-center min-h-full bg-white p-4 pt-16">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e8f5e0] rounded-full mb-4">
            <Swords className="w-10 h-10 text-[#4a7a2a]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('battle.title')}</h1>
          <p className="text-gray-600">{t('battle.raceAgainstFriend')}</p>
          {playerName && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#e8f5e0] rounded-full">
              <span className="text-[#4a7a2a] font-medium">{t('battle.playingAs')}</span>
              <span className="text-[#3a6a1a] font-bold">{playerName}</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Create Room Button */}
        <button
          onClick={onCreateRoom}
          className="w-full bg-[#4a7a2a] hover:bg-[#3a6a1a] text-white font-bold py-4 px-6 rounded-xl mb-4 transition-colors flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          {t('battle.createRoom')}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-600 text-sm">{t('battle.or')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinSubmit}>
          <label className="block text-gray-700 font-medium mb-2">
            {t('battle.enterRoomCode')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCDEF"
              maxLength={6}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-mono text-xl text-center uppercase tracking-widest focus:border-[#7dad4c] focus:outline-none"
            />
            <button
              type="submit"
              disabled={joinCode.length !== 6}
              className="px-6 py-3 bg-[#5a8a3a] hover:bg-[#4a7a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              {t('battle.join')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
