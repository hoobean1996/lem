/**
 * Mini Python Lexer
 *
 * Tokenizes Mini Python source code, handling:
 * - Chinese and English keywords
 * - Python-style indentation (INDENT/DEDENT tokens)
 * - Numbers, strings, identifiers
 * - Operators and delimiters
 */

import { SyntaxError } from './errors';

// Token types
export type TokenType =
  // Keywords
  | 'IF'
  | 'ELIF'
  | 'ELSE'
  | 'REPEAT'
  | 'TIMES'
  | 'WHILE'
  | 'DO'
  | 'FOR'
  | 'IN'
  | 'RANGE'
  | 'BREAK'
  | 'CONTINUE'
  | 'PASS'
  | 'DEF'
  | 'RETURN'
  | 'TRUE'
  | 'FALSE'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'CLASS'
  // Operators
  | 'PLUS'
  | 'MINUS'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'MODULO'
  | 'FLOOR_DIV'
  | 'POWER'
  | 'ASSIGN'
  | 'EQ'
  | 'NEQ'
  | 'LT'
  | 'GT'
  | 'LTE'
  | 'GTE'
  | 'PLUS_ASSIGN'
  | 'MINUS_ASSIGN'
  | 'MULTIPLY_ASSIGN'
  | 'DIVIDE_ASSIGN'
  // Delimiters
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'LBRACE'
  | 'RBRACE'
  | 'COLON'
  | 'COMMA'
  | 'DOT'
  // Structure
  | 'INDENT'
  | 'DEDENT'
  | 'NEWLINE'
  // Literals & Identifiers
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  // End
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string | number | null;
  line: number;
  column: number;
}

// Keyword mappings (Chinese and English)
const KEYWORDS: Record<string, TokenType> = {
  // Chinese keywords
  如果: 'IF',
  否则如果: 'ELIF',
  否则: 'ELSE',
  重复: 'REPEAT',
  次: 'TIMES',
  当: 'WHILE',
  时: 'DO',
  对于: 'FOR',
  从: 'FOR',
  在: 'IN',
  到: 'RANGE',
  范围: 'RANGE',
  停止: 'BREAK',
  跳出: 'BREAK',
  继续: 'CONTINUE',
  跳过: 'PASS',
  定义: 'DEF',
  返回: 'RETURN',
  真: 'TRUE',
  假: 'FALSE',
  和: 'AND',
  或: 'OR',
  不: 'NOT',
  类: 'CLASS',

  // English keywords
  if: 'IF',
  elif: 'ELIF',
  else: 'ELSE',
  repeat: 'REPEAT',
  times: 'TIMES',
  while: 'WHILE',
  for: 'FOR',
  in: 'IN',
  range: 'RANGE',
  break: 'BREAK',
  continue: 'CONTINUE',
  pass: 'PASS',
  def: 'DEF',
  return: 'RETURN',
  True: 'TRUE',
  False: 'FALSE',
  and: 'AND',
  or: 'OR',
  not: 'NOT',
  class: 'CLASS',
};

// Two-character operators
const TWO_CHAR_OPS: Record<string, TokenType> = {
  '==': 'EQ',
  '!=': 'NEQ',
  '<=': 'LTE',
  '>=': 'GTE',
  '//': 'FLOOR_DIV',
  '**': 'POWER',
  '+=': 'PLUS_ASSIGN',
  '-=': 'MINUS_ASSIGN',
  '*=': 'MULTIPLY_ASSIGN',
  '/=': 'DIVIDE_ASSIGN',
};

// Single-character operators
const SINGLE_CHAR_OPS: Record<string, TokenType> = {
  '+': 'PLUS',
  '-': 'MINUS',
  '*': 'MULTIPLY',
  '/': 'DIVIDE',
  '%': 'MODULO',
  '=': 'ASSIGN',
  '<': 'LT',
  '>': 'GT',
};

// Delimiters
const DELIMITERS: Record<string, TokenType> = {
  '(': 'LPAREN',
  ')': 'RPAREN',
  '[': 'LBRACKET',
  ']': 'RBRACKET',
  '{': 'LBRACE',
  '}': 'RBRACE',
  ':': 'COLON',
  ',': 'COMMA',
  '.': 'DOT',
};

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 0;
  private indentStack: number[] = [0];
  private tokens: Token[] = [];
  private atLineStart: boolean = true;

  constructor(source: string) {
    // Normalize line endings and ensure trailing newline
    this.source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!this.source.endsWith('\n')) {
      this.source += '\n';
    }
  }

  tokenize(): Token[] {
    this.tokens = [];

    while (!this.isAtEnd()) {
      this.scanToken();
    }

    // Emit any remaining DEDENT tokens
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.tokens.push(this.makeToken('DEDENT', null));
    }

    this.tokens.push(this.makeToken('EOF', null));
    return this.tokens;
  }

  private scanToken(): void {
    // Handle indentation at line start
    if (this.atLineStart) {
      this.handleIndentation();
      this.atLineStart = false;
      return;
    }

    const ch = this.peek();

    // Skip spaces (not at line start)
    if (ch === ' ' || ch === '\t') {
      this.advance();
      return;
    }

    // Comments
    if (ch === '#') {
      this.skipComment();
      return;
    }

    // Newlines
    if (ch === '\n') {
      // Only emit NEWLINE if we have meaningful tokens on this line
      if (this.tokens.length > 0 && this.lastTokenType() !== 'NEWLINE') {
        this.tokens.push(this.makeToken('NEWLINE', null));
      }
      this.advance();
      this.line++;
      this.column = 0;
      this.atLineStart = true;
      return;
    }

    // Two-character operators
    const twoChar = this.source.slice(this.pos, this.pos + 2);
    if (TWO_CHAR_OPS[twoChar]) {
      this.tokens.push(this.makeToken(TWO_CHAR_OPS[twoChar], twoChar));
      this.advance();
      this.advance();
      return;
    }

    // Single-character operators
    if (SINGLE_CHAR_OPS[ch]) {
      this.tokens.push(this.makeToken(SINGLE_CHAR_OPS[ch], ch));
      this.advance();
      return;
    }

    // Delimiters
    if (DELIMITERS[ch]) {
      this.tokens.push(this.makeToken(DELIMITERS[ch], ch));
      this.advance();
      return;
    }

    // Numbers
    if (this.isDigit(ch)) {
      this.scanNumber();
      return;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      this.scanString(ch);
      return;
    }

    // Identifiers and keywords
    if (this.isIdentifierStart(ch)) {
      this.scanIdentifier();
      return;
    }

    throw new SyntaxError(
      `未知的字符: '${ch}'`,
      this.line,
      this.column,
      '检查是否有拼写错误或使用了不支持的符号'
    );
  }

  private handleIndentation(): void {
    let indent = 0;

    // Skip blank lines and comments
    while (!this.isAtEnd()) {
      const ch = this.peek();

      if (ch === ' ') {
        indent++;
        this.advance();
      } else if (ch === '\t') {
        // Treat tab as 4 spaces
        indent += 4;
        this.advance();
      } else if (ch === '\n') {
        // Blank line, reset and continue
        this.advance();
        this.line++;
        this.column = 0;
        indent = 0;
      } else if (ch === '#') {
        // Comment line
        this.skipComment();
        indent = 0;
      } else {
        break;
      }
    }

    if (this.isAtEnd()) return;

    const currentIndent = this.indentStack[this.indentStack.length - 1];

    if (indent > currentIndent) {
      this.indentStack.push(indent);
      this.tokens.push(this.makeToken('INDENT', null));
    } else if (indent < currentIndent) {
      while (
        this.indentStack.length > 1 &&
        this.indentStack[this.indentStack.length - 1] > indent
      ) {
        this.indentStack.pop();
        this.tokens.push(this.makeToken('DEDENT', null));
      }

      if (this.indentStack[this.indentStack.length - 1] !== indent) {
        throw new SyntaxError(
          '缩进不正确',
          this.line,
          this.column,
          '检查这一行的空格数量是否正确，每级缩进应该一致'
        );
      }
    }
  }

  private scanNumber(): void {
    const startCol = this.column;
    let numStr = '';

    while (this.isDigit(this.peek())) {
      numStr += this.advance();
    }

    // Handle decimals
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      numStr += this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        numStr += this.advance();
      }
    }

    this.tokens.push({
      type: 'NUMBER',
      value: parseFloat(numStr),
      line: this.line,
      column: startCol,
    });
  }

  private scanString(quote: string): void {
    const startCol = this.column;
    const startLine = this.line;
    this.advance(); // consume opening quote

    let str = '';
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        throw new SyntaxError(
          '字符串没有正确结束',
          startLine,
          startCol,
          `在字符串末尾添加 ${quote}`
        );
      }

      // Handle escape sequences
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case 'n':
            str += '\n';
            break;
          case 't':
            str += '\t';
            break;
          case '\\':
            str += '\\';
            break;
          case '"':
            str += '"';
            break;
          case "'":
            str += "'";
            break;
          default:
            str += escaped;
        }
      } else {
        str += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new SyntaxError('字符串没有正确结束', startLine, startCol, `在字符串末尾添加 ${quote}`);
    }

    this.advance(); // consume closing quote

    this.tokens.push({
      type: 'STRING',
      value: str,
      line: this.line,
      column: startCol,
    });
  }

  private scanIdentifier(): void {
    const startCol = this.column;
    let name = '';

    while (this.isIdentifierPart(this.peek())) {
      name += this.advance();
    }

    // Check if it's a keyword
    const keywordType = KEYWORDS[name];
    if (keywordType) {
      this.tokens.push({
        type: keywordType,
        value: name,
        line: this.line,
        column: startCol,
      });
    } else {
      this.tokens.push({
        type: 'IDENTIFIER',
        value: name,
        line: this.line,
        column: startCol,
      });
    }
  }

  private skipComment(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  // Helper methods

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.pos];
  }

  private peekNext(): string {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source[this.pos + 1];
  }

  private advance(): string {
    const ch = this.source[this.pos];
    this.pos++;
    this.column++;
    return ch;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isIdentifierStart(ch: string): boolean {
    // Allow letters, underscore, and CJK characters
    return /[a-zA-Z_\u4e00-\u9fff]/.test(ch);
  }

  private isIdentifierPart(ch: string): boolean {
    // Allow letters, digits, underscore, and CJK characters
    return /[a-zA-Z0-9_\u4e00-\u9fff]/.test(ch);
  }

  private makeToken(type: TokenType, value: string | number | null): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column,
    };
  }

  private lastTokenType(): TokenType | null {
    if (this.tokens.length === 0) return null;
    return this.tokens[this.tokens.length - 1].type;
  }
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}
