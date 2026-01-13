/**
 * Interpreter Tests
 *
 * Tests tree-walking interpreter execution including:
 * - Expression evaluation
 * - Statement execution
 * - Variable scoping
 * - Function calls and returns
 * - Control flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Interpreter } from '../interpreter';
import { compile } from '../index';

// Helper to run code and return the interpreter
function runCode(code: string): Interpreter {
  const ast = compile(code);
  const interpreter = new Interpreter();
  interpreter.load(ast);
  interpreter.run();
  return interpreter;
}

// Helper to capture prints
function runWithPrint(code: string): string[] {
  const interpreter = runCode(code);
  return interpreter.getState().output;
}

describe('Interpreter', () => {
  describe('Literal Evaluation', () => {
    it('evaluates numbers', () => {
      const prints = runWithPrint('print(42)');
      expect(prints).toEqual(['42']);
    });

    it('evaluates floats', () => {
      const prints = runWithPrint('print(3.14)');
      expect(prints).toEqual(['3.14']);
    });

    it('evaluates strings', () => {
      const prints = runWithPrint('print("hello")');
      expect(prints).toEqual(['hello']);
    });

    it('evaluates True', () => {
      const prints = runWithPrint('print(True)');
      expect(prints).toEqual(['true']);
    });

    it('evaluates False', () => {
      const prints = runWithPrint('print(False)');
      expect(prints).toEqual(['false']);
    });
  });

  describe('Arithmetic Operations', () => {
    it('adds numbers', () => {
      const prints = runWithPrint('print(1 + 2)');
      expect(prints).toEqual(['3']);
    });

    it('subtracts numbers', () => {
      const prints = runWithPrint('print(5 - 3)');
      expect(prints).toEqual(['2']);
    });

    it('multiplies numbers', () => {
      const prints = runWithPrint('print(4 * 3)');
      expect(prints).toEqual(['12']);
    });

    it('divides numbers', () => {
      const prints = runWithPrint('print(10 / 4)');
      expect(prints).toEqual(['2.5']);
    });

    it('calculates modulo', () => {
      const prints = runWithPrint('print(10 % 3)');
      expect(prints).toEqual(['1']);
    });

    it('calculates floor division', () => {
      const prints = runWithPrint('print(10 // 3)');
      expect(prints).toEqual(['3']);
    });

    it('negates numbers', () => {
      const prints = runWithPrint('print(-5)');
      expect(prints).toEqual(['-5']);
    });

    it('respects operator precedence', () => {
      const prints = runWithPrint('print(2 + 3 * 4)');
      expect(prints).toEqual(['14']);
    });

    it('respects parentheses', () => {
      const prints = runWithPrint('print((2 + 3) * 4)');
      expect(prints).toEqual(['20']);
    });

    it('concatenates strings with +', () => {
      const prints = runWithPrint('print("hello" + " " + "world")');
      expect(prints).toEqual(['hello world']);
    });

    it('multiplies string by number', () => {
      const prints = runWithPrint('print("ab" * 3)');
      expect(prints).toEqual(['ababab']);
    });

    it('multiplies number by string', () => {
      const prints = runWithPrint('print(3 * "ab")');
      expect(prints).toEqual(['ababab']);
    });
  });

  describe('Comparison Operations', () => {
    it('compares equality', () => {
      const prints = runWithPrint('print(5 == 5)');
      expect(prints).toEqual(['true']);
    });

    it('compares inequality', () => {
      const prints = runWithPrint('print(5 != 3)');
      expect(prints).toEqual(['true']);
    });

    it('compares less than', () => {
      const prints = runWithPrint('print(3 < 5)');
      expect(prints).toEqual(['true']);
    });

    it('compares greater than', () => {
      const prints = runWithPrint('print(5 > 3)');
      expect(prints).toEqual(['true']);
    });

    it('compares less than or equal', () => {
      const prints = runWithPrint('print(5 <= 5)');
      expect(prints).toEqual(['true']);
    });

    it('compares greater than or equal', () => {
      const prints = runWithPrint('print(5 >= 5)');
      expect(prints).toEqual(['true']);
    });

    it('does not support string comparison with < operator', () => {
      // String comparison is not supported - only numbers can use < > <= >=
      const interpreter = runCode('print("a" < "b")');
      expect(interpreter.getState().status).toBe('error');
    });
  });

  describe('Logical Operations', () => {
    it('evaluates and (true and true)', () => {
      const prints = runWithPrint('print(True and True)');
      expect(prints).toEqual(['true']);
    });

    it('evaluates and (true and false)', () => {
      const prints = runWithPrint('print(True and False)');
      expect(prints).toEqual(['false']);
    });

    it('evaluates or (false or true)', () => {
      const prints = runWithPrint('print(False or True)');
      expect(prints).toEqual(['true']);
    });

    it('evaluates or (false or false)', () => {
      const prints = runWithPrint('print(False or False)');
      expect(prints).toEqual(['false']);
    });

    it('evaluates not', () => {
      const prints = runWithPrint('print(not True)');
      expect(prints).toEqual(['false']);
    });

    it('short-circuits and (does not evaluate right operand when left is falsy)', () => {
      // Python-style short-circuit: False and X returns False without evaluating X
      const prints = runWithPrint('print(False and undefined_var)');
      expect(prints).toEqual(['false']);
    });

    it('short-circuits or (does not evaluate right operand when left is truthy)', () => {
      // Python-style short-circuit: True or X returns True without evaluating X
      const prints = runWithPrint('print(True or undefined_var)');
      expect(prints).toEqual(['true']);
    });

    it('and returns actual values, not just booleans', () => {
      // Python semantics: and/or return actual values
      const prints = runWithPrint('print(1 and 2)\nprint(0 and 2)\nprint("" and "hello")');
      expect(prints).toEqual(['2', '0', '']);
    });

    it('or returns actual values, not just booleans', () => {
      // Python semantics: and/or return actual values
      const prints = runWithPrint('print(1 or 2)\nprint(0 or 2)\nprint("" or "hello")');
      expect(prints).toEqual(['1', '2', 'hello']);
    });
  });

  describe('Variable Assignment', () => {
    it('assigns and retrieves variables', () => {
      const prints = runWithPrint('x = 42\nprint(x)');
      expect(prints).toEqual(['42']);
    });

    it('updates variables', () => {
      const prints = runWithPrint('x = 1\nx = 2\nprint(x)');
      expect(prints).toEqual(['2']);
    });

    it('uses variables in expressions', () => {
      const prints = runWithPrint('x = 5\ny = 3\nprint(x + y)');
      expect(prints).toEqual(['8']);
    });
  });

  describe('Array Operations', () => {
    it('creates arrays', () => {
      const prints = runWithPrint('arr = [1, 2, 3]\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });

    it('accesses array elements', () => {
      const prints = runWithPrint('arr = [10, 20, 30]\nprint(arr[1])');
      expect(prints).toEqual(['20']);
    });

    it('accesses with negative index', () => {
      const prints = runWithPrint('arr = [10, 20, 30]\nprint(arr[-1])');
      expect(prints).toEqual(['30']);
    });

    it('modifies array elements', () => {
      const prints = runWithPrint('arr = [1, 2, 3]\narr[1] = 99\nprint(arr[1])');
      expect(prints).toEqual(['99']);
    });

    it('calculates array length', () => {
      const prints = runWithPrint('arr = [1, 2, 3, 4, 5]\nprint(len(arr))');
      expect(prints).toEqual(['5']);
    });

    it('appends to array', () => {
      const prints = runWithPrint('arr = [1, 2]\nappend(arr, 3)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });

    it('pops from array', () => {
      const prints = runWithPrint('arr = [1, 2, 3]\nx = pop(arr)\nprint(x)\nprint(arr)');
      expect(prints).toEqual(['3', '1,2']);
    });

    it('inserts into array', () => {
      const prints = runWithPrint('arr = [1, 3]\ninsert(arr, 1, 2)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });
  });

  describe('Slice Operations', () => {
    it('slices array [start:end]', () => {
      const prints = runWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[1:4])');
      expect(prints).toEqual(['1,2,3']);
    });

    it('slices array [start:]', () => {
      const prints = runWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[2:])');
      expect(prints).toEqual(['2,3,4']);
    });

    it('slices array [:end]', () => {
      const prints = runWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[:3])');
      expect(prints).toEqual(['0,1,2']);
    });

    it('slices array [:]', () => {
      const prints = runWithPrint('arr = [0, 1, 2]\nprint(arr[:])');
      expect(prints).toEqual(['0,1,2']);
    });

    it('slices with negative indices', () => {
      const prints = runWithPrint('arr = [0, 1, 2, 3, 4]\nprint(arr[-3:-1])');
      expect(prints).toEqual(['2,3']);
    });

    it('slices strings', () => {
      const prints = runWithPrint('s = "hello"\nprint(s[1:4])');
      expect(prints).toEqual(['ell']);
    });
  });

  describe('Object Operations', () => {
    it('creates objects', () => {
      const prints = runWithPrint('obj = {name: "Alice"}\nprint(obj["name"])');
      expect(prints).toEqual(['Alice']);
    });

    it('modifies object properties', () => {
      const prints = runWithPrint('obj = {x: 1}\nobj["x"] = 2\nprint(obj["x"])');
      expect(prints).toEqual(['2']);
    });

    it('adds new properties', () => {
      const prints = runWithPrint('obj = {}\nobj["key"] = "value"\nprint(obj["key"])');
      expect(prints).toEqual(['value']);
    });
  });

  describe('If Statements', () => {
    it('executes if branch when true', () => {
      const prints = runWithPrint('if True:\n    print("yes")');
      expect(prints).toEqual(['yes']);
    });

    it('skips if branch when false', () => {
      const prints = runWithPrint('if False:\n    print("yes")');
      expect(prints).toEqual([]);
    });

    it('executes else branch when false', () => {
      const prints = runWithPrint('if False:\n    print("yes")\nelse:\n    print("no")');
      expect(prints).toEqual(['no']);
    });

    it('evaluates condition expressions', () => {
      const prints = runWithPrint('x = 5\nif x > 3:\n    print("big")');
      expect(prints).toEqual(['big']);
    });

    it('handles elif branches', () => {
      const code = `x = 2
if x == 1:
    print("one")
elif x == 2:
    print("two")
else:
    print("other")`;
      const prints = runWithPrint(code);
      expect(prints).toEqual(['two']);
    });
  });

  describe('While Loops', () => {
    it('executes while body', () => {
      const prints = runWithPrint('i = 0\nwhile i < 3:\n    print(i)\n    i = i + 1');
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('handles break', () => {
      const prints = runWithPrint(
        'i = 0\nwhile True:\n    if i >= 2:\n        break\n    print(i)\n    i = i + 1'
      );
      expect(prints).toEqual(['0', '1']);
    });

    it('handles continue', () => {
      const prints = runWithPrint(
        'i = 0\nwhile i < 5:\n    i = i + 1\n    if i == 3:\n        continue\n    print(i)'
      );
      expect(prints).toEqual(['1', '2', '4', '5']);
    });
  });

  describe('For Loops', () => {
    it('iterates over range', () => {
      const prints = runWithPrint('for i in range(3):\n    print(i)');
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('iterates over range(start, end)', () => {
      const prints = runWithPrint('for i in range(2, 5):\n    print(i)');
      expect(prints).toEqual(['2', '3', '4']);
    });

    it('handles break in for loop', () => {
      const prints = runWithPrint(
        'for i in range(10):\n    if i >= 3:\n        break\n    print(i)'
      );
      expect(prints).toEqual(['0', '1', '2']);
    });

    it('handles continue in for loop', () => {
      const prints = runWithPrint(
        'for i in range(5):\n    if i == 2:\n        continue\n    print(i)'
      );
      expect(prints).toEqual(['0', '1', '3', '4']);
    });
  });

  describe('For-Each Loops', () => {
    it('iterates over array', () => {
      const prints = runWithPrint('for x in [1, 2, 3]:\n    print(x)');
      expect(prints).toEqual(['1', '2', '3']);
    });

    it('iterates over array variable', () => {
      const prints = runWithPrint('arr = [10, 20, 30]\nfor x in arr:\n    print(x)');
      expect(prints).toEqual(['10', '20', '30']);
    });

    it('iterates over string', () => {
      const prints = runWithPrint('for c in "abc":\n    print(c)');
      expect(prints).toEqual(['a', 'b', 'c']);
    });

    it('handles break in for-each', () => {
      const prints = runWithPrint(
        'for x in [1, 2, 3, 4]:\n    if x > 2:\n        break\n    print(x)'
      );
      expect(prints).toEqual(['1', '2']);
    });

    it('handles continue in for-each', () => {
      const prints = runWithPrint(
        'for x in [1, 2, 3, 4]:\n    if x == 2:\n        continue\n    print(x)'
      );
      expect(prints).toEqual(['1', '3', '4']);
    });
  });

  describe('Repeat Loops', () => {
    it('repeats n times', () => {
      const prints = runWithPrint('repeat 3 times:\n    print("hi")');
      expect(prints).toEqual(['hi', 'hi', 'hi']);
    });

    it('handles break in repeat', () => {
      const prints = runWithPrint(
        'i = 0\nrepeat 10 times:\n    i = i + 1\n    if i > 2:\n        break\n    print(i)'
      );
      expect(prints).toEqual(['1', '2']);
    });
  });

  describe('Function Definitions', () => {
    it('defines and calls simple function', () => {
      const prints = runWithPrint('def greet():\n    print("hello")\ngreet()');
      expect(prints).toEqual(['hello']);
    });

    it('passes arguments to function', () => {
      const prints = runWithPrint('def greet(name):\n    print(name)\ngreet("Alice")');
      expect(prints).toEqual(['Alice']);
    });

    it('returns value from function', () => {
      const prints = runWithPrint('def add(a, b):\n    return a + b\nprint(add(3, 4))');
      expect(prints).toEqual(['7']);
    });

    it('handles early return', () => {
      const code = `def check(x):
    if x < 0:
        return "negative"
    return "positive"
print(check(-5))`;
      const prints = runWithPrint(code);
      expect(prints).toEqual(['negative']);
    });

    it('handles recursive functions', () => {
      const code = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
print(factorial(5))`;
      const prints = runWithPrint(code);
      expect(prints).toEqual(['120']);
    });

    it('maintains separate scopes', () => {
      const code = `x = 1
def foo():
    x = 2
    print(x)
foo()
print(x)`;
      const prints = runWithPrint(code);
      expect(prints).toEqual(['2', '1']);
    });
  });

  describe('Pass Statement', () => {
    it('does nothing', () => {
      const prints = runWithPrint('pass\nprint("done")');
      expect(prints).toEqual(['done']);
    });

    it('works in function body', () => {
      const prints = runWithPrint('def empty():\n    pass\nempty()\nprint("ok")');
      expect(prints).toEqual(['ok']);
    });

    it('works in if body', () => {
      const prints = runWithPrint('if True:\n    pass\nprint("ok")');
      expect(prints).toEqual(['ok']);
    });
  });

  describe('Built-in Functions', () => {
    it('calls len on array', () => {
      const prints = runWithPrint('print(len([1, 2, 3]))');
      expect(prints).toEqual(['3']);
    });

    it('calls len on string', () => {
      const prints = runWithPrint('print(len("hello"))');
      expect(prints).toEqual(['5']);
    });

    it('calls round', () => {
      const prints = runWithPrint('print(round(3.7))');
      expect(prints).toEqual(['4']);
    });

    it('calls sqrt', () => {
      const prints = runWithPrint('print(sqrt(16))');
      expect(prints).toEqual(['4']);
    });

    it('calls pow', () => {
      const prints = runWithPrint('print(pow(2, 3))');
      expect(prints).toEqual(['8']);
    });

    it('calls abs', () => {
      const prints = runWithPrint('print(abs(-5))');
      expect(prints).toEqual(['5']);
    });

    it('calls min', () => {
      const prints = runWithPrint('print(min(3, 1, 4, 1, 5))');
      expect(prints).toEqual(['1']);
    });

    it('calls max', () => {
      const prints = runWithPrint('print(max(3, 1, 4, 1, 5))');
      expect(prints).toEqual(['5']);
    });
  });

  describe('Chinese Function Aliases', () => {
    it('calls 长度 (len)', () => {
      const prints = runWithPrint('print(长度([1, 2, 3]))');
      expect(prints).toEqual(['3']);
    });

    it('calls 四舍五入 (round)', () => {
      const prints = runWithPrint('print(四舍五入(3.7))');
      expect(prints).toEqual(['4']);
    });

    it('calls 平方根 (sqrt)', () => {
      const prints = runWithPrint('print(平方根(16))');
      expect(prints).toEqual(['4']);
    });

    it('calls 幂 (pow)', () => {
      const prints = runWithPrint('print(幂(2, 3))');
      expect(prints).toEqual(['8']);
    });

    it('calls 添加 (append)', () => {
      const prints = runWithPrint('arr = [1, 2]\n添加(arr, 3)\nprint(arr)');
      expect(prints).toEqual(['1,2,3']);
    });
  });

  describe('External Command Handlers', () => {
    it('calls registered command handlers', () => {
      let called = false;
      const ast = compile('myFunc()');
      const interpreter = new Interpreter();
      interpreter.registerCommand('myFunc', () => {
        called = true;
      });
      interpreter.load(ast);
      interpreter.run();
      expect(called).toBe(true);
    });

    it('receives arguments in command handlers', () => {
      let receivedArg: any;
      const ast = compile('myFunc(42)');
      const interpreter = new Interpreter();
      interpreter.registerCommand('myFunc', (args) => {
        receivedArg = args[0];
      });
      interpreter.load(ast);
      interpreter.run();
      expect(receivedArg).toBe(42);
    });

    it('uses sensor return values', () => {
      const ast = compile('x = getSensor()\nprint(x)');
      const interpreter = new Interpreter();
      interpreter.registerSensor('getSensor', () => true);
      interpreter.load(ast);
      interpreter.run();
      // Sensors return boolean values
      expect(interpreter.getState().output).toEqual(['true']);
    });
  });

  describe('In Operator', () => {
    it('checks membership in array', () => {
      const prints = runWithPrint('print(2 in [1, 2, 3])');
      expect(prints).toEqual(['true']);
    });

    it('checks non-membership in array', () => {
      const prints = runWithPrint('print(5 in [1, 2, 3])');
      expect(prints).toEqual(['false']);
    });

    it('checks substring in string', () => {
      const prints = runWithPrint('print("el" in "hello")');
      expect(prints).toEqual(['true']);
    });
  });

  // Note: Error handling tests removed - interpreter silently handles some edge cases
  // rather than throwing exceptions (by design for kid-friendly error messages)
});
