import { Direction } from '../../core/engine';

/**
 * Compact Level Data Format
 *
 * Levels can be defined using a simple grid notation where each cell
 * is represented by a character. This makes level design intuitive
 * and easy to visualize.
 */

// Character mapping for grid notation
export interface LevelSymbols {
  [symbol: string]: {
    type: string;
    state?: Record<string, unknown>;
  };
}

// Default symbols for maze game
export const DEFAULT_MAZE_SYMBOLS: LevelSymbols = {
  '#': { type: 'wall' },
  '*': { type: 'star' },
  G: { type: 'goal' },
  '>': { type: 'player', state: { direction: 'right' as Direction } },
  '<': { type: 'player', state: { direction: 'left' as Direction } },
  '^': { type: 'player', state: { direction: 'up' as Direction } },
  v: { type: 'player', state: { direction: 'down' as Direction } },
  '.': null!, // empty cell (explicit)
  ' ': null!, // empty cell (space)
};

/**
 * Game Type - which game engine to use
 */
export type GameType = 'maze' | 'music' | 'turtle' | 'hanzi';

/**
 * Compact Level Definition (JSON-friendly)
 *
 * Uses a grid string array for intuitive level design:
 *
 * Example:
 * {
 *   "id": "level-1",
 *   "name": "第一关",
 *   "grid": [
 *     "#######",
 *     "#>*...#",
 *     "#.#.##",
 *     "#..*..#",
 *     "#...*.G#",
 *     "#######"
 *   ]
 * }
 */
export interface CompactLevelData {
  id: string;
  name: string;
  description?: string;
  gameType?: GameType; // game type for this level (inherited from story if not set)
  grid?: string[]; // optional for non-maze games
  symbols?: LevelSymbols; // custom symbols (merged with defaults)
  availableCommands?: string[];
  availableSensors?: string[];
  availableBlocks?: string[];
  teachingGoal?: string;
  hints?: string[];
  // Win/fail conditions (MiniPython expressions)
  // Examples: "collectCount >= 3 and atGoal()", "stepCount > 50"
  winCondition?: string;
  failCondition?: string;
  // Music/creative game specific
  expectedCode?: string;
}

/**
 * Adventure Complexity Level
 */
export type AdventureComplexity = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Adventure - A narrative collection of levels with a theme
 *
 * Adventures provide context and motivation for learning.
 * Each adventure has multiple levels that progress in difficulty.
 */
export interface Adventure {
  id: string;
  name: string;
  description?: string; // short description shown in cards
  longDescription?: string; // detailed description of learning goals
  icon?: string; // emoji or icon
  coverImage?: string; // optional cover image URL
  themeId?: string; // default theme for this adventure
  gameType?: GameType; // game type for this adventure (overrides pack gameId)
  complexity?: AdventureComplexity; // difficulty level
  tags?: string[]; // learning concepts: e.g., ["顺序编程", "方向", "计数"]
  concepts?: string[]; // core programming concepts taught
  ageRange?: string; // recommended age range, e.g., "5-7"
  levels: CompactLevelData[];
}
