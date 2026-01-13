/**
 * Turtle Game Commands
 *
 * Single source of truth for turtle commands and conditions.
 * Used by: TurtleVM (registration), BlockEditor (UI), CodeGenerator (code output)
 */

import { TurtleWorld } from './TurtleWorld';
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
  handler: (world: TurtleWorld, args: Value[]) => Value | void;
}

export interface ConditionDefinition {
  /** Unique condition ID */
  id: string;
  /** Display label */
  label: string;
  /** Code name to emit */
  codeName: string;
  /** Handler function - returns boolean */
  handler: (world: TurtleWorld) => boolean;
}

// ============ Colors ============

export const TURTLE_COLORS = {
  action: '#3B82F6', // Blue - movement commands
  pen: '#8B5CF6', // Purple - pen commands
  sensor: '#10B981', // Green - conditions/sensors
} as const;

// Color name to hex mappings for setColor command
export const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  black: '#000000',
  white: '#ffffff',
};

// ============ Commands ============

export const TURTLE_COMMANDS: CommandDefinition[] = [
  // Movement commands
  {
    id: 'forward',
    label: 'Forward',
    icon: '⬆️',
    color: TURTLE_COLORS.action,
    codeName: 'forward',
    argType: 'number',
    defaultArg: 50,
    handler: (world, args) => {
      const distance = typeof args[0] === 'number' ? args[0] : 50;
      world.forward(distance);
    },
  },
  {
    id: 'backward',
    label: 'Backward',
    icon: '⬇️',
    color: TURTLE_COLORS.action,
    codeName: 'backward',
    argType: 'number',
    defaultArg: 50,
    handler: (world, args) => {
      const distance = typeof args[0] === 'number' ? args[0] : 50;
      world.backward(distance);
    },
  },
  {
    id: 'turnLeft',
    label: 'Turn Left',
    icon: '↩️',
    color: TURTLE_COLORS.action,
    codeName: 'turnLeft',
    argType: 'number',
    defaultArg: 90,
    handler: (world, args) => {
      const degrees = typeof args[0] === 'number' ? args[0] : 90;
      world.turnLeft(degrees);
    },
  },
  {
    id: 'turnRight',
    label: 'Turn Right',
    icon: '↪️',
    color: TURTLE_COLORS.action,
    codeName: 'turnRight',
    argType: 'number',
    defaultArg: 90,
    handler: (world, args) => {
      const degrees = typeof args[0] === 'number' ? args[0] : 90;
      world.turnRight(degrees);
    },
  },
  // Pen commands
  {
    id: 'penUp',
    label: 'Pen Up',
    icon: '✏️',
    color: TURTLE_COLORS.pen,
    codeName: 'penUp',
    argType: 'none',
    handler: (world) => world.penUp(),
  },
  {
    id: 'penDown',
    label: 'Pen Down',
    icon: '🖊️',
    color: TURTLE_COLORS.pen,
    codeName: 'penDown',
    argType: 'none',
    handler: (world) => world.penDown(),
  },
  {
    id: 'setColor',
    label: 'Set Color',
    icon: '🎨',
    color: TURTLE_COLORS.pen,
    codeName: 'setColor',
    argType: 'string',
    defaultArg: 'red',
    handler: (world, args) => {
      const color = typeof args[0] === 'string' ? args[0] : '#000000';
      const mappedColor = COLOR_MAP[color] || color;
      world.setColor(mappedColor);
    },
  },
  {
    id: 'setWidth',
    label: 'Set Width',
    icon: '📏',
    color: TURTLE_COLORS.pen,
    codeName: 'setWidth',
    argType: 'number',
    defaultArg: 2,
    handler: (world, args) => {
      const width = typeof args[0] === 'number' ? args[0] : 2;
      world.setWidth(width);
    },
  },
];

// ============ Conditions ============
// Turtle doesn't have game conditions like maze, but has sensors

export const TURTLE_CONDITIONS: ConditionDefinition[] = [];

// ============ Sensors ============

export const TURTLE_SENSORS: CommandDefinition[] = [
  {
    id: 'isPenDown',
    label: 'Is Pen Down',
    icon: '❓',
    color: TURTLE_COLORS.sensor,
    codeName: 'isPenDown',
    argType: 'none',
    handler: (world) => world.isPenDown(),
  },
  {
    id: 'getX',
    label: 'Get X',
    icon: '📍',
    color: TURTLE_COLORS.sensor,
    codeName: 'getX',
    argType: 'none',
    handler: (world) => world.getX(),
  },
  {
    id: 'getY',
    label: 'Get Y',
    icon: '📍',
    color: TURTLE_COLORS.sensor,
    codeName: 'getY',
    argType: 'none',
    handler: (world) => world.getY(),
  },
  {
    id: 'getAngle',
    label: 'Get Angle',
    icon: '🧭',
    color: TURTLE_COLORS.sensor,
    codeName: 'getAngle',
    argType: 'none',
    handler: (world) => world.getAngle(),
  },
];

// ============ Helper Functions ============

/** Get all commands as a map by ID */
export function getCommandMap(): Map<string, CommandDefinition> {
  return new Map(TURTLE_COMMANDS.map((cmd) => [cmd.id, cmd]));
}

/** Get all conditions as a map by ID */
export function getConditionMap(): Map<string, ConditionDefinition> {
  return new Map(TURTLE_CONDITIONS.map((cond) => [cond.id, cond]));
}
