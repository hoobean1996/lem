/**
 * Turtle Level Types
 *
 * Type definitions for turtle level data.
 * Provides type safety for level definitions.
 */

/** Command IDs available in turtle game */
export type TurtleCommandId =
  | 'forward'
  | 'backward'
  | 'turnLeft'
  | 'turnRight'
  | 'penUp'
  | 'penDown'
  | 'setColor'
  | 'setWidth';

/** Sensor IDs available in turtle game */
export type TurtleSensorId = 'isPenDown' | 'getX' | 'getY' | 'getAngle';

/** Block types available in turtle game */
export type TurtleBlockType =
  | 'command'
  | 'repeat'
  | 'if'
  | 'ifelse'
  | 'while'
  | 'for'
  | 'variable'
  | 'function';

/**
 * Turtle Level Definition
 *
 * Defines a single turtle level with all its configuration.
 */
export interface TurtleLevelData {
  /** Unique level ID */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Game type - always 'turtle' for turtle levels */
  gameType: 'turtle';
  /** Available command IDs for this level */
  availableCommands: TurtleCommandId[];
  /** Available sensor IDs for this level */
  availableSensors: TurtleSensorId[];
  /** Available block types for this level */
  availableBlocks: TurtleBlockType[];
  /** Win condition expression */
  winCondition: string;
  /** Fail condition expression */
  failCondition: string;
  /** Teaching goal for this level */
  teachingGoal: string;
  /** Hints to help the player */
  hints: string[];
  /** Expected code solution */
  expectedCode: string;
  /** Required subscription tier (optional) */
  requiredTier?: 'free' | 'premium';
}
