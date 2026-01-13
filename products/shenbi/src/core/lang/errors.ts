/**
 * Mini Python Error Types
 */

export interface MiniPyError {
  type: 'SyntaxError' | 'RuntimeError';
  message: string;
  line: number;
  column: number;
  suggestion?: string;
}

export class SyntaxError extends Error {
  line: number;
  column: number;
  suggestion?: string;

  constructor(message: string, line: number, column: number, suggestion?: string) {
    super(message);
    this.name = 'SyntaxError';
    this.line = line;
    this.column = column;
    this.suggestion = suggestion;
  }

  toJSON(): MiniPyError {
    return {
      type: 'SyntaxError',
      message: this.message,
      line: this.line,
      column: this.column,
      suggestion: this.suggestion,
    };
  }
}

export class RuntimeError extends Error {
  line: number;
  column: number;
  suggestion?: string;

  constructor(message: string, line: number = 0, column: number = 0, suggestion?: string) {
    super(message);
    this.name = 'RuntimeError';
    this.line = line;
    this.column = column;
    this.suggestion = suggestion;
  }

  toJSON(): MiniPyError {
    return {
      type: 'RuntimeError',
      message: this.message,
      line: this.line,
      column: this.column,
      suggestion: this.suggestion,
    };
  }
}
