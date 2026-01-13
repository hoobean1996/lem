/**
 * MiniJupyter Types
 *
 * Data model for notebook cells, outputs, and metadata.
 */

// ============ Cell Types ============

export type CellType = 'markdown' | 'code';
export type CellExecutionState = 'idle' | 'running' | 'success' | 'error';
export type CellOutputType = 'text' | 'turtle' | 'maze' | 'error';
export type GameType = 'turtle' | 'maze';

// ============ Canvas State Snapshots ============

export interface Point {
  x: number;
  y: number;
}

export interface TurtleCanvasState {
  lines: Array<{
    from: Point;
    to: Point;
    color: string;
    width: number;
  }>;
  turtle: {
    x: number;
    y: number;
    angle: number;
    penDown: boolean;
  };
  width: number;
  height: number;
}

export interface MazeCanvasState {
  grid: string[];
  playerPosition: Point;
  playerDirection: 'up' | 'down' | 'left' | 'right';
  stars: Point[];
}

// ============ Cell Output ============

export interface CellOutput {
  id: string;
  type: CellOutputType;
  content: string;
  canvasState?: TurtleCanvasState | MazeCanvasState;
  timestamp: number;
}

// ============ Cell Definitions ============

export interface BaseCell {
  id: string;
  type: CellType;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface MarkdownCell extends BaseCell {
  type: 'markdown';
  isEditing: boolean;
}

export interface CodeCell extends BaseCell {
  type: 'code';
  executionState: CellExecutionState;
  executionCount: number | null;
  outputs: CellOutput[];
  gameType?: GameType;
}

export type Cell = MarkdownCell | CodeCell;

// ============ Notebook ============

export interface NotebookMetadata {
  title: string;
  description?: string;
  author: string;
  authorId: string;
  tags?: string[];
  language: 'en' | 'zh';
  createdAt: number;
  updatedAt: number;
}

export interface Notebook {
  id: string;
  metadata: NotebookMetadata;
  cells: Cell[];
  version: number;
}

// ============ Version History ============

export interface NotebookVersion {
  version: number;
  cells: Cell[];
  timestamp: number;
  description?: string;
}

// ============ Storage ============

export interface NotebookStorageData {
  notebooks: Record<string, Notebook>;
  lastOpenedId?: string;
}

export interface NotebookHistoryData {
  [notebookId: string]: NotebookVersion[];
}

// ============ Execution Context ============

export interface VMContext {
  globals: Map<string, unknown>;
  executionCount: number;
}

// ============ Drag-Drop ============

export const CELL_DRAG_TYPE = 'NOTEBOOK_CELL';

export interface CellDragItem {
  id: string;
  index: number;
  type: typeof CELL_DRAG_TYPE;
}
