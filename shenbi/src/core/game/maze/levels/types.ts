/**
 * Maze Level Types
 *
 * Type definitions for maze level data.
 * Provides type safety for level definitions.
 */

import type { CommandDefinition, ConditionDefinition } from '../commands';
import type { CustomCommandDefinition } from '../../../engine/types';

/** Command IDs available in maze game */
export type MazeCommandId = 'forward' | 'backward' | 'turnLeft' | 'turnRight' | 'collect';

/** Sensor IDs available in maze game */
export type MazeSensorId =
  | 'frontBlocked'
  | 'frontClear'
  | 'leftClear'
  | 'rightClear'
  | 'atGoal'
  | 'notAtGoal'
  | 'hasStar';

/** Block types available in maze game */
export type MazeBlockType =
  | 'command'
  | 'repeat'
  | 'if'
  | 'ifelse'
  | 'while'
  | 'for'
  | 'variable'
  | 'function';

/**
 * Maze Level Definition
 *
 * Defines a single maze level with all its configuration.
 */
export interface MazeLevelData {
  /** Unique level ID */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Grid layout using character notation */
  grid: string[];
  /** Available command IDs for this level */
  availableCommands: MazeCommandId[];
  /** Available sensor IDs for this level */
  availableSensors: MazeSensorId[];
  /** Available block types for this level */
  availableBlocks: MazeBlockType[];
  /** Win condition expression */
  winCondition: string;
  /** Fail condition expression */
  failCondition: string;
  /** Teaching goal for this level */
  teachingGoal: string;
  /** Hints to help the player */
  hints: string[];
  /** Required subscription tier (optional) */
  requiredTier?: 'free' | 'premium';
  /** Custom commands specific to this level (optional) */
  customCommands?: CustomCommandDefinition[];
}

/** Helper to get command definitions for a level */
export function getCommandsForLevel(
  level: MazeLevelData,
  allCommands: CommandDefinition[]
): CommandDefinition[] {
  return allCommands.filter((cmd) => level.availableCommands.includes(cmd.id as MazeCommandId));
}

/** Helper to get sensor definitions for a level */
export function getSensorsForLevel(
  level: MazeLevelData,
  allConditions: ConditionDefinition[]
): ConditionDefinition[] {
  return allConditions.filter((cond) => level.availableSensors.includes(cond.id as MazeSensorId));
}
