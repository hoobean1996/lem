/**
 * Game Module
 *
 * Provides game-specific VM bindings and utilities.
 * Each game type is in its own subfolder with its own World, VM, and Canvas.
 *
 * Architecture pattern:
 * - World: Data model (state, commands, sensors)
 * - VM: Code executor (maps code to World methods)
 * - Canvas: Renderer (displays World state)
 */

// Maze Game
export { MazeWorld, MazeVM, MazeCanvas } from './maze';
export type { Direction, CellType, Position, PlayerState, MazeLevel, MazeVMConfig } from './maze';

// Turtle Graphics Game
export { TurtleWorld, TurtleVM, TurtleCanvas } from './turtle';
export type { TurtleState, Line, Point, TurtleVMConfig } from './turtle';
