/**
 * Mini Python Interpreter
 *
 * A step-by-step interpreter that executes AST nodes one at a time,
 * supporting pause/resume for educational visualization.
 */

import type {
  Program,
  Statement,
  Expression,
  ExpressionStatement,
  Assignment,
  AugmentedAssignment,
  IndexedAssignment,
  IfStatement,
  RepeatStatement,
  WhileStatement,
  ForStatement,
  ForEachStatement,
  ReturnStatement,
  BinaryOp,
  UnaryOp,
  CallExpression,
} from './ast';
import { RuntimeError } from './errors';

// Runtime values
export type Value = number | string | boolean | null | UserFunction | Value[] | ObjectValue;
export interface ObjectValue {
  [key: string]: Value;
}

export interface UserFunction {
  type: 'function';
  name: string;
  params: string[];
  body: Statement[];
}

// Execution result from a single step
export interface StepResult {
  done: boolean;
  action: string | null;
  actionArgs: Value[];
  highlightLine: number | null;
  output?: string;
}

// Execution state
export type ExecutionStatus = 'ready' | 'running' | 'paused' | 'completed' | 'error';

export interface ExecutionState {
  status: ExecutionStatus;
  error: string | null;
  currentLine: number | null;
  variables: Record<string, Value>;
  output: string[];
}

// Stack frame for function calls
interface StackFrame {
  functionName: string | null;
  locals: Map<string, Value>;
  statements: Statement[];
  statementIndex: number;
  // For repeat/while loops
  loopCounter?: number;
  loopLimit?: number;
  loopBody?: Statement[];
  loopBodyIndex?: number;
  // For while loops
  whileCondition?: Expression;
  // For for-range loops
  forVariable?: string;
  forEnd?: number;
  forStep?: number;
  // For for-each loops
  forEachIterable?: Value[];
  forEachIndex?: number;
  // Break/continue flags
  shouldBreak?: boolean;
  shouldContinue?: boolean;
  // Return value
  returnValue?: Value;
  hasReturned?: boolean;
}

// Built-in command handler type
export type CommandHandler = (args: Value[]) => void;
export type SensorHandler = (args: Value[]) => boolean;

export class Interpreter {
  private program: Program | null = null;
  private callStack: StackFrame[] = [];
  private globals: Map<string, Value> = new Map();
  private functions: Map<string, UserFunction> = new Map();
  private status: ExecutionStatus = 'ready';
  private error: string | null = null;
  private output: string[] = [];

  // External bindings
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private sensorHandlers: Map<string, SensorHandler> = new Map();

  // Execution limits
  private stepCount: number = 0;
  private maxSteps: number = 10000;

  constructor() {
    this.reset();
  }

  /**
   * Register a command handler (e.g., '前进', 'forward')
   */
  registerCommand(name: string, handler: CommandHandler): void {
    this.commandHandlers.set(name, handler);
  }

  /**
   * Register a sensor handler (e.g., '前方有墙', 'frontBlocked')
   */
  registerSensor(name: string, handler: SensorHandler): void {
    this.sensorHandlers.set(name, handler);
  }

  /**
   * Load a program for execution
   */
  load(program: Program): void {
    this.reset();
    this.program = program;

    // Pre-scan for function definitions
    for (const stmt of program.body) {
      if (stmt.type === 'FunctionDef') {
        this.functions.set(stmt.name, {
          type: 'function',
          name: stmt.name,
          params: stmt.params,
          body: stmt.body,
        });
      }
    }

    // Filter out function definitions from main body
    const mainStatements = program.body.filter((s) => s.type !== 'FunctionDef');

    // Initialize main stack frame
    this.callStack.push({
      functionName: null,
      locals: new Map(),
      statements: mainStatements,
      statementIndex: 0,
    });

    this.status = 'ready';
  }

  /**
   * Execute a single step
   */
  step(): StepResult {
    if (this.status === 'completed' || this.status === 'error') {
      return { done: true, action: null, actionArgs: [], highlightLine: null };
    }

    this.status = 'running';
    this.stepCount++;

    if (this.stepCount > this.maxSteps) {
      this.error = '程序执行步数过多，可能存在无限循环';
      this.status = 'error';
      return { done: true, action: null, actionArgs: [], highlightLine: null };
    }

    try {
      const result = this.executeStep();
      return result;
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      this.status = 'error';
      return { done: true, action: null, actionArgs: [], highlightLine: null };
    }
  }

  /**
   * Run until completion or pause
   */
  run(): StepResult[] {
    const results: StepResult[] = [];

    while (this.status !== 'completed' && this.status !== 'error' && this.status !== 'paused') {
      const result = this.step();
      results.push(result);
      if (result.done) break;
    }

    return results;
  }

  /**
   * Pause execution
   */
  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
    }
  }

  /**
   * Resume execution
   */
  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  /**
   * Reset interpreter state
   */
  reset(): void {
    this.program = null;
    this.callStack = [];
    this.globals = new Map();
    this.functions = new Map();
    this.status = 'ready';
    this.error = null;
    this.output = [];
    this.stepCount = 0;
  }

  /**
   * Get current execution state
   */
  getState(): ExecutionState {
    const variables: Record<string, Value> = {};

    // Collect globals
    for (const [name, value] of this.globals) {
      if (typeof value !== 'object' || value === null) {
        variables[name] = value;
      }
    }

    // Collect current frame locals
    if (this.callStack.length > 0) {
      const frame = this.currentFrame();
      for (const [name, value] of frame.locals) {
        if (typeof value !== 'object' || value === null) {
          variables[name] = value;
        }
      }
    }

    return {
      status: this.status,
      error: this.error,
      currentLine: this.getCurrentLine(),
      variables,
      output: [...this.output],
    };
  }

  // ============ Internal Execution ============

  private executeStep(): StepResult {
    if (this.callStack.length === 0) {
      this.status = 'completed';
      return { done: true, action: null, actionArgs: [], highlightLine: null };
    }

    const frame = this.currentFrame();

    // Handle loop continuation
    if (frame.loopBody !== undefined) {
      return this.executeLoopStep(frame);
    }

    // Check if we've finished all statements in this frame
    if (frame.statementIndex >= frame.statements.length) {
      this.callStack.pop();

      // If this was a function call, handle return
      if (frame.functionName !== null && this.callStack.length > 0) {
        // Return value is already set in the parent frame
      }

      // Continue with next step
      if (this.callStack.length === 0) {
        this.status = 'completed';
        return { done: true, action: null, actionArgs: [], highlightLine: null };
      }

      return { done: false, action: null, actionArgs: [], highlightLine: this.getCurrentLine() };
    }

    const stmt = frame.statements[frame.statementIndex];
    return this.executeStatement(stmt, frame);
  }

  private executeStatement(stmt: Statement, frame: StackFrame): StepResult {
    const line = stmt.loc?.line ?? null;

    switch (stmt.type) {
      case 'ExpressionStatement':
        return this.executeExpressionStatement(stmt, frame, line);

      case 'Assignment':
        return this.executeAssignment(stmt, frame, line);

      case 'AugmentedAssignment':
        return this.executeAugmentedAssignment(stmt, frame, line);

      case 'IndexedAssignment':
        return this.executeIndexedAssignment(stmt, frame, line);

      case 'IfStatement':
        return this.executeIfStatement(stmt, frame, line);

      case 'RepeatStatement':
        return this.executeRepeatStatement(stmt, frame, line);

      case 'WhileStatement':
        return this.executeWhileStatement(stmt, frame, line);

      case 'ForStatement':
        return this.executeForStatement(stmt, frame, line);

      case 'ForEachStatement':
        return this.executeForEachStatement(stmt, frame, line);

      case 'BreakStatement':
        return this.executeBreakStatement(frame, line);

      case 'ContinueStatement':
        return this.executeContinueStatement(frame, line);

      case 'PassStatement':
        // Pass does nothing - just move to next statement
        frame.statementIndex++;
        return { done: false, action: null, actionArgs: [], highlightLine: line };

      case 'ReturnStatement':
        return this.executeReturnStatement(stmt, frame, line);

      case 'FunctionDef':
        // Skip - already processed during load
        frame.statementIndex++;
        return { done: false, action: null, actionArgs: [], highlightLine: line };

      default:
        throw new RuntimeError(`未知的语句类型: ${(stmt as { type: string }).type}`, line ?? 0, 0);
    }
  }

  private executeExpressionStatement(
    stmt: ExpressionStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    this.evaluateExpression(stmt.expression); // Execute for side effects
    frame.statementIndex++;

    // Check if this was a command call
    if (stmt.expression.type === 'CallExpression') {
      const callee = stmt.expression.callee;
      if (this.commandHandlers.has(callee)) {
        return {
          done: false,
          action: callee,
          actionArgs: stmt.expression.arguments.map((arg) => this.evaluateExpression(arg)),
          highlightLine: line,
        };
      }
    }

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeAssignment(stmt: Assignment, frame: StackFrame, line: number | null): StepResult {
    const value = this.evaluateExpression(stmt.value);
    this.setVariable(stmt.target, value);
    frame.statementIndex++;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeAugmentedAssignment(
    stmt: AugmentedAssignment,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const currentValue = this.getVariable(stmt.target);
    const operand = this.evaluateExpression(stmt.value);

    let newValue: Value;
    switch (stmt.operator) {
      case '+=':
        if (typeof currentValue === 'number' && typeof operand === 'number') {
          newValue = currentValue + operand;
        } else if (typeof currentValue === 'string' || typeof operand === 'string') {
          newValue = String(currentValue) + String(operand);
        } else {
          throw new RuntimeError('+= 需要两个数字或字符串', line ?? 0, 0);
        }
        break;
      case '-=':
        if (typeof currentValue !== 'number' || typeof operand !== 'number') {
          throw new RuntimeError('-= 需要两个数字', line ?? 0, 0);
        }
        newValue = currentValue - operand;
        break;
      case '*=':
        if (typeof currentValue === 'number' && typeof operand === 'number') {
          newValue = currentValue * operand;
        } else if (typeof currentValue === 'string' && typeof operand === 'number') {
          newValue = currentValue.repeat(operand);
        } else {
          throw new RuntimeError('*= 需要两个数字，或字符串与整数', line ?? 0, 0);
        }
        break;
      case '/=':
        if (typeof currentValue !== 'number' || typeof operand !== 'number') {
          throw new RuntimeError('/= 需要两个数字', line ?? 0, 0);
        }
        if (operand === 0) {
          throw new RuntimeError('不能除以零', line ?? 0, 0);
        }
        newValue = currentValue / operand;
        break;
      default:
        throw new RuntimeError(`未知的增量赋值运算符: ${stmt.operator}`, line ?? 0, 0);
    }

    this.setVariable(stmt.target, newValue);
    frame.statementIndex++;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeIndexedAssignment(
    stmt: IndexedAssignment,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const obj = this.evaluateExpression(stmt.object);
    const index = this.evaluateExpression(stmt.index);
    const value = this.evaluateExpression(stmt.value);

    if (Array.isArray(obj)) {
      // Array index assignment
      if (typeof index !== 'number' || !Number.isInteger(index)) {
        throw new RuntimeError('数组索引必须是整数', line ?? 0, 0);
      }
      // Support negative indexing
      let actualIndex = index;
      if (index < 0) {
        actualIndex = obj.length + index;
      }
      if (actualIndex < 0 || actualIndex >= obj.length) {
        throw new RuntimeError(`数组索引 ${index} 超出范围 (0-${obj.length - 1})`, line ?? 0, 0);
      }
      obj[actualIndex] = value;
    } else if (typeof obj === 'object' && obj !== null && !('type' in obj)) {
      // Object key assignment
      if (typeof index !== 'string' && typeof index !== 'number') {
        throw new RuntimeError('对象键必须是字符串或数字', line ?? 0, 0);
      }
      (obj as ObjectValue)[String(index)] = value;
    } else {
      throw new RuntimeError('只能对数组或对象进行索引赋值', line ?? 0, 0);
    }

    frame.statementIndex++;
    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeIfStatement(
    stmt: IfStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const condition = this.evaluateExpression(stmt.condition);

    frame.statementIndex++;

    if (this.isTruthy(condition)) {
      // Execute consequent
      this.callStack.push({
        functionName: null,
        locals: new Map(),
        statements: stmt.consequent,
        statementIndex: 0,
      });
    } else if (stmt.elifBranches && stmt.elifBranches.length > 0) {
      // Check elif branches
      for (const elifBranch of stmt.elifBranches) {
        const elifCondition = this.evaluateExpression(elifBranch.condition);
        if (this.isTruthy(elifCondition)) {
          this.callStack.push({
            functionName: null,
            locals: new Map(),
            statements: elifBranch.consequent,
            statementIndex: 0,
          });
          return { done: false, action: null, actionArgs: [], highlightLine: line };
        }
      }
      // No elif matched, try else
      if (stmt.alternate) {
        this.callStack.push({
          functionName: null,
          locals: new Map(),
          statements: stmt.alternate,
          statementIndex: 0,
        });
      }
    } else if (stmt.alternate) {
      // Execute alternate
      this.callStack.push({
        functionName: null,
        locals: new Map(),
        statements: stmt.alternate,
        statementIndex: 0,
      });
    }

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeRepeatStatement(
    stmt: RepeatStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const count = this.evaluateExpression(stmt.count);

    if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
      throw new RuntimeError(
        '重复次数必须是非负整数',
        stmt.loc?.line ?? 0,
        0,
        '检查重复次数是否正确'
      );
    }

    if (count === 0) {
      frame.statementIndex++;
      return { done: false, action: null, actionArgs: [], highlightLine: line };
    }

    // Set up loop in current frame
    frame.loopCounter = 0;
    frame.loopLimit = count;
    frame.loopBody = stmt.body;
    frame.loopBodyIndex = 0;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeWhileStatement(
    stmt: WhileStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const condition = this.evaluateExpression(stmt.condition);

    if (!this.isTruthy(condition)) {
      frame.statementIndex++;
      return { done: false, action: null, actionArgs: [], highlightLine: line };
    }

    // Set up while loop
    frame.whileCondition = stmt.condition;
    frame.loopBody = stmt.body;
    frame.loopBodyIndex = 0;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeForStatement(
    stmt: ForStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const start = this.evaluateExpression(stmt.start);
    const end = this.evaluateExpression(stmt.end);
    const step = stmt.step ? this.evaluateExpression(stmt.step) : 1;

    if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
      throw new RuntimeError('循环范围必须是数字', stmt.loc?.line ?? 0, 0, '检查范围参数是否正确');
    }

    if (step === 0) {
      throw new RuntimeError('循环步长不能为零', stmt.loc?.line ?? 0, 0);
    }

    // Check if loop should run at all
    if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
      frame.statementIndex++;
      return { done: false, action: null, actionArgs: [], highlightLine: line };
    }

    // Set up for loop - using loopCounter as the current value
    this.setVariable(stmt.variable, start);
    frame.forVariable = stmt.variable;
    frame.forEnd = end;
    frame.forStep = step;
    frame.loopBody = stmt.body;
    frame.loopBodyIndex = 0;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeForEachStatement(
    stmt: ForEachStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const iterable = this.evaluateExpression(stmt.iterable);

    // Support iterating over arrays and strings
    let items: Value[];
    if (Array.isArray(iterable)) {
      items = iterable;
    } else if (typeof iterable === 'string') {
      // Convert string to array of characters
      items = iterable.split('');
    } else {
      throw new RuntimeError(
        '只能对数组或字符串进行迭代',
        stmt.loc?.line ?? 0,
        0,
        '检查迭代对象是否为数组或字符串'
      );
    }

    // Check if loop should run at all
    if (items.length === 0) {
      frame.statementIndex++;
      return { done: false, action: null, actionArgs: [], highlightLine: line };
    }

    // Set up for-each loop
    frame.forEachIterable = items;
    frame.forEachIndex = 0;
    frame.forVariable = stmt.variable;
    this.setVariable(stmt.variable, items[0]);
    frame.loopBody = stmt.body;
    frame.loopBodyIndex = 0;

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeBreakStatement(frame: StackFrame, line: number | null): StepResult {
    frame.shouldBreak = true;
    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeContinueStatement(frame: StackFrame, line: number | null): StepResult {
    frame.shouldContinue = true;
    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeReturnStatement(
    stmt: ReturnStatement,
    frame: StackFrame,
    line: number | null
  ): StepResult {
    const value = stmt.value ? this.evaluateExpression(stmt.value) : null;

    frame.returnValue = value;
    frame.hasReturned = true;

    // Pop back to caller
    this.callStack.pop();

    return { done: false, action: null, actionArgs: [], highlightLine: line };
  }

  private executeLoopStep(frame: StackFrame): StepResult {
    const body = frame.loopBody!;
    const bodyIndex = frame.loopBodyIndex!;

    // Check for break
    if (frame.shouldBreak) {
      frame.shouldBreak = false;
      return this.exitLoop(frame);
    }

    // Check for continue
    if (frame.shouldContinue) {
      frame.shouldContinue = false;
      return this.continueLoop(frame);
    }

    // Execute next statement in loop body
    if (bodyIndex < body.length) {
      const stmt = body[bodyIndex];
      frame.loopBodyIndex!++;

      // Create a mini-frame for the statement
      const result = this.evaluateStatementForLoop(stmt);
      return result;
    }

    // End of loop body - check continuation
    return this.continueLoop(frame);
  }

  private exitLoop(frame: StackFrame): StepResult {
    // Clean up all loop state
    frame.loopBody = undefined;
    frame.loopBodyIndex = undefined;
    frame.loopCounter = undefined;
    frame.loopLimit = undefined;
    frame.whileCondition = undefined;
    frame.forVariable = undefined;
    frame.forEnd = undefined;
    frame.forStep = undefined;
    frame.forEachIterable = undefined;
    frame.forEachIndex = undefined;
    frame.statementIndex++;
    return { done: false, action: null, actionArgs: [], highlightLine: null };
  }

  private continueLoop(frame: StackFrame): StepResult {
    // Handle for-each loops
    if (frame.forEachIterable !== undefined) {
      const nextIndex = frame.forEachIndex! + 1;
      if (nextIndex < frame.forEachIterable.length) {
        frame.forEachIndex = nextIndex;
        this.setVariable(frame.forVariable!, frame.forEachIterable[nextIndex]);
        frame.loopBodyIndex = 0;
        return { done: false, action: null, actionArgs: [], highlightLine: null };
      } else {
        return this.exitLoop(frame);
      }
    }

    // Handle for-range loops
    if (frame.forVariable !== undefined && frame.forEnd !== undefined) {
      const currentValue = this.getVariable(frame.forVariable) as number;
      const nextValue = currentValue + frame.forStep!;
      const end = frame.forEnd!;
      const step = frame.forStep!;

      // Check if loop should continue
      if ((step > 0 && nextValue < end) || (step < 0 && nextValue > end)) {
        this.setVariable(frame.forVariable, nextValue);
        frame.loopBodyIndex = 0;
        return { done: false, action: null, actionArgs: [], highlightLine: null };
      } else {
        return this.exitLoop(frame);
      }
    }

    // Handle while loops
    if (frame.whileCondition !== undefined) {
      const condition = this.evaluateExpression(frame.whileCondition);
      if (this.isTruthy(condition)) {
        frame.loopBodyIndex = 0;
        return {
          done: false,
          action: null,
          actionArgs: [],
          highlightLine: frame.whileCondition.loc?.line ?? null,
        };
      } else {
        return this.exitLoop(frame);
      }
    }

    // Handle repeat loops
    frame.loopCounter!++;
    if (frame.loopCounter! < frame.loopLimit!) {
      frame.loopBodyIndex = 0;
      return { done: false, action: null, actionArgs: [], highlightLine: null };
    } else {
      return this.exitLoop(frame);
    }
  }

  private evaluateStatementForLoop(stmt: Statement): StepResult {
    const line = stmt.loc?.line ?? null;

    switch (stmt.type) {
      case 'ExpressionStatement': {
        this.evaluateExpression(stmt.expression);
        if (stmt.expression.type === 'CallExpression') {
          const callee = stmt.expression.callee;
          if (this.commandHandlers.has(callee)) {
            return {
              done: false,
              action: callee,
              actionArgs: stmt.expression.arguments.map((arg) => this.evaluateExpression(arg)),
              highlightLine: line,
            };
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'Assignment': {
        const value = this.evaluateExpression(stmt.value);
        this.setVariable(stmt.target, value);
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'AugmentedAssignment': {
        const currentValue = this.getVariable(stmt.target);
        const operand = this.evaluateExpression(stmt.value);
        let newValue: Value;
        switch (stmt.operator) {
          case '+=':
            if (typeof currentValue === 'number' && typeof operand === 'number') {
              newValue = currentValue + operand;
            } else if (typeof currentValue === 'string' || typeof operand === 'string') {
              newValue = String(currentValue) + String(operand);
            } else {
              throw new RuntimeError('+= 需要两个数字或字符串', line ?? 0, 0);
            }
            break;
          case '-=':
            if (typeof currentValue !== 'number' || typeof operand !== 'number') {
              throw new RuntimeError('-= 需要两个数字', line ?? 0, 0);
            }
            newValue = currentValue - operand;
            break;
          case '*=':
            if (typeof currentValue === 'number' && typeof operand === 'number') {
              newValue = currentValue * operand;
            } else if (typeof currentValue === 'string' && typeof operand === 'number') {
              newValue = currentValue.repeat(operand);
            } else {
              throw new RuntimeError('*= 需要两个数字，或字符串与整数', line ?? 0, 0);
            }
            break;
          case '/=':
            if (typeof currentValue !== 'number' || typeof operand !== 'number') {
              throw new RuntimeError('/= 需要两个数字', line ?? 0, 0);
            }
            if (operand === 0) throw new RuntimeError('不能除以零', line ?? 0, 0);
            newValue = currentValue / operand;
            break;
          default:
            throw new RuntimeError(`未知的增量赋值运算符: ${stmt.operator}`, line ?? 0, 0);
        }
        this.setVariable(stmt.target, newValue);
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'IndexedAssignment': {
        const obj = this.evaluateExpression(stmt.object);
        const index = this.evaluateExpression(stmt.index);
        const value = this.evaluateExpression(stmt.value);

        if (Array.isArray(obj)) {
          if (typeof index !== 'number' || !Number.isInteger(index)) {
            throw new RuntimeError('数组索引必须是整数', line ?? 0, 0);
          }
          // Support negative indexing
          let actualIndex = index;
          if (index < 0) {
            actualIndex = obj.length + index;
          }
          if (actualIndex < 0 || actualIndex >= obj.length) {
            throw new RuntimeError(
              `数组索引 ${index} 超出范围 (0-${obj.length - 1})`,
              line ?? 0,
              0
            );
          }
          obj[actualIndex] = value;
        } else if (this.isObject(obj)) {
          (obj as ObjectValue)[String(index)] = value;
        } else {
          throw new RuntimeError('只能对数组或对象进行索引赋值', line ?? 0, 0);
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'IfStatement': {
        const condition = this.evaluateExpression(stmt.condition);
        let branch: Statement[] | null = null;

        if (this.isTruthy(condition)) {
          branch = stmt.consequent;
        } else if (stmt.elifBranches && stmt.elifBranches.length > 0) {
          for (const elifBranch of stmt.elifBranches) {
            const elifCondition = this.evaluateExpression(elifBranch.condition);
            if (this.isTruthy(elifCondition)) {
              branch = elifBranch.consequent;
              break;
            }
          }
          if (!branch && stmt.alternate) {
            branch = stmt.alternate;
          }
        } else if (stmt.alternate) {
          branch = stmt.alternate;
        }

        if (branch) {
          // Execute branch statements directly without modifying loop body
          const frame = this.currentFrame();
          for (const branchStmt of branch) {
            const result = this.evaluateStatementForLoop(branchStmt);
            // Check if break/continue was triggered
            if (frame.shouldBreak || frame.shouldContinue) {
              return result;
            }
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'BreakStatement': {
        const frame = this.currentFrame();
        frame.shouldBreak = true;
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'PassStatement':
        // Pass does nothing
        return { done: false, action: null, actionArgs: [], highlightLine: line };

      case 'ContinueStatement': {
        const frame = this.currentFrame();
        frame.shouldContinue = true;
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'ForStatement': {
        // Execute nested for loop synchronously
        const frame = this.currentFrame();
        const start = this.evaluateExpression(stmt.start) as number;
        const end = this.evaluateExpression(stmt.end) as number;
        const step = stmt.step ? (this.evaluateExpression(stmt.step) as number) : 1;

        for (let i = start; step > 0 ? i < end : i > end; i += step) {
          this.setVariable(stmt.variable, i);
          for (const s of stmt.body) {
            const result = this.evaluateStatementForLoop(s);
            if (frame.shouldBreak || frame.shouldContinue) break;
            // Check if there was a command action to return
            if (result.action !== null) {
              // Continue processing loop
            }
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
          if (frame.shouldContinue) {
            frame.shouldContinue = false;
            // Continue to next iteration
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'ForEachStatement': {
        // Execute nested for-each loop synchronously
        const frame = this.currentFrame();
        const iterable = this.evaluateExpression(stmt.iterable);
        let items: Value[];
        if (Array.isArray(iterable)) {
          items = iterable;
        } else if (typeof iterable === 'string') {
          items = iterable.split('');
        } else {
          throw new RuntimeError('只能对数组或字符串进行迭代', line ?? 0, 0);
        }

        for (const item of items) {
          this.setVariable(stmt.variable, item);
          for (const s of stmt.body) {
            this.evaluateStatementForLoop(s);
            if (frame.shouldBreak || frame.shouldContinue) break;
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
          if (frame.shouldContinue) {
            frame.shouldContinue = false;
            // Continue to next iteration
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'WhileStatement': {
        // Execute nested while loop synchronously
        const frame = this.currentFrame();
        while (this.isTruthy(this.evaluateExpression(stmt.condition))) {
          for (const s of stmt.body) {
            this.evaluateStatementForLoop(s);
            if (frame.shouldBreak || frame.shouldContinue) break;
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
          if (frame.shouldContinue) {
            frame.shouldContinue = false;
            // Continue to next iteration
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      case 'RepeatStatement': {
        // Execute nested repeat loop synchronously
        const frame = this.currentFrame();
        const count = this.evaluateExpression(stmt.count) as number;
        for (let i = 0; i < count; i++) {
          for (const s of stmt.body) {
            this.evaluateStatementForLoop(s);
            if (frame.shouldBreak || frame.shouldContinue) break;
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
          if (frame.shouldContinue) {
            frame.shouldContinue = false;
            // Continue to next iteration
          }
        }
        return { done: false, action: null, actionArgs: [], highlightLine: line };
      }

      default:
        return { done: false, action: null, actionArgs: [], highlightLine: line };
    }
  }

  // ============ Expression Evaluation ============

  private evaluateExpression(expr: Expression): Value {
    switch (expr.type) {
      case 'NumberLiteral':
        return expr.value;

      case 'StringLiteral':
        return expr.value;

      case 'BooleanLiteral':
        return expr.value;

      case 'Identifier':
        return this.getVariable(expr.name);

      case 'BinaryOp':
        return this.evaluateBinaryOp(expr);

      case 'UnaryOp':
        return this.evaluateUnaryOp(expr);

      case 'CallExpression':
        return this.evaluateCall(expr);

      case 'ArrayLiteral':
        return expr.elements.map((e) => this.evaluateExpression(e));

      case 'ObjectLiteral': {
        const result: ObjectValue = {};
        for (const prop of expr.properties) {
          result[prop.key] = this.evaluateExpression(prop.value);
        }
        return result;
      }

      case 'IndexAccess': {
        const obj = this.evaluateExpression(expr.object);
        const index = this.evaluateExpression(expr.index);

        // Array access
        if (Array.isArray(obj)) {
          if (typeof index !== 'number' || !Number.isInteger(index)) {
            throw new RuntimeError('数组索引必须是整数', expr.loc?.line ?? 0, 0);
          }
          // Support negative indexing
          let actualIndex = index;
          if (index < 0) {
            actualIndex = obj.length + index;
          }
          if (actualIndex < 0 || actualIndex >= obj.length) {
            throw new RuntimeError(
              `数组索引 ${index} 超出范围 (0-${obj.length - 1})`,
              expr.loc?.line ?? 0,
              0
            );
          }
          return obj[actualIndex];
        }

        // String access (character at index)
        if (typeof obj === 'string') {
          if (typeof index !== 'number' || !Number.isInteger(index)) {
            throw new RuntimeError('字符串索引必须是整数', expr.loc?.line ?? 0, 0);
          }
          let actualIndex = index;
          if (index < 0) {
            actualIndex = obj.length + index;
          }
          if (actualIndex < 0 || actualIndex >= obj.length) {
            throw new RuntimeError(
              `字符串索引 ${index} 超出范围 (0-${obj.length - 1})`,
              expr.loc?.line ?? 0,
              0
            );
          }
          return obj[actualIndex];
        }

        // Object access
        if (typeof obj === 'object' && obj !== null && !('type' in obj)) {
          const key = String(index);
          if (!(key in obj)) {
            throw new RuntimeError(`对象没有键 "${key}"`, expr.loc?.line ?? 0, 0);
          }
          return (obj as ObjectValue)[key];
        }

        throw new RuntimeError('只能对数组、字符串或对象进行索引', expr.loc?.line ?? 0, 0);
      }

      case 'SliceAccess': {
        const obj = this.evaluateExpression(expr.object);
        const startExpr = expr.start ? this.evaluateExpression(expr.start) : null;
        const endExpr = expr.end ? this.evaluateExpression(expr.end) : null;

        // Handle arrays
        if (Array.isArray(obj)) {
          const len = obj.length;
          let start = startExpr !== null ? (startExpr as number) : 0;
          let end = endExpr !== null ? (endExpr as number) : len;

          // Validate indices
          if (
            (startExpr !== null && typeof start !== 'number') ||
            (endExpr !== null && typeof end !== 'number')
          ) {
            throw new RuntimeError('切片索引必须是整数', expr.loc?.line ?? 0, 0);
          }

          // Handle negative indices
          if (start < 0) start = Math.max(0, len + start);
          if (end < 0) end = Math.max(0, len + end);

          // Clamp to valid range
          start = Math.max(0, Math.min(start, len));
          end = Math.max(0, Math.min(end, len));

          return obj.slice(start, end);
        }

        // Handle strings
        if (typeof obj === 'string') {
          const len = obj.length;
          let start = startExpr !== null ? (startExpr as number) : 0;
          let end = endExpr !== null ? (endExpr as number) : len;

          // Validate indices
          if (
            (startExpr !== null && typeof start !== 'number') ||
            (endExpr !== null && typeof end !== 'number')
          ) {
            throw new RuntimeError('切片索引必须是整数', expr.loc?.line ?? 0, 0);
          }

          // Handle negative indices
          if (start < 0) start = Math.max(0, len + start);
          if (end < 0) end = Math.max(0, len + end);

          // Clamp to valid range
          start = Math.max(0, Math.min(start, len));
          end = Math.max(0, Math.min(end, len));

          return obj.slice(start, end);
        }

        throw new RuntimeError('只能对数组或字符串进行切片', expr.loc?.line ?? 0, 0);
      }

      default:
        throw new RuntimeError(`未知的表达式类型: ${(expr as { type: string }).type}`, 0, 0);
    }
  }

  private evaluateBinaryOp(expr: BinaryOp): Value {
    // Short-circuit evaluation for 'and' and 'or'
    // These return actual values, not just booleans (Python semantics)
    if (expr.operator === 'and') {
      const left = this.evaluateExpression(expr.left);
      if (!this.isTruthy(left)) return left; // Short-circuit: return falsy value
      return this.evaluateExpression(expr.right);
    }

    if (expr.operator === 'or') {
      const left = this.evaluateExpression(expr.left);
      if (this.isTruthy(left)) return left; // Short-circuit: return truthy value
      return this.evaluateExpression(expr.right);
    }

    const left = this.evaluateExpression(expr.left);
    const right = this.evaluateExpression(expr.right);

    switch (expr.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string')
          return String(left) + String(right);
        throw new RuntimeError('加法需要两个数字或字符串', expr.loc?.line ?? 0, 0);

      case '-':
        if (typeof left === 'number' && typeof right === 'number') return left - right;
        throw new RuntimeError('减法需要两个数字', expr.loc?.line ?? 0, 0);

      case '*':
        if (typeof left === 'number' && typeof right === 'number') return left * right;
        // String multiplication: "ab" * 3 = "ababab" or 3 * "ab" = "ababab"
        if (typeof left === 'string' && typeof right === 'number') {
          if (!Number.isInteger(right) || right < 0) {
            throw new RuntimeError('字符串重复次数必须是非负整数', expr.loc?.line ?? 0, 0);
          }
          return left.repeat(right);
        }
        if (typeof left === 'number' && typeof right === 'string') {
          if (!Number.isInteger(left) || left < 0) {
            throw new RuntimeError('字符串重复次数必须是非负整数', expr.loc?.line ?? 0, 0);
          }
          return right.repeat(left);
        }
        throw new RuntimeError('乘法需要两个数字，或字符串与整数', expr.loc?.line ?? 0, 0);

      case '/':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) throw new RuntimeError('不能除以零', expr.loc?.line ?? 0, 0);
          return left / right;
        }
        throw new RuntimeError('除法需要两个数字', expr.loc?.line ?? 0, 0);

      case '%':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) throw new RuntimeError('不能对零取模', expr.loc?.line ?? 0, 0);
          return left % right;
        }
        throw new RuntimeError('取模需要两个数字', expr.loc?.line ?? 0, 0);

      case '//':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) throw new RuntimeError('不能除以零', expr.loc?.line ?? 0, 0);
          return Math.floor(left / right);
        }
        throw new RuntimeError('整除需要两个数字', expr.loc?.line ?? 0, 0);

      case '**':
        if (typeof left === 'number' && typeof right === 'number') {
          return Math.pow(left, right);
        }
        throw new RuntimeError('幂运算需要两个数字', expr.loc?.line ?? 0, 0);

      case '==':
        return left === right;

      case '!=':
        return left !== right;

      case '<':
        if (typeof left === 'number' && typeof right === 'number') return left < right;
        throw new RuntimeError('比较需要两个数字', expr.loc?.line ?? 0, 0);

      case '>':
        if (typeof left === 'number' && typeof right === 'number') return left > right;
        throw new RuntimeError('比较需要两个数字', expr.loc?.line ?? 0, 0);

      case '<=':
        if (typeof left === 'number' && typeof right === 'number') return left <= right;
        throw new RuntimeError('比较需要两个数字', expr.loc?.line ?? 0, 0);

      case '>=':
        if (typeof left === 'number' && typeof right === 'number') return left >= right;
        throw new RuntimeError('比较需要两个数字', expr.loc?.line ?? 0, 0);

      // 'and' and 'or' handled above for short-circuit evaluation

      case 'in':
        // Check if left is in right (array or string)
        if (Array.isArray(right)) {
          return right.includes(left);
        }
        if (typeof right === 'string') {
          if (typeof left !== 'string') {
            throw new RuntimeError('字符串的 in 运算符需要字符串', expr.loc?.line ?? 0, 0);
          }
          return right.includes(left);
        }
        // Check if key is in object
        if (typeof right === 'object' && right !== null && !('type' in right)) {
          return String(left) in right;
        }
        throw new RuntimeError('in 运算符需要数组、字符串或对象', expr.loc?.line ?? 0, 0);

      default:
        throw new RuntimeError(`未知的运算符: ${expr.operator}`, expr.loc?.line ?? 0, 0);
    }
  }

  private evaluateUnaryOp(expr: UnaryOp): Value {
    const operand = this.evaluateExpression(expr.operand);

    switch (expr.operator) {
      case '-':
        if (typeof operand === 'number') return -operand;
        throw new RuntimeError('负号需要数字', expr.loc?.line ?? 0, 0);

      case 'not':
        return !this.isTruthy(operand);

      default:
        throw new RuntimeError(`未知的运算符: ${expr.operator}`, expr.loc?.line ?? 0, 0);
    }
  }

  private evaluateCall(expr: CallExpression): Value {
    const callee = expr.callee;
    const args = expr.arguments.map((arg) => this.evaluateExpression(arg));

    // Check for command (side effect, returns null)
    if (this.commandHandlers.has(callee)) {
      this.commandHandlers.get(callee)!(args);
      return null;
    }

    // Check for sensor (returns boolean)
    if (this.sensorHandlers.has(callee)) {
      return this.sensorHandlers.get(callee)!(args);
    }

    // Check for user-defined function
    if (this.functions.has(callee)) {
      return this.callUserFunction(callee, args);
    }

    // Built-in functions
    if (callee === 'print' || callee === '打印') {
      const str = args.map((a) => this.valueToString(a)).join(' ');
      this.output.push(str);
      return null;
    }

    // len() - get length of array or string
    if (callee === 'len' || callee === '长度') {
      if (args.length !== 1) {
        throw new RuntimeError('len() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const arg = args[0];
      if (Array.isArray(arg)) {
        return arg.length;
      }
      if (typeof arg === 'string') {
        return arg.length;
      }
      throw new RuntimeError('len() 只支持数组和字符串', expr.loc?.line ?? 0, 0);
    }

    // random() - return random float between 0 and 1
    if (callee === 'random' || callee === '随机') {
      return Math.random();
    }

    // randint(min, max) - return random integer between min and max (inclusive)
    if (callee === 'randint' || callee === '随机整数') {
      if (args.length !== 2) {
        throw new RuntimeError('randint() 需要2个参数: randint(min, max)', expr.loc?.line ?? 0, 0);
      }
      const min = args[0];
      const max = args[1];
      if (typeof min !== 'number' || typeof max !== 'number') {
        throw new RuntimeError('randint() 参数必须是数字', expr.loc?.line ?? 0, 0);
      }
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new RuntimeError('randint() 参数必须是整数', expr.loc?.line ?? 0, 0);
      }
      if (min > max) {
        throw new RuntimeError(
          'randint() 第一个参数必须小于等于第二个参数',
          expr.loc?.line ?? 0,
          0
        );
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // append(array, value) - add value to end of array
    if (callee === 'append' || callee === '添加') {
      if (args.length !== 2) {
        throw new RuntimeError(
          'append() 需要2个参数: append(array, value)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const arr = args[0];
      const value = args[1];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('append() 第一个参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      arr.push(value);
      return null;
    }

    // pop(array) - remove and return last element
    if (callee === 'pop' || callee === '弹出') {
      if (args.length !== 1) {
        throw new RuntimeError('pop() 需要1个参数: pop(array)', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('pop() 参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      if (arr.length === 0) {
        throw new RuntimeError('不能从空数组弹出元素', expr.loc?.line ?? 0, 0);
      }
      return arr.pop()!;
    }

    // insert(array, index, value) - insert value at index
    if (callee === 'insert' || callee === '插入') {
      if (args.length !== 3) {
        throw new RuntimeError(
          'insert() 需要3个参数: insert(array, index, value)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const arr = args[0];
      const index = args[1];
      const value = args[2];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('insert() 第一个参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      if (typeof index !== 'number' || !Number.isInteger(index)) {
        throw new RuntimeError('insert() 第二个参数必须是整数', expr.loc?.line ?? 0, 0);
      }
      if (index < 0 || index > arr.length) {
        throw new RuntimeError(
          `insert() 索引 ${index} 超出范围 (0-${arr.length})`,
          expr.loc?.line ?? 0,
          0
        );
      }
      arr.splice(index, 0, value);
      return null;
    }

    // sort(array) - sort array in place
    if (callee === 'sort' || callee === '排序') {
      if (args.length !== 1) {
        throw new RuntimeError('sort() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('sort() 参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      arr.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
      return null;
    }

    // reverse(array) - reverse array in place
    if (callee === 'reverse' || callee === '反转') {
      if (args.length !== 1) {
        throw new RuntimeError('reverse() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('reverse() 参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      arr.reverse();
      return null;
    }

    // index(array, value) - find index of value in array, returns -1 if not found
    if (callee === 'index' || callee === '索引') {
      if (args.length !== 2) {
        throw new RuntimeError('index() 需要2个参数: index(array, value)', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      const value = args[1];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('index() 第一个参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      return arr.indexOf(value);
    }

    // count(array, value) - count occurrences of value in array
    if (callee === 'count' || callee === '计数') {
      if (args.length !== 2) {
        throw new RuntimeError('count() 需要2个参数: count(array, value)', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      const value = args[1];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('count() 第一个参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      return arr.filter((x) => x === value).length;
    }

    // clear(array) - remove all elements from array
    if (callee === 'clear' || callee === '清空') {
      if (args.length !== 1) {
        throw new RuntimeError('clear() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('clear() 参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      arr.length = 0;
      return null;
    }

    // abs(x) - absolute value
    if (callee === 'abs' || callee === '绝对值') {
      if (args.length !== 1) {
        throw new RuntimeError('abs() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const x = args[0];
      if (typeof x !== 'number') {
        throw new RuntimeError('abs() 参数必须是数字', expr.loc?.line ?? 0, 0);
      }
      return Math.abs(x);
    }

    // min(...args) - minimum value
    if (callee === 'min' || callee === '最小值') {
      if (args.length === 0) {
        throw new RuntimeError('min() 需要至少1个参数', expr.loc?.line ?? 0, 0);
      }
      // If single array argument, find min of array
      if (args.length === 1 && Array.isArray(args[0])) {
        const arr = args[0] as Value[];
        if (arr.length === 0) {
          throw new RuntimeError('min() 不能对空数组求最小值', expr.loc?.line ?? 0, 0);
        }
        let minVal = arr[0] as number;
        for (const v of arr) {
          if (typeof v !== 'number') {
            throw new RuntimeError('min() 数组元素必须是数字', expr.loc?.line ?? 0, 0);
          }
          if (v < minVal) minVal = v;
        }
        return minVal;
      }
      // Multiple arguments
      let minVal = args[0] as number;
      for (const v of args) {
        if (typeof v !== 'number') {
          throw new RuntimeError('min() 参数必须是数字', expr.loc?.line ?? 0, 0);
        }
        if (v < minVal) minVal = v;
      }
      return minVal;
    }

    // max(...args) - maximum value
    if (callee === 'max' || callee === '最大值') {
      if (args.length === 0) {
        throw new RuntimeError('max() 需要至少1个参数', expr.loc?.line ?? 0, 0);
      }
      // If single array argument, find max of array
      if (args.length === 1 && Array.isArray(args[0])) {
        const arr = args[0] as Value[];
        if (arr.length === 0) {
          throw new RuntimeError('max() 不能对空数组求最大值', expr.loc?.line ?? 0, 0);
        }
        let maxVal = arr[0] as number;
        for (const v of arr) {
          if (typeof v !== 'number') {
            throw new RuntimeError('max() 数组元素必须是数字', expr.loc?.line ?? 0, 0);
          }
          if (v > maxVal) maxVal = v;
        }
        return maxVal;
      }
      // Multiple arguments
      let maxVal = args[0] as number;
      for (const v of args) {
        if (typeof v !== 'number') {
          throw new RuntimeError('max() 参数必须是数字', expr.loc?.line ?? 0, 0);
        }
        if (v > maxVal) maxVal = v;
      }
      return maxVal;
    }

    // sum(array) - sum of array elements
    if (callee === 'sum' || callee === '求和') {
      if (args.length !== 1) {
        throw new RuntimeError('sum() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('sum() 参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      let total = 0;
      for (const v of arr) {
        if (typeof v !== 'number') {
          throw new RuntimeError('sum() 数组元素必须是数字', expr.loc?.line ?? 0, 0);
        }
        total += v;
      }
      return total;
    }

    // int(x) - convert to integer
    if (callee === 'int' || callee === '整数') {
      if (args.length !== 1) {
        throw new RuntimeError('int() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const x = args[0];
      if (typeof x === 'number') {
        return Math.trunc(x);
      }
      if (typeof x === 'string') {
        const parsed = parseInt(x, 10);
        if (isNaN(parsed)) {
          throw new RuntimeError(`无法将 "${x}" 转换为整数`, expr.loc?.line ?? 0, 0);
        }
        return parsed;
      }
      if (typeof x === 'boolean') {
        return x ? 1 : 0;
      }
      throw new RuntimeError('int() 只支持数字、字符串和布尔值', expr.loc?.line ?? 0, 0);
    }

    // float(x) - convert to float
    if (callee === 'float' || callee === '浮点数') {
      if (args.length !== 1) {
        throw new RuntimeError('float() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const x = args[0];
      if (typeof x === 'number') {
        return x;
      }
      if (typeof x === 'string') {
        const parsed = parseFloat(x);
        if (isNaN(parsed)) {
          throw new RuntimeError(`无法将 "${x}" 转换为浮点数`, expr.loc?.line ?? 0, 0);
        }
        return parsed;
      }
      if (typeof x === 'boolean') {
        return x ? 1.0 : 0.0;
      }
      throw new RuntimeError('float() 只支持数字、字符串和布尔值', expr.loc?.line ?? 0, 0);
    }

    // str(x) - convert to string
    if (callee === 'str' || callee === '字符串') {
      if (args.length !== 1) {
        throw new RuntimeError('str() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      return this.valueToString(args[0]);
    }

    // upper(s) - convert string to uppercase
    if (callee === 'upper' || callee === '大写') {
      if (args.length !== 1) {
        throw new RuntimeError('upper() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const s = args[0];
      if (typeof s !== 'string') {
        throw new RuntimeError('upper() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.toUpperCase();
    }

    // lower(s) - convert string to lowercase
    if (callee === 'lower' || callee === '小写') {
      if (args.length !== 1) {
        throw new RuntimeError('lower() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const s = args[0];
      if (typeof s !== 'string') {
        throw new RuntimeError('lower() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.toLowerCase();
    }

    // split(s, sep?) - split string into array
    if (callee === 'split' || callee === '分割') {
      if (args.length < 1 || args.length > 2) {
        throw new RuntimeError(
          'split() 需要1-2个参数: split(string, separator?)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const s = args[0];
      if (typeof s !== 'string') {
        throw new RuntimeError('split() 第一个参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      if (args.length === 1) {
        // Split on whitespace
        return s.split(/\s+/).filter((x) => x.length > 0);
      }
      const sep = args[1];
      if (typeof sep !== 'string') {
        throw new RuntimeError('split() 第二个参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.split(sep);
    }

    // join(arr, sep?) - join array into string
    if (callee === 'join' || callee === '连接') {
      if (args.length < 1 || args.length > 2) {
        throw new RuntimeError(
          'join() 需要1-2个参数: join(array, separator?)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const arr = args[0];
      if (!Array.isArray(arr)) {
        throw new RuntimeError('join() 第一个参数必须是数组', expr.loc?.line ?? 0, 0);
      }
      const sep = args.length === 2 ? String(args[1]) : '';
      return arr.map((v) => this.valueToString(v)).join(sep);
    }

    // strip(s) - remove whitespace from both ends
    if (callee === 'strip' || callee === '去空格') {
      if (args.length !== 1) {
        throw new RuntimeError('strip() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const s = args[0];
      if (typeof s !== 'string') {
        throw new RuntimeError('strip() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.trim();
    }

    // replace(s, old, new) - replace all occurrences of old with new
    if (callee === 'replace' || callee === '替换') {
      if (args.length !== 3) {
        throw new RuntimeError(
          'replace() 需要3个参数: replace(string, old, new)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const s = args[0];
      const oldStr = args[1];
      const newStr = args[2];
      if (typeof s !== 'string' || typeof oldStr !== 'string' || typeof newStr !== 'string') {
        throw new RuntimeError('replace() 所有参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.split(oldStr).join(newStr);
    }

    // find(s, sub) - find index of substring, returns -1 if not found
    if (callee === 'find' || callee === '查找') {
      if (args.length !== 2) {
        throw new RuntimeError(
          'find() 需要2个参数: find(string, substring)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const s = args[0];
      const sub = args[1];
      if (typeof s !== 'string' || typeof sub !== 'string') {
        throw new RuntimeError('find() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.indexOf(sub);
    }

    // startswith(s, prefix) - check if string starts with prefix
    if (callee === 'startswith' || callee === '以开头') {
      if (args.length !== 2) {
        throw new RuntimeError(
          'startswith() 需要2个参数: startswith(string, prefix)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const s = args[0];
      const prefix = args[1];
      if (typeof s !== 'string' || typeof prefix !== 'string') {
        throw new RuntimeError('startswith() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.startsWith(prefix);
    }

    // endswith(s, suffix) - check if string ends with suffix
    if (callee === 'endswith' || callee === '以结尾') {
      if (args.length !== 2) {
        throw new RuntimeError(
          'endswith() 需要2个参数: endswith(string, suffix)',
          expr.loc?.line ?? 0,
          0
        );
      }
      const s = args[0];
      const suffix = args[1];
      if (typeof s !== 'string' || typeof suffix !== 'string') {
        throw new RuntimeError('endswith() 参数必须是字符串', expr.loc?.line ?? 0, 0);
      }
      return s.endsWith(suffix);
    }

    // round(x, digits?) - round to n decimal places
    if (callee === 'round' || callee === '四舍五入') {
      if (args.length < 1 || args.length > 2) {
        throw new RuntimeError('round() 需要1-2个参数: round(x, digits?)', expr.loc?.line ?? 0, 0);
      }
      const x = args[0];
      if (typeof x !== 'number') {
        throw new RuntimeError('round() 第一个参数必须是数字', expr.loc?.line ?? 0, 0);
      }
      if (args.length === 1) {
        return Math.round(x);
      }
      const digits = args[1];
      if (typeof digits !== 'number' || !Number.isInteger(digits) || digits < 0) {
        throw new RuntimeError('round() 第二个参数必须是非负整数', expr.loc?.line ?? 0, 0);
      }
      const factor = Math.pow(10, digits);
      return Math.round(x * factor) / factor;
    }

    // sqrt(x) - square root
    if (callee === 'sqrt' || callee === '平方根') {
      if (args.length !== 1) {
        throw new RuntimeError('sqrt() 需要1个参数', expr.loc?.line ?? 0, 0);
      }
      const x = args[0];
      if (typeof x !== 'number') {
        throw new RuntimeError('sqrt() 参数必须是数字', expr.loc?.line ?? 0, 0);
      }
      if (x < 0) {
        throw new RuntimeError('sqrt() 参数不能是负数', expr.loc?.line ?? 0, 0);
      }
      return Math.sqrt(x);
    }

    // pow(base, exp) - power
    if (callee === 'pow' || callee === '幂') {
      if (args.length !== 2) {
        throw new RuntimeError('pow() 需要2个参数: pow(base, exponent)', expr.loc?.line ?? 0, 0);
      }
      const base = args[0];
      const exp = args[1];
      if (typeof base !== 'number' || typeof exp !== 'number') {
        throw new RuntimeError('pow() 参数必须是数字', expr.loc?.line ?? 0, 0);
      }
      return Math.pow(base, exp);
    }

    throw new RuntimeError(
      `未定义的函数: ${callee}`,
      expr.loc?.line ?? 0,
      0,
      '检查函数名是否正确，或者是否已经定义了这个函数'
    );
  }

  private callUserFunction(name: string, args: Value[]): Value {
    const func = this.functions.get(name)!;

    if (args.length !== func.params.length) {
      throw new RuntimeError(
        `函数 ${name} 需要 ${func.params.length} 个参数，但传入了 ${args.length} 个`,
        0,
        0
      );
    }

    // Create new frame
    const locals = new Map<string, Value>();
    for (let i = 0; i < func.params.length; i++) {
      locals.set(func.params[i], args[i]);
    }

    // For synchronous execution, we need to execute the function immediately
    // This is a simplified version - for step-by-step, we'd push a frame
    const frame: StackFrame = {
      functionName: name,
      locals,
      statements: func.body,
      statementIndex: 0,
    };

    // Execute function body synchronously
    const savedStack = this.callStack;
    this.callStack = [frame];

    while (frame.statementIndex < frame.statements.length && !frame.hasReturned) {
      const stmt = frame.statements[frame.statementIndex];
      this.executeStatementSync(stmt, frame);
    }

    this.callStack = savedStack;

    return frame.returnValue ?? null;
  }

  private executeStatementSync(stmt: Statement, frame: StackFrame): void {
    switch (stmt.type) {
      case 'ExpressionStatement':
        this.evaluateExpression(stmt.expression);
        frame.statementIndex++;
        break;

      case 'Assignment': {
        const value = this.evaluateExpression(stmt.value);
        frame.locals.set(stmt.target, value);
        frame.statementIndex++;
        break;
      }

      case 'AugmentedAssignment': {
        const currentValue = frame.locals.has(stmt.target)
          ? frame.locals.get(stmt.target)!
          : this.globals.get(stmt.target);
        const operand = this.evaluateExpression(stmt.value);
        let newValue: Value;
        switch (stmt.operator) {
          case '+=':
            if (typeof currentValue === 'number' && typeof operand === 'number') {
              newValue = currentValue + operand;
            } else {
              newValue = String(currentValue) + String(operand);
            }
            break;
          case '-=':
            newValue = (currentValue as number) - (operand as number);
            break;
          case '*=':
            if (typeof currentValue === 'string' && typeof operand === 'number') {
              newValue = currentValue.repeat(operand);
            } else {
              newValue = (currentValue as number) * (operand as number);
            }
            break;
          case '/=':
            newValue = (currentValue as number) / (operand as number);
            break;
          default:
            newValue = currentValue!;
        }
        frame.locals.set(stmt.target, newValue);
        frame.statementIndex++;
        break;
      }

      case 'IndexedAssignment': {
        const obj = this.evaluateExpression(stmt.object);
        const index = this.evaluateExpression(stmt.index);
        const value = this.evaluateExpression(stmt.value);

        if (Array.isArray(obj)) {
          if (
            typeof index === 'number' &&
            Number.isInteger(index) &&
            index >= 0 &&
            index < obj.length
          ) {
            obj[index] = value;
          }
        } else if (this.isObject(obj)) {
          (obj as ObjectValue)[String(index)] = value;
        }
        frame.statementIndex++;
        break;
      }

      case 'IfStatement': {
        const condition = this.evaluateExpression(stmt.condition);
        let branch: Statement[] | null = null;

        if (this.isTruthy(condition)) {
          branch = stmt.consequent;
        } else if (stmt.elifBranches && stmt.elifBranches.length > 0) {
          for (const elifBranch of stmt.elifBranches) {
            const elifCondition = this.evaluateExpression(elifBranch.condition);
            if (this.isTruthy(elifCondition)) {
              branch = elifBranch.consequent;
              break;
            }
          }
          if (!branch && stmt.alternate) {
            branch = stmt.alternate;
          }
        } else if (stmt.alternate) {
          branch = stmt.alternate;
        }

        if (branch) {
          for (const s of branch) {
            this.executeStatementSync(s, frame);
            if (frame.hasReturned) return;
          }
        }
        frame.statementIndex++;
        break;
      }

      case 'RepeatStatement':
        const count = this.evaluateExpression(stmt.count) as number;
        for (let i = 0; i < count; i++) {
          for (const s of stmt.body) {
            this.executeStatementSync(s, frame);
            if (frame.hasReturned) return;
          }
        }
        frame.statementIndex++;
        break;

      case 'WhileStatement':
        while (this.isTruthy(this.evaluateExpression(stmt.condition))) {
          for (const s of stmt.body) {
            this.executeStatementSync(s, frame);
            if (frame.hasReturned || frame.shouldBreak) break;
            if (frame.shouldContinue) {
              frame.shouldContinue = false;
              break;
            }
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
        }
        frame.statementIndex++;
        break;

      case 'ForStatement': {
        const start = this.evaluateExpression(stmt.start) as number;
        const end = this.evaluateExpression(stmt.end) as number;
        const step = stmt.step ? (this.evaluateExpression(stmt.step) as number) : 1;

        for (let i = start; step > 0 ? i < end : i > end; i += step) {
          frame.locals.set(stmt.variable, i);
          for (const s of stmt.body) {
            this.executeStatementSync(s, frame);
            if (frame.hasReturned || frame.shouldBreak) break;
            if (frame.shouldContinue) {
              frame.shouldContinue = false;
              break;
            }
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
        }
        frame.statementIndex++;
        break;
      }

      case 'ForEachStatement': {
        const iterable = this.evaluateExpression(stmt.iterable);
        let items: Value[];
        if (Array.isArray(iterable)) {
          items = iterable;
        } else if (typeof iterable === 'string') {
          items = iterable.split('');
        } else {
          throw new RuntimeError('只能对数组或字符串进行迭代', stmt.loc?.line ?? 0, 0);
        }

        for (const item of items) {
          frame.locals.set(stmt.variable, item);
          for (const s of stmt.body) {
            this.executeStatementSync(s, frame);
            if (frame.hasReturned || frame.shouldBreak) break;
            if (frame.shouldContinue) {
              frame.shouldContinue = false;
              break;
            }
          }
          if (frame.shouldBreak) {
            frame.shouldBreak = false;
            break;
          }
        }
        frame.statementIndex++;
        break;
      }

      case 'BreakStatement':
        frame.shouldBreak = true;
        break;

      case 'ContinueStatement':
        frame.shouldContinue = true;
        break;

      case 'PassStatement':
        // Pass does nothing - just move to next statement
        frame.statementIndex++;
        break;

      case 'ReturnStatement':
        frame.returnValue = stmt.value ? this.evaluateExpression(stmt.value) : null;
        frame.hasReturned = true;
        break;

      default:
        frame.statementIndex++;
    }
  }

  // ============ Variable Management ============

  private getVariable(name: string): Value {
    // Check local scope first
    if (this.callStack.length > 0) {
      const frame = this.currentFrame();
      if (frame.locals.has(name)) {
        return frame.locals.get(name)!;
      }
    }

    // Check globals
    if (this.globals.has(name)) {
      return this.globals.get(name)!;
    }

    throw new RuntimeError(
      `变量 "${name}" 还没有定义`,
      0,
      0,
      `在使用变量之前，需要先给它赋值，例如：${name} = 0`
    );
  }

  private setVariable(name: string, value: Value): void {
    // If in function, set local
    if (this.callStack.length > 0) {
      const frame = this.currentFrame();
      if (frame.functionName !== null || frame.locals.has(name)) {
        frame.locals.set(name, value);
        return;
      }
    }

    // Otherwise set global
    this.globals.set(name, value);
  }

  // ============ Helpers ============

  private currentFrame(): StackFrame {
    return this.callStack[this.callStack.length - 1];
  }

  private getCurrentLine(): number | null {
    if (this.callStack.length === 0) return null;
    const frame = this.currentFrame();
    if (frame.statementIndex >= frame.statements.length) return null;
    return frame.statements[frame.statementIndex].loc?.line ?? null;
  }

  private isTruthy(value: Value): boolean {
    if (value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  // Convert value to string for printing
  private valueToString(value: Value): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      // Use comma-separated format (consistent with JavaScript's String conversion)
      return value.map((v) => this.valueToString(v)).join(',');
    }
    if (typeof value === 'object' && !('type' in value)) {
      // It's an ObjectValue
      const entries = Object.entries(value as ObjectValue);
      const parts = entries.map(([k, v]) => `${k}: ${this.valueToString(v)}`);
      return '{' + parts.join(', ') + '}';
    }
    return String(value);
  }

  // Check if a value is an object (not array, not function)
  private isObject(value: Value): value is ObjectValue {
    return (
      typeof value === 'object' && value !== null && !Array.isArray(value) && !('type' in value)
    );
  }
}
