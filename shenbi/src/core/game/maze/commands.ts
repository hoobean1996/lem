/**
 * Maze Game Commands
 *
 * Single source of truth for maze commands and conditions.
 * Used by: MazeVM (registration), BlockEditor (UI), CodeGenerator (code output)
 */

import { MazeWorld } from './MazeWorld';
import { Value } from '../../lang/ir';

// ============ Types ============

export type ArgType = 'none' | 'number' | 'string';

export interface CommandDefinition {
  /** Unique command ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon for block UI */
  icon: string;
  /** Block color (hex) */
  color: string;
  /** Code name to emit (e.g., 'forward') */
  codeName: string;
  /** Argument type */
  argType: ArgType;
  /** Default argument value */
  defaultArg?: number | string;
  /** Handler function */
  handler: (world: MazeWorld, args: Value[]) => Value | void;
}

export interface ConditionDefinition {
  /** Unique condition ID */
  id: string;
  /** Display label */
  label: string;
  /** Code name to emit (e.g., 'frontBlocked') */
  codeName: string;
  /** Handler function - returns boolean */
  handler: (world: MazeWorld) => boolean;
}

// ============ Colors ============

export const MAZE_COLORS = {
  action: '#3B82F6', // Blue - movement commands
  sensor: '#10B981', // Green - conditions/sensors
} as const;

// ============ Commands ============

export const MAZE_COMMANDS: CommandDefinition[] = [
  {
    id: 'forward',
    label: 'Forward',
    icon: '⬆️',
    color: MAZE_COLORS.action,
    codeName: 'forward',
    argType: 'none',
    handler: (world) => world.moveForward(),
  },
  {
    id: 'backward',
    label: 'Backward',
    icon: '⬇️',
    color: MAZE_COLORS.action,
    codeName: 'backward',
    argType: 'none',
    handler: (world) => world.moveBackward(),
  },
  {
    id: 'turnLeft',
    label: 'Turn Left',
    icon: '↩️',
    color: MAZE_COLORS.action,
    codeName: 'turnLeft',
    argType: 'none',
    handler: (world) => world.turnLeft(),
  },
  {
    id: 'turnRight',
    label: 'Turn Right',
    icon: '↪️',
    color: MAZE_COLORS.action,
    codeName: 'turnRight',
    argType: 'none',
    handler: (world) => world.turnRight(),
  },
  {
    id: 'collect',
    label: 'Collect',
    icon: '⭐',
    color: MAZE_COLORS.action,
    codeName: 'collect',
    argType: 'none',
    handler: (world) => world.collect(),
  },
];

// ============ Conditions ============

export const MAZE_CONDITIONS: ConditionDefinition[] = [
  {
    id: 'frontBlocked',
    label: 'Front Blocked',
    codeName: 'frontBlocked',
    handler: (world) => world.isFrontBlocked(),
  },
  {
    id: 'frontClear',
    label: 'Front Clear',
    codeName: 'frontClear',
    handler: (world) => world.isFrontClear(),
  },
  {
    id: 'atGoal',
    label: 'At Goal',
    codeName: 'atGoal',
    handler: (world) => world.isAtGoal(),
  },
  {
    id: 'notAtGoal',
    label: 'Not At Goal',
    codeName: 'notAtGoal',
    handler: (world) => !world.isAtGoal(),
  },
  {
    id: 'hasStar',
    label: 'Has Star',
    codeName: 'hasStar',
    handler: (world) => world.hasStarHere(),
  },
];

// ============ Additional Sensors (not used in conditions, but available) ============

export const MAZE_SENSORS: CommandDefinition[] = [
  {
    id: 'remainingStars',
    label: 'Remaining Stars',
    icon: '🔢',
    color: MAZE_COLORS.sensor,
    codeName: 'remainingStars',
    argType: 'none',
    handler: (world) => world.getRemainingStars(),
  },
  {
    id: 'collectedCount',
    label: 'Collected Count',
    icon: '🔢',
    color: MAZE_COLORS.sensor,
    codeName: 'collectedCount',
    argType: 'none',
    handler: (world) => world.getCollectedCount(),
  },
];

// ============ Helper Functions ============

/** Get all commands as a map by ID */
export function getCommandMap(): Map<string, CommandDefinition> {
  return new Map(MAZE_COMMANDS.map((cmd) => [cmd.id, cmd]));
}

/** Get all conditions as a map by ID */
export function getConditionMap(): Map<string, ConditionDefinition> {
  return new Map(MAZE_CONDITIONS.map((cond) => [cond.id, cond]));
}
