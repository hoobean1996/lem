/**
 * Turtle Graphics Game Module
 */

export { TurtleWorld } from './TurtleWorld';
export type { TurtleState, Line, Point } from './TurtleWorld';
export { TurtleVM } from './TurtleVM';
export type { TurtleVMConfig } from './TurtleVM';
export { TurtleCanvas } from './TurtleCanvas';

// Command definitions (for BlockEditor, CodeGenerator)
export {
  TURTLE_COMMANDS,
  TURTLE_CONDITIONS,
  TURTLE_SENSORS,
  TURTLE_COLORS,
  COLOR_MAP,
} from './commands';
export type { CommandDefinition, ConditionDefinition, ArgType } from './commands';
