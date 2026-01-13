/**
 * Turtle Virtual Machine
 *
 * Wraps the pure MiniPython VM with turtle graphics bindings.
 * Commands and sensors are registered from commands.ts (single source of truth).
 * TurtleWorld is the single source of truth for game state.
 */

import { VM, VMState, VMStepResult, CommandHandler } from '../../lang/vm';
import { CompiledProgram, Value } from '../../lang/ir';
import { compile, compileToIR } from '../../lang/index';
import { TurtleWorld } from './TurtleWorld';
import { TURTLE_COMMANDS, TURTLE_CONDITIONS, TURTLE_SENSORS } from './commands';

export interface TurtleVMConfig {
  world: TurtleWorld;
  onPrint?: (message: string) => void;
}

/**
 * TurtleVM - MiniPython VM with turtle graphics bindings
 * Commands call TurtleWorld methods directly for single source of truth.
 */
export class TurtleVM {
  private vm: VM;
  private world: TurtleWorld;
  private onPrint?: (message: string) => void;

  constructor(config: TurtleVMConfig) {
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
    for (const cmd of TURTLE_COMMANDS) {
      const handler = (args: Value[]) => cmd.handler(this.world, args);
      this.vm.registerCommand(cmd.codeName, handler);
    }

    // Register conditions as commands (they return boolean)
    for (const cond of TURTLE_CONDITIONS) {
      const handler = () => cond.handler(this.world);
      this.vm.registerCommand(cond.codeName, handler);
    }

    // Register sensors from commands.ts
    for (const sensor of TURTLE_SENSORS) {
      const handler = (args: Value[]) => sensor.handler(this.world, args);
      this.vm.registerCommand(sensor.codeName, handler);
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

  // Expression Evaluation (for win/fail conditions)
  // Native commands are already registered, so expressions can use them directly
  evaluateExpression(source: string): Value {
    const fullSource = '__result__ = ' + source;
    this.vm.evaluateExpression(fullSource);
    return this.vm.getGlobal('__result__') ?? null;
  }
}
