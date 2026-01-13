import {
  LevelDefinition,
  EntityPlacement,
  BlockCategory,
  CustomCommandDefinition,
} from '../../core/engine';
import {
  CompactLevelData,
  LevelSymbols,
  DEFAULT_MAZE_SYMBOLS,
  AdventureComplexity,
  GameType,
} from './types';
import { warn } from '../logging';
import { StdlibFunction } from '../services/api';

// Import local TypeScript levels
import { mazeLevels, type MazeLevelData } from '../../core/game/maze/levels';
import {
  turtleLevels,
  type TurtleLevelData,
} from '../../core/game/turtle/levels';

/**
 * Parsed Adventure with full level definitions
 */
export interface ParsedAdventure {
  id: string;
  /** Numeric ID from the API (for progress tracking) */
  numericId?: number;
  name: string;
  description?: string;
  longDescription?: string;
  icon?: string;
  themeId?: string;
  gameType?: GameType;
  complexity?: AdventureComplexity;
  tags?: string[];
  concepts?: string[];
  ageRange?: string;
  stdlibFunctions?: StdlibFunction[];
  levels: LevelDefinition[];
  userId?: number; // 0 = system/official, >0 = teacher-created
}

/**
 * Parse a compact level definition into the engine's LevelDefinition format
 * Supports both grid-based (maze) and non-grid (music, etc.) levels
 * Used for parsing custom teacher-created levels
 */
export function parseLevel(
  data: CompactLevelData,
  defaultSymbols: LevelSymbols = DEFAULT_MAZE_SYMBOLS
): LevelDefinition {
  const grid = data.grid;

  // For non-grid games (music, etc.), create a minimal level definition
  if (!grid || grid.length === 0) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      width: 0,
      height: 0,
      entities: [],
      availableCommands: data.availableCommands,
      availableSensors: data.availableSensors,
      availableBlocks: data.availableBlocks as BlockCategory[] | undefined,
      teachingGoal: data.teachingGoal,
      hints: data.hints,
      expectedCode: data.expectedCode,
      gameType: data.gameType,
      winCondition: data.winCondition,
      failCondition: data.failCondition,
    };
  }

  // Grid-based parsing for maze games
  const symbols = { ...defaultSymbols, ...data.symbols };
  const height = grid.length;
  const width = Math.max(...grid.map((row) => row.length));

  const entities: EntityPlacement[] = [];

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];

      // Skip empty cells
      if (char === ' ' || char === '.') {
        continue;
      }

      const symbolDef = symbols[char];
      if (!symbolDef) {
        warn(`Unknown symbol in level`, { levelId: data.id, char, x, y }, 'LevelLoader');
        continue;
      }

      entities.push({
        type: symbolDef.type,
        position: { x, y },
        state: symbolDef.state,
      });
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    width,
    height,
    grid, // Preserve original grid for new MazeWorld architecture
    entities,
    availableCommands: data.availableCommands,
    availableSensors: data.availableSensors,
    availableBlocks: data.availableBlocks as BlockCategory[] | undefined,
    teachingGoal: data.teachingGoal,
    hints: data.hints,
    winCondition: data.winCondition,
    failCondition: data.failCondition,
  };
}

// ============================================
// Local TypeScript Level Loading
// ============================================

/**
 * Convert local MazeLevelData to LevelDefinition
 */
function convertMazeLevelToDefinition(level: MazeLevelData): LevelDefinition {
  const grid = level.grid;
  const height = grid.length;
  const width = Math.max(...grid.map((row) => row.length));

  const entities: EntityPlacement[] = [];

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char === ' ' || char === '.') continue;

      const symbolDef = DEFAULT_MAZE_SYMBOLS[char];
      if (symbolDef) {
        entities.push({
          type: symbolDef.type,
          position: { x, y },
          state: symbolDef.state,
        });
      }
    }
  }

  return {
    id: level.id,
    name: level.name,
    description: level.description,
    width,
    height,
    grid,
    entities,
    availableCommands: level.availableCommands,
    availableSensors: level.availableSensors,
    availableBlocks: level.availableBlocks as BlockCategory[],
    teachingGoal: level.teachingGoal,
    hints: level.hints,
    gameType: 'maze',
    winCondition: level.winCondition,
    failCondition: level.failCondition,
    requiredTier: level.requiredTier,
    customCommands: level.customCommands,
  };
}

/**
 * Convert local TurtleLevelData to LevelDefinition
 */
function convertTurtleLevelToDefinition(level: TurtleLevelData): LevelDefinition {
  return {
    id: level.id,
    name: level.name,
    description: level.description,
    width: 400,
    height: 400,
    grid: [],
    entities: [],
    availableCommands: level.availableCommands,
    availableSensors: level.availableSensors,
    availableBlocks: level.availableBlocks as BlockCategory[],
    teachingGoal: level.teachingGoal,
    hints: level.hints,
    gameType: 'turtle',
    winCondition: level.winCondition,
    failCondition: level.failCondition,
    requiredTier: level.requiredTier,
  };
}

/**
 * Load all adventures from local TypeScript level files
 * This is the primary way to load levels - no API needed
 */
export function loadLocalAdventures(): { adventures: ParsedAdventure[] } {
  // Create maze adventure from local levels
  const mazeAdventure: ParsedAdventure = {
    id: 'robot-maze',
    name: 'Robot Maze Adventure',
    description: 'Help the robot navigate through mazes!',
    icon: '🤖',
    gameType: 'maze',
    complexity: 'beginner',
    levels: mazeLevels.map(convertMazeLevelToDefinition),
  };

  // Create turtle adventure from local levels
  const turtleAdventure: ParsedAdventure = {
    id: 'turtle-graphics',
    name: 'Turtle Graphics Adventure',
    description: 'Learn to draw amazing patterns with the turtle!',
    icon: '🐢',
    gameType: 'turtle',
    complexity: 'beginner',
    levels: turtleLevels.map(convertTurtleLevelToDefinition),
  };

  return {
    adventures: [mazeAdventure, turtleAdventure],
  };
}
