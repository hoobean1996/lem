/**
 * Battle Mode Types
 *
 * Types for real-time multiplayer battle mode using PeerJS.
 */

import type { Entity, LevelDefinition } from '../engine/types';

// Battle status progression
export type BattleStatus =
  | 'lobby' // Initial state, creating/joining room
  | 'waiting' // Host waiting for opponent
  | 'connecting' // Guest connecting to host
  | 'ready' // Both connected, waiting to start
  | 'playing' // Game in progress
  | 'finished'; // Game ended, showing result

// Player progress during battle
export interface PlayerProgress {
  entities: Entity[];
  isComplete: boolean;
  codeExecuting: boolean;
  currentLine: number | null;
}

// Main battle state
export interface BattleState {
  status: BattleStatus;
  roomCode: string | null;
  isHost: boolean;
  level: LevelDefinition | null;
  myProgress: PlayerProgress;
  opponentProgress: PlayerProgress;
  winner: 'me' | 'opponent' | null;
  error: string | null;
}

// Player state for synchronization (new format)
export interface PlayerState {
  x: number;
  y: number;
  collected: number;
}

// Messages sent over PeerJS connection
export type BattleMessage =
  | { type: 'player-info'; name: string }
  | { type: 'ready'; level: LevelDefinition }
  | { type: 'start' }
  | { type: 'state-update'; state?: PlayerState; entities?: Entity[]; currentLine: number | null }
  | { type: 'code-start' }
  | { type: 'code-stop' }
  | { type: 'complete' }
  | { type: 'reset' }
  | { type: 'ping' }
  | { type: 'pong' }
  | { type: 'leave' };

// Generate a random room code (6 uppercase letters)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
