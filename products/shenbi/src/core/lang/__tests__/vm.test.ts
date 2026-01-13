/**
 * VM Tests
 *
 * Tests stack-based virtual machine execution including:
 * - All opcodes
 * - Stack operations
 * - Variable handling
 * - Function calls
 * - Control flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VM } from '../vm';
import { compile, compileToIR } from '../index';
import type { CompiledProgram, Instruction } from '../ir';
import { IR } from '../ir';

// Helper to run code through VM
function runVM(code: string): any {
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();
  vm.load(program);

  let result;
  while (true) {
    result = vm.step();
    if (result.done) break;
  }

  // Check for errors in VM state and throw
  const state = vm.getState();
  if (state.status === 'error' && state.error) {
    throw new Error(state.error);
  }

  return result;
}

// Helper to capture prints from VM
function runVMWithPrint(code: string): string[] {
  const prints: string[] = [];
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();

  // Register print as a command handler to capture output
  vm.registerCommand('print', (args) => {
    prints.push(String(args[0]));
  });
  vm.registerCommand('打印', (args) => {
    prints.push(String(args[0]));
  });

  vm.load(program);

  while (true) {
    const result = vm.step();
    if (result.done) break;
  }
  return prints;
}

describe('VM', () => {
  describe('Stack Operations', () => {
    it('pushes and pops values', () => {
      const prints = runVMWithPrint('print(42)');
      expect(prints).toEqual(['42']);
    });

    it('handles multiple values on stack', () => {
      const prints = runVMWithPrint('print(1 + 2 + 3)');
      expect(prints).toEqual(['6']);
    });
  });

  describe('Arithmetic Operations', () => {
    it('executes ADD', () => {
      const prints = runVMWithPrint('print(10 + 5)');
      expect(prints).toEqual(['15']);
    });

    it('executes SUB', () => {
      const prints = runVMWithPrint('print(10 - 3)');
      expect(prints).toEqual(['7']);
    });

    it('executes MUL', () => {
      const prints = runVMWithPrint('print(4 * 5)');
      expect(prints).toEqual(['20']);
    });

    it('executes DIV', () => {
      const prints = runVMWithPrint('print(15 / 3)');
      expect(prints).toEqual(['5']);
    });

    it('executes MOD', () => {
      const prints = runVMWithPrint('print(17 % 5)');
      expect(prints).toEqual(['2']);
    });

    it('executes FLOOR_DIV', () => {
      const prints = runVMWithPrint('print(17 // 5)');
      expect(prints).toEqual(['3']);
    });

    it('executes NEG', () => {
      const prints = runVMWithPrint('print(-42)');
      expect(prints).toEqual(['-42']);
    });

    it('handles string concatenation with ADD', () => {
      const prints = runVMWithPrint('print("hello" + " world")');
      expect(prints).toEqual(['hello world']);
    });

    it('handles string multiplication with MUL', () => {
      const prints = runVMWithPrint('print("ab" * 3)');
      expect(prints).toEqual(['ababab']);
    });

    it('handles number * string', () => {
      const prints = runVMWithPrint('print(3 * "xy")');
      expect(prints).toEqual(['xyxyxy']);
    });
  });

  describe('Comparison Operations', () => {
    it('executes EQ (true)', () => {
      const prints = runVMWithPrint('print(5 == 5)');
      expect(prints).toEqual(['true']);
    });

    it('executes EQ (false)', () => {
      const prints = runVMWithPrint('print(5 == 3)');
      expect(prints).toEqual(['false']);
    });

    it('executes NEQ', () => {
      const prints = runVMWithPrint('print(5 != 3)');
      expect(prints).toEqual(['true']);
    });

    it('executes LT', () => {
      const prints = runVMWithPrint('print(3 < 5)');
      expect(prints).toEqual(['true']);
    });

    it('executes GT', () => {
      const prints = runVMWithPrint('print(5 > 3)');
      expect(prints).toEqual(['true']);
    });

    it('executes LTE', () => {
      const prints = runVMWithPrint('print(5 <= 5)');
      expect(prints).toEqual(['true']);
    });

    it('executes GTE', () => {
      const prints = runVMWithPrint('print(5 >= 5)');
      expect(prints).toEqual(['true']);
    });

    it('executes IN (array membership)', () => {
      const prints = runVMWithPrint('print(2 in [1, 2, 3])');
      expect(prints).toEqual(['true']);
    });

    it('executes IN (string substring)', () => {
      const prints = runVMWithPrint('print("ell" in "hello")');
      expect(prints).toEqual(['true']);
    });
  });

  describe('Logical Operations', () => {
    it('executes AND (true and true)', () => {
      const prints = runVMWithPrint('print(True and True)');
      expect(prints).toEqual(['true']);
    });

    it('executes AND (true and false)', () => {
      const prints = runVMWithPrint('print(True and False)');
      expect(prints).toEqual(['false']);
    });

    it('executes OR (false or true)', () => {
      const prints = runVMWithPrint('print(False or True)');
      expect(prints).toEqual(['true']);
    });

    it('executes OR (false or false)', () => {
      const prints = runVMWithPrint('print(False or False)');
      expect(prints).toEqual(['false']);
    });

    it('executes NOT', () => {
      const prints = runVMWithPrint('print(not True)');
      expect(prints).toEqual(['false']);
    });
  });

  describe('Variable Operations', () => {
    it('executes STORE and LOAD', () => {
      const prints = runVMWithPrint('x = 42\nprint(x)');
      expect(prints).toEqual(['42']);
    });

    it('handles variable updates', () => {
      const prints = runVMWithPrint('x = 1\nx = 2\nprint(x)');
      expect(prints).toEqual(['2']);
    });

    it('handles multiple variables', () => {
      const prints = runVMWithPrint('x = 1\ny = 2\nprint(x + y)');
      expect(prints).toEqual(['3']);
    });
  });

  describe('Array Operations', () => {
    it('executes ARRAY_CREATE', () => {
      const prints = runVMWithPrint('arr = [1, 2, 3]\nprint(len(arr))');
      expect(prints).toEqual(['3']);
    });

    it('executes ARRAY_GET', () => {
      const prints = runVMWithPrint('arr = [10, 20, 30]\nprint(arr[1])');
      expect(prints).toEqual(['20']);
    });

    it('executes ARRAY_GET with negative index', () => {
      const prints = runVMWithPrint('arr = [10, 20, 30]\nprint(arr[-1])');
      expect(prints).toEqual(['30']);
    });

    it('executes ARRAY_SET', () => {
      const prints = runVMWithPrint('arr = [1, 2, 3]\narr[1] = 99\nprint(arr[1])');
      expect(prints).toEqual(['99']);
    });

    it('executes SLICE [start:end]', () => {
      const prints = runVMWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[1:4])');
      expect(prints).toEqual(['1,2,3']);
    });

    it('executes SLICE [start:]', () => {
      const prints = runVMWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[3:])');
      expect(prints).toEqual(['3,4']);
    });

    it('executes SLICE [:end]', () => {
      const prints = runVMWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[:2])');
      expect(prints).toEqual(['0,1']);
    });

    it('executes SLICE [:]', () => {
      const prints = runVMWithPrint('arr = [1, 2, 3]\nprint(arr[:])');
      expect(prints).toEqual(['1,2,3']);
    });

    it('executes SLICE with negative indices', () => {
      const prints = runVMWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[-3:-1])');
      expect(prints).toEqual(['2,3']);
    });

    it('executes string slicing', () => {
      const prints = runVMWithPrint('s = "hello"\nprint(s[1:4])');
      expect(prints).toEqual(['ell']);
    });
  });

  describe('Object Operations', () => {
    it('executes OBJECT_CREATE', () => {
      const prints = runVMWithPrint('obj = {a: 1, b: 2}\nprint(obj["a"])');
      expect(prints).toEqual(['1']);
    });

    it('executes OBJECT_GET', () => {
      const prints = runVMWithPrint('obj = {name: "Alice"}\nprint(obj["name"])');
      expect(prints).toEqual(['Alice']);
    });

    it('executes OBJECT_SET', () => {
      const prints = runVMWithPrint('obj = {x: 1}\nobj["x"] = 2\nprint(obj["x"])');
      expect(prints).toEqual(['2']);
    });

    it('adds new object property', () => {
      const prints = runVMWithPrint('obj = {}\nobj["key"] = "value"\nprint(obj["key"])');
      expect(prints).toEqual(['value']);
    });
  });

  describe('Control Flow - JUMP', () => {
    it('executes unconditional JUMP', () => {
      // While loop uses JUMP to loop back
      const prints = runVMWithPrint('i = 0\nwhile i < 3:\n    print(i)\n    i = i + 1');
      expect(prints).toEqual(['0', '1', '2']);
    });
  });

  describe('Control Flow - JUMP_IF_NOT', () => {
    it('jumps when condition is false', () => {
      const prints = runVMWithPrint('if False:\n    print("yes")\nprint("done")');
      expect(prints).toEqual(['done']);
    });

    it('does not jump when condition is true', () => {
      const prints = runVMWithPrint('if True:\n    print("yes")\nprint("done")');
      expect(prints).toEqual(['yes', 'done']);
    });
  });

  describe('Control Flow - JUMP_IF', () => {
    it('jumps when condition is true', () => {
      // This is used internally for short-circuit evaluation
      const prints = runVMWithPrint('print(True or undefined)');
      expect(prints).toEqual(['true']);
    });
  });

  describe('Function Calls - CALL', () => {
    it('calls built-in functions', () => {
      const prints = runVMWithPrint('print(len([1, 2, 3]))');
      expect(prints).toEqual(['3']);
    });

    it('calls len on string', () => {
      const prints = runVMWithPrint('print(len("hello"))');
      expect(prints).toEqual(['5']);
    });

    it('calls round', () => {
      const prints = runVMWithPrint('print(round(3.7))');
      expect(prints).toEqual(['4']);
    });

    it('calls sqrt', () => {
      const prints = runVMWithPrint('print(sqrt(16))');
      expect(prints).toEqual(['4']);
    });

    it('calls pow', () => {
      const prints = runVMWithPrint('print(pow(2, 3))');
      expect(prints).toEqual(['8']);
    });

    it('calls abs', () => {
      const prints = runVMWithPrint('print(abs(-5))');
      expect(prints).toEqual(['5']);
    });

    it('calls append', () => {
      const prints = runVMWithPrint('arr = [1, 2]\nappend(arr, 3)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });

    it('calls pop', () => {
      const prints = runVMWithPrint('arr = [1, 2, 3]\nx = pop(arr)\nprint(x)\nprint(arr)');
      expect(prints).toEqual(['3', '1,2']);
    });

    it('calls insert', () => {
      const prints = runVMWithPrint('arr = [1, 3]\ninsert(arr, 1, 2)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });

    it('calls registered command handlers', () => {
      let called = false;
      const ast = compile('myFunc()');
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('myFunc', () => {
        called = true;
      });
      vm.load(program);

      while (!vm.step().done) {}
      expect(called).toBe(true);
    });
  });

  describe('Function Calls - CALL_USER', () => {
    it('calls user-defined function', () => {
      const prints = runVMWithPrint('def greet():\n    print("hi")\ngreet()');
      expect(prints).toEqual(['hi']);
    });

    it('passes arguments to function', () => {
      const prints = runVMWithPrint('def echo(x):\n    print(x)\necho(42)');
      expect(prints).toEqual(['42']);
    });

    it('returns value from function', () => {
      const prints = runVMWithPrint('def add(a, b):\n    return a + b\nprint(add(3, 4))');
      expect(prints).toEqual(['7']);
    });

    it('handles recursive function calls', () => {
      const code = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
print(fib(6))`;
      const prints = runVMWithPrint(code);
      expect(prints).toEqual(['8']);
    });
  });

  describe('RETURN', () => {
    it('returns from function', () => {
      const prints = runVMWithPrint('def foo():\n    return 42\nprint(foo())');
      expect(prints).toEqual(['42']);
    });

    it('returns null when no value', () => {
      const prints = runVMWithPrint('def foo():\n    return\nprint(foo())');
      expect(prints).toEqual(['null']);
    });

    it('handles early return', () => {
      const code = `def check(x):
    if x < 0:
        return "neg"
    return "pos"
print(check(-1))`;
      const prints = runVMWithPrint(code);
      expect(prints).toEqual(['neg']);
    });
  });

  describe('NOP', () => {
    it('executes pass as NOP', () => {
      const prints = runVMWithPrint('pass\nprint("ok")');
      expect(prints).toEqual(['ok']);
    });
  });

  describe('HALT', () => {
    it('stops execution', () => {
      const result = runVM('x = 5');
      expect(result.done).toBe(true);
    });
  });

  describe('While Loops', () => {
    it('executes while loop body', () => {
      const prints = runVMWithPrint('i = 0\nwhile i < 3:\n    print(i)\n    i = i + 1');
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('handles break', () => {
      const prints = runVMWithPrint(
        'i = 0\nwhile True:\n    if i >= 2:\n        break\n    print(i)\n    i = i + 1'
      );
      expect(prints).toEqual(['0', '1']);
    });

    it('handles continue', () => {
      const prints = runVMWithPrint(
        'i = 0\nwhile i < 5:\n    i = i + 1\n    if i == 3:\n        continue\n    print(i)'
      );
      expect(prints).toEqual(['1', '2', '4', '5']);
    });
  });

  describe('For Loops', () => {
    it('iterates over range', () => {
      const prints = runVMWithPrint('for i in range(3):\n    print(i)');
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('iterates over range(start, end)', () => {
      const prints = runVMWithPrint('for i in range(2, 5):\n    print(i)');
      expect(prints).toEqual(['2', '3', '4']);
    });

    it('handles break in for', () => {
      const prints = runVMWithPrint(
        'for i in range(10):\n    if i >= 3:\n        break\n    print(i)'
      );
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('handles continue in for', () => {
      const prints = runVMWithPrint(
        'for i in range(5):\n    if i == 2:\n        continue\n    print(i)'
      );
      expect(prints).toEqual(['0', '1', '3', '4']);
    });
  });

  describe('For-Each Loops', () => {
    it('iterates over array', () => {
      const prints = runVMWithPrint('for x in [1, 2, 3]:\n    print(x)');
      expect(prints).toEqual(['1', '2', '3']);
    });

    it('iterates over array variable', () => {
      const prints = runVMWithPrint('arr = [10, 20, 30]\nfor x in arr:\n    print(x)');
      expect(prints).toEqual(['10', '20', '30']);
    });

    it('iterates over string', () => {
      const prints = runVMWithPrint('for c in "abc":\n    print(c)');
      expect(prints).toEqual(['a', 'b', 'c']);
    });

    it('handles break in for-each', () => {
      const prints = runVMWithPrint(
        'for x in [1, 2, 3, 4]:\n    if x > 2:\n        break\n    print(x)'
      );
      expect(prints).toEqual(['1', '2']);
    });

    it('handles continue in for-each', () => {
      const prints = runVMWithPrint(
        'for x in [1, 2, 3]:\n    if x == 2:\n        continue\n    print(x)'
      );
      expect(prints).toEqual(['1', '3']);
    });
  });

  describe('Repeat Loops', () => {
    it('repeats n times', () => {
      const prints = runVMWithPrint('repeat 3 times:\n    print("hi")');
      expect(prints).toEqual(['hi', 'hi', 'hi']);
    });

    it('handles break in repeat', () => {
      const prints = runVMWithPrint(
        'i = 0\nrepeat 10 times:\n    i = i + 1\n    if i > 2:\n        break\n    print(i)'
      );
      expect(prints).toEqual(['1', '2']);
    });
  });

  describe('If-Else', () => {
    it('executes if branch', () => {
      const prints = runVMWithPrint('if True:\n    print("yes")');
      expect(prints).toEqual(['yes']);
    });

    it('executes else branch', () => {
      const prints = runVMWithPrint('if False:\n    print("yes")\nelse:\n    print("no")');
      expect(prints).toEqual(['no']);
    });

    it('handles elif', () => {
      const code = `x = 2
if x == 1:
    print("one")
elif x == 2:
    print("two")
else:
    print("other")`;
      const prints = runVMWithPrint(code);
      expect(prints).toEqual(['two']);
    });
  });

  describe('VM State', () => {
    it('tracks current line', () => {
      const ast = compile('x = 5\ny = 10');
      const program = compileToIR(ast);
      const vm = new VM();
      vm.load(program);

      const result = vm.step();
      expect(result.highlightLine).toBeDefined();
    });

    it('reports done when halted', () => {
      const result = runVM('x = 5');
      expect(result.done).toBe(true);
    });

    it('exposes variables', () => {
      const ast = compile('x = 42\ny = "hello"');
      const program = compileToIR(ast);
      const vm = new VM();
      vm.load(program);

      while (!vm.step().done) {}

      const vars = vm.getVariables();
      expect(vars.x).toBe(42);
      expect(vars.y).toBe('hello');
    });
  });

  describe('Error Handling', () => {
    it('throws on undefined variable', () => {
      expect(() => runVM('print(undefined_var)')).toThrow();
    });

    it('throws on division by zero', () => {
      // VM explicitly throws on division by zero
      expect(() => runVM('x = 1 / 0')).toThrow();
    });

    it('throws on array index out of bounds', () => {
      // VM explicitly throws on array index out of bounds
      expect(() => runVM('arr = [1, 2, 3]\nx = arr[10]')).toThrow();
    });

    it('throws on calling undefined function', () => {
      expect(() => runVM('undefined_func()')).toThrow();
    });
  });

  describe('Chinese Built-in Aliases', () => {
    it('executes 长度 (len)', () => {
      const prints = runVMWithPrint('print(长度([1, 2, 3]))');
      expect(prints).toEqual(['3']);
    });

    it('executes 四舍五入 (round)', () => {
      const prints = runVMWithPrint('print(四舍五入(3.7))');
      expect(prints).toEqual(['4']);
    });

    it('executes 平方根 (sqrt)', () => {
      const prints = runVMWithPrint('print(平方根(16))');
      expect(prints).toEqual(['4']);
    });

    it('executes 幂 (pow)', () => {
      const prints = runVMWithPrint('print(幂(2, 3))');
      expect(prints).toEqual(['8']);
    });

    it('executes 添加 (append)', () => {
      const prints = runVMWithPrint('arr = [1]\n添加(arr, 2)\nprint(arr)');
      expect(prints).toEqual(['1,2']);
    });

    it('executes 弹出 (pop)', () => {
      const prints = runVMWithPrint('arr = [1, 2]\nx = 弹出(arr)\nprint(x)');
      expect(prints).toEqual(['2']);
    });

    it('executes 插入 (insert)', () => {
      const prints = runVMWithPrint('arr = [1, 3]\n插入(arr, 1, 2)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });
  });
});
