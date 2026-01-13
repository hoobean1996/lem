/**
 * Maze World
 *
 * A simple grid-based world for maze games.
 * Follows the same pattern as TurtleWorld for consistency.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CellType = 'empty' | 'wall' | 'star' | 'goal';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  collected: number;
}

export interface MazeLevel {
  width: number;
  height: number;
  grid: CellType[][];
  playerStart: Position;
  playerDirection: Direction;
}

// Character to cell type mapping
const CharToCell: Record<string, CellType> = {
  '#': 'wall',
  '.': 'empty',
  '*': 'star',
  G: 'goal',
  '>': 'empty', // Player positions are empty cells
  '<': 'empty',
  '^': 'empty',
  v: 'empty',
};

// Character to direction mapping
const CharToDirection: Record<string, Direction> = {
  '>': 'right',
  '<': 'left',
  '^': 'up',
  v: 'down',
};

// Direction offsets for movement
const DirectionOffsets: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Turn mappings
const TurnLeft: Record<Direction, Direction> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

const TurnRight: Record<Direction, Direction> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

/**
 * Parse grid string array into MazeLevel
 */
export function parseGridStrings(gridStrings: string[]): MazeLevel {
  const height = gridStrings.length;
  const width = gridStrings[0]?.length ?? 0;

  const grid: CellType[][] = [];
  let playerStart: Position = { x: 0, y: 0 };
  let playerDirection: Direction = 'right';

  for (let y = 0; y < height; y++) {
    const row: CellType[] = [];
    const line = gridStrings[y];

    for (let x = 0; x < width; x++) {
      const char = line[x] || '.';
      const cellType = CharToCell[char] ?? 'empty';
      row.push(cellType);

      // Check for player position
      if (CharToDirection[char]) {
        playerStart = { x, y };
        playerDirection = CharToDirection[char];
      }
    }
    grid.push(row);
  }

  return { width, height, grid, playerStart, playerDirection };
}

/**
 * MazeWorld - A grid-based game world
 */
export class MazeWorld {
  private width: number = 0;
  private height: number = 0;
  private grid: CellType[][] = [];
  private player: PlayerState;
  private listeners: Set<() => void> = new Set();
  private initialLevel: MazeLevel | null = null;

  constructor() {
    this.player = {
      x: 0,
      y: 0,
      direction: 'right',
      collected: 0,
    };
  }

  /**
   * Load level from string array (convenience method)
   */
  loadFromStrings(gridStrings: string[]): void {
    const level = parseGridStrings(gridStrings);
    this.loadLevel(level);
  }

  // ============ Level Loading ============

  loadLevel(level: MazeLevel): void {
    this.width = level.width;
    this.height = level.height;
    this.initialLevel = level;

    // Deep copy grid
    this.grid = level.grid.map((row) => [...row]);

    // Set player start
    this.player = {
      x: level.playerStart.x,
      y: level.playerStart.y,
      direction: level.playerDirection,
      collected: 0,
    };

    this.notifyListeners();
  }

  reset(): void {
    if (this.initialLevel) {
      this.loadLevel(this.initialLevel);
    }
  }

  // ============ State Access ============

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getGrid(): CellType[][] {
    return this.grid.map((row) => [...row]);
  }

  getCell(x: number, y: number): CellType {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 'wall'; // Out of bounds is treated as wall
    }
    return this.grid[y][x];
  }

  getPlayer(): PlayerState {
    return { ...this.player };
  }

  // ============ Commands ============

  /**
   * Move player forward one cell in current direction
   * Returns true if move was successful, false if blocked
   */
  moveForward(): boolean {
    const offset = DirectionOffsets[this.player.direction];
    const newX = this.player.x + offset.x;
    const newY = this.player.y + offset.y;

    // Check if blocked
    if (this.getCell(newX, newY) === 'wall') {
      this.notifyListeners();
      return false;
    }

    // Move player
    this.player.x = newX;
    this.player.y = newY;

    // Auto-collect stars when stepping on them
    this.autoCollect();

    this.notifyListeners();
    return true;
  }

  /**
   * Move player backward one cell (opposite of current direction)
   * Returns true if move was successful, false if blocked
   */
  moveBackward(): boolean {
    const offset = DirectionOffsets[this.player.direction];
    const newX = this.player.x - offset.x;
    const newY = this.player.y - offset.y;

    // Check if blocked
    if (this.getCell(newX, newY) === 'wall') {
      this.notifyListeners();
      return false;
    }

    // Move player
    this.player.x = newX;
    this.player.y = newY;

    // Auto-collect stars when stepping on them
    this.autoCollect();

    this.notifyListeners();
    return true;
  }

  /**
   * Auto-collect star at current position (called after movement)
   */
  private autoCollect(): void {
    const cell = this.getCell(this.player.x, this.player.y);
    if (cell === 'star') {
      this.grid[this.player.y][this.player.x] = 'empty';
      this.player.collected++;
    }
  }

  /**
   * Turn player left (counter-clockwise)
   */
  turnLeft(): void {
    this.player.direction = TurnLeft[this.player.direction];
    this.notifyListeners();
  }

  /**
   * Turn player right (clockwise)
   */
  turnRight(): void {
    this.player.direction = TurnRight[this.player.direction];
    this.notifyListeners();
  }

  /**
   * Collect item at current position
   * Returns true if something was collected
   */
  collect(): boolean {
    const cell = this.getCell(this.player.x, this.player.y);
    if (cell === 'star') {
      this.grid[this.player.y][this.player.x] = 'empty';
      this.player.collected++;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // ============ Sensors ============

  /**
   * Check if there's a wall in front of player
   */
  isFrontBlocked(): boolean {
    const offset = DirectionOffsets[this.player.direction];
    const frontX = this.player.x + offset.x;
    const frontY = this.player.y + offset.y;
    return this.getCell(frontX, frontY) === 'wall';
  }

  /**
   * Check if front is clear (not blocked)
   */
  isFrontClear(): boolean {
    return !this.isFrontBlocked();
  }

  /**
   * Check if player is at goal
   */
  isAtGoal(): boolean {
    return this.getCell(this.player.x, this.player.y) === 'goal';
  }

  /**
   * Check if there's a star at player's current position
   */
  hasStarHere(): boolean {
    return this.getCell(this.player.x, this.player.y) === 'star';
  }

  /**
   * Get number of stars remaining in maze
   */
  getRemainingStars(): number {
    let count = 0;
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell === 'star') count++;
      }
    }
    return count;
  }

  /**
   * Get total stars collected
   */
  getCollectedCount(): number {
    return this.player.collected;
  }

  // ============ Events ============

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // ============ Shared State (for MiniPython VM) ============

  /**
   * Export current state as a plain object for MiniPython VM
   * The grid uses string cell types for MiniPython compatibility
   */
  toSharedState(): SharedMazeState {
    return {
      x: this.player.x,
      y: this.player.y,
      direction: this.player.direction,
      collected: this.player.collected,
      steps: 0,
      width: this.width,
      height: this.height,
      grid: this.grid.map((row) => [...row]),
    };
  }

  /**
   * Sync state from the shared state object modified by MiniPython
   */
  syncFromSharedState(state: SharedMazeState): void {
    this.player.x = state.x;
    this.player.y = state.y;
    this.player.direction = state.direction;
    this.player.collected = state.collected;
    // Sync grid (convert string to CellType)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = state.grid[y][x] as CellType;
      }
    }
    this.notifyListeners();
  }
}

/**
 * Plain object state for sharing with MiniPython VM
 */
export interface SharedMazeState {
  x: number;
  y: number;
  direction: Direction;
  collected: number;
  steps: number;
  width: number;
  height: number;
  grid: string[][];
}
