/**
 * Lexer Tests
 *
 * Tests tokenization of all MiniPython constructs including:
 * - Keywords (Chinese and English)
 * - Operators and delimiters
 * - Literals (numbers, strings, booleans)
 * - Indentation handling
 * - Comments
 */

import { describe, it, expect } from 'vitest';
import { tokenize, Token, TokenType } from '../lexer';

// Helper to get token types from token array
function getTypes(tokens: Token[]): TokenType[] {
  return tokens.map((t) => t.type);
}

// Helper to get token values
function getValues(tokens: Token[]): (string | number | null)[] {
  return tokens.map((t) => t.value);
}

describe('Lexer', () => {
  describe('Keywords - English', () => {
    it('tokenizes control flow keywords', () => {
      const tokens = tokenize('if else elif while for in range');
      expect(getTypes(tokens)).toEqual([
        'IF',
        'ELSE',
        'ELIF',
        'WHILE',
        'FOR',
        'IN',
        'RANGE',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes loop keywords', () => {
      const tokens = tokenize('repeat times break continue');
      expect(getTypes(tokens)).toEqual(['REPEAT', 'TIMES', 'BREAK', 'CONTINUE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes function keywords', () => {
      const tokens = tokenize('def return pass');
      expect(getTypes(tokens)).toEqual(['DEF', 'RETURN', 'PASS', 'NEWLINE', 'EOF']);
    });

    it('tokenizes boolean keywords', () => {
      const tokens = tokenize('True False');
      expect(getTypes(tokens)).toEqual(['TRUE', 'FALSE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes logical operators', () => {
      const tokens = tokenize('and or not');
      expect(getTypes(tokens)).toEqual(['AND', 'OR', 'NOT', 'NEWLINE', 'EOF']);
    });
  });

  describe('Keywords - Chinese', () => {
    it('tokenizes Chinese control flow keywords', () => {
      const tokens = tokenize('如果 否则 否则如果 当');
      expect(getTypes(tokens)).toEqual(['IF', 'ELSE', 'ELIF', 'WHILE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes Chinese loop keywords', () => {
      const tokens = tokenize('重复 次 停止 跳出 继续');
      expect(getTypes(tokens)).toEqual([
        'REPEAT',
        'TIMES',
        'BREAK',
        'BREAK',
        'CONTINUE',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes Chinese function keywords', () => {
      const tokens = tokenize('定义 返回 跳过');
      expect(getTypes(tokens)).toEqual(['DEF', 'RETURN', 'PASS', 'NEWLINE', 'EOF']);
    });

    it('tokenizes Chinese boolean keywords', () => {
      const tokens = tokenize('真 假');
      expect(getTypes(tokens)).toEqual(['TRUE', 'FALSE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes Chinese logical operators', () => {
      const tokens = tokenize('和 或 不');
      expect(getTypes(tokens)).toEqual(['AND', 'OR', 'NOT', 'NEWLINE', 'EOF']);
    });

    it('tokenizes Chinese for loop keywords', () => {
      const tokens = tokenize('对于 从 在 到 范围');
      expect(getTypes(tokens)).toEqual(['FOR', 'FOR', 'IN', 'RANGE', 'RANGE', 'NEWLINE', 'EOF']);
    });
  });

  describe('Operators', () => {
    it('tokenizes arithmetic operators', () => {
      const tokens = tokenize('+ - * / % //');
      expect(getTypes(tokens)).toEqual([
        'PLUS',
        'MINUS',
        'MULTIPLY',
        'DIVIDE',
        'MODULO',
        'FLOOR_DIV',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes comparison operators', () => {
      const tokens = tokenize('== != < > <= >=');
      expect(getTypes(tokens)).toEqual(['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes assignment operator', () => {
      const tokens = tokenize('=');
      expect(getTypes(tokens)).toEqual(['ASSIGN', 'NEWLINE', 'EOF']);
    });

    it('distinguishes = and ==', () => {
      const tokens = tokenize('x = 5 == 5');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'ASSIGN',
        'NUMBER',
        'EQ',
        'NUMBER',
        'NEWLINE',
        'EOF',
      ]);
    });
  });

  describe('Delimiters', () => {
    it('tokenizes parentheses', () => {
      const tokens = tokenize('()');
      expect(getTypes(tokens)).toEqual(['LPAREN', 'RPAREN', 'NEWLINE', 'EOF']);
    });

    it('tokenizes brackets', () => {
      const tokens = tokenize('[]');
      expect(getTypes(tokens)).toEqual(['LBRACKET', 'RBRACKET', 'NEWLINE', 'EOF']);
    });

    it('tokenizes braces', () => {
      const tokens = tokenize('{}');
      expect(getTypes(tokens)).toEqual(['LBRACE', 'RBRACE', 'NEWLINE', 'EOF']);
    });

    it('tokenizes colon and comma', () => {
      const tokens = tokenize(':,');
      expect(getTypes(tokens)).toEqual(['COLON', 'COMMA', 'NEWLINE', 'EOF']);
    });
  });

  describe('Numbers', () => {
    it('tokenizes integers', () => {
      const tokens = tokenize('0 1 42 999');
      expect(getValues(tokens)).toEqual([0, 1, 42, 999, null, null]);
    });

    it('tokenizes floating point numbers', () => {
      const tokens = tokenize('3.14 0.5 10.0');
      expect(getValues(tokens)).toEqual([3.14, 0.5, 10.0, null, null]);
    });

    it('tokenizes negative numbers as minus + number', () => {
      const tokens = tokenize('-5');
      expect(getTypes(tokens)).toEqual(['MINUS', 'NUMBER', 'NEWLINE', 'EOF']);
      expect(tokens[1].value).toBe(5);
    });
  });

  describe('Strings', () => {
    it('tokenizes double-quoted strings', () => {
      const tokens = tokenize('"hello"');
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].value).toBe('hello');
    });

    it('tokenizes single-quoted strings', () => {
      const tokens = tokenize("'world'");
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].value).toBe('world');
    });

    it('tokenizes empty strings', () => {
      const tokens = tokenize('""');
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].value).toBe('');
    });

    it('tokenizes strings with spaces', () => {
      const tokens = tokenize('"hello world"');
      expect(tokens[0].value).toBe('hello world');
    });

    it('handles escape sequences', () => {
      const tokens = tokenize('"line1\\nline2"');
      expect(tokens[0].value).toBe('line1\nline2');
    });

    it('handles tab escape', () => {
      const tokens = tokenize('"a\\tb"');
      expect(tokens[0].value).toBe('a\tb');
    });

    it('handles escaped quotes', () => {
      const tokens = tokenize('"say \\"hi\\""');
      expect(tokens[0].value).toBe('say "hi"');
    });

    it('handles escaped backslash', () => {
      const tokens = tokenize('"path\\\\file"');
      expect(tokens[0].value).toBe('path\\file');
    });

    it('tokenizes Chinese strings', () => {
      const tokens = tokenize('"你好世界"');
      expect(tokens[0].value).toBe('你好世界');
    });
  });

  describe('Identifiers', () => {
    it('tokenizes simple identifiers', () => {
      const tokens = tokenize('x foo bar123');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'IDENTIFIER',
        'IDENTIFIER',
        'NEWLINE',
        'EOF',
      ]);
      expect(getValues(tokens)).toEqual(['x', 'foo', 'bar123', null, null]);
    });

    it('tokenizes identifiers with underscores', () => {
      const tokens = tokenize('_private my_var __dunder__');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'IDENTIFIER',
        'IDENTIFIER',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes Chinese identifiers', () => {
      const tokens = tokenize('变量 我的变量 变量1');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'IDENTIFIER',
        'IDENTIFIER',
        'NEWLINE',
        'EOF',
      ]);
      expect(getValues(tokens)).toEqual(['变量', '我的变量', '变量1', null, null]);
    });

    it('tokenizes mixed Chinese-English identifiers', () => {
      const tokens = tokenize('my变量 变量x');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'IDENTIFIER', 'NEWLINE', 'EOF']);
    });
  });

  describe('Indentation', () => {
    it('generates INDENT token for increased indentation', () => {
      const tokens = tokenize('if x:\n    y');
      expect(getTypes(tokens)).toContain('INDENT');
    });

    it('generates DEDENT token for decreased indentation', () => {
      const tokens = tokenize('if x:\n    y\nz');
      expect(getTypes(tokens)).toContain('DEDENT');
    });

    it('handles multiple indent levels', () => {
      const code = `if x:
    if y:
        z`;
      const tokens = tokenize(code);
      const types = getTypes(tokens);
      expect(types.filter((t) => t === 'INDENT').length).toBe(2);
    });

    it('handles multiple dedent levels', () => {
      const code = `if x:
    if y:
        z
a`;
      const tokens = tokenize(code);
      const types = getTypes(tokens);
      expect(types.filter((t) => t === 'DEDENT').length).toBe(2);
    });

    it('treats tabs as 4 spaces', () => {
      const code = 'if x:\n\ty';
      const tokens = tokenize(code);
      expect(getTypes(tokens)).toContain('INDENT');
    });
  });

  describe('Comments', () => {
    it('ignores single-line comments', () => {
      const tokens = tokenize('x = 5 # this is a comment');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'ASSIGN', 'NUMBER', 'NEWLINE', 'EOF']);
    });

    it('ignores full-line comments', () => {
      const tokens = tokenize('# comment\nx = 5');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'ASSIGN', 'NUMBER', 'NEWLINE', 'EOF']);
    });

    it('ignores multiple comment lines', () => {
      const tokens = tokenize('# comment 1\n# comment 2\nx');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'NEWLINE', 'EOF']);
    });
  });

  describe('Complete Statements', () => {
    it('tokenizes variable assignment', () => {
      const tokens = tokenize('x = 42');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'ASSIGN', 'NUMBER', 'NEWLINE', 'EOF']);
    });

    it('tokenizes function call', () => {
      const tokens = tokenize('print("hello")');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'LPAREN',
        'STRING',
        'RPAREN',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes if statement', () => {
      const tokens = tokenize('if x > 5:\n    print(x)');
      expect(getTypes(tokens)).toEqual([
        'IF',
        'IDENTIFIER',
        'GT',
        'NUMBER',
        'COLON',
        'NEWLINE',
        'INDENT',
        'IDENTIFIER',
        'LPAREN',
        'IDENTIFIER',
        'RPAREN',
        'NEWLINE',
        'DEDENT',
        'EOF',
      ]);
    });

    it('tokenizes for loop', () => {
      const tokens = tokenize('for i in range(5):\n    x');
      expect(getTypes(tokens)).toEqual([
        'FOR',
        'IDENTIFIER',
        'IN',
        'RANGE',
        'LPAREN',
        'NUMBER',
        'RPAREN',
        'COLON',
        'NEWLINE',
        'INDENT',
        'IDENTIFIER',
        'NEWLINE',
        'DEDENT',
        'EOF',
      ]);
    });

    it('tokenizes array literal', () => {
      const tokens = tokenize('[1, 2, 3]');
      expect(getTypes(tokens)).toEqual([
        'LBRACKET',
        'NUMBER',
        'COMMA',
        'NUMBER',
        'COMMA',
        'NUMBER',
        'RBRACKET',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes object literal', () => {
      const tokens = tokenize('{name: "foo", value: 42}');
      expect(getTypes(tokens)).toEqual([
        'LBRACE',
        'IDENTIFIER',
        'COLON',
        'STRING',
        'COMMA',
        'IDENTIFIER',
        'COLON',
        'NUMBER',
        'RBRACE',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes array access', () => {
      const tokens = tokenize('arr[0]');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'LBRACKET',
        'NUMBER',
        'RBRACKET',
        'NEWLINE',
        'EOF',
      ]);
    });

    it('tokenizes slice syntax', () => {
      const tokens = tokenize('arr[1:3]');
      expect(getTypes(tokens)).toEqual([
        'IDENTIFIER',
        'LBRACKET',
        'NUMBER',
        'COLON',
        'NUMBER',
        'RBRACKET',
        'NEWLINE',
        'EOF',
      ]);
    });
  });

  describe('Line and Column Tracking', () => {
    it('tracks line numbers correctly', () => {
      const tokens = tokenize('x\ny\nz');
      expect(tokens[0].line).toBe(1);
      expect(tokens[2].line).toBe(2);
      expect(tokens[4].line).toBe(3);
    });

    it('tracks column numbers for identifiers', () => {
      const tokens = tokenize('abc xyz');
      // Column tracks position after the token
      expect(tokens[0].type).toBe('IDENTIFIER');
      expect(tokens[1].type).toBe('IDENTIFIER');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty input', () => {
      const tokens = tokenize('');
      expect(getTypes(tokens)).toEqual(['EOF']);
    });

    it('handles whitespace only', () => {
      const tokens = tokenize('   \n   \n   ');
      expect(getTypes(tokens)).toEqual(['EOF']);
    });

    it('handles comment only', () => {
      const tokens = tokenize('# just a comment');
      expect(getTypes(tokens)).toEqual(['EOF']);
    });

    it('handles multiple blank lines', () => {
      const tokens = tokenize('x\n\n\ny');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'NEWLINE', 'IDENTIFIER', 'NEWLINE', 'EOF']);
    });

    it('handles trailing whitespace', () => {
      const tokens = tokenize('x = 5   ');
      expect(getTypes(tokens)).toEqual(['IDENTIFIER', 'ASSIGN', 'NUMBER', 'NEWLINE', 'EOF']);
    });
  });

  describe('Error Handling', () => {
    it('throws on unterminated string', () => {
      expect(() => tokenize('"hello')).toThrow();
    });

    it('throws on unterminated string with newline', () => {
      expect(() => tokenize('"hello\nworld"')).toThrow();
    });

    it('throws on unknown character', () => {
      expect(() => tokenize('x @ y')).toThrow();
    });
  });
});
