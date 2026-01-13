/**
 * Notebook Execution Hook
 *
 * Manages code cell execution with shared context across cells.
 * Supports print output and turtle graphics.
 */

import { useState, useCallback, useRef } from 'react';
import { VM, VMState } from '../../../core/lang/vm';
import { compile, compileToIR } from '../../../core/lang/index';
import { Value } from '../../../core/lang/ir';
import { TurtleWorld } from '../../../core/game/turtle/TurtleWorld';
import type { CodeCell, CellOutput, TurtleCanvasState } from '../types';
import { createTextOutput, createErrorOutput, generateOutputId } from '../utils/cellHelpers';

// Color name to hex mappings (matches TurtleVM)
const COLORS: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  black: '#000000',
  white: '#ffffff',
  红: '#ef4444',
  红色: '#ef4444',
  蓝: '#3b82f6',
  蓝色: '#3b82f6',
  绿: '#22c55e',
  绿色: '#22c55e',
  黄: '#eab308',
  黄色: '#eab308',
  紫: '#a855f7',
  紫色: '#a855f7',
  橙: '#f97316',
  橙色: '#f97316',
  黑: '#000000',
  黑色: '#000000',
  白: '#ffffff',
  白色: '#ffffff',
};

// ============ Execution Context ============

interface ExecutionResult {
  success: boolean;
  outputs: CellOutput[];
  variables: Record<string, Value>;
}

// ============ Hook ============

export function useNotebookExecution() {
  // Shared globals across cells
  const [executionCount, setExecutionCount] = useState(0);
  const globalsRef = useRef<Map<string, Value>>(new Map());
  const turtleWorldRef = useRef<TurtleWorld | null>(null);

  // Execute a single code cell
  const executeCell = useCallback(async (cell: CodeCell): Promise<ExecutionResult> => {
    const outputs: CellOutput[] = [];
    const printBuffer: string[] = [];

    try {
      const vm = new VM();

      // Restore shared globals
      for (const [name, value] of globalsRef.current) {
        vm.setGlobal(name, value);
      }

      // Register print command
      vm.registerCommand('print', (args: Value[]) => {
        printBuffer.push(args.map(String).join(' '));
      });
      vm.registerCommand('打印', (args: Value[]) => {
        printBuffer.push(args.map(String).join(' '));
      });

      // Handle turtle game type
      let turtleWorld: TurtleWorld | null = null;
      if (cell.gameType === 'turtle') {
        // Create or reuse turtle world
        if (!turtleWorldRef.current) {
          turtleWorldRef.current = new TurtleWorld();
        }
        turtleWorld = turtleWorldRef.current;

        // Register turtle movement commands (calling TurtleWorld directly)
        vm.registerCommand('forward', (args: Value[]) => {
          const distance = typeof args[0] === 'number' ? args[0] : 1;
          turtleWorld!.forward(distance);
        });
        vm.registerCommand('前进', (args: Value[]) => {
          const distance = typeof args[0] === 'number' ? args[0] : 1;
          turtleWorld!.forward(distance);
        });
        vm.registerCommand('backward', (args: Value[]) => {
          const distance = typeof args[0] === 'number' ? args[0] : 1;
          turtleWorld!.backward(distance);
        });
        vm.registerCommand('后退', (args: Value[]) => {
          const distance = typeof args[0] === 'number' ? args[0] : 1;
          turtleWorld!.backward(distance);
        });
        vm.registerCommand('turnLeft', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnLeft(degrees);
        });
        vm.registerCommand('左转', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnLeft(degrees);
        });
        vm.registerCommand('left', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnLeft(degrees);
        });
        vm.registerCommand('turnRight', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnRight(degrees);
        });
        vm.registerCommand('右转', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnRight(degrees);
        });
        vm.registerCommand('right', (args: Value[]) => {
          const degrees = typeof args[0] === 'number' ? args[0] : 90;
          turtleWorld!.turnRight(degrees);
        });

        // Pen commands
        vm.registerCommand('penUp', () => {
          turtleWorld!.penUp();
        });
        vm.registerCommand('抬笔', () => {
          turtleWorld!.penUp();
        });
        vm.registerCommand('penDown', () => {
          turtleWorld!.penDown();
        });
        vm.registerCommand('落笔', () => {
          turtleWorld!.penDown();
        });

        vm.registerCommand('setColor', (args: Value[]) => {
          const color = typeof args[0] === 'string' ? args[0] : '#000000';
          const mappedColor = COLORS[color] || color;
          turtleWorld!.setColor(mappedColor);
        });
        vm.registerCommand('设置颜色', (args: Value[]) => {
          const color = typeof args[0] === 'string' ? args[0] : '#000000';
          const mappedColor = COLORS[color] || color;
          turtleWorld!.setColor(mappedColor);
        });
        vm.registerCommand('颜色', (args: Value[]) => {
          const color = typeof args[0] === 'string' ? args[0] : '#000000';
          const mappedColor = COLORS[color] || color;
          turtleWorld!.setColor(mappedColor);
        });
        vm.registerCommand('setWidth', (args: Value[]) => {
          const width = typeof args[0] === 'number' ? args[0] : 2;
          turtleWorld!.setWidth(width);
        });
        vm.registerCommand('设置宽度', (args: Value[]) => {
          const width = typeof args[0] === 'number' ? args[0] : 2;
          turtleWorld!.setWidth(width);
        });

        // Sensors
        vm.registerCommand('isPenDown', () => turtleWorld!.isPenDown());
        vm.registerCommand('画笔落下', () => turtleWorld!.isPenDown());
        vm.registerCommand('getX', () => turtleWorld!.getX());
        vm.registerCommand('获取X', () => turtleWorld!.getX());
        vm.registerCommand('getY', () => turtleWorld!.getY());
        vm.registerCommand('获取Y', () => turtleWorld!.getY());
        vm.registerCommand('getAngle', () => turtleWorld!.getAngle());
        vm.registerCommand('获取角度', () => turtleWorld!.getAngle());

        // Compile user code directly (no stdlib needed)
        const ast = compile(cell.content);
        const program = compileToIR(ast);
        vm.load(program);
      } else {
        // Regular code execution
        const ast = compile(cell.content);
        const program = compileToIR(ast);
        vm.load(program);
      }

      // Run to completion
      let steps = 0;
      const maxSteps = 100000;
      while (steps < maxSteps) {
        const result = vm.step();
        if (result.done) break;
        steps++;
      }

      // Check for errors
      const state: VMState = vm.getState();
      if (state.status === 'error' && state.error) {
        outputs.push(createErrorOutput(state.error));
        return { success: false, outputs, variables: {} };
      }

      // Collect print output
      if (printBuffer.length > 0) {
        outputs.push(createTextOutput(printBuffer.join('\n')));
      }

      // Capture turtle canvas state
      if (cell.gameType === 'turtle' && turtleWorld) {
        const turtle = turtleWorld.getTurtle();
        const lines = turtleWorld.getLines();

        const canvasState: TurtleCanvasState = {
          lines: lines.map((line) => ({
            from: line.from,
            to: line.to,
            color: line.color,
            width: line.width,
          })),
          turtle: {
            x: turtle.x,
            y: turtle.y,
            angle: turtle.angle,
            penDown: turtle.penDown,
          },
          width: turtleWorld.getWidth(),
          height: turtleWorld.getHeight(),
        };

        outputs.push({
          id: generateOutputId(),
          type: 'turtle',
          content: '',
          canvasState,
          timestamp: Date.now(),
        });
      }

      // Update shared globals
      const variables = vm.getVariables();
      for (const [name, value] of Object.entries(variables)) {
        // Skip internal/stdlib variables
        if (!name.startsWith('_') && name !== 'world') {
          globalsRef.current.set(name, value);
        }
      }

      setExecutionCount((prev) => prev + 1);

      return { success: true, outputs, variables };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      outputs.push(createErrorOutput(errorMessage));
      return { success: false, outputs, variables: {} };
    }
  }, []);

  // Reset execution context (like "Restart Kernel")
  const resetContext = useCallback(() => {
    globalsRef.current = new Map();
    turtleWorldRef.current = null;
    setExecutionCount(0);
  }, []);

  // Reset only turtle world (keep variables)
  const resetTurtleWorld = useCallback(() => {
    turtleWorldRef.current = new TurtleWorld();
  }, []);

  // Get current globals for display
  const getGlobals = useCallback((): Record<string, Value> => {
    const result: Record<string, Value> = {};
    for (const [name, value] of globalsRef.current) {
      result[name] = value;
    }
    return result;
  }, []);

  return {
    executeCell,
    resetContext,
    resetTurtleWorld,
    getGlobals,
    executionCount,
  };
}
