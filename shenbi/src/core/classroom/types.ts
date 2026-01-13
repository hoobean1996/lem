/**
 * Classroom Mode Types
 *
 * Types for real-time classroom mode using PeerJS (WebRTC).
 * Teacher connects to multiple students in a star topology.
 */

import type { Entity, LevelDefinition } from '../engine/types';

// Role in the classroom
export type ClassroomRole = 'teacher' | 'student';

// Classroom status progression
export type ClassroomStatus =
  | 'name-entry' // Entering name and selecting role
  | 'lobby' // Main lobby (create/join)
  | 'waiting' // Teacher waiting for students / Student waiting for start
  | 'playing' // Level in progress
  | 'finished'; // Level complete, showing results

// Student progress during gameplay
export interface StudentProgress {
  starsCollected: number;
  completed: boolean;
  entities: Entity[]; // For live preview
}

// Student info tracked by teacher
export interface StudentInfo {
  id: string;
  name: string;
  connected: boolean;
  progress: StudentProgress;
}

// Messages sent over PeerJS connection
export type ClassroomMessage =
  // Student -> Teacher
  | { type: 'student-join'; studentId: string; name: string }
  | { type: 'student-progress'; studentId: string; progress: StudentProgress }
  // Teacher -> Student(s)
  | { type: 'teacher-welcome'; teacherName: string }
  | { type: 'teacher-set-level'; level: LevelDefinition }
  | { type: 'teacher-start' }
  | { type: 'teacher-reset' }
  | { type: 'teacher-end-session' }
  // Bidirectional
  | { type: 'ping' }
  | { type: 'pong' };

// Generate a random room code (6 uppercase letters)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create initial student progress
export function createInitialProgress(): StudentProgress {
  return {
    starsCollected: 0,
    completed: false,
    entities: [],
  };
}
