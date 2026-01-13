/**
 * Mini Python Parser
 *
 * Recursive descent parser that produces an AST from tokens.
 * Supports both Chinese and English syntax.
 */

import { Token, TokenType } from './lexer';
import type {
  Program,
  Statement,
  Expression,
  AugmentedAssignment,
  IndexedAssignment,
  MemberAssignment,
  IfStatement,
  RepeatStatement,
  WhileStatement,
  ForStatement,
  ForEachStatement,
  BreakStatement,
  ContinueStatement,
  PassStatement,
  FunctionDef,
  ClassDef,
  ReturnStatement,
  ArrayLiteral,
  IndexAccess,
  SliceAccess,
  ObjectLiteral,
  MemberAccess,
  MethodCall,
} from './ast';
import { SyntaxError } from './errors';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Program {
    const body: Statement[] = [];

    // Skip leading newlines
    this.skipNewlines();

    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    return {
      type: 'Program',
      body,
    };
  }

  // ============ Statement Parsing ============

  private parseStatement(): Statement {
    const token = this.peek();

    // Compound statements
    if (token.type === 'IF') {
      return this.parseIfStatement();
    }

    if (token.type === 'REPEAT') {
      return this.parseRepeatStatement();
    }

    if (token.type === 'WHILE') {
      return this.parseWhileStatement();
    }

    if (token.type === 'FOR') {
      return this.parseForStatement();
    }

    if (token.type === 'BREAK') {
      return this.parseBreakStatement();
    }

    if (token.type === 'CONTINUE') {
      return this.parseContinueStatement();
    }

    if (token.type === 'PASS') {
      return this.parsePassStatement();
    }

    if (token.type === 'DEF') {
      return this.parseFunctionDef();
    }

    if (token.type === 'CLASS') {
      return this.parseClassDef();
    }

    if (token.type === 'RETURN') {
      return this.parseReturnStatement();
    }

    // Simple statements (assignment or expression)
    return this.parseSimpleStatement();
  }

  private parseSimpleStatement(): Statement {
    const expr = this.parseExpression();

    // Check for augmented assignment (+=, -=, *=, /=)
    if (
      this.check('PLUS_ASSIGN') ||
      this.check('MINUS_ASSIGN') ||
      this.check('MULTIPLY_ASSIGN') ||
      this.check('DIVIDE_ASSIGN')
    ) {
      const opToken = this.advance(); // consume the operator
      const opMap: Record<string, '+=' | '-=' | '*=' | '/='> = {
        PLUS_ASSIGN: '+=',
        MINUS_ASSIGN: '-=',
        MULTIPLY_ASSIGN: '*=',
        DIVIDE_ASSIGN: '/=',
      };
      const operator = opMap[opToken.type];
      const value = this.parseExpression();
      this.expectNewlineOrEnd();

      // Only simple variables can use augmented assignment
      if (expr.type === 'Identifier') {
        return {
          type: 'AugmentedAssignment',
          target: expr.name,
          operator,
          value,
          loc: expr.loc,
        } as AugmentedAssignment;
      }

      throw new SyntaxError(
        '增量赋值只能用于变量',
        expr.loc?.line || 1,
        expr.loc?.column || 0,
        '使用 += -= *= /= 时，左侧必须是变量名（如 x += 1）'
      );
    }

    // Check for assignment
    if (this.check('ASSIGN')) {
      this.advance(); // consume '='
      const value = this.parseExpression();
      this.expectNewlineOrEnd();

      // Simple assignment: x = value
      if (expr.type === 'Identifier') {
        return {
          type: 'Assignment',
          target: expr.name,
          value,
          loc: expr.loc,
        };
      }

      // Indexed assignment: arr[0] = value or obj["key"] = value
      if (expr.type === 'IndexAccess') {
        return {
          type: 'IndexedAssignment',
          object: expr.object,
          index: expr.index,
          value,
          loc: expr.loc,
        } as IndexedAssignment;
      }

      // Member assignment: self.x = value or obj.prop = value
      if (expr.type === 'MemberAccess') {
        return {
          type: 'MemberAssignment',
          object: expr.object,
          property: expr.property,
          value,
          loc: expr.loc,
        } as MemberAssignment;
      }

      // Invalid assignment target
      throw new SyntaxError(
        '无效的赋值目标',
        expr.loc?.line || 1,
        expr.loc?.column || 0,
        '赋值目标必须是变量名、索引表达式或成员访问（如 x、arr[0] 或 self.x）'
      );
    }

    this.expectNewlineOrEnd();

    return {
      type: 'ExpressionStatement',
      expression: expr,
      loc: expr.loc,
    };
  }

  private parseIfStatement(): IfStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'if' / '如果'

    const condition = this.parseExpression();
    this.expect('COLON', '需要冒号 ":"');
    const consequent = this.parseBlock();

    // Parse elif branches
    const elifBranches: { condition: Expression; consequent: Statement[] }[] = [];
    while (this.check('ELIF')) {
      this.advance(); // consume 'elif' / '否则如果'
      const elifCondition = this.parseExpression();
      this.expect('COLON', '需要冒号 ":"');
      const elifConsequent = this.parseBlock();
      elifBranches.push({ condition: elifCondition, consequent: elifConsequent });
    }

    let alternate: Statement[] | null = null;

    if (this.check('ELSE')) {
      this.advance(); // consume 'else' / '否则'
      this.expect('COLON', '需要冒号 ":"');
      alternate = this.parseBlock();
    }

    return {
      type: 'IfStatement',
      condition,
      consequent,
      elifBranches: elifBranches.length > 0 ? elifBranches : undefined,
      alternate,
      loc: { line: loc, column: 0 },
    };
  }

  private parseRepeatStatement(): RepeatStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'repeat' / '重复'

    const count = this.parseExpression();

    // Expect 'times' / '次'
    this.expect('TIMES', '需要 "次" 或 "times"');
    this.expect('COLON', '需要冒号 ":"');

    const body = this.parseBlock();

    return {
      type: 'RepeatStatement',
      count,
      body,
      loc: { line: loc, column: 0 },
    };
  }

  private parseWhileStatement(): WhileStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'while' / '当'

    const condition = this.parseExpression();

    // Optional '时' for Chinese syntax
    if (this.check('DO')) {
      this.advance();
    }

    this.expect('COLON', '需要冒号 ":"');

    const body = this.parseBlock();

    return {
      type: 'WhileStatement',
      condition,
      body,
      loc: { line: loc, column: 0 },
    };
  }

  private parseForStatement(): ForStatement | ForEachStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'for' / '对于' / '从'

    const varToken = this.expect('IDENTIFIER', '需要循环变量名');
    const variable = varToken.value as string;

    // Expect 'in' / '在'
    this.expect('IN', '需要 "在" 或 "in"');

    // Check if this is a range-based for loop
    if (this.check('RANGE')) {
      // For loop with range: for i in range(...)
      this.advance(); // consume 'range' / '范围' / '到'

      this.expect('LPAREN', '需要左括号 "("');

      const firstArg = this.parseExpression();
      let start: Expression;
      let end: Expression;
      let step: Expression | undefined;

      if (this.check('COMMA')) {
        this.advance(); // consume ','
        start = firstArg;
        end = this.parseExpression();

        // Optional step
        if (this.check('COMMA')) {
          this.advance();
          step = this.parseExpression();
        }
      } else {
        // range(n) means range(0, n)
        start = { type: 'NumberLiteral', value: 0, loc: firstArg.loc };
        end = firstArg;
      }

      this.expect('RPAREN', '需要右括号 ")"');
      this.expect('COLON', '需要冒号 ":"');

      const body = this.parseBlock();

      return {
        type: 'ForStatement',
        variable,
        start,
        end,
        step,
        body,
        loc: { line: loc, column: 0 },
      };
    } else {
      // For-each loop: for item in iterable
      const iterable = this.parseExpression();

      this.expect('COLON', '需要冒号 ":"');

      const body = this.parseBlock();

      return {
        type: 'ForEachStatement',
        variable,
        iterable,
        body,
        loc: { line: loc, column: 0 },
      };
    }
  }

  private parseBreakStatement(): BreakStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'break' / '停止' / '跳出'
    this.expectNewlineOrEnd();

    return {
      type: 'BreakStatement',
      loc: { line: loc, column: 0 },
    };
  }

  private parseContinueStatement(): ContinueStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'continue' / '继续'
    this.expectNewlineOrEnd();

    return {
      type: 'ContinueStatement',
      loc: { line: loc, column: 0 },
    };
  }

  private parsePassStatement(): PassStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'pass' / '跳过'
    this.expectNewlineOrEnd();

    return {
      type: 'PassStatement',
      loc: { line: loc, column: 0 },
    };
  }

  private parseFunctionDef(): FunctionDef {
    const loc = this.peek().line;
    this.advance(); // consume 'def' / '定义'

    const nameToken = this.expect('IDENTIFIER', '需要函数名');
    const name = nameToken.value as string;

    this.expect('LPAREN', '需要左括号 "("');

    const params: string[] = [];
    if (!this.check('RPAREN')) {
      do {
        const paramToken = this.expect('IDENTIFIER', '需要参数名');
        params.push(paramToken.value as string);
      } while (this.match('COMMA'));
    }

    this.expect('RPAREN', '需要右括号 ")"');
    this.expect('COLON', '需要冒号 ":"');

    const body = this.parseBlock();

    return {
      type: 'FunctionDef',
      name,
      params,
      body,
      loc: { line: loc, column: 0 },
    };
  }

  private parseClassDef(): ClassDef {
    const loc = this.peek().line;
    this.advance(); // consume 'class' / '类'

    const nameToken = this.expect('IDENTIFIER', '需要类名');
    const name = nameToken.value as string;

    this.expect('COLON', '需要冒号 ":"');
    this.expect('NEWLINE', '需要换行');
    this.expect('INDENT', '需要缩进');

    const methods: FunctionDef[] = [];

    // Parse class body - only method definitions are allowed
    while (!this.check('DEDENT') && !this.isAtEnd()) {
      this.skipNewlines();

      if (this.check('DEDENT') || this.isAtEnd()) break;

      if (this.check('DEF')) {
        methods.push(this.parseFunctionDef());
      } else if (this.check('PASS')) {
        // Allow pass statement in empty classes
        this.advance();
        this.expectNewlineOrEnd();
      } else {
        const token = this.peek();
        throw new SyntaxError(
          '类中只能定义方法',
          token.line,
          token.column,
          '在类中使用 def 定义方法'
        );
      }

      this.skipNewlines();
    }

    if (this.check('DEDENT')) {
      this.advance();
    }

    return {
      type: 'ClassDef',
      name,
      methods,
      loc: { line: loc, column: 0 },
    };
  }

  private parseReturnStatement(): ReturnStatement {
    const loc = this.peek().line;
    this.advance(); // consume 'return' / '返回'

    let value: Expression | null = null;

    // Check if there's a return value (not newline or dedent)
    if (!this.check('NEWLINE') && !this.check('DEDENT') && !this.isAtEnd()) {
      value = this.parseExpression();
    }

    this.expectNewlineOrEnd();

    return {
      type: 'ReturnStatement',
      value,
      loc: { line: loc, column: 0 },
    };
  }

  private parseBlock(): Statement[] {
    this.expect('NEWLINE', '需要换行');
    this.expect('INDENT', '需要缩进');

    const statements: Statement[] = [];

    while (!this.check('DEDENT') && !this.isAtEnd()) {
      statements.push(this.parseStatement());
      this.skipNewlines();
    }

    if (this.check('DEDENT')) {
      this.advance();
    }

    if (statements.length === 0) {
      throw new SyntaxError(
        '代码块不能为空',
        this.peek().line,
        this.peek().column,
        '在冒号后面的缩进区域添加至少一条语句'
      );
    }

    return statements;
  }

  // ============ Expression Parsing ============

  private parseExpression(): Expression {
    return this.parseOrExpr();
  }

  private parseOrExpr(): Expression {
    let left = this.parseAndExpr();

    while (this.check('OR')) {
      this.advance(); // consume 'or' token
      const right = this.parseAndExpr();
      left = {
        type: 'BinaryOp',
        operator: 'or',
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseAndExpr(): Expression {
    let left = this.parseNotExpr();

    while (this.check('AND')) {
      this.advance(); // consume 'and' token
      const right = this.parseNotExpr();
      left = {
        type: 'BinaryOp',
        operator: 'and',
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseNotExpr(): Expression {
    if (this.check('NOT')) {
      const token = this.advance();
      const operand = this.parseNotExpr();
      return {
        type: 'UnaryOp',
        operator: 'not',
        operand,
        loc: { line: token.line, column: token.column },
      };
    }

    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let left = this.parseArithExpr();

    while (this.checkAny(['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'IN'])) {
      const opToken = this.advance();
      const op = this.tokenTypeToOperator(opToken.type);
      const right = this.parseArithExpr();
      left = {
        type: 'BinaryOp',
        operator: op,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseArithExpr(): Expression {
    let left = this.parseTerm();

    while (this.checkAny(['PLUS', 'MINUS'])) {
      const opToken = this.advance();
      const op = opToken.type === 'PLUS' ? '+' : '-';
      const right = this.parseTerm();
      left = {
        type: 'BinaryOp',
        operator: op,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseTerm(): Expression {
    let left = this.parsePower();

    while (this.checkAny(['MULTIPLY', 'DIVIDE', 'MODULO', 'FLOOR_DIV'])) {
      const opToken = this.advance();
      const op = this.termTokenToOperator(opToken.type);
      const right = this.parsePower();
      left = {
        type: 'BinaryOp',
        operator: op,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  // Power operator ** is right-associative and higher precedence than *//
  private parsePower(): Expression {
    const left = this.parseFactor();

    if (this.check('POWER')) {
      this.advance(); // consume '**'
      const right = this.parsePower(); // right-associative: recurse
      return {
        type: 'BinaryOp',
        operator: '**',
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private termTokenToOperator(type: TokenType): string {
    const mapping: Partial<Record<TokenType, string>> = {
      MULTIPLY: '*',
      DIVIDE: '/',
      MODULO: '%',
      FLOOR_DIV: '//',
    };
    return mapping[type] || type;
  }

  private parseFactor(): Expression {
    if (this.check('MINUS')) {
      const token = this.advance();
      const operand = this.parseFactor();
      return {
        type: 'UnaryOp',
        operator: '-',
        operand,
        loc: { line: token.line, column: token.column },
      };
    }

    return this.parsePostfix();
  }

  // Handle postfix operations: array[index], array[start:end], obj.property, obj.method()
  private parsePostfix(): Expression {
    let expr = this.parseAtom();

    // Handle index access, slice access, member access, and method calls
    while (this.check('LBRACKET') || this.check('DOT')) {
      if (this.check('LBRACKET')) {
        this.advance(); // consume '['

        // Check for slice syntax
        if (this.check('COLON')) {
          // [:end] or [:]
          this.advance(); // consume ':'
          let end: Expression | null = null;
          if (!this.check('RBRACKET')) {
            end = this.parseExpression();
          }
          this.expect('RBRACKET', '需要右方括号 "]"');
          expr = {
            type: 'SliceAccess',
            object: expr,
            start: null,
            end,
            loc: expr.loc,
          } as SliceAccess;
        } else {
          // Could be [index] or [start:end] or [start:]
          const first = this.parseExpression();

          if (this.check('COLON')) {
            // [start:end] or [start:]
            this.advance(); // consume ':'
            let end: Expression | null = null;
            if (!this.check('RBRACKET')) {
              end = this.parseExpression();
            }
            this.expect('RBRACKET', '需要右方括号 "]"');
            expr = {
              type: 'SliceAccess',
              object: expr,
              start: first,
              end,
              loc: expr.loc,
            } as SliceAccess;
          } else {
            // [index] - normal index access
            this.expect('RBRACKET', '需要右方括号 "]"');
            expr = {
              type: 'IndexAccess',
              object: expr,
              index: first,
              loc: expr.loc,
            } as IndexAccess;
          }
        }
      } else if (this.check('DOT')) {
        this.advance(); // consume '.'

        const propToken = this.expect('IDENTIFIER', '需要属性名或方法名');
        const property = propToken.value as string;

        // Check if it's a method call
        if (this.check('LPAREN')) {
          this.advance(); // consume '('
          const args: Expression[] = [];

          if (!this.check('RPAREN')) {
            do {
              args.push(this.parseExpression());
            } while (this.match('COMMA'));
          }

          this.expect('RPAREN', '需要右括号 ")"');

          expr = {
            type: 'MethodCall',
            object: expr,
            method: property,
            arguments: args,
            loc: expr.loc,
          } as MethodCall;
        } else {
          // It's a member access
          expr = {
            type: 'MemberAccess',
            object: expr,
            property,
            loc: expr.loc,
          } as MemberAccess;
        }
      }
    }

    return expr;
  }

  private parseAtom(): Expression {
    const token = this.peek();

    // Number
    if (this.check('NUMBER')) {
      this.advance();
      return {
        type: 'NumberLiteral',
        value: token.value as number,
        loc: { line: token.line, column: token.column },
      };
    }

    // String
    if (this.check('STRING')) {
      this.advance();
      return {
        type: 'StringLiteral',
        value: token.value as string,
        loc: { line: token.line, column: token.column },
      };
    }

    // Boolean
    if (this.check('TRUE')) {
      this.advance();
      return {
        type: 'BooleanLiteral',
        value: true,
        loc: { line: token.line, column: token.column },
      };
    }

    if (this.check('FALSE')) {
      this.advance();
      return {
        type: 'BooleanLiteral',
        value: false,
        loc: { line: token.line, column: token.column },
      };
    }

    // Parenthesized expression
    if (this.check('LPAREN')) {
      this.advance();
      const expr = this.parseExpression();
      this.expect('RPAREN', '需要右括号 ")"');
      return expr;
    }

    // Array literal: [1, 2, 3]
    if (this.check('LBRACKET')) {
      return this.parseArrayLiteral();
    }

    // Object literal: {key: value}
    if (this.check('LBRACE')) {
      return this.parseObjectLiteral();
    }

    // Identifier or function call
    if (this.check('IDENTIFIER')) {
      this.advance();
      const name = token.value as string;

      // Check for function call
      if (this.check('LPAREN')) {
        this.advance();
        const args: Expression[] = [];

        if (!this.check('RPAREN')) {
          do {
            args.push(this.parseExpression());
          } while (this.match('COMMA'));
        }

        this.expect('RPAREN', '需要右括号 ")"');

        return {
          type: 'CallExpression',
          callee: name,
          arguments: args,
          loc: { line: token.line, column: token.column },
        };
      }

      return {
        type: 'Identifier',
        name,
        loc: { line: token.line, column: token.column },
      };
    }

    throw new SyntaxError(
      `意外的符号: ${token.value || token.type}`,
      token.line,
      token.column,
      '检查语法是否正确'
    );
  }

  // Parse array literal: [1, 2, 3] or []
  private parseArrayLiteral(): ArrayLiteral {
    const token = this.peek();
    this.advance(); // consume '['

    const elements: Expression[] = [];

    // Handle empty array []
    if (!this.check('RBRACKET')) {
      do {
        elements.push(this.parseExpression());
      } while (this.match('COMMA'));
    }

    this.expect('RBRACKET', '需要右方括号 "]"');

    return {
      type: 'ArrayLiteral',
      elements,
      loc: { line: token.line, column: token.column },
    };
  }

  // Parse object literal: {key: value, key2: value2} or {}
  private parseObjectLiteral(): ObjectLiteral {
    const token = this.peek();
    this.advance(); // consume '{'

    const properties: { key: string; value: Expression }[] = [];

    // Handle empty object {}
    if (!this.check('RBRACE')) {
      do {
        // Key can be identifier or string
        let key: string;
        if (this.check('IDENTIFIER')) {
          key = this.advance().value as string;
        } else if (this.check('STRING')) {
          key = this.advance().value as string;
        } else {
          const t = this.peek();
          throw new SyntaxError(
            '对象的键必须是标识符或字符串',
            t.line,
            t.column,
            '使用 {name: value} 或 {"name": value} 格式'
          );
        }

        this.expect('COLON', '需要冒号 ":"');
        const value = this.parseExpression();
        properties.push({ key, value });
      } while (this.match('COMMA'));
    }

    this.expect('RBRACE', '需要右花括号 "}"');

    return {
      type: 'ObjectLiteral',
      properties,
      loc: { line: token.line, column: token.column },
    };
  }

  // ============ Helper Methods ============

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.pos++;
    }
    return this.tokens[this.pos - 1];
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkAny(types: TokenType[]): boolean {
    return types.some((type) => this.check(type));
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    const token = this.peek();
    throw new SyntaxError(message, token.line, token.column, undefined);
  }

  private expectNewlineOrEnd(): void {
    if (this.isAtEnd() || this.check('DEDENT')) return;
    if (!this.match('NEWLINE')) {
      const token = this.peek();
      throw new SyntaxError('语句末尾需要换行', token.line, token.column, '在这一行末尾按回车换行');
    }
  }

  private skipNewlines(): void {
    while (this.check('NEWLINE')) {
      this.advance();
    }
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private tokenTypeToOperator(type: TokenType): string {
    const mapping: Partial<Record<TokenType, string>> = {
      EQ: '==',
      NEQ: '!=',
      LT: '<',
      GT: '>',
      LTE: '<=',
      GTE: '>=',
      IN: 'in',
    };
    return mapping[type] || type;
  }
}

export function parse(tokens: Token[]): Program {
  const parser = new Parser(tokens);
  return parser.parse();
}
