/**
 * Cell Helper Functions
 *
 * Utilities for creating cells, generating IDs, and managing notebook structure.
 */

import type { Cell, MarkdownCell, CodeCell, Notebook, CellOutput, GameType } from '../types';

// ============ ID Generation ============

let idCounter = 0;

export function generateId(prefix = 'cell'): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function generateNotebookId(): string {
  return generateId('notebook');
}

export function generateCellId(): string {
  return generateId('cell');
}

export function generateOutputId(): string {
  return generateId('output');
}

// ============ Cell Factories ============

export function createMarkdownCell(content = ''): MarkdownCell {
  const now = Date.now();
  return {
    id: generateCellId(),
    type: 'markdown',
    content,
    isEditing: content === '',
    createdAt: now,
    updatedAt: now,
  };
}

export function createCodeCell(content = '', gameType: GameType | undefined = 'turtle'): CodeCell {
  const now = Date.now();
  return {
    id: generateCellId(),
    type: 'code',
    content,
    executionState: 'idle',
    executionCount: null,
    outputs: [],
    gameType,
    createdAt: now,
    updatedAt: now,
  };
}

export function createCell(type: 'markdown' | 'code', content = ''): Cell {
  return type === 'markdown' ? createMarkdownCell(content) : createCodeCell(content);
}

// ============ Output Factories ============

export function createTextOutput(content: string): CellOutput {
  return {
    id: generateOutputId(),
    type: 'text',
    content,
    timestamp: Date.now(),
  };
}

export function createErrorOutput(content: string): CellOutput {
  return {
    id: generateOutputId(),
    type: 'error',
    content,
    timestamp: Date.now(),
  };
}

// ============ Notebook Factory ============

export function createNotebook(
  title = 'Untitled Notebook',
  author = 'Anonymous',
  authorId = 'unknown',
  language: 'en' | 'zh' = 'en'
): Notebook {
  const now = Date.now();
  const squareCode = `# Draw a square
repeat 4 times:
    forward(5)
    turnLeft(90)`;

  return {
    id: generateNotebookId(),
    metadata: {
      title,
      author,
      authorId,
      language,
      createdAt: now,
      updatedAt: now,
    },
    cells: [
      createMarkdownCell(
        '# Welcome to MiniJupyter\n\nThis is your interactive notebook for learning programming!\n\nDouble-click this cell to edit it.'
      ),
      createMarkdownCell(
        '## Drawing with Turtle\n\nThe code below draws a square. Click **Run** to see it in action!'
      ),
      createCodeCell(squareCode, 'turtle'),
    ],
    version: 1,
  };
}

// ============ Cell Updates ============

export function updateCell<T extends Cell>(cell: T, updates: Partial<T>): T {
  return {
    ...cell,
    ...updates,
    updatedAt: Date.now(),
  };
}

export function updateCellContent(cell: Cell, content: string): Cell {
  return updateCell(cell, { content } as Partial<Cell>);
}

// ============ Cell Array Operations ============

export function insertCellAfter(cells: Cell[], afterId: string | null, newCell: Cell): Cell[] {
  if (afterId === null) {
    return [newCell, ...cells];
  }
  const index = cells.findIndex((c) => c.id === afterId);
  if (index === -1) {
    return [...cells, newCell];
  }
  return [...cells.slice(0, index + 1), newCell, ...cells.slice(index + 1)];
}

export function removeCell(cells: Cell[], cellId: string): Cell[] {
  return cells.filter((c) => c.id !== cellId);
}

export function moveCell(cells: Cell[], fromIndex: number, toIndex: number): Cell[] {
  if (fromIndex === toIndex) return cells;
  const result = [...cells];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function findCellIndex(cells: Cell[], cellId: string): number {
  return cells.findIndex((c) => c.id === cellId);
}

// ============ Type Guards ============

export function isMarkdownCell(cell: Cell): cell is MarkdownCell {
  return cell.type === 'markdown';
}

export function isCodeCell(cell: Cell): cell is CodeCell {
  return cell.type === 'code';
}
