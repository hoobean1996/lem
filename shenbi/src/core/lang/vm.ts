/**
 * Mini Python Virtual Machine
 *
 * A simple stack-based VM that executes compiled IR instructions.
 * Supports step-by-step execution with just a program counter.
 */

import { Value, CompiledProgram, Instruction, parseCallArg, Instance, isInstance } from './ir';
import { RuntimeError } from './errors';
import { error as logError } from '../../infrastructure/logging';
import { tokenize } from './lexer';
import { parse } from './parser';
import { compileToIR } from './compiler';

// ============ VM State ============

export type VMStatus = 'ready' | 'running' | 'paused' | 'completed' | 'error' | 'waiting';

export interface VMState {
  status: VMStatus;
  pc: number; // Program counter
  stack: Value[]; // Operand stack
  globals: Map<string, Value>; // Global variables
  callStack: CallFrame[]; // For user function calls
  error: string | null;
  currentLine: number | null;
}

interface CallFrame {
  returnAddress: number;
  locals: Map<string, Value>;
  functionName: string;
  callLine: number | null;
}

// Snapshot for step-back debugging
export interface VMSnapshot {
  pc: number;
  stack: Value[];
  globals: Map<string, Value>;
  callStack: CallFrame[];
  stepCount: number;
}

// ============ Step Result ============

export interface VMStepResult {
  done: boolean;
  action: string | null; // Command name if a command was called
  actionArgs: Value[]; // Arguments passed to command
  sensorQuery: string | null; // Sensor name if a sensor was queried
  highlightLine: number | null;
}

// ============ Execution Visualization ============

export interface ExecutionVisualization {
  currentLine: number | null;
  currentInstruction: string | null;
  stack: Value[];
  variables: Record<string, Value>;
  watchedVariables: Record<string, Value | undefined>;
  callStack: Array<{ name: string; line: number; locals: Record<string, Value> }>;
  canStepBack: boolean;
  historyLength: number;
  breakpoints: number[];
  status: VMStatus;
}

// ============ External Handlers ============

export type CommandHandler = (args: Value[]) => void;
export type SensorHandler = (args: Value[]) => Value;

// ============ Virtual Machine ============

export class VM {
  private program: CompiledProgram | null = null;
  private pc: number = 0;
  private stack: Value[] = [];
  private globals: Map<string, Value> = new Map();
  private callStack: CallFrame[] = [];
  private status: VMStatus = 'ready';
  private error: string | null = null;

  private commandHandlers: Map<string, CommandHandler> = new Map();
  private sensorHandlers: Map<string, SensorHandler> = new Map();

  // Class registry: maps class name to list of method names
  private classes: Map<string, string[]> = new Map();

  // Execution limits
  private stepCount: number = 0;
  private maxSteps: number = 100000;

  // Debugging features
  private watchedVariables: Set<string> = new Set();
  private breakpoints: Set<number> = new Set(); // Line numbers
  private stateHistory: VMSnapshot[] = [];
  private maxHistorySize: number = 1000;

  // ============ Configuration ============

  registerCommand(name: string, handler: CommandHandler): void {
    this.commandHandlers.set(name, handler);
  }

  registerSensor(name: string, handler: SensorHandler): void {
    this.sensorHandlers.set(name, handler);
  }

  /**
   * Set a global variable (for injecting shared state from TypeScript)
   * This allows TypeScript to share objects with MiniPython code
   */
  setGlobal(name: string, value: Value): void {
    this.globals.set(name, value);
  }

  /**
   * Get a global variable (for reading state from TypeScript)
   * Returns undefined if the variable doesn't exist
   */
  getGlobal(name: string): Value | undefined {
    return this.globals.get(name);
  }

  // ============ Program Loading ============

  load(program: CompiledProgram): void {
    this.program = program;
    this.reset();
    this.status = 'ready';
  }

  reset(): void {
    this.pc = 0;
    this.stack = [];
    this.globals = new Map();
    this.callStack = [];
    this.classes = new Map();
    this.status = 'ready';
    this.error = null;
    this.stepCount = 0;
    this.stateHistory = [];
    // Note: watchedVariables and breakpoints are NOT reset - they persist across runs
  }

  // ============ Expression Evaluation ============

  /**
   * Evaluate an expression string and return the result.
   * This is useful for evaluating win/fail conditions using the current VM state.
   * The expression runs in a temporary context and doesn't affect the main program.
   *
   * @param source - Expression to evaluate (e.g., "remainingStars() == 0 and atGoal()")
   * @returns The result of the expression, or null if evaluation failed
   */
  evaluateExpression(source: string): Value {
    try {
      // Compile the expression
      const tokens = tokenize(source);
      const ast = parse(tokens);
      const compiled = compileToIR(ast);

      // Save current state
      const savedPc = this.pc;
      const savedStack = [...this.stack];
      const savedStatus = this.status;
      const savedCallStack = [...this.callStack];
      const savedStepCount = this.stepCount;
      const savedError = this.error;

      // Run the expression program
      this.pc = 0;
      this.stack = [];
      this.callStack = [];
      this.status = 'ready';
      this.error = null;
      this.stepCount = 0;

      // Execute expression (use temporary program)
      const savedProgram = this.program;
      this.program = compiled;

      // Run to completion (with step limit for safety)
      let steps = 0;
      const maxSteps = 10000;
      // Use type assertion to avoid TS narrowing issue - status changes during stepWithoutHistory
      while (
        (this.status as VMStatus) !== 'completed' &&
        (this.status as VMStatus) !== 'error' &&
        steps < maxSteps
      ) {
        this.stepWithoutHistory();
        steps++;
      }

      // Check for runtime errors (use type assertion - status changed during loop)
      if ((this.status as VMStatus) === 'error' && this.error) {
        console.error('[VM] Expression error:', this.error);
      }

      // Get result from stack
      const result = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;

      // Restore original state
      this.program = savedProgram;
      this.pc = savedPc;
      this.stack = savedStack;
      this.status = savedStatus;
      this.callStack = savedCallStack;
      this.stepCount = savedStepCount;
      this.error = savedError;

      return result;
    } catch (error) {
      logError('Expression evaluation error', error, undefined, 'VM');
      return null;
    }
  }

  /**
   * Execute a single instruction without saving to history.
   * Used internally for expression evaluation.
   */
  private stepWithoutHistory(): VMStepResult {
    if (!this.program) {
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    if (this.status === 'completed' || this.status === 'error') {
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    this.status = 'running';

    if (this.pc >= this.program.instructions.length) {
      this.status = 'completed';
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    const inst = this.program.instructions[this.pc];

    try {
      return this.executeInstruction(inst);
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      this.status = 'error';
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }
  }

  // ============ Execution Control ============

  /**
   * Execute a single instruction
   */
  step(): VMStepResult {
    if (!this.program) {
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    if (this.status === 'completed' || this.status === 'error') {
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    // Save snapshot before executing (for step-back)
    this.saveSnapshot();

    this.status = 'running';
    this.stepCount++;

    if (this.stepCount > this.maxSteps) {
      this.error = '程序执行步数过多，可能存在无限循环';
      this.status = 'error';
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    if (this.pc >= this.program.instructions.length) {
      this.status = 'completed';
      return { done: true, action: null, actionArgs: [], sensorQuery: null, highlightLine: null };
    }

    const inst = this.program.instructions[this.pc];

    try {
      return this.executeInstruction(inst);
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      this.status = 'error';
      return {
        done: true,
        action: null,
        actionArgs: [],
        sensorQuery: null,
        highlightLine: inst.sourceLine ?? null,
      };
    }
  }

  /**
   * Run until completion, command call, or error
   */
  run(): VMStepResult {
    while (true) {
      const result = this.step();
      if (result.done || result.action !== null) {
        return result;
      }
    }
  }

  /**
   * Run all steps, collecting command actions
   */
  runAll(): VMStepResult[] {
    const results: VMStepResult[] = [];
    while (true) {
      const result = this.step();
      if (result.action !== null) {
        results.push(result);
      }
      if (result.done) {
        break;
      }
    }
    return results;
  }

  /**
   * Run until a breakpoint is hit, program completes, or error occurs
   * Returns the step result and whether a breakpoint was hit
   */
  runUntilBreakpoint(): { result: VMStepResult; hitBreakpoint: boolean } {
    let hitBreakpoint = false;

    while (true) {
      const result = this.step();

      // Check if we hit a breakpoint on the next line to execute
      const currentLine = this.getCurrentLine();
      if (currentLine !== null && this.breakpoints.has(currentLine)) {
        this.status = 'paused';
        hitBreakpoint = true;
        return { result, hitBreakpoint };
      }

      if (result.done || result.action !== null) {
        return { result, hitBreakpoint: false };
      }
    }
  }

  /**
   * Continue execution after hitting a breakpoint
   * Skips the current breakpoint and runs until the next one
   */
  continueExecution(): { result: VMStepResult; hitBreakpoint: boolean } {
    // First, step past the current line to avoid immediately hitting the same breakpoint
    if (this.status === 'paused') {
      this.status = 'running';
      const currentLine = this.getCurrentLine();

      // Step until we're on a different line
      while (true) {
        const result = this.step();
        if (result.done) {
          return { result, hitBreakpoint: false };
        }
        const newLine = this.getCurrentLine();
        if (newLine !== currentLine) {
          break;
        }
      }
    }

    // Now run until the next breakpoint
    return this.runUntilBreakpoint();
  }

  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  // ============ State Access ============

  getState(): VMState {
    return {
      status: this.status,
      pc: this.pc,
      stack: [...this.stack],
      globals: new Map(this.globals),
      callStack: this.callStack.map((f) => ({
        returnAddress: f.returnAddress,
        locals: new Map(f.locals),
        functionName: f.functionName,
        callLine: f.callLine,
      })),
      error: this.error,
      currentLine: this.getCurrentLine(),
    };
  }

  /**
   * Get call stack for visualization
   * Returns array of frames with function name, current line, and local variables
   */
  getCallStackForVisualization(): Array<{
    name: string;
    line: number;
    locals: Record<string, Value>;
  }> {
    const result: Array<{ name: string; line: number; locals: Record<string, Value> }> = [];

    // Add main frame if we have globals
    if (this.globals.size > 0 || this.callStack.length === 0) {
      const mainLocals: Record<string, Value> = {};
      // Only show globals in main frame if no functions are called
      if (this.callStack.length === 0) {
        for (const [name, value] of this.globals) {
          mainLocals[name] = value;
        }
      }
      result.push({
        name: '<main>',
        line: this.callStack.length === 0 ? (this.getCurrentLine() ?? 1) : 1,
        locals: mainLocals,
      });
    }

    // Add function call frames
    for (let i = 0; i < this.callStack.length; i++) {
      const frame = this.callStack[i];
      const locals: Record<string, Value> = {};
      for (const [name, value] of frame.locals) {
        locals[name] = value;
      }

      // For current frame (last one), use current line; otherwise use call line
      const isCurrentFrame = i === this.callStack.length - 1;
      const line = isCurrentFrame
        ? (this.getCurrentLine() ?? frame.callLine ?? 1)
        : (frame.callLine ?? 1);

      result.push({
        name: frame.functionName,
        line,
        locals,
      });
    }

    return result;
  }

  getCurrentLine(): number | null {
    if (!this.program || this.pc >= this.program.instructions.length) {
      return null;
    }
    return this.program.instructions[this.pc].sourceLine ?? null;
  }

  getVariables(): Record<string, Value> {
    const vars: Record<string, Value> = {};
    for (const [name, value] of this.globals) {
      vars[name] = value;
    }
    // Include current frame locals
    if (this.callStack.length > 0) {
      const frame = this.callStack[this.callStack.length - 1];
      for (const [name, value] of frame.locals) {
        vars[name] = value;
      }
    }
    return vars;
  }

  /**
   * Get comprehensive execution visualization info
   * Useful for debugger UI to show all relevant state at once
   */
  getExecutionVisualization(): ExecutionVisualization {
    // Get current instruction description
    let currentInstruction: string | null = null;
    if (this.program && this.pc < this.program.instructions.length) {
      const inst = this.program.instructions[this.pc];
      currentInstruction = inst.arg !== undefined ? `${inst.op} ${inst.arg}` : inst.op;
    }

    return {
      currentLine: this.getCurrentLine(),
      currentInstruction,
      stack: [...this.stack],
      variables: this.getVariables(),
      watchedVariables: this.getWatchedValues(),
      callStack: this.getCallStackForVisualization(),
      canStepBack: this.stateHistory.length > 0,
      historyLength: this.stateHistory.length,
      breakpoints: this.getBreakpoints(),
      status: this.status,
    };
  }

  // ============ Variable Watch ============

  /**
   * Add a variable to the watch list
   */
  addWatch(name: string): void {
    this.watchedVariables.add(name);
  }

  /**
   * Remove a variable from the watch list
   */
  removeWatch(name: string): void {
    this.watchedVariables.delete(name);
  }

  /**
   * Clear all watched variables
   */
  clearWatch(): void {
    this.watchedVariables.clear();
  }

  /**
   * Get list of watched variable names
   */
  getWatchList(): string[] {
    return [...this.watchedVariables];
  }

  /**
   * Get values of watched variables only
   * Returns object with variable names and their current values (or undefined if not set)
   */
  getWatchedValues(): Record<string, Value | undefined> {
    const allVars = this.getVariables();
    const watched: Record<string, Value | undefined> = {};
    for (const name of this.watchedVariables) {
      watched[name] = allVars[name];
    }
    return watched;
  }

  // ============ Breakpoints ============

  /**
   * Add a breakpoint at a specific line number
   */
  addBreakpoint(line: number): void {
    this.breakpoints.add(line);
  }

  /**
   * Remove a breakpoint from a specific line number
   */
  removeBreakpoint(line: number): void {
    this.breakpoints.delete(line);
  }

  /**
   * Toggle a breakpoint at a specific line number
   * Returns true if breakpoint was added, false if removed
   */
  toggleBreakpoint(line: number): boolean {
    if (this.breakpoints.has(line)) {
      this.breakpoints.delete(line);
      return false;
    } else {
      this.breakpoints.add(line);
      return true;
    }
  }

  /**
   * Clear all breakpoints
   */
  clearBreakpoints(): void {
    this.breakpoints.clear();
  }

  /**
   * Get all breakpoint line numbers
   */
  getBreakpoints(): number[] {
    return [...this.breakpoints].sort((a, b) => a - b);
  }

  /**
   * Check if a line has a breakpoint
   */
  hasBreakpoint(line: number): boolean {
    return this.breakpoints.has(line);
  }

  // ============ Step-Back Debugging ============

  /**
   * Save current state to history (called before each step)
   */
  private saveSnapshot(): void {
    // Deep copy the state
    const snapshot: VMSnapshot = {
      pc: this.pc,
      stack: JSON.parse(JSON.stringify(this.stack)) as Value[],
      globals: new Map(
        [...this.globals].map(([k, v]) => [k, JSON.parse(JSON.stringify(v)) as Value])
      ),
      callStack: this.callStack.map((frame) => ({
        returnAddress: frame.returnAddress,
        locals: new Map(
          [...frame.locals].map(([k, v]) => [k, JSON.parse(JSON.stringify(v)) as Value])
        ),
        functionName: frame.functionName,
        callLine: frame.callLine,
      })),
      stepCount: this.stepCount,
    };

    this.stateHistory.push(snapshot);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Step back one instruction (undo last step)
   * Returns true if successful, false if no history available
   */
  stepBack(): boolean {
    if (this.stateHistory.length === 0) {
      return false;
    }

    const snapshot = this.stateHistory.pop()!;

    // Restore state
    this.pc = snapshot.pc;
    this.stack = snapshot.stack;
    this.globals = snapshot.globals;
    this.callStack = snapshot.callStack;
    this.stepCount = snapshot.stepCount;
    this.status = 'paused';
    this.error = null;

    return true;
  }

  /**
   * Get number of steps available to go back
   */
  getHistoryLength(): number {
    return this.stateHistory.length;
  }

  /**
   * Clear step history
   */
  clearHistory(): void {
    this.stateHistory = [];
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    // Trim history if needed
    while (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  // ============ Instruction Execution ============

  private executeInstruction(inst: Instruction): VMStepResult {
    const line = inst.sourceLine ?? null;
    const baseResult: VMStepResult = {
      done: false,
      action: null,
      actionArgs: [],
      sensorQuery: null,
      highlightLine: line,
    };

    switch (inst.op) {
      // Stack manipulation
      case 'PUSH':
        this.stack.push(inst.arg as Value);
        this.pc++;
        return baseResult;

      case 'POP':
        this.stack.pop();
        this.pc++;
        return baseResult;

      case 'DUP':
        this.stack.push(this.peek());
        this.pc++;
        return baseResult;

      // Variables
      case 'LOAD':
        this.stack.push(this.getVariable(inst.arg as string));
        this.pc++;
        return baseResult;

      case 'STORE':
        this.setVariable(inst.arg as string, this.pop());
        this.pc++;
        return baseResult;

      // Arithmetic
      case 'ADD': {
        const b = this.pop();
        const a = this.pop();
        if (typeof a === 'number' && typeof b === 'number') {
          this.stack.push(a + b);
        } else if (typeof a === 'string' || typeof b === 'string') {
          this.stack.push(String(a) + String(b));
        } else {
          throw new RuntimeError('加法需要数字或字符串', line ?? 0, 0);
        }
        this.pc++;
        return baseResult;
      }

      case 'SUB': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(a - b);
        this.pc++;
        return baseResult;
      }

      case 'MUL': {
        const b = this.pop();
        const a = this.pop();
        // Number multiplication
        if (typeof a === 'number' && typeof b === 'number') {
          this.stack.push(a * b);
        }
        // String multiplication: "ab" * 3 = "ababab" or 3 * "ab" = "ababab"
        else if (typeof a === 'string' && typeof b === 'number') {
          if (!Number.isInteger(b) || b < 0) {
            throw new RuntimeError('字符串重复次数必须是非负整数', line ?? 0, 0);
          }
          this.stack.push(a.repeat(b));
        } else if (typeof a === 'number' && typeof b === 'string') {
          if (!Number.isInteger(a) || a < 0) {
            throw new RuntimeError('字符串重复次数必须是非负整数', line ?? 0, 0);
          }
          this.stack.push(b.repeat(a));
        } else {
          throw new RuntimeError('乘法需要两个数字，或字符串与整数', line ?? 0, 0);
        }
        this.pc++;
        return baseResult;
      }

      case 'DIV': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        if (b === 0) {
          throw new RuntimeError('不能除以零', line ?? 0, 0);
        }
        this.stack.push(a / b);
        this.pc++;
        return baseResult;
      }

      case 'MOD': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        if (b === 0) {
          throw new RuntimeError('不能对零取模', line ?? 0, 0);
        }
        this.stack.push(a % b);
        this.pc++;
        return baseResult;
      }

      case 'FLOOR_DIV': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        if (b === 0) {
          throw new RuntimeError('不能除以零', line ?? 0, 0);
        }
        this.stack.push(Math.floor(a / b));
        this.pc++;
        return baseResult;
      }

      case 'POW': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(Math.pow(a, b));
        this.pc++;
        return baseResult;
      }

      case 'NEG': {
        const a = this.popNumber(line);
        this.stack.push(-a);
        this.pc++;
        return baseResult;
      }

      // Comparison
      case 'EQ': {
        const b = this.pop();
        const a = this.pop();
        this.stack.push(a === b);
        this.pc++;
        return baseResult;
      }

      case 'NEQ': {
        const b = this.pop();
        const a = this.pop();
        this.stack.push(a !== b);
        this.pc++;
        return baseResult;
      }

      case 'LT': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(a < b);
        this.pc++;
        return baseResult;
      }

      case 'GT': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(a > b);
        this.pc++;
        return baseResult;
      }

      case 'LTE': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(a <= b);
        this.pc++;
        return baseResult;
      }

      case 'GTE': {
        const b = this.popNumber(line);
        const a = this.popNumber(line);
        this.stack.push(a >= b);
        this.pc++;
        return baseResult;
      }

      case 'IN': {
        const right = this.pop();
        const left = this.pop();

        // Check if left is in right (array or string)
        if (Array.isArray(right)) {
          this.stack.push(right.includes(left));
          this.pc++;
          return baseResult;
        }
        if (typeof right === 'string') {
          if (typeof left !== 'string') {
            throw new RuntimeError('字符串的 in 运算符需要字符串', line ?? 0, 0);
          }
          this.stack.push(right.includes(left));
          this.pc++;
          return baseResult;
        }
        // Check if key is in object
        if (typeof right === 'object' && right !== null) {
          this.stack.push(String(left) in right);
          this.pc++;
          return baseResult;
        }
        throw new RuntimeError('in 运算符需要数组、字符串或对象', line ?? 0, 0);
      }

      // Logical
      case 'NOT': {
        const a = this.pop();
        this.stack.push(!this.isTruthy(a));
        this.pc++;
        return baseResult;
      }

      case 'AND': {
        const b = this.pop();
        const a = this.pop();
        this.stack.push(this.isTruthy(a) && this.isTruthy(b));
        this.pc++;
        return baseResult;
      }

      case 'OR': {
        const b = this.pop();
        const a = this.pop();
        this.stack.push(this.isTruthy(a) || this.isTruthy(b));
        this.pc++;
        return baseResult;
      }

      // Control flow
      case 'JUMP':
        this.pc = inst.arg as number;
        return baseResult;

      case 'JUMP_IF': {
        const condition = this.pop();
        if (this.isTruthy(condition)) {
          this.pc = inst.arg as number;
        } else {
          this.pc++;
        }
        return baseResult;
      }

      case 'JUMP_IF_NOT': {
        const condition = this.pop();
        if (!this.isTruthy(condition)) {
          this.pc = inst.arg as number;
        } else {
          this.pc++;
        }
        return baseResult;
      }

      // Function calls
      case 'CALL': {
        const { name, argCount } = parseCallArg(inst.arg as string);
        const args = this.popN(argCount);

        // Check for command handler
        if (this.commandHandlers.has(name)) {
          const result = this.commandHandlers.get(name)!(args);
          // Push return value (or null if undefined)
          this.stack.push(result ?? null);
          this.pc++;
          return {
            ...baseResult,
            action: name,
            actionArgs: args,
          };
        }

        // Check for sensor handler
        if (this.sensorHandlers.has(name)) {
          const result = this.sensorHandlers.get(name)!(args);
          this.stack.push(result);
          this.pc++;
          return {
            ...baseResult,
            sensorQuery: name,
          };
        }

        // Built-in functions
        if (name === 'len' || name === '长度') {
          if (args.length !== 1) {
            throw new RuntimeError('len() 需要1个参数', line ?? 0, 0);
          }
          const arg = args[0];
          if (Array.isArray(arg)) {
            this.stack.push(arg.length);
          } else if (typeof arg === 'string') {
            this.stack.push(arg.length);
          } else {
            throw new RuntimeError('len() 只支持数组和字符串', line ?? 0, 0);
          }
          this.pc++;
          return baseResult;
        }

        if (name === 'print' || name === '打印') {
          // Print is a no-op in VM mode (output handled elsewhere)
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // random() - return random float between 0 and 1
        if (name === 'random' || name === '随机') {
          this.stack.push(Math.random());
          this.pc++;
          return baseResult;
        }

        // randint(min, max) - return random integer between min and max (inclusive)
        if (name === 'randint' || name === '随机整数') {
          if (args.length !== 2) {
            throw new RuntimeError('randint() 需要2个参数: randint(min, max)', line ?? 0, 0);
          }
          const min = args[0];
          const max = args[1];
          if (typeof min !== 'number' || typeof max !== 'number') {
            throw new RuntimeError('randint() 参数必须是数字', line ?? 0, 0);
          }
          if (!Number.isInteger(min) || !Number.isInteger(max)) {
            throw new RuntimeError('randint() 参数必须是整数', line ?? 0, 0);
          }
          if (min > max) {
            throw new RuntimeError('randint() 第一个参数必须小于等于第二个参数', line ?? 0, 0);
          }
          this.stack.push(Math.floor(Math.random() * (max - min + 1)) + min);
          this.pc++;
          return baseResult;
        }

        // append(array, value) - add value to end of array
        if (name === 'append' || name === '添加') {
          if (args.length !== 2) {
            throw new RuntimeError('append() 需要2个参数: append(array, value)', line ?? 0, 0);
          }
          const arr = args[0];
          const value = args[1];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('append() 第一个参数必须是数组', line ?? 0, 0);
          }
          arr.push(value);
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // pop(array) - remove and return last element
        if (name === 'pop' || name === '弹出') {
          if (args.length !== 1) {
            throw new RuntimeError('pop() 需要1个参数: pop(array)', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('pop() 参数必须是数组', line ?? 0, 0);
          }
          if (arr.length === 0) {
            throw new RuntimeError('不能从空数组弹出元素', line ?? 0, 0);
          }
          this.stack.push(arr.pop() as Value);
          this.pc++;
          return baseResult;
        }

        // insert(array, index, value) - insert value at index
        if (name === 'insert' || name === '插入') {
          if (args.length !== 3) {
            throw new RuntimeError(
              'insert() 需要3个参数: insert(array, index, value)',
              line ?? 0,
              0
            );
          }
          const arr = args[0];
          const index = args[1];
          const value = args[2];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('insert() 第一个参数必须是数组', line ?? 0, 0);
          }
          if (typeof index !== 'number' || !Number.isInteger(index)) {
            throw new RuntimeError('insert() 第二个参数必须是整数', line ?? 0, 0);
          }
          if (index < 0 || index > arr.length) {
            throw new RuntimeError(
              `insert() 索引 ${index} 超出范围 (0-${arr.length})`,
              line ?? 0,
              0
            );
          }
          arr.splice(index, 0, value);
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // sort(array) - sort array in place
        if (name === 'sort' || name === '排序') {
          if (args.length !== 1) {
            throw new RuntimeError('sort() 需要1个参数', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('sort() 参数必须是数组', line ?? 0, 0);
          }
          arr.sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') return a - b;
            return String(a).localeCompare(String(b));
          });
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // reverse(array) - reverse array in place
        if (name === 'reverse' || name === '反转') {
          if (args.length !== 1) {
            throw new RuntimeError('reverse() 需要1个参数', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('reverse() 参数必须是数组', line ?? 0, 0);
          }
          arr.reverse();
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // index(array, value) - find index of value in array, returns -1 if not found
        if (name === 'index' || name === '索引') {
          if (args.length !== 2) {
            throw new RuntimeError('index() 需要2个参数: index(array, value)', line ?? 0, 0);
          }
          const arr = args[0];
          const value = args[1];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('index() 第一个参数必须是数组', line ?? 0, 0);
          }
          this.stack.push(arr.indexOf(value));
          this.pc++;
          return baseResult;
        }

        // count(array, value) - count occurrences of value in array
        if (name === 'count' || name === '计数') {
          if (args.length !== 2) {
            throw new RuntimeError('count() 需要2个参数: count(array, value)', line ?? 0, 0);
          }
          const arr = args[0];
          const value = args[1];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('count() 第一个参数必须是数组', line ?? 0, 0);
          }
          this.stack.push(arr.filter((x) => x === value).length);
          this.pc++;
          return baseResult;
        }

        // clear(array) - remove all elements from array
        if (name === 'clear' || name === '清空') {
          if (args.length !== 1) {
            throw new RuntimeError('clear() 需要1个参数', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('clear() 参数必须是数组', line ?? 0, 0);
          }
          arr.length = 0;
          this.stack.push(null);
          this.pc++;
          return baseResult;
        }

        // abs(x) - absolute value
        if (name === 'abs' || name === '绝对值') {
          if (args.length !== 1) {
            throw new RuntimeError('abs() 需要1个参数', line ?? 0, 0);
          }
          const x = args[0];
          if (typeof x !== 'number') {
            throw new RuntimeError('abs() 参数必须是数字', line ?? 0, 0);
          }
          this.stack.push(Math.abs(x));
          this.pc++;
          return baseResult;
        }

        // min(...args) - minimum value
        if (name === 'min' || name === '最小值') {
          if (args.length === 0) {
            throw new RuntimeError('min() 需要至少1个参数', line ?? 0, 0);
          }
          // If single array argument, find min of array
          if (args.length === 1 && Array.isArray(args[0])) {
            const arr = args[0] as Value[];
            if (arr.length === 0) {
              throw new RuntimeError('min() 不能对空数组求最小值', line ?? 0, 0);
            }
            let minVal = arr[0] as number;
            for (const v of arr) {
              if (typeof v !== 'number') {
                throw new RuntimeError('min() 数组元素必须是数字', line ?? 0, 0);
              }
              if (v < minVal) minVal = v;
            }
            this.stack.push(minVal);
            this.pc++;
            return baseResult;
          }
          // Multiple arguments
          let minVal = args[0] as number;
          for (const v of args) {
            if (typeof v !== 'number') {
              throw new RuntimeError('min() 参数必须是数字', line ?? 0, 0);
            }
            if (v < minVal) minVal = v;
          }
          this.stack.push(minVal);
          this.pc++;
          return baseResult;
        }

        // max(...args) - maximum value
        if (name === 'max' || name === '最大值') {
          if (args.length === 0) {
            throw new RuntimeError('max() 需要至少1个参数', line ?? 0, 0);
          }
          // If single array argument, find max of array
          if (args.length === 1 && Array.isArray(args[0])) {
            const arr = args[0] as Value[];
            if (arr.length === 0) {
              throw new RuntimeError('max() 不能对空数组求最大值', line ?? 0, 0);
            }
            let maxVal = arr[0] as number;
            for (const v of arr) {
              if (typeof v !== 'number') {
                throw new RuntimeError('max() 数组元素必须是数字', line ?? 0, 0);
              }
              if (v > maxVal) maxVal = v;
            }
            this.stack.push(maxVal);
            this.pc++;
            return baseResult;
          }
          // Multiple arguments
          let maxVal = args[0] as number;
          for (const v of args) {
            if (typeof v !== 'number') {
              throw new RuntimeError('max() 参数必须是数字', line ?? 0, 0);
            }
            if (v > maxVal) maxVal = v;
          }
          this.stack.push(maxVal);
          this.pc++;
          return baseResult;
        }

        // sum(array) - sum of array elements
        if (name === 'sum' || name === '求和') {
          if (args.length !== 1) {
            throw new RuntimeError('sum() 需要1个参数', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('sum() 参数必须是数组', line ?? 0, 0);
          }
          let total = 0;
          for (const v of arr) {
            if (typeof v !== 'number') {
              throw new RuntimeError('sum() 数组元素必须是数字', line ?? 0, 0);
            }
            total += v;
          }
          this.stack.push(total);
          this.pc++;
          return baseResult;
        }

        // int(x) - convert to integer
        if (name === 'int' || name === '整数') {
          if (args.length !== 1) {
            throw new RuntimeError('int() 需要1个参数', line ?? 0, 0);
          }
          const x = args[0];
          if (typeof x === 'number') {
            this.stack.push(Math.trunc(x));
            this.pc++;
            return baseResult;
          }
          if (typeof x === 'string') {
            const parsed = parseInt(x, 10);
            if (isNaN(parsed)) {
              throw new RuntimeError(`无法将 "${x}" 转换为整数`, line ?? 0, 0);
            }
            this.stack.push(parsed);
            this.pc++;
            return baseResult;
          }
          if (typeof x === 'boolean') {
            this.stack.push(x ? 1 : 0);
            this.pc++;
            return baseResult;
          }
          throw new RuntimeError('int() 只支持数字、字符串和布尔值', line ?? 0, 0);
        }

        // float(x) - convert to float
        if (name === 'float' || name === '浮点数') {
          if (args.length !== 1) {
            throw new RuntimeError('float() 需要1个参数', line ?? 0, 0);
          }
          const x = args[0];
          if (typeof x === 'number') {
            this.stack.push(x);
            this.pc++;
            return baseResult;
          }
          if (typeof x === 'string') {
            const parsed = parseFloat(x);
            if (isNaN(parsed)) {
              throw new RuntimeError(`无法将 "${x}" 转换为浮点数`, line ?? 0, 0);
            }
            this.stack.push(parsed);
            this.pc++;
            return baseResult;
          }
          if (typeof x === 'boolean') {
            this.stack.push(x ? 1.0 : 0.0);
            this.pc++;
            return baseResult;
          }
          throw new RuntimeError('float() 只支持数字、字符串和布尔值', line ?? 0, 0);
        }

        // str(x) - convert to string
        if (name === 'str' || name === '字符串') {
          if (args.length !== 1) {
            throw new RuntimeError('str() 需要1个参数', line ?? 0, 0);
          }
          this.stack.push(this.valueToString(args[0]));
          this.pc++;
          return baseResult;
        }

        // upper(s) - convert string to uppercase
        if (name === 'upper' || name === '大写') {
          if (args.length !== 1) {
            throw new RuntimeError('upper() 需要1个参数', line ?? 0, 0);
          }
          const s = args[0];
          if (typeof s !== 'string') {
            throw new RuntimeError('upper() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.toUpperCase());
          this.pc++;
          return baseResult;
        }

        // lower(s) - convert string to lowercase
        if (name === 'lower' || name === '小写') {
          if (args.length !== 1) {
            throw new RuntimeError('lower() 需要1个参数', line ?? 0, 0);
          }
          const s = args[0];
          if (typeof s !== 'string') {
            throw new RuntimeError('lower() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.toLowerCase());
          this.pc++;
          return baseResult;
        }

        // split(s, sep?) - split string into array
        if (name === 'split' || name === '分割') {
          if (args.length < 1 || args.length > 2) {
            throw new RuntimeError(
              'split() 需要1-2个参数: split(string, separator?)',
              line ?? 0,
              0
            );
          }
          const s = args[0];
          if (typeof s !== 'string') {
            throw new RuntimeError('split() 第一个参数必须是字符串', line ?? 0, 0);
          }
          if (args.length === 1) {
            // Split on whitespace
            this.stack.push(s.split(/\s+/).filter((x) => x.length > 0));
          } else {
            const sep = args[1];
            if (typeof sep !== 'string') {
              throw new RuntimeError('split() 第二个参数必须是字符串', line ?? 0, 0);
            }
            this.stack.push(s.split(sep));
          }
          this.pc++;
          return baseResult;
        }

        // join(arr, sep?) - join array into string
        if (name === 'join' || name === '连接') {
          if (args.length < 1 || args.length > 2) {
            throw new RuntimeError('join() 需要1-2个参数: join(array, separator?)', line ?? 0, 0);
          }
          const arr = args[0];
          if (!Array.isArray(arr)) {
            throw new RuntimeError('join() 第一个参数必须是数组', line ?? 0, 0);
          }
          const sep = args.length === 2 ? String(args[1]) : '';
          this.stack.push(arr.map((v: Value) => this.valueToString(v)).join(sep));
          this.pc++;
          return baseResult;
        }

        // strip(s) - remove whitespace from both ends
        if (name === 'strip' || name === '去空格') {
          if (args.length !== 1) {
            throw new RuntimeError('strip() 需要1个参数', line ?? 0, 0);
          }
          const s = args[0];
          if (typeof s !== 'string') {
            throw new RuntimeError('strip() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.trim());
          this.pc++;
          return baseResult;
        }

        // replace(s, old, new) - replace all occurrences of old with new
        if (name === 'replace' || name === '替换') {
          if (args.length !== 3) {
            throw new RuntimeError(
              'replace() 需要3个参数: replace(string, old, new)',
              line ?? 0,
              0
            );
          }
          const s = args[0];
          const oldStr = args[1];
          const newStr = args[2];
          if (typeof s !== 'string' || typeof oldStr !== 'string' || typeof newStr !== 'string') {
            throw new RuntimeError('replace() 所有参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.split(oldStr).join(newStr));
          this.pc++;
          return baseResult;
        }

        // find(s, sub) - find index of substring, returns -1 if not found
        if (name === 'find' || name === '查找') {
          if (args.length !== 2) {
            throw new RuntimeError('find() 需要2个参数: find(string, substring)', line ?? 0, 0);
          }
          const s = args[0];
          const sub = args[1];
          if (typeof s !== 'string' || typeof sub !== 'string') {
            throw new RuntimeError('find() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.indexOf(sub));
          this.pc++;
          return baseResult;
        }

        // startswith(s, prefix) - check if string starts with prefix
        if (name === 'startswith' || name === '以开头') {
          if (args.length !== 2) {
            throw new RuntimeError(
              'startswith() 需要2个参数: startswith(string, prefix)',
              line ?? 0,
              0
            );
          }
          const s = args[0];
          const prefix = args[1];
          if (typeof s !== 'string' || typeof prefix !== 'string') {
            throw new RuntimeError('startswith() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.startsWith(prefix));
          this.pc++;
          return baseResult;
        }

        // endswith(s, suffix) - check if string ends with suffix
        if (name === 'endswith' || name === '以结尾') {
          if (args.length !== 2) {
            throw new RuntimeError(
              'endswith() 需要2个参数: endswith(string, suffix)',
              line ?? 0,
              0
            );
          }
          const s = args[0];
          const suffix = args[1];
          if (typeof s !== 'string' || typeof suffix !== 'string') {
            throw new RuntimeError('endswith() 参数必须是字符串', line ?? 0, 0);
          }
          this.stack.push(s.endsWith(suffix));
          this.pc++;
          return baseResult;
        }

        // round(x, digits?) - round to n decimal places
        if (name === 'round' || name === '四舍五入') {
          if (args.length < 1 || args.length > 2) {
            throw new RuntimeError('round() 需要1-2个参数: round(x, digits?)', line ?? 0, 0);
          }
          const x = args[0];
          if (typeof x !== 'number') {
            throw new RuntimeError('round() 第一个参数必须是数字', line ?? 0, 0);
          }
          if (args.length === 1) {
            this.stack.push(Math.round(x));
          } else {
            const digits = args[1];
            if (typeof digits !== 'number' || !Number.isInteger(digits) || digits < 0) {
              throw new RuntimeError('round() 第二个参数必须是非负整数', line ?? 0, 0);
            }
            const factor = Math.pow(10, digits);
            this.stack.push(Math.round(x * factor) / factor);
          }
          this.pc++;
          return baseResult;
        }

        // sqrt(x) - square root
        if (name === 'sqrt' || name === '平方根') {
          if (args.length !== 1) {
            throw new RuntimeError('sqrt() 需要1个参数', line ?? 0, 0);
          }
          const x = args[0];
          if (typeof x !== 'number') {
            throw new RuntimeError('sqrt() 参数必须是数字', line ?? 0, 0);
          }
          if (x < 0) {
            throw new RuntimeError('sqrt() 参数不能是负数', line ?? 0, 0);
          }
          this.stack.push(Math.sqrt(x));
          this.pc++;
          return baseResult;
        }

        // pow(base, exp) - power
        if (name === 'pow' || name === '幂') {
          if (args.length !== 2) {
            throw new RuntimeError('pow() 需要2个参数: pow(base, exponent)', line ?? 0, 0);
          }
          const base = args[0];
          const exp = args[1];
          if (typeof base !== 'number' || typeof exp !== 'number') {
            throw new RuntimeError('pow() 参数必须是数字', line ?? 0, 0);
          }
          this.stack.push(Math.pow(base, exp));
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError(`未定义的函数: ${name}`, line ?? 0, 0, '检查函数名是否正确');
      }

      case 'CALL_USER': {
        const { name } = parseCallArg(inst.arg as string);
        const funcAddr = this.program!.functions.get(name);

        if (funcAddr === undefined) {
          throw new RuntimeError(`未定义的函数: ${name}`, line ?? 0, 0);
        }

        // Push call frame with return address, function name, and call line
        this.callStack.push({
          returnAddress: this.pc + 1,
          locals: new Map(),
          functionName: name,
          callLine: line,
        });

        // Arguments are already on stack, will be stored by function prologue
        this.pc = funcAddr;
        return baseResult;
      }

      case 'RETURN': {
        const returnValue = this.pop();

        if (this.callStack.length === 0) {
          // Return from main - end program
          this.stack.push(returnValue);
          this.status = 'completed';
          return { ...baseResult, done: true };
        }

        const frame = this.callStack.pop()!;

        // Special handling for __init__: return self instead of the return value
        if (frame.functionName.endsWith('.__init__')) {
          const self = frame.locals.get('self');
          if (self !== undefined) {
            this.stack.push(self);
          } else {
            this.stack.push(returnValue);
          }
        } else {
          this.stack.push(returnValue);
        }

        this.pc = frame.returnAddress;
        return baseResult;
      }

      // Special
      case 'HALT':
        this.status = 'completed';
        return { ...baseResult, done: true };

      case 'NOP':
        this.pc++;
        return baseResult;

      // Array operations
      case 'ARRAY_CREATE': {
        const count = inst.arg as number;
        const elements = this.popN(count);
        this.stack.push(elements);
        this.pc++;
        return baseResult;
      }

      case 'ARRAY_GET': {
        const index = this.pop();
        const obj = this.pop();

        // Array access
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
          this.stack.push(obj[actualIndex] as Value);
          this.pc++;
          return baseResult;
        }

        // String character access
        if (typeof obj === 'string') {
          if (typeof index !== 'number' || !Number.isInteger(index)) {
            throw new RuntimeError('字符串索引必须是整数', line ?? 0, 0);
          }
          // Support negative indexing
          let actualIndex = index;
          if (index < 0) {
            actualIndex = obj.length + index;
          }
          if (actualIndex < 0 || actualIndex >= obj.length) {
            throw new RuntimeError(
              `字符串索引 ${index} 超出范围 (0-${obj.length - 1})`,
              line ?? 0,
              0
            );
          }
          this.stack.push(obj[actualIndex]);
          this.pc++;
          return baseResult;
        }

        // Object access
        if (typeof obj === 'object' && obj !== null) {
          const key = String(index);
          if (!(key in obj)) {
            throw new RuntimeError(`对象没有键 "${key}"`, line ?? 0, 0);
          }
          this.stack.push((obj as Record<string, Value>)[key]);
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError('只能对数组、字符串或对象进行索引', line ?? 0, 0);
      }

      case 'ARRAY_SET': {
        const value = this.pop();
        const index = this.pop();
        const obj = this.pop();

        // Array assignment
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
          this.pc++;
          return baseResult;
        }

        // Object assignment
        if (typeof obj === 'object' && obj !== null) {
          const key = String(index);
          (obj as Record<string, Value>)[key] = value;
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError('只能对数组或对象进行索引赋值', line ?? 0, 0);
      }

      case 'SLICE': {
        const endVal = this.pop();
        const startVal = this.pop();
        const obj = this.pop();

        // Handle arrays
        if (Array.isArray(obj)) {
          const len = obj.length;
          let start = startVal !== null ? (startVal as number) : 0;
          let end = endVal !== null ? (endVal as number) : len;

          // Validate indices
          if (
            (startVal !== null && typeof start !== 'number') ||
            (endVal !== null && typeof end !== 'number')
          ) {
            throw new RuntimeError('切片索引必须是整数', line ?? 0, 0);
          }

          // Handle negative indices
          if (start < 0) start = Math.max(0, len + start);
          if (end < 0) end = Math.max(0, len + end);

          // Clamp to valid range
          start = Math.max(0, Math.min(start, len));
          end = Math.max(0, Math.min(end, len));

          this.stack.push(obj.slice(start, end));
          this.pc++;
          return baseResult;
        }

        // Handle strings
        if (typeof obj === 'string') {
          const len = obj.length;
          let start = startVal !== null ? (startVal as number) : 0;
          let end = endVal !== null ? (endVal as number) : len;

          // Validate indices
          if (
            (startVal !== null && typeof start !== 'number') ||
            (endVal !== null && typeof end !== 'number')
          ) {
            throw new RuntimeError('切片索引必须是整数', line ?? 0, 0);
          }

          // Handle negative indices
          if (start < 0) start = Math.max(0, len + start);
          if (end < 0) end = Math.max(0, len + end);

          // Clamp to valid range
          start = Math.max(0, Math.min(start, len));
          end = Math.max(0, Math.min(end, len));

          this.stack.push(obj.slice(start, end));
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError('只能对数组或字符串进行切片', line ?? 0, 0);
      }

      case 'OBJECT_CREATE': {
        const count = inst.arg as number;
        const obj: Record<string, Value> = {};
        // Pop key-value pairs (pushed as key, value, key, value, ...)
        for (let i = 0; i < count; i++) {
          const value = this.pop();
          const key = String(this.pop());
          obj[key] = value;
        }
        this.stack.push(obj);
        this.pc++;
        return baseResult;
      }

      case 'OBJECT_GET': {
        const key = String(this.pop());
        const obj = this.pop();

        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          throw new RuntimeError('只能对对象进行属性访问', line ?? 0, 0);
        }

        if (!(key in obj)) {
          throw new RuntimeError(`对象没有键 "${key}"`, line ?? 0, 0);
        }

        this.stack.push((obj as Record<string, Value>)[key]);
        this.pc++;
        return baseResult;
      }

      case 'OBJECT_SET': {
        const value = this.pop();
        const key = String(this.pop());
        const obj = this.pop();

        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          throw new RuntimeError('只能对对象进行属性赋值', line ?? 0, 0);
        }

        (obj as Record<string, Value>)[key] = value;
        this.pc++;
        return baseResult;
      }

      // Class operations
      case 'CLASS_DEF': {
        // Define a class - extract method names from the function table
        const className = inst.arg as string;
        const methods: string[] = [];

        // Find all methods for this class (ClassName.methodName)
        if (this.program) {
          for (const funcName of this.program.functions.keys()) {
            if (funcName.startsWith(className + '.')) {
              const methodName = funcName.slice(className.length + 1);
              methods.push(methodName);
            }
          }
        }

        this.classes.set(className, methods);
        this.pc++;
        return baseResult;
      }

      case 'NEW': {
        // Create a new instance of a class
        const { name: className, argCount } = parseCallArg(inst.arg as string);
        const args = this.popN(argCount);

        // Check if class exists
        if (!this.classes.has(className)) {
          throw new RuntimeError(`未定义的类: ${className}`, line ?? 0, 0);
        }

        // Create instance
        const instance: Instance = {
          __class__: className,
          __fields__: new Map(),
        };

        // Check if __init__ exists and call it
        const initMethod = `${className}.__init__`;
        if (this.program && this.program.functions.has(initMethod)) {
          // Push instance (self) and args onto stack
          this.stack.push(instance);
          for (const arg of args) {
            this.stack.push(arg);
          }

          // Push call frame
          this.callStack.push({
            returnAddress: this.pc + 1,
            locals: new Map(),
            functionName: initMethod,
            callLine: line,
          });

          // Jump to __init__
          this.pc = this.program.functions.get(initMethod)!;

          // Special: we need to push the instance as the result after __init__ returns
          // For now, we mark that we're in a NEW call by storing the instance
          // Actually, __init__ should return None, but the instance is what we want
          // We handle this by checking in RETURN if we're returning from __init__
          return baseResult;
        }

        // No __init__, just push the instance
        this.stack.push(instance);
        this.pc++;
        return baseResult;
      }

      case 'MEMBER_GET': {
        // Get instance member: [instance, propName] -> value
        const propName = String(this.pop());
        const obj = this.pop();

        if (isInstance(obj)) {
          if (!obj.__fields__.has(propName)) {
            throw new RuntimeError(`实例没有属性 "${propName}"`, line ?? 0, 0);
          }
          this.stack.push(obj.__fields__.get(propName)!);
          this.pc++;
          return baseResult;
        }

        // Fall back to object property access for regular objects
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
          const key = propName;
          if (!(key in obj)) {
            throw new RuntimeError(`对象没有属性 "${key}"`, line ?? 0, 0);
          }
          this.stack.push((obj as Record<string, Value>)[key]);
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError('只能对实例或对象进行成员访问', line ?? 0, 0);
      }

      case 'MEMBER_SET': {
        // Set instance member: [instance, propName, value] -> (mutates)
        const value = this.pop();
        const propName = String(this.pop());
        const obj = this.pop();

        if (isInstance(obj)) {
          obj.__fields__.set(propName, value);
          this.pc++;
          return baseResult;
        }

        // Fall back to object property assignment for regular objects
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
          (obj as Record<string, Value>)[propName] = value;
          this.pc++;
          return baseResult;
        }

        throw new RuntimeError('只能对实例或对象进行成员赋值', line ?? 0, 0);
      }

      case 'METHOD_CALL': {
        // Call method: arg = methodName:argCount, [instance, ...args] -> result
        const { name: methodName, argCount } = parseCallArg(inst.arg as string);
        // argCount includes self, so we pop argCount items
        const allArgs = this.popN(argCount);
        const instance = allArgs[0];
        const methodArgs = allArgs.slice(1);

        if (!isInstance(instance)) {
          throw new RuntimeError('方法调用需要实例对象', line ?? 0, 0);
        }

        const className = instance.__class__;
        const qualifiedName = `${className}.${methodName}`;

        if (!this.program || !this.program.functions.has(qualifiedName)) {
          throw new RuntimeError(`类 "${className}" 没有方法 "${methodName}"`, line ?? 0, 0);
        }

        // Push instance (self) and args back onto stack
        this.stack.push(instance);
        for (const arg of methodArgs) {
          this.stack.push(arg);
        }

        // Push call frame
        this.callStack.push({
          returnAddress: this.pc + 1,
          locals: new Map(),
          functionName: qualifiedName,
          callLine: line,
        });

        // Jump to method
        this.pc = this.program.functions.get(qualifiedName)!;
        return baseResult;
      }

      default:
        throw new RuntimeError(`未知指令: ${inst.op}`, line ?? 0, 0);
    }
  }

  // ============ Stack Helpers ============

  private pop(): Value {
    if (this.stack.length === 0) {
      throw new RuntimeError('栈为空', 0, 0);
    }
    return this.stack.pop()!;
  }

  private peek(): Value {
    if (this.stack.length === 0) {
      throw new RuntimeError('栈为空', 0, 0);
    }
    return this.stack[this.stack.length - 1];
  }

  private popN(n: number): Value[] {
    const args: Value[] = [];
    for (let i = 0; i < n; i++) {
      args.unshift(this.pop());
    }
    return args;
  }

  private popNumber(line: number | null): number {
    const v = this.pop();
    if (typeof v !== 'number') {
      throw new RuntimeError('需要数字', line ?? 0, 0);
    }
    return v;
  }

  // ============ Variable Helpers ============

  private getVariable(name: string): Value {
    // Check local scope first
    if (this.callStack.length > 0) {
      const frame = this.callStack[this.callStack.length - 1];
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
    // If in function, use local scope
    if (this.callStack.length > 0) {
      const frame = this.callStack[this.callStack.length - 1];
      frame.locals.set(name, value);
    } else {
      this.globals.set(name, value);
    }
  }

  // ============ Type Helpers ============

  private isTruthy(value: Value): boolean {
    if (value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private valueToString(value: Value): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      return '[' + value.map((v: Value) => this.valueToString(v)).join(', ') + ']';
    }
    // Handle Instance objects
    if (isInstance(value)) {
      const fields: string[] = [];
      for (const [k, v] of value.__fields__) {
        fields.push(`${k}: ${this.valueToString(v)}`);
      }
      return `<${value.__class__} {${fields.join(', ')}}>`;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, Value>);
      const parts = entries.map(([k, v]) => `${k}: ${this.valueToString(v)}`);
      return '{' + parts.join(', ') + '}';
    }
    return String(value);
  }
}
