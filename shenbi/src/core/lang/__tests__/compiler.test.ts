/**
 * Compiler Tests
 *
 * Tests IR code generation for all MiniPython constructs including:
 * - Expressions compilation
 * - Statement compilation
 * - Control flow
 * - Function compilation
 */

import { describe, it, expect } from 'vitest';
import { compile, compileToIR } from '../index';
import type { CompiledProgram, Instruction, OpCode } from '../ir';

// Helper to compile code to IR
function compileCode(code: string): CompiledProgram {
  const ast = compile(code);
  return compileToIR(ast);
}

// Helper to get opcodes from instructions
function getOpcodes(program: CompiledProgram): OpCode[] {
  return program.instructions.map((i) => i.op);
}

// Helper to find instruction by opcode
function findInstruction(program: CompiledProgram, op: OpCode): Instruction | undefined {
  return program.instructions.find((i) => i.op === op);
}

// Helper to count occurrences of an opcode
function countOpcode(program: CompiledProgram, op: OpCode): number {
  return program.instructions.filter((i) => i.op === op).length;
}

describe('Compiler', () => {
  describe('Literal Compilation', () => {
    it('compiles number literals', () => {
      const program = compileCode('42');
      const push = findInstruction(program, 'PUSH');
      expect(push?.arg).toBe(42);
    });

    it('compiles string literals', () => {
      const program = compileCode('"hello"');
      const push = findInstruction(program, 'PUSH');
      expect(push?.arg).toBe('hello');
    });

    it('compiles boolean True', () => {
      const program = compileCode('True');
      const push = findInstruction(program, 'PUSH');
      expect(push?.arg).toBe(true);
    });

    it('compiles boolean False', () => {
      const program = compileCode('False');
      const push = findInstruction(program, 'PUSH');
      expect(push?.arg).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    it('compiles addition', () => {
      const program = compileCode('1 + 2');
      expect(getOpcodes(program)).toContain('ADD');
    });

    it('compiles subtraction', () => {
      const program = compileCode('5 - 3');
      expect(getOpcodes(program)).toContain('SUB');
    });

    it('compiles multiplication', () => {
      const program = compileCode('4 * 2');
      expect(getOpcodes(program)).toContain('MUL');
    });

    it('compiles division', () => {
      const program = compileCode('10 / 2');
      expect(getOpcodes(program)).toContain('DIV');
    });

    it('compiles modulo', () => {
      const program = compileCode('10 % 3');
      expect(getOpcodes(program)).toContain('MOD');
    });

    it('compiles floor division', () => {
      const program = compileCode('10 // 3');
      expect(getOpcodes(program)).toContain('FLOOR_DIV');
    });

    it('compiles negation', () => {
      const program = compileCode('-5');
      expect(getOpcodes(program)).toContain('NEG');
    });

    it('compiles complex expression in correct order', () => {
      const program = compileCode('1 + 2 * 3');
      const opcodes = getOpcodes(program);
      // Should push 1, push 2, push 3, MUL, ADD
      const mulIndex = opcodes.indexOf('MUL');
      const addIndex = opcodes.indexOf('ADD');
      expect(mulIndex).toBeLessThan(addIndex);
    });
  });

  describe('Comparison Operations', () => {
    it('compiles equality', () => {
      const program = compileCode('x == 5');
      expect(getOpcodes(program)).toContain('EQ');
    });

    it('compiles inequality', () => {
      const program = compileCode('x != 5');
      expect(getOpcodes(program)).toContain('NEQ');
    });

    it('compiles less than', () => {
      const program = compileCode('x < 5');
      expect(getOpcodes(program)).toContain('LT');
    });

    it('compiles greater than', () => {
      const program = compileCode('x > 5');
      expect(getOpcodes(program)).toContain('GT');
    });

    it('compiles less than or equal', () => {
      const program = compileCode('x <= 5');
      expect(getOpcodes(program)).toContain('LTE');
    });

    it('compiles greater than or equal', () => {
      const program = compileCode('x >= 5');
      expect(getOpcodes(program)).toContain('GTE');
    });

    it('compiles in operator', () => {
      const program = compileCode('x in arr');
      expect(getOpcodes(program)).toContain('IN');
    });
  });

  describe('Logical Operations', () => {
    it('compiles and with short-circuit evaluation', () => {
      const program = compileCode('x and y');
      // AND uses short-circuit: DUP, JUMP_IF_NOT, POP, evaluate right
      expect(getOpcodes(program)).toContain('DUP');
      expect(getOpcodes(program)).toContain('JUMP_IF_NOT');
    });

    it('compiles or with short-circuit evaluation', () => {
      const program = compileCode('x or y');
      // OR uses short-circuit: DUP, JUMP_IF, POP, evaluate right
      expect(getOpcodes(program)).toContain('DUP');
      expect(getOpcodes(program)).toContain('JUMP_IF');
    });

    it('compiles not', () => {
      const program = compileCode('not x');
      expect(getOpcodes(program)).toContain('NOT');
    });
  });

  describe('Variable Operations', () => {
    it('compiles variable load', () => {
      const program = compileCode('x');
      const load = findInstruction(program, 'LOAD');
      expect(load?.arg).toBe('x');
    });

    it('compiles variable store', () => {
      const program = compileCode('x = 5');
      const store = findInstruction(program, 'STORE');
      expect(store?.arg).toBe('x');
    });

    it('compiles assignment with expression', () => {
      const program = compileCode('x = 1 + 2');
      expect(getOpcodes(program)).toContain('ADD');
      expect(getOpcodes(program)).toContain('STORE');
    });
  });

  describe('Array Operations', () => {
    it('compiles empty array literal', () => {
      const program = compileCode('[]');
      const arrayCreate = findInstruction(program, 'ARRAY_CREATE');
      expect(arrayCreate?.arg).toBe(0);
    });

    it('compiles array literal with elements', () => {
      const program = compileCode('[1, 2, 3]');
      const arrayCreate = findInstruction(program, 'ARRAY_CREATE');
      expect(arrayCreate?.arg).toBe(3);
    });

    it('compiles array index access', () => {
      const program = compileCode('arr[0]');
      expect(getOpcodes(program)).toContain('ARRAY_GET');
    });

    it('compiles array index assignment', () => {
      const program = compileCode('arr[0] = 5');
      expect(getOpcodes(program)).toContain('ARRAY_SET');
    });

    it('compiles slice access', () => {
      const program = compileCode('arr[1:3]');
      expect(getOpcodes(program)).toContain('SLICE');
    });

    it('compiles slice with null start', () => {
      const program = compileCode('arr[:3]');
      const opcodes = getOpcodes(program);
      expect(opcodes).toContain('SLICE');
      // Should push null for start
      const pushes = program.instructions.filter((i) => i.op === 'PUSH');
      expect(pushes.some((p) => p.arg === null)).toBe(true);
    });

    it('compiles slice with null end', () => {
      const program = compileCode('arr[1:]');
      const opcodes = getOpcodes(program);
      expect(opcodes).toContain('SLICE');
    });
  });

  describe('Object Operations', () => {
    it('compiles empty object literal', () => {
      const program = compileCode('{}');
      const objectCreate = findInstruction(program, 'OBJECT_CREATE');
      expect(objectCreate?.arg).toBe(0);
    });

    it('compiles object literal with properties', () => {
      const program = compileCode('{a: 1, b: 2}');
      const objectCreate = findInstruction(program, 'OBJECT_CREATE');
      expect(objectCreate?.arg).toBe(2);
    });

    it('compiles object property access', () => {
      const program = compileCode('obj["key"]');
      // Object access uses same opcode as array access (ARRAY_GET)
      expect(getOpcodes(program)).toContain('ARRAY_GET');
    });

    it('compiles object property assignment', () => {
      const program = compileCode('obj["key"] = 5');
      // Object property assignment uses ARRAY_SET
      expect(getOpcodes(program)).toContain('ARRAY_SET');
    });
  });

  describe('Function Calls', () => {
    it('compiles built-in function call', () => {
      const program = compileCode('print(42)');
      const call = findInstruction(program, 'CALL');
      expect(call?.arg).toBe('print:1');
    });

    it('compiles function call with multiple arguments', () => {
      const program = compileCode('foo(1, 2, 3)');
      const call = program.instructions.find((i) => i.op === 'CALL' || i.op === 'CALL_USER');
      expect(call?.arg).toContain(':3');
    });

    it('compiles user function call after definition', () => {
      const program = compileCode('def foo():\n    pass\nfoo()');
      expect(getOpcodes(program)).toContain('CALL_USER');
    });
  });

  describe('Control Flow - If', () => {
    it('compiles if statement with JUMP_IF_NOT', () => {
      const program = compileCode('if x:\n    y');
      expect(getOpcodes(program)).toContain('JUMP_IF_NOT');
    });

    it('compiles if-else with JUMP', () => {
      const program = compileCode('if x:\n    y\nelse:\n    z');
      expect(getOpcodes(program)).toContain('JUMP_IF_NOT');
      expect(getOpcodes(program)).toContain('JUMP');
    });
  });

  describe('Control Flow - While', () => {
    it('compiles while loop with JUMP and JUMP_IF_NOT', () => {
      const program = compileCode('while x:\n    y');
      expect(getOpcodes(program)).toContain('JUMP');
      expect(getOpcodes(program)).toContain('JUMP_IF_NOT');
    });

    it('creates proper loop structure', () => {
      const program = compileCode('while x:\n    y');
      const opcodes = getOpcodes(program);
      // Should have: condition check, JUMP_IF_NOT to end, body, JUMP back to condition
      expect(opcodes.filter((op) => op === 'JUMP').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Control Flow - For', () => {
    it('compiles for loop', () => {
      const program = compileCode('for i in range(5):\n    x');
      // For loop uses STORE for loop variable
      expect(getOpcodes(program)).toContain('STORE');
      expect(getOpcodes(program)).toContain('JUMP');
    });
  });

  describe('Control Flow - ForEach', () => {
    it('compiles for-each loop', () => {
      const program = compileCode('for x in arr:\n    y');
      // ForEach creates temp variables and iterates
      expect(getOpcodes(program)).toContain('STORE');
      expect(getOpcodes(program)).toContain('JUMP');
    });
  });

  describe('Control Flow - Repeat', () => {
    it('compiles repeat loop', () => {
      const program = compileCode('repeat 5 times:\n    x');
      expect(getOpcodes(program)).toContain('JUMP');
    });
  });

  describe('Control Flow - Break/Continue', () => {
    it('compiles break as JUMP', () => {
      const program = compileCode('while True:\n    break');
      // Break compiles to JUMP to end of loop
      expect(countOpcode(program, 'JUMP')).toBeGreaterThanOrEqual(1);
    });

    it('compiles continue as JUMP', () => {
      const program = compileCode('while True:\n    continue');
      // Continue compiles to JUMP to loop condition
      expect(countOpcode(program, 'JUMP')).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Control Flow - Pass', () => {
    it('compiles pass as NOP', () => {
      const program = compileCode('pass');
      expect(getOpcodes(program)).toContain('NOP');
    });
  });

  describe('Function Definitions', () => {
    it('registers function in function table', () => {
      const program = compileCode('def foo():\n    pass');
      expect(program.functions.has('foo')).toBe(true);
    });

    it('compiles function with parameters', () => {
      const program = compileCode('def add(a, b):\n    return a + b');
      expect(program.functions.has('add')).toBe(true);
    });

    it('compiles return statement', () => {
      const program = compileCode('def foo():\n    return 42');
      expect(getOpcodes(program)).toContain('RETURN');
    });

    it('compiles return without value', () => {
      const program = compileCode('def foo():\n    return');
      expect(getOpcodes(program)).toContain('RETURN');
    });
  });

  describe('Program Structure', () => {
    it('ends with HALT', () => {
      const program = compileCode('x = 5');
      const lastOp = program.instructions[program.instructions.length - 1].op;
      expect(lastOp).toBe('HALT');
    });

    it('maintains source line mapping', () => {
      const program = compileCode('x = 5\ny = 10');
      // Check that some instructions have source line info
      const withSourceLine = program.instructions.filter((i) => i.sourceLine !== undefined);
      expect(withSourceLine.length).toBeGreaterThan(0);
    });

    it('builds source map', () => {
      const program = compileCode('x = 5\ny = 10');
      expect(program.sourceMap.size).toBeGreaterThan(0);
    });
  });

  describe('Complex Programs', () => {
    it('compiles factorial function', () => {
      const code = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`;
      const program = compileCode(code);
      expect(program.functions.has('factorial')).toBe(true);
      expect(getOpcodes(program)).toContain('CALL_USER');
    });

    it('compiles nested loops', () => {
      const code = `for i in range(3):
    for j in range(3):
        print(i + j)`;
      const program = compileCode(code);
      // Should have multiple JUMP instructions for nested loops
      expect(countOpcode(program, 'JUMP')).toBeGreaterThanOrEqual(2);
    });

    it('compiles array operations', () => {
      const code = `arr = [1, 2, 3]
arr[0] = 10
x = arr[1]`;
      const program = compileCode(code);
      expect(getOpcodes(program)).toContain('ARRAY_CREATE');
      expect(getOpcodes(program)).toContain('ARRAY_SET');
      expect(getOpcodes(program)).toContain('ARRAY_GET');
    });
  });

  describe('Expression Statement Cleanup', () => {
    it('pops unused expression results', () => {
      const program = compileCode('1 + 2');
      // Expression statement should pop the result
      expect(getOpcodes(program)).toContain('POP');
    });

    it('does not pop function call results used in assignment', () => {
      const program = compileCode('x = foo()');
      // Should STORE, not POP
      expect(getOpcodes(program)).toContain('STORE');
    });
  });
});
