/**
 * useBattle Hook (Polling-based)
 *
 * Manages battle state via REST API polling instead of WebRTC.
 * This provides more reliable connections through firewalls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { battleApi, type BattleResponse } from '../../infrastructure/services/api';
import type { LevelDefinition } from '../engine/types';

// Battle status (matches API status values)
export type BattleStatus =
  | 'idle' // Initial state, not in a battle
  | 'creating' // Creating a room
  | 'waiting' // Host waiting for opponent
  | 'joining' // Guest joining a room
  | 'ready' // Both connected, waiting to start
  | 'playing' // Game in progress
  | 'finished'; // Game ended

export interface UseBattleOptions {
  /** Player's display name */
  playerName: string;
  /** Called when battle state changes */
  onStateChange?: (state: BattleState) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
}

export interface BattleState {
  status: BattleStatus;
  roomCode: string | null;
  isHost: boolean;
  level: LevelDefinition | null;
  hostName: string | null;
  guestName: string | null;
  hostCompleted: boolean;
  guestCompleted: boolean;
  winnerId: number | null;
  winnerName: string | null;
  myUserId: number | null;
  startedAt: string | null;
}

export interface UseBattleReturn {
  // State
  state: BattleState;
  loading: boolean;
  error: string | null;

  // Actions
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  startBattle: (level: LevelDefinition) => Promise<void>;
  completeBattle: (code?: string) => Promise<void>;
  leaveBattle: () => Promise<void>;

  // Helpers
  isHost: boolean;
  isConnected: boolean;
  opponentName: string | null;
  iWon: boolean | null;
}

const initialState: BattleState = {
  status: 'idle',
  roomCode: null,
  isHost: false,
  level: null,
  hostName: null,
  guestName: null,
  hostCompleted: false,
  guestCompleted: false,
  winnerId: null,
  winnerName: null,
  myUserId: null,
  startedAt: null,
};

// Polling intervals
const POLLING_INTERVAL_WAITING = 1000; // 1s when waiting for opponent
const POLLING_INTERVAL_PLAYING = 500; // 500ms during gameplay

export function useBattle({
  playerName,
  onStateChange,
  onError,
}: UseBattleOptions): UseBattleReturn {
  const [state, setState] = useState<BattleState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track my user ID from the API response
  const myUserIdRef = useRef<number | null>(null);

  // Polling timer ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Callback refs to avoid stale closures
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
    onErrorRef.current = onError;
  }, [onStateChange, onError]);

  // Convert API response to local state
  const apiResponseToState = useCallback(
    (response: BattleResponse, isHost: boolean): BattleState => {
      // Map API status to our status
      let status: BattleStatus;
      switch (response.status) {
        case 'waiting':
          status = isHost ? 'waiting' : 'joining';
          break;
        case 'ready':
          status = 'ready';
          break;
        case 'playing':
          status = 'playing';
          break;
        case 'finished':
          status = 'finished';
          break;
        default:
          status = 'idle';
      }

      return {
        status,
        roomCode: response.room_code,
        isHost,
        level: response.level as LevelDefinition | null,
        hostName: response.host_name,
        guestName: response.guest_name,
        hostCompleted: response.host_completed,
        guestCompleted: response.guest_completed,
        winnerId: response.winner_id,
        winnerName: response.winner_name || null,
        myUserId: myUserIdRef.current,
        startedAt: response.started_at || null,
      };
    },
    []
  );

  // Poll battle state
  const pollBattleState = useCallback(
    async (roomCode: string, isHost: boolean) => {
      try {
        const response = await battleApi.get(roomCode);
        const newState = apiResponseToState(response, isHost);

        // Determine my user ID from the response
        if (isHost) {
          myUserIdRef.current = response.host_id;
        } else if (response.guest_id) {
          myUserIdRef.current = response.guest_id;
        }
        newState.myUserId = myUserIdRef.current;

        setState(newState);
        onStateChangeRef.current?.(newState);

        // Stop polling if game is finished
        if (response.status === 'finished' || response.status === 'expired') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get battle state';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);

        // Stop polling on error
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    },
    [apiResponseToState]
  );

  // Start polling
  const startPolling = useCallback(
    (roomCode: string, isHost: boolean, interval: number) => {
      // Clear existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      // Initial poll
      pollBattleState(roomCode, isHost);

      // Start interval
      pollingRef.current = setInterval(() => {
        pollBattleState(roomCode, isHost);
      }, interval);
    },
    [pollBattleState]
  );

  // Create a new room
  const createRoom = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await battleApi.create({ player_name: playerName });
      myUserIdRef.current = response.host_id;

      const newState = apiResponseToState(response, true);
      setState(newState);
      onStateChangeRef.current?.(newState);

      // Start polling for opponent
      startPolling(response.room_code, true, POLLING_INTERVAL_WAITING);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMsg);
      onErrorRef.current?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [playerName, apiResponseToState, startPolling]);

  // Join an existing room
  const joinRoom = useCallback(
    async (code: string) => {
      const normalizedCode = code.toUpperCase().trim();
      if (normalizedCode.length !== 6) {
        const errorMsg = 'Invalid room code';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await battleApi.join({
          room_code: normalizedCode,
          player_name: playerName,
        });
        myUserIdRef.current = response.guest_id;

        const newState = apiResponseToState(response, false);
        setState(newState);
        onStateChangeRef.current?.(newState);

        // Start polling
        startPolling(normalizedCode, false, POLLING_INTERVAL_WAITING);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to join room';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [playerName, apiResponseToState, startPolling]
  );

  // Start the battle (host only)
  const startBattle = useCallback(
    async (level: LevelDefinition) => {
      if (!state.roomCode || !state.isHost) {
        const errorMsg = 'Cannot start: not a host or no room';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await battleApi.start(state.roomCode, {
          level: level as unknown as Record<string, unknown>,
        });
        // Start response is minimal, poll to get full state
        await pollBattleState(state.roomCode, true);

        // Switch to faster polling during gameplay
        startPolling(state.roomCode, true, POLLING_INTERVAL_PLAYING);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to start battle';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [state.roomCode, state.isHost, pollBattleState, startPolling]
  );

  // Mark as completed
  const completeBattle = useCallback(
    async (code?: string) => {
      if (!state.roomCode) {
        return;
      }

      try {
        await battleApi.complete(state.roomCode, { code: code || '' });
        // Complete response is partial, poll to get full state
        await pollBattleState(state.roomCode, state.isHost);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to complete battle';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      }
    },
    [state.roomCode, state.isHost, pollBattleState]
  );

  // Leave the battle
  const leaveBattle = useCallback(async () => {
    // Stop polling first
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (state.roomCode) {
      try {
        await battleApi.leave(state.roomCode);
      } catch {
        // Ignore errors when leaving
      }
    }

    // Reset state
    myUserIdRef.current = null;
    setState(initialState);
  }, [state.roomCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Computed values
  const isHost = state.isHost;
  // isConnected = true only when both players are in the room (ready, playing, or finished)
  const isConnected =
    state.status === 'ready' || state.status === 'playing' || state.status === 'finished';
  const opponentName = isHost ? state.guestName : state.hostName;

  // Determine if I won
  let iWon: boolean | null = null;
  if (state.status === 'finished' && state.winnerId !== null && myUserIdRef.current !== null) {
    iWon = state.winnerId === myUserIdRef.current;
  }

  return {
    state,
    loading,
    error,
    createRoom,
    joinRoom,
    startBattle,
    completeBattle,
    leaveBattle,
    isHost,
    isConnected,
    opponentName,
    iWon,
  };
}
