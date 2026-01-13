/**
 * Parser Tests
 *
 * Tests AST generation for all MiniPython constructs including:
 * - Expressions (literals, binary ops, unary ops, calls)
 * - Statements (assignment, if, while, for, function def, etc.)
 * - Complex nested structures
 */

import { describe, it, expect } from 'vitest';
import { compile } from '../index';
import type {
  Program,
  Statement,
  Expression,
  Assignment,
  IfStatement,
  WhileStatement,
  ForStatement,
  ForEachStatement,
  RepeatStatement,
  FunctionDef,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  PassStatement,
  ExpressionStatement,
  BinaryOp,
  UnaryOp,
  CallExpression,
  ArrayLiteral,
  IndexAccess,
  SliceAccess,
  ObjectLiteral,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  Identifier,
} from '../ast';

// Helper to parse and get first statement
function parseStmt(code: string): Statement {
  const program = compile(code);
  return program.body[0];
}

// Helper to parse and get expression from expression statement
function parseExpr(code: string): Expression {
  const stmt = parseStmt(code) as ExpressionStatement;
  return stmt.expression;
}

describe('Parser', () => {
  describe('Literals', () => {
    it('parses integer literals', () => {
      const expr = parseExpr('42') as NumberLiteral;
      expect(expr.type).toBe('NumberLiteral');
      expect(expr.value).toBe(42);
    });

    it('parses float literals', () => {
      const expr = parseExpr('3.14') as NumberLiteral;
      expect(expr.type).toBe('NumberLiteral');
      expect(expr.value).toBe(3.14);
    });

    it('parses string literals', () => {
      const expr = parseExpr('"hello"') as StringLiteral;
      expect(expr.type).toBe('StringLiteral');
      expect(expr.value).toBe('hello');
    });

    it('parses True', () => {
      const expr = parseExpr('True') as BooleanLiteral;
      expect(expr.type).toBe('BooleanLiteral');
      expect(expr.value).toBe(true);
    });

    it('parses False', () => {
      const expr = parseExpr('False') as BooleanLiteral;
      expect(expr.type).toBe('BooleanLiteral');
      expect(expr.value).toBe(false);
    });

    it('parses Chinese True (真)', () => {
      const expr = parseExpr('真') as BooleanLiteral;
      expect(expr.type).toBe('BooleanLiteral');
      expect(expr.value).toBe(true);
    });

    it('parses Chinese False (假)', () => {
      const expr = parseExpr('假') as BooleanLiteral;
      expect(expr.type).toBe('BooleanLiteral');
      expect(expr.value).toBe(false);
    });
  });

  describe('Identifiers', () => {
    it('parses simple identifiers', () => {
      const expr = parseExpr('x') as Identifier;
      expect(expr.type).toBe('Identifier');
      expect(expr.name).toBe('x');
    });

    it('parses Chinese identifiers', () => {
      const expr = parseExpr('变量') as Identifier;
      expect(expr.type).toBe('Identifier');
      expect(expr.name).toBe('变量');
    });
  });

  describe('Binary Operations', () => {
    it('parses addition', () => {
      const expr = parseExpr('1 + 2') as BinaryOp;
      expect(expr.type).toBe('BinaryOp');
      expect(expr.operator).toBe('+');
      expect((expr.left as NumberLiteral).value).toBe(1);
      expect((expr.right as NumberLiteral).value).toBe(2);
    });

    it('parses subtraction', () => {
      const expr = parseExpr('5 - 3') as BinaryOp;
      expect(expr.operator).toBe('-');
    });

    it('parses multiplication', () => {
      const expr = parseExpr('4 * 2') as BinaryOp;
      expect(expr.operator).toBe('*');
    });

    it('parses division', () => {
      const expr = parseExpr('10 / 2') as BinaryOp;
      expect(expr.operator).toBe('/');
    });

    it('parses modulo', () => {
      const expr = parseExpr('10 % 3') as BinaryOp;
      expect(expr.operator).toBe('%');
    });

    it('parses floor division', () => {
      const expr = parseExpr('10 // 3') as BinaryOp;
      expect(expr.operator).toBe('//');
    });

    it('respects operator precedence (mul over add)', () => {
      const expr = parseExpr('1 + 2 * 3') as BinaryOp;
      expect(expr.operator).toBe('+');
      expect((expr.right as BinaryOp).operator).toBe('*');
    });

    it('respects parentheses', () => {
      const expr = parseExpr('(1 + 2) * 3') as BinaryOp;
      expect(expr.operator).toBe('*');
      expect((expr.left as BinaryOp).operator).toBe('+');
    });
  });

  describe('Comparison Operations', () => {
    it('parses equality', () => {
      const expr = parseExpr('x == 5') as BinaryOp;
      expect(expr.operator).toBe('==');
    });

    it('parses inequality', () => {
      const expr = parseExpr('x != 5') as BinaryOp;
      expect(expr.operator).toBe('!=');
    });

    it('parses less than', () => {
      const expr = parseExpr('x < 5') as BinaryOp;
      expect(expr.operator).toBe('<');
    });

    it('parses greater than', () => {
      const expr = parseExpr('x > 5') as BinaryOp;
      expect(expr.operator).toBe('>');
    });

    it('parses less than or equal', () => {
      const expr = parseExpr('x <= 5') as BinaryOp;
      expect(expr.operator).toBe('<=');
    });

    it('parses greater than or equal', () => {
      const expr = parseExpr('x >= 5') as BinaryOp;
      expect(expr.operator).toBe('>=');
    });
  });

  describe('Logical Operations', () => {
    it('parses and', () => {
      const expr = parseExpr('x and y') as BinaryOp;
      expect(expr.operator).toBe('and');
    });

    it('parses or', () => {
      const expr = parseExpr('x or y') as BinaryOp;
      expect(expr.operator).toBe('or');
    });

    it('parses Chinese and (和)', () => {
      const expr = parseExpr('x 和 y') as BinaryOp;
      expect(expr.operator).toBe('and');
    });

    it('parses Chinese or (或)', () => {
      const expr = parseExpr('x 或 y') as BinaryOp;
      expect(expr.operator).toBe('or');
    });

    it('respects logical operator precedence (and over or)', () => {
      const expr = parseExpr('a or b and c') as BinaryOp;
      expect(expr.operator).toBe('or');
      expect((expr.right as BinaryOp).operator).toBe('and');
    });
  });

  describe('Unary Operations', () => {
    it('parses negation', () => {
      const expr = parseExpr('-5') as UnaryOp;
      expect(expr.type).toBe('UnaryOp');
      expect(expr.operator).toBe('-');
      expect((expr.operand as NumberLiteral).value).toBe(5);
    });

    it('parses not', () => {
      const expr = parseExpr('not x') as UnaryOp;
      expect(expr.operator).toBe('not');
    });

    it('parses Chinese not (不)', () => {
      const expr = parseExpr('不 x') as UnaryOp;
      expect(expr.operator).toBe('not');
    });
  });

  describe('Call Expressions', () => {
    it('parses function call with no arguments', () => {
      const expr = parseExpr('foo()') as CallExpression;
      expect(expr.type).toBe('CallExpression');
      expect(expr.callee).toBe('foo');
      expect(expr.arguments).toHaveLength(0);
    });

    it('parses function call with one argument', () => {
      const expr = parseExpr('print(42)') as CallExpression;
      expect(expr.callee).toBe('print');
      expect(expr.arguments).toHaveLength(1);
      expect((expr.arguments[0] as NumberLiteral).value).toBe(42);
    });

    it('parses function call with multiple arguments', () => {
      const expr = parseExpr('add(1, 2, 3)') as CallExpression;
      expect(expr.callee).toBe('add');
      expect(expr.arguments).toHaveLength(3);
    });

    it('parses nested function calls', () => {
      const expr = parseExpr('outer(inner(x))') as CallExpression;
      expect(expr.callee).toBe('outer');
      expect((expr.arguments[0] as CallExpression).callee).toBe('inner');
    });
  });

  describe('Array Literals', () => {
    it('parses empty array', () => {
      const expr = parseExpr('[]') as ArrayLiteral;
      expect(expr.type).toBe('ArrayLiteral');
      expect(expr.elements).toHaveLength(0);
    });

    it('parses array with elements', () => {
      const expr = parseExpr('[1, 2, 3]') as ArrayLiteral;
      expect(expr.elements).toHaveLength(3);
      expect((expr.elements[0] as NumberLiteral).value).toBe(1);
    });

    it('parses nested arrays', () => {
      const expr = parseExpr('[[1, 2], [3, 4]]') as ArrayLiteral;
      expect(expr.elements).toHaveLength(2);
      expect((expr.elements[0] as ArrayLiteral).elements).toHaveLength(2);
    });

    it('parses array with mixed types', () => {
      const expr = parseExpr('[1, "two", True]') as ArrayLiteral;
      expect(expr.elements).toHaveLength(3);
      expect(expr.elements[0].type).toBe('NumberLiteral');
      expect(expr.elements[1].type).toBe('StringLiteral');
      expect(expr.elements[2].type).toBe('BooleanLiteral');
    });
  });

  describe('Index Access', () => {
    it('parses array index access', () => {
      const expr = parseExpr('arr[0]') as IndexAccess;
      expect(expr.type).toBe('IndexAccess');
      expect((expr.object as Identifier).name).toBe('arr');
      expect((expr.index as NumberLiteral).value).toBe(0);
    });

    it('parses negative index access', () => {
      const expr = parseExpr('arr[-1]') as IndexAccess;
      expect(expr.type).toBe('IndexAccess');
      const index = expr.index as UnaryOp;
      expect(index.operator).toBe('-');
    });

    it('parses chained index access', () => {
      const expr = parseExpr('arr[0][1]') as IndexAccess;
      expect(expr.type).toBe('IndexAccess');
      expect((expr.object as IndexAccess).type).toBe('IndexAccess');
    });

    it('parses object string key access', () => {
      const expr = parseExpr('obj["key"]') as IndexAccess;
      expect((expr.index as StringLiteral).value).toBe('key');
    });
  });

  describe('Slice Access', () => {
    it('parses full slice [start:end]', () => {
      const expr = parseExpr('arr[1:3]') as SliceAccess;
      expect(expr.type).toBe('SliceAccess');
      expect((expr.start as NumberLiteral).value).toBe(1);
      expect((expr.end as NumberLiteral).value).toBe(3);
    });

    it('parses slice with only start [start:]', () => {
      const expr = parseExpr('arr[1:]') as SliceAccess;
      expect(expr.type).toBe('SliceAccess');
      expect((expr.start as NumberLiteral).value).toBe(1);
      expect(expr.end).toBeNull();
    });

    it('parses slice with only end [:end]', () => {
      const expr = parseExpr('arr[:3]') as SliceAccess;
      expect(expr.type).toBe('SliceAccess');
      expect(expr.start).toBeNull();
      expect((expr.end as NumberLiteral).value).toBe(3);
    });

    it('parses full slice [:]', () => {
      const expr = parseExpr('arr[:]') as SliceAccess;
      expect(expr.type).toBe('SliceAccess');
      expect(expr.start).toBeNull();
      expect(expr.end).toBeNull();
    });

    it('parses slice with negative indices', () => {
      const expr = parseExpr('arr[-3:-1]') as SliceAccess;
      expect(expr.type).toBe('SliceAccess');
    });
  });

  describe('Object Literals', () => {
    it('parses empty object', () => {
      const expr = parseExpr('{}') as ObjectLiteral;
      expect(expr.type).toBe('ObjectLiteral');
      expect(expr.properties).toHaveLength(0);
    });

    it('parses object with properties', () => {
      const expr = parseExpr('{name: "Alice", age: 30}') as ObjectLiteral;
      expect(expr.properties).toHaveLength(2);
      expect(expr.properties[0].key).toBe('name');
      expect((expr.properties[0].value as StringLiteral).value).toBe('Alice');
    });

    it('parses nested objects', () => {
      const expr = parseExpr('{user: {name: "Bob"}}') as ObjectLiteral;
      expect(expr.properties).toHaveLength(1);
      expect((expr.properties[0].value as ObjectLiteral).properties).toHaveLength(1);
    });
  });

  describe('Assignment Statements', () => {
    it('parses simple assignment', () => {
      const stmt = parseStmt('x = 5') as Assignment;
      expect(stmt.type).toBe('Assignment');
      expect(stmt.target).toBe('x');
      expect((stmt.value as NumberLiteral).value).toBe(5);
    });

    it('parses assignment with expression', () => {
      const stmt = parseStmt('x = 1 + 2') as Assignment;
      expect((stmt.value as BinaryOp).operator).toBe('+');
    });
  });

  describe('If Statements', () => {
    it('parses simple if', () => {
      const stmt = parseStmt('if x:\n    y') as IfStatement;
      expect(stmt.type).toBe('IfStatement');
      expect((stmt.condition as Identifier).name).toBe('x');
      expect(stmt.consequent).toHaveLength(1);
      // alternate is empty array or undefined when there's no else
      expect(stmt.alternate?.length ?? 0).toBe(0);
    });

    it('parses if-else', () => {
      const stmt = parseStmt('if x:\n    y\nelse:\n    z') as IfStatement;
      expect(stmt.consequent).toHaveLength(1);
      expect(stmt.alternate).toHaveLength(1);
    });

    it('parses if-elif-else', () => {
      const code = `if a:
    x
elif b:
    y
else:
    z`;
      const stmt = parseStmt(code) as IfStatement;
      expect(stmt.consequent).toHaveLength(1);
      expect(stmt.elifBranches).toHaveLength(1);
      expect(stmt.alternate).toHaveLength(1);
    });

    it('parses Chinese if (如果)', () => {
      const stmt = parseStmt('如果 x:\n    y') as IfStatement;
      expect(stmt.type).toBe('IfStatement');
    });
  });

  describe('While Statements', () => {
    it('parses while loop', () => {
      const stmt = parseStmt('while x:\n    y') as WhileStatement;
      expect(stmt.type).toBe('WhileStatement');
      expect((stmt.condition as Identifier).name).toBe('x');
      expect(stmt.body).toHaveLength(1);
    });

    it('parses Chinese while (当)', () => {
      const stmt = parseStmt('当 x:\n    y') as WhileStatement;
      expect(stmt.type).toBe('WhileStatement');
    });
  });

  describe('For Statements', () => {
    it('parses for loop with range', () => {
      const stmt = parseStmt('for i in range(5):\n    x') as ForStatement;
      expect(stmt.type).toBe('ForStatement');
      expect(stmt.variable).toBe('i');
      expect((stmt.start as NumberLiteral).value).toBe(0);
      expect((stmt.end as NumberLiteral).value).toBe(5);
    });

    it('parses for loop with range(start, end)', () => {
      const stmt = parseStmt('for i in range(1, 10):\n    x') as ForStatement;
      expect((stmt.start as NumberLiteral).value).toBe(1);
      expect((stmt.end as NumberLiteral).value).toBe(10);
    });

    it('parses Chinese for loop', () => {
      const stmt = parseStmt('对于 i 在 范围(5):\n    x') as ForStatement;
      expect(stmt.type).toBe('ForStatement');
    });
  });

  describe('For-Each Statements', () => {
    it('parses for-each over array variable', () => {
      const stmt = parseStmt('for item in arr:\n    x') as ForEachStatement;
      expect(stmt.type).toBe('ForEachStatement');
      expect(stmt.variable).toBe('item');
      expect((stmt.iterable as Identifier).name).toBe('arr');
    });

    it('parses for-each over array literal', () => {
      const stmt = parseStmt('for x in [1, 2, 3]:\n    y') as ForEachStatement;
      expect(stmt.type).toBe('ForEachStatement');
      expect((stmt.iterable as ArrayLiteral).elements).toHaveLength(3);
    });

    it('parses for-each over string', () => {
      const stmt = parseStmt('for c in "hello":\n    x') as ForEachStatement;
      expect(stmt.type).toBe('ForEachStatement');
      expect((stmt.iterable as StringLiteral).value).toBe('hello');
    });
  });

  describe('Repeat Statements', () => {
    it('parses repeat loop', () => {
      const stmt = parseStmt('repeat 5 times:\n    x') as RepeatStatement;
      expect(stmt.type).toBe('RepeatStatement');
      expect((stmt.count as NumberLiteral).value).toBe(5);
      expect(stmt.body).toHaveLength(1);
    });

    it('parses Chinese repeat (重复...次)', () => {
      const stmt = parseStmt('重复 3 次:\n    x') as RepeatStatement;
      expect(stmt.type).toBe('RepeatStatement');
    });
  });

  describe('Function Definitions', () => {
    it('parses function with no parameters', () => {
      const stmt = parseStmt('def foo():\n    x') as FunctionDef;
      expect(stmt.type).toBe('FunctionDef');
      expect(stmt.name).toBe('foo');
      expect(stmt.params).toHaveLength(0);
    });

    it('parses function with parameters', () => {
      const stmt = parseStmt('def add(a, b):\n    x') as FunctionDef;
      expect(stmt.params).toEqual(['a', 'b']);
    });

    it('parses function with return', () => {
      const stmt = parseStmt('def foo():\n    return 5') as FunctionDef;
      const returnStmt = stmt.body[0] as ReturnStatement;
      expect(returnStmt.type).toBe('ReturnStatement');
      expect((returnStmt.value as NumberLiteral).value).toBe(5);
    });

    it('parses Chinese function definition', () => {
      const stmt = parseStmt('定义 函数():\n    x') as FunctionDef;
      expect(stmt.type).toBe('FunctionDef');
    });
  });

  describe('Control Flow Statements', () => {
    it('parses break', () => {
      const stmt = parseStmt('break') as BreakStatement;
      expect(stmt.type).toBe('BreakStatement');
    });

    it('parses continue', () => {
      const stmt = parseStmt('continue') as ContinueStatement;
      expect(stmt.type).toBe('ContinueStatement');
    });

    it('parses pass', () => {
      const stmt = parseStmt('pass') as PassStatement;
      expect(stmt.type).toBe('PassStatement');
    });

    it('parses Chinese break (停止/跳出)', () => {
      const stmt = parseStmt('停止') as BreakStatement;
      expect(stmt.type).toBe('BreakStatement');
    });

    it('parses Chinese continue (继续)', () => {
      const stmt = parseStmt('继续') as ContinueStatement;
      expect(stmt.type).toBe('ContinueStatement');
    });

    it('parses Chinese pass (跳过)', () => {
      const stmt = parseStmt('跳过') as PassStatement;
      expect(stmt.type).toBe('PassStatement');
    });
  });

  describe('Complex Programs', () => {
    it('parses function with loop and conditionals', () => {
      const code = `def factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)`;
      const program = compile(code);
      expect(program.body).toHaveLength(1);
      const fn = program.body[0] as FunctionDef;
      expect(fn.name).toBe('factorial');
    });

    it('parses nested loops', () => {
      const code = `for i in range(3):
    for j in range(3):
        print(i + j)`;
      const program = compile(code);
      const outerFor = program.body[0] as ForStatement;
      const innerFor = outerFor.body[0] as ForStatement;
      expect(innerFor.type).toBe('ForStatement');
    });

    it('parses array operations', () => {
      const code = `arr = [1, 2, 3]
x = arr[0]
arr[1] = 5`;
      const program = compile(code);
      expect(program.body).toHaveLength(3);
    });
  });

  describe('Source Location Tracking', () => {
    it('tracks statement locations', () => {
      const stmt = parseStmt('x = 5');
      // loc is { line: number, column: number }
      expect(stmt.loc).toBeDefined();
      expect(stmt.loc).toHaveProperty('line');
      expect(stmt.loc?.line).toBe(1);
    });

    it('tracks expression locations', () => {
      const expr = parseExpr('1 + 2');
      expect(expr.loc).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('throws on unexpected token', () => {
      expect(() => compile('if then')).toThrow();
    });

    it('throws on missing colon', () => {
      expect(() => compile('if x\n    y')).toThrow();
    });

    it('throws on missing body', () => {
      expect(() => compile('if x:')).toThrow();
    });

    it('throws on unmatched parentheses', () => {
      expect(() => compile('(1 + 2')).toThrow();
    });

    it('throws on unmatched brackets', () => {
      expect(() => compile('[1, 2, 3')).toThrow();
    });
  });
});
