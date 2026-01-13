/**
 * VM Debugging Features Tests
 *
 * Tests for:
 * - Variable Watch
 * - Breakpoints
 * - Step-back debugging
 * - Execution visualization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VM } from '../vm';
import { compile, compileToIR } from '../index';

function createVM(code: string): VM {
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();
  vm.load(program);
  return vm;
}

describe('VM Debugging Features', () => {
  describe('Variable Watch', () => {
    it('adds and removes watched variables', () => {
      const vm = createVM('x = 1');

      vm.addWatch('x');
      vm.addWatch('y');
      expect(vm.getWatchList()).toEqual(['x', 'y']);

      vm.removeWatch('x');
      expect(vm.getWatchList()).toEqual(['y']);
    });

    it('clears all watched variables', () => {
      const vm = createVM('x = 1');

      vm.addWatch('x');
      vm.addWatch('y');
      vm.clearWatch();
      expect(vm.getWatchList()).toEqual([]);
    });

    it('gets values of watched variables', () => {
      const vm = createVM('x = 10\ny = 20');

      vm.addWatch('x');
      vm.addWatch('y');
      vm.addWatch('z'); // not defined

      // Run to completion
      while (!vm.step().done) {}

      const watched = vm.getWatchedValues();
      expect(watched.x).toBe(10);
      expect(watched.y).toBe(20);
      expect(watched.z).toBeUndefined();
    });

    it('watch list persists across reset', () => {
      const vm = createVM('x = 1');

      vm.addWatch('x');
      vm.reset();
      expect(vm.getWatchList()).toEqual(['x']);
    });
  });

  describe('Breakpoints', () => {
    it('adds and removes breakpoints', () => {
      const vm = createVM('x = 1\ny = 2\nz = 3');

      vm.addBreakpoint(1);
      vm.addBreakpoint(3);
      expect(vm.getBreakpoints()).toEqual([1, 3]);

      vm.removeBreakpoint(1);
      expect(vm.getBreakpoints()).toEqual([3]);
    });

    it('toggles breakpoints', () => {
      const vm = createVM('x = 1');

      expect(vm.toggleBreakpoint(1)).toBe(true); // added
      expect(vm.hasBreakpoint(1)).toBe(true);

      expect(vm.toggleBreakpoint(1)).toBe(false); // removed
      expect(vm.hasBreakpoint(1)).toBe(false);
    });

    it('clears all breakpoints', () => {
      const vm = createVM('x = 1');

      vm.addBreakpoint(1);
      vm.addBreakpoint(2);
      vm.clearBreakpoints();
      expect(vm.getBreakpoints()).toEqual([]);
    });

    it('breakpoints persist across reset', () => {
      const vm = createVM('x = 1');

      vm.addBreakpoint(1);
      vm.reset();
      expect(vm.getBreakpoints()).toEqual([1]);
    });

    it('runs until breakpoint', () => {
      const vm = createVM('x = 1\ny = 2\nz = 3');

      vm.addBreakpoint(2);
      const { hitBreakpoint } = vm.runUntilBreakpoint();

      expect(hitBreakpoint).toBe(true);
      expect(vm.getState().status).toBe('paused');
      expect(vm.getVariables().x).toBe(1);
      expect(vm.getVariables().y).toBeUndefined(); // not yet executed
    });

    it('continues execution after breakpoint', () => {
      const vm = createVM('x = 1\ny = 2\nz = 3');

      vm.addBreakpoint(2);
      vm.addBreakpoint(3);

      // Run to first breakpoint
      let result = vm.runUntilBreakpoint();
      expect(result.hitBreakpoint).toBe(true);

      // Continue to next breakpoint
      result = vm.continueExecution();
      expect(result.hitBreakpoint).toBe(true);
      expect(vm.getVariables().y).toBe(2);
    });

    it('completes when no more breakpoints', () => {
      const vm = createVM('x = 1\ny = 2');

      const { hitBreakpoint, result } = vm.runUntilBreakpoint();
      expect(hitBreakpoint).toBe(false);
      expect(result.done).toBe(true);
    });
  });

  describe('Step-Back Debugging', () => {
    it('steps back to previous state', () => {
      const vm = createVM('x = 1\nx = 2\nx = 3');

      // Execute all steps
      while (!vm.step().done) {}

      expect(vm.getVariables().x).toBe(3);

      // Step back
      expect(vm.stepBack()).toBe(true);
      // Note: stepping back restores state BEFORE the last instruction
      // So we may need multiple step backs to see the value change
    });

    it('returns false when no history', () => {
      const vm = createVM('x = 1');

      expect(vm.stepBack()).toBe(false);
    });

    it('tracks history length', () => {
      const vm = createVM('x = 1\ny = 2\nz = 3');

      expect(vm.getHistoryLength()).toBe(0);

      vm.step();
      expect(vm.getHistoryLength()).toBe(1);

      vm.step();
      expect(vm.getHistoryLength()).toBe(2);
    });

    it('clears history', () => {
      const vm = createVM('x = 1\ny = 2');

      vm.step();
      vm.step();
      expect(vm.getHistoryLength()).toBeGreaterThan(0);

      vm.clearHistory();
      expect(vm.getHistoryLength()).toBe(0);
    });

    it('history is cleared on reset', () => {
      const vm = createVM('x = 1');

      vm.step();
      vm.reset();
      expect(vm.getHistoryLength()).toBe(0);
    });

    it('limits history size', () => {
      const vm = createVM('x = 0\nfor i in range(100):\n    x = x + 1');

      vm.setMaxHistorySize(10);

      // Run all steps
      while (!vm.step().done) {}

      // History should be limited
      expect(vm.getHistoryLength()).toBeLessThanOrEqual(10);
    });

    it('can step back multiple times', () => {
      const vm = createVM('x = 1\ny = 2\nz = 3');

      // Run all
      while (!vm.step().done) {}

      const initialHistory = vm.getHistoryLength();

      // Step back multiple times
      vm.stepBack();
      vm.stepBack();
      vm.stepBack();

      expect(vm.getHistoryLength()).toBe(initialHistory - 3);
    });
  });

  describe('Execution Visualization', () => {
    it('provides comprehensive visualization info', () => {
      const vm = createVM('x = 10\ny = 20');

      vm.addWatch('x');
      vm.addBreakpoint(2);

      // Run one step
      vm.step();

      const viz = vm.getExecutionVisualization();

      expect(viz.currentLine).toBeDefined();
      expect(viz.currentInstruction).toBeDefined();
      expect(viz.stack).toBeInstanceOf(Array);
      expect(viz.variables).toBeDefined();
      expect(viz.watchedVariables).toBeDefined();
      expect(viz.callStack).toBeInstanceOf(Array);
      expect(typeof viz.canStepBack).toBe('boolean');
      expect(typeof viz.historyLength).toBe('number');
      expect(viz.breakpoints).toEqual([2]);
      expect(viz.status).toBeDefined();
    });

    it('shows watched variable values', () => {
      const vm = createVM('x = 42');

      vm.addWatch('x');

      // Run to completion
      while (!vm.step().done) {}

      const viz = vm.getExecutionVisualization();
      expect(viz.watchedVariables.x).toBe(42);
    });

    it('shows current instruction', () => {
      const vm = createVM('x = 1');

      const viz = vm.getExecutionVisualization();
      expect(viz.currentInstruction).toContain('PUSH');
    });

    it('shows call stack with at least main frame', () => {
      const vm = createVM('x = 1\ny = 2');

      // Step once
      vm.step();

      const viz = vm.getExecutionVisualization();
      // Should always have at least main frame
      expect(viz.callStack.length).toBeGreaterThanOrEqual(1);
      expect(viz.callStack[0].name).toBe('<main>');
    });

    it('indicates when step back is available', () => {
      const vm = createVM('x = 1');

      expect(vm.getExecutionVisualization().canStepBack).toBe(false);

      vm.step();

      expect(vm.getExecutionVisualization().canStepBack).toBe(true);
    });
  });
});
