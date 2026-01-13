/**
 * Maze Virtual Machine
 *
 * Wraps the pure MiniPython VM with maze game bindings.
 * Commands and sensors are registered from commands.ts (single source of truth).
 * MazeWorld is the single source of truth for game state.
 */

import { VM, VMState, VMStepResult, CommandHandler } from '../../lang/vm';
import { CompiledProgram, Value } from '../../lang/ir';
import { compile, compileToIR } from '../../lang/index';
import { MazeWorld } from './MazeWorld';
import { MAZE_COMMANDS, MAZE_CONDITIONS, MAZE_SENSORS } from './commands';
import type { CustomCommandDefinition } from '../../engine/types';

export interface MazeVMConfig {
  world: MazeWorld;
  onPrint?: (message: string) => void;
}

/**
 * MazeVM - MiniPython VM with maze game bindings
 * Commands call MazeWorld methods directly for single source of truth.
 */
export class MazeVM {
  private vm: VM;
  private world: MazeWorld;
  private onPrint?: (message: string) => void;

  constructor(config: MazeVMConfig) {
    this.vm = new VM();
    this.world = config.world;
    this.onPrint = config.onPrint;

    this.registerBindings();
  }

  private registerBindings(): void {
    // Print command
    const printHandler: CommandHandler = (args: Value[]) => {
      const message = args.map((a) => String(a)).join(' ');
      if (this.onPrint) {
        this.onPrint(message);
      } else {
        console.log(message);
      }
    };
    this.vm.registerCommand('print', printHandler);

    // Register commands from commands.ts (single source of truth)
    for (const cmd of MAZE_COMMANDS) {
      const handler = (args: Value[]) => cmd.handler(this.world, args);
      this.vm.registerCommand(cmd.codeName, handler);
    }

    // Register conditions as commands (they return boolean)
    for (const cond of MAZE_CONDITIONS) {
      const handler = () => cond.handler(this.world);
      this.vm.registerCommand(cond.codeName, handler);
    }

    // Register sensors from commands.ts
    for (const sensor of MAZE_SENSORS) {
      const handler = (args: Value[]) => sensor.handler(this.world, args);
      this.vm.registerCommand(sensor.codeName, handler);
    }
  }

  /**
   * Register custom commands defined in the level.
   * Custom commands are "macros" - their code is compiled and executed when called.
   */
  registerCustomCommands(commands: CustomCommandDefinition[]): void {
    for (const cmd of commands) {
      // Create a handler that compiles and runs the command's code
      const handler: CommandHandler = (args: Value[]) => {
        // Create a temporary VM to run the custom command
        // (We can't use this.vm because it might be in the middle of execution)
        const tempVM = new VM();

        // Copy all registered commands to the temp VM
        for (const c of MAZE_COMMANDS) {
          tempVM.registerCommand(c.codeName, (a: Value[]) => c.handler(this.world, a));
        }
        for (const cond of MAZE_CONDITIONS) {
          tempVM.registerCommand(cond.codeName, () => cond.handler(this.world));
        }
        for (const sensor of MAZE_SENSORS) {
          tempVM.registerCommand(sensor.codeName, (a: Value[]) => sensor.handler(this.world, a));
        }
        tempVM.registerCommand('print', (a: Value[]) => {
          const message = a.map((v) => String(v)).join(' ');
          if (this.onPrint) this.onPrint(message);
        });

        // Prepare the code with arg variable if needed
        let codeToRun = cmd.code;
        if (cmd.argType !== 'none' && args.length > 0) {
          // Prepend arg assignment
          const argValue = args[0];
          const argCode =
            typeof argValue === 'string' ? `"${argValue}"` : String(argValue);
          codeToRun = `arg = ${argCode}\n${codeToRun}`;
        }

        // Compile and run
        try {
          const ast = compile(codeToRun);
          const program = compileToIR(ast);
          tempVM.load(program);
          tempVM.run();
        } catch (e) {
          console.error(`Error in custom command ${cmd.codeName}:`, e);
        }
      };

      this.vm.registerCommand(cmd.codeName, handler);
    }
  }

  /**
   * Load and compile user source code
   */
  loadWithSource(userCode: string): void {
    const ast = compile(userCode);
    const program = compileToIR(ast);
    this.vm.load(program);
  }

  // ============ VM Delegation ============

  load(program: CompiledProgram): void {
    this.vm.load(program);
  }

  reset(): void {
    this.vm.reset();
  }

  step(): VMStepResult {
    return this.vm.step();
  }

  run(): VMStepResult {
    return this.vm.run();
  }

  runAll(): VMStepResult[] {
    return this.vm.runAll();
  }

  pause(): void {
    this.vm.pause();
  }

  resume(): void {
    this.vm.resume();
  }

  getState(): VMState {
    return this.vm.getState();
  }

  getCurrentLine(): number | null {
    return this.vm.getCurrentLine();
  }

  getVariables(): Record<string, Value> {
    return this.vm.getVariables();
  }

  getCallStackForVisualization(): Array<{
    name: string;
    line: number;
    locals: Record<string, Value>;
  }> {
    return this.vm.getCallStackForVisualization();
  }

  // ============ Debugging Features Delegation ============

  // Breakpoints
  addBreakpoint(line: number): void {
    this.vm.addBreakpoint(line);
  }

  removeBreakpoint(line: number): void {
    this.vm.removeBreakpoint(line);
  }

  toggleBreakpoint(line: number): boolean {
    return this.vm.toggleBreakpoint(line);
  }

  clearBreakpoints(): void {
    this.vm.clearBreakpoints();
  }

  getBreakpoints(): number[] {
    return this.vm.getBreakpoints();
  }

  hasBreakpoint(line: number): boolean {
    return this.vm.hasBreakpoint(line);
  }

  // Variable Watch
  addWatch(name: string): void {
    this.vm.addWatch(name);
  }

  removeWatch(name: string): void {
    this.vm.removeWatch(name);
  }

  clearWatch(): void {
    this.vm.clearWatch();
  }

  getWatchList(): string[] {
    return this.vm.getWatchList();
  }

  getWatchedValues(): Record<string, Value | undefined> {
    return this.vm.getWatchedValues();
  }

  // Step-Back Debugging
  stepBack(): boolean {
    return this.vm.stepBack();
  }

  getHistoryLength(): number {
    return this.vm.getHistoryLength();
  }

  clearHistory(): void {
    this.vm.clearHistory();
  }

  setMaxHistorySize(size: number): void {
    this.vm.setMaxHistorySize(size);
  }

  // Expression Evaluation (for win/fail conditions)
  // Native commands are already registered, so expressions can use them directly
  evaluateExpression(source: string): Value {
    // Assign to __result__ because expression statements pop their results
    const fullSource = '__result__ = ' + source;
    this.vm.evaluateExpression(fullSource);
    return this.vm.getGlobal('__result__') ?? null;
  }
}
