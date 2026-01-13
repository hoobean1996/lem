/**
 * Maze Game Module
 *
 * Clean architecture following the same pattern as Turtle:
 * - MazeWorld: Data model (grid, player state, commands)
 * - MazeVM: Code executor (maps code to MazeWorld methods)
 * - MazeCanvas: Renderer (displays MazeWorld state)
 * - commands: Single source of truth for command definitions
 */

export { MazeWorld } from './MazeWorld';
export type { Direction, CellType, Position, PlayerState, MazeLevel } from './MazeWorld';

export { MazeVM } from './MazeVM';
export type { MazeVMConfig } from './MazeVM';

export { MazeCanvas } from './MazeCanvas';

// Command definitions (for BlockEditor, CodeGenerator)
export { MAZE_COMMANDS, MAZE_CONDITIONS, MAZE_SENSORS, MAZE_COLORS } from './commands';
export type { CommandDefinition, ConditionDefinition, ArgType } from './commands';
