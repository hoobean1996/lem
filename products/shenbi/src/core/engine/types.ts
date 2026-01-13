// ============================================
// Core Types for Grid World Engine
// ============================================

// Position in the grid world
export interface Position {
  x: number; // column index, 0-based, increases to the right
  y: number; // row index, 0-based, increases downward
}

// Four cardinal directions
export type Direction = 'up' | 'down' | 'left' | 'right';

// ============================================
// Entity System (used by battle mode)
// ============================================

export interface Component {
  type: string;
  config?: Record<string, unknown>;
}

export interface Entity {
  id: string;
  type: string;
  position: Position;
  components: Component[];
  state: Record<string, unknown>;
}

// ============================================
// Level Definition
// ============================================

export interface EntityPlacement {
  type: string;
  position: Position;
  state?: Record<string, unknown>;
}

// Block types for visual programming
export type BlockCategory =
  | 'command'
  | 'repeat'
  | 'while'
  | 'if'
  | 'ifelse'
  | 'for'
  | 'setVariable'
  | 'print'
  | 'functionDef'
  | 'functionCall';

// ============================================
// Custom Command Definition (level-specific)
// ============================================

/**
 * Defines a custom command that can be added to a level.
 * The command appears in the block palette and executes the provided code.
 */
export interface CustomCommandDefinition {
  /** Unique command ID (must not conflict with built-in commands) */
  id: string;
  /** Display label for the block */
  label: string;
  /** Emoji icon for the block */
  icon: string;
  /** Block color (hex). Defaults to action color if not specified */
  color?: string;
  /** Code name to emit (what appears in generated code) */
  codeName: string;
  /** Argument type */
  argType?: 'none' | 'number' | 'string';
  /** Default argument value */
  defaultArg?: number | string;
  /**
   * MiniPython code to execute when command is called.
   * Has access to built-in commands: forward(), turnLeft(), collect(), etc.
   * For commands with args, use `arg` variable to access the argument.
   *
   * Examples:
   * - "forward()\nforward()" - move forward twice
   * - "repeat 4 times:\n    forward()" - move forward 4 times
   * - "repeat arg times:\n    turnLeft()" - turn left N times (arg from block)
   */
  code: string;
}

export interface LevelDefinition {
  id: string;
  /** Numeric ID from the API (for progress tracking) */
  numericId?: number;
  /** Adventure's numeric ID (for progress tracking) */
  adventureNumericId?: number;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  entities?: EntityPlacement[];
  // Alternative grid format (string array) - used by maze levels
  grid?: string[];
  initialState?: Record<string, unknown>;
  availableCommands?: string[];
  availableSensors?: string[];
  availableBlocks?: BlockCategory[];
  teachingGoal?: string;
  hints?: string[];
  // Music/creative game specific fields
  gameType?: 'maze' | 'music' | 'turtle' | 'hanzi';
  expectedCode?: string;
  // Win/fail conditions (MiniPython expressions)
  winCondition?: string;
  failCondition?: string;
  // Access control
  requiredTier?: string; // "free" or "premium"
  // Custom commands for this level
  customCommands?: CustomCommandDefinition[];
}
