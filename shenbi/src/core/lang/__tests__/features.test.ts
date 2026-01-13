/**
 * New Features Tests
 *
 * Comprehensive tests for recently added MiniPython features:
 * - Array/String slicing
 * - For-each loops
 * - Math functions (round, sqrt, pow)
 * - String multiplication
 * - Pass statement
 * - Break/Continue in loops
 */

import { describe, it, expect } from 'vitest';
import { Interpreter } from '../interpreter';
import { VM } from '../vm';
import { compile, compileToIR } from '../index';

// Run with tree-walking interpreter
function runInterpreter(code: string): string[] {
  const ast = compile(code);
  const interpreter = new Interpreter();
  interpreter.load(ast);
  interpreter.run();
  return interpreter.getState().output;
}

// Run with bytecode VM
function runVM(code: string): string[] {
  const prints: string[] = [];
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();

  // Register print to capture output since VM's built-in print is a no-op
  vm.registerCommand('print', (args) => prints.push(String(args[0])));
  vm.registerCommand('打印', (args) => prints.push(String(args[0])));

  vm.load(program);
  while (!vm.step().done) {}
  return prints;
}

// Test both interpreter and VM
function testBoth(name: string, code: string, expected: string[]) {
  it(`${name} (interpreter)`, () => {
    expect(runInterpreter(code)).toEqual(expected);
  });

  it(`${name} (VM)`, () => {
    expect(runVM(code)).toEqual(expected);
  });
}

describe('New Features', () => {
  describe('Array Slicing', () => {
    testBoth('slices array [start:end]', 'arr = [0, 1, 2, 3, 4]\nprint(arr[1:4])', ['1,2,3']);

    testBoth('slices array [start:]', 'arr = [0, 1, 2, 3, 4]\nprint(arr[3:])', ['3,4']);

    testBoth('slices array [:end]', 'arr = [0, 1, 2, 3, 4]\nprint(arr[:2])', ['0,1']);

    testBoth('slices array [:]', 'arr = [0, 1, 2]\nprint(arr[:])', ['0,1,2']);

    testBoth('slices with negative start', 'arr = [0, 1, 2, 3, 4]\nprint(arr[-3:])', ['2,3,4']);

    testBoth('slices with negative end', 'arr = [0, 1, 2, 3, 4]\nprint(arr[:-2])', ['0,1,2']);

    testBoth('slices with both negative', 'arr = [0, 1, 2, 3, 4]\nprint(arr[-4:-1])', ['1,2,3']);

    testBoth('empty slice when start >= end', 'arr = [0, 1, 2, 3, 4]\nprint(arr[3:1])', ['']);

    testBoth('handles out of bounds gracefully', 'arr = [0, 1, 2]\nprint(arr[1:100])', ['1,2']);
  });

  describe('String Slicing', () => {
    testBoth('slices string [start:end]', 'print("hello"[1:4])', ['ell']);

    testBoth('slices string [start:]', 'print("hello"[2:])', ['llo']);

    testBoth('slices string [:end]', 'print("hello"[:3])', ['hel']);

    testBoth('slices string [:]', 'print("abc"[:])', ['abc']);

    testBoth('slices string with negative indices', 'print("hello"[-4:-1])', ['ell']);
  });

  describe('For-Each Loops', () => {
    testBoth('iterates over array literal', 'for x in [1, 2, 3]:\n    print(x)', ['1', '2', '3']);

    testBoth('iterates over array variable', 'arr = [10, 20, 30]\nfor x in arr:\n    print(x)', [
      '10',
      '20',
      '30',
    ]);

    testBoth('iterates over string', 'for c in "abc":\n    print(c)', ['a', 'b', 'c']);

    testBoth('handles empty array', 'for x in []:\n    print(x)\nprint("done")', ['done']);

    testBoth('handles empty string', 'for c in "":\n    print(c)\nprint("done")', ['done']);

    testBoth(
      'modifies iteration variable',
      `sum = 0
for x in [1, 2, 3]:
    sum = sum + x
print(sum)`,
      ['6']
    );

    testBoth(
      'nested for-each loops',
      `for i in [1, 2]:
    for j in ["a", "b"]:
        print(j)`,
      ['a', 'b', 'a', 'b']
    );

    testBoth(
      'for-each with break',
      `for x in [1, 2, 3, 4, 5]:
    if x > 3:
        break
    print(x)`,
      ['1', '2', '3']
    );

    testBoth(
      'for-each with continue',
      `for x in [1, 2, 3, 4, 5]:
    if x == 3:
        continue
    print(x)`,
      ['1', '2', '4', '5']
    );
  });

  describe('Math Functions - round', () => {
    testBoth('rounds down', 'print(round(3.2))', ['3']);
    testBoth('rounds up', 'print(round(3.7))', ['4']);
    testBoth('rounds half up', 'print(round(3.5))', ['4']);
    testBoth('rounds negative', 'print(round(-2.7))', ['-3']);
    testBoth('rounds integer', 'print(round(5))', ['5']);

    testBoth('Chinese alias 四舍五入', 'print(四舍五入(3.6))', ['4']);
  });

  describe('Math Functions - sqrt', () => {
    testBoth('sqrt of 4', 'print(sqrt(4))', ['2']);
    testBoth('sqrt of 16', 'print(sqrt(16))', ['4']);
    testBoth('sqrt of 2', 'print(sqrt(2))', ['1.4142135623730951']);
    testBoth('sqrt of 0', 'print(sqrt(0))', ['0']);

    testBoth('Chinese alias 平方根', 'print(平方根(9))', ['3']);
  });

  describe('Math Functions - pow', () => {
    testBoth('pow(2, 3)', 'print(pow(2, 3))', ['8']);
    testBoth('pow(5, 2)', 'print(pow(5, 2))', ['25']);
    testBoth('pow(10, 0)', 'print(pow(10, 0))', ['1']);
    testBoth('pow(2, 10)', 'print(pow(2, 10))', ['1024']);

    testBoth('Chinese alias 幂', 'print(幂(3, 4))', ['81']);
  });

  describe('String Multiplication', () => {
    testBoth('multiplies string by number', 'print("ab" * 3)', ['ababab']);

    testBoth('multiplies number by string', 'print(3 * "xy")', ['xyxyxy']);

    testBoth('multiplies by 1', 'print("x" * 1)', ['x']);

    testBoth('multiplies by 0', 'print("abc" * 0)', ['']);

    testBoth('works with variable', 's = "hi"\nprint(s * 2)', ['hihi']);

    testBoth('works in expression', 'print("a" * 2 + "b" * 3)', ['aabbb']);

    testBoth('works with Chinese characters', 'print("你好" * 2)', ['你好你好']);

    testBoth('works with emoji', 'print("★" * 3)', ['★★★']);
  });

  describe('Pass Statement', () => {
    testBoth('does nothing in simple case', 'pass\nprint("done")', ['done']);

    testBoth(
      'works in function body',
      `def empty():
    pass
empty()
print("ok")`,
      ['ok']
    );

    testBoth(
      'works in if branch',
      `if True:
    pass
print("ok")`,
      ['ok']
    );

    testBoth(
      'works in else branch',
      `if False:
    print("no")
else:
    pass
print("ok")`,
      ['ok']
    );

    testBoth(
      'works in while body',
      `i = 0
while i < 3:
    i = i + 1
    pass
print(i)`,
      ['3']
    );

    testBoth(
      'works in for body',
      `for i in range(3):
    pass
print("done")`,
      ['done']
    );

    testBoth('Chinese alias 跳过', '跳过\nprint("ok")', ['ok']);
  });

  describe('Break Statement', () => {
    testBoth(
      'breaks from while loop',
      `i = 0
while True:
    i = i + 1
    if i > 3:
        break
print(i)`,
      ['4']
    );

    testBoth(
      'breaks from for loop',
      `for i in range(10):
    if i >= 3:
        break
print(i)`,
      ['3']
    );

    testBoth(
      'breaks from repeat loop',
      `count = 0
repeat 100 times:
    count = count + 1
    if count >= 5:
        break
print(count)`,
      ['5']
    );

    testBoth(
      'breaks from for-each loop',
      `for x in [1, 2, 3, 4, 5]:
    if x > 3:
        break
print(x)`,
      ['4']
    );

    testBoth(
      'breaks only inner loop',
      `for i in range(3):
    for j in range(3):
        if j >= 1:
            break
        print(j)`,
      ['0', '0', '0']
    );

    testBoth(
      'Chinese aliases 停止/跳出',
      `i = 0
while True:
    i = i + 1
    if i >= 2:
        停止
print(i)`,
      ['2']
    );
  });

  describe('Continue Statement', () => {
    testBoth(
      'continues in while loop',
      `i = 0
while i < 5:
    i = i + 1
    if i == 3:
        continue
    print(i)`,
      ['1', '2', '4', '5']
    );

    testBoth(
      'continues in for loop',
      `for i in range(5):
    if i == 2:
        continue
    print(i)`,
      ['0', '1', '3', '4']
    );

    testBoth(
      'continues in for-each loop',
      `for x in [1, 2, 3, 4]:
    if x == 2:
        continue
    print(x)`,
      ['1', '3', '4']
    );

    testBoth(
      'continues only affects inner loop',
      `for i in range(2):
    for j in range(3):
        if j == 1:
            continue
        print(j)`,
      ['0', '2', '0', '2']
    );

    testBoth(
      'Chinese alias 继续',
      `for i in range(3):
    if i == 1:
        继续
    print(i)`,
      ['0', '2']
    );
  });

  describe('Negative Array Index', () => {
    testBoth('accesses last element with -1', 'arr = [1, 2, 3]\nprint(arr[-1])', ['3']);

    testBoth('accesses second to last with -2', 'arr = [1, 2, 3]\nprint(arr[-2])', ['2']);

    testBoth('accesses first with -len', 'arr = [1, 2, 3]\nprint(arr[-3])', ['1']);

    testBoth('assigns with negative index', 'arr = [1, 2, 3]\narr[-1] = 99\nprint(arr)', [
      '1,2,99',
    ]);
  });

  describe('String Index Access', () => {
    testBoth('accesses character by index', 'print("hello"[1])', ['e']);

    testBoth('accesses with negative index', 'print("hello"[-1])', ['o']);

    testBoth('accesses first character', 'print("abc"[0])', ['a']);
  });

  describe('In Operator', () => {
    testBoth('checks element in array (found)', 'print(2 in [1, 2, 3])', ['true']);

    testBoth('checks element in array (not found)', 'print(5 in [1, 2, 3])', ['false']);

    testBoth('checks substring (found)', 'print("ell" in "hello")', ['true']);

    testBoth('checks substring (not found)', 'print("xyz" in "hello")', ['false']);

    testBoth('checks character in string', 'print("e" in "hello")', ['true']);

    testBoth(
      'works in if condition',
      `if 2 in [1, 2, 3]:
    print("yes")`,
      ['yes']
    );
  });

  describe('Floor Division', () => {
    testBoth('positive integers', 'print(7 // 3)', ['2']);
    testBoth('exact division', 'print(9 // 3)', ['3']);
    testBoth('with float operand', 'print(7.5 // 2)', ['3']);
    testBoth('negative result', 'print(-7 // 3)', ['-3']);
  });

  describe('Combined Features', () => {
    testBoth(
      'slice result used in for-each',
      `arr = [0, 1, 2, 3, 4]
for x in arr[1:4]:
    print(x)`,
      ['1', '2', '3']
    );

    testBoth('math functions in expression', 'print(pow(2, 3) + sqrt(16) + round(1.5))', ['14']);

    testBoth('string multiplication with slicing', 's = "abc" * 2\nprint(s[2:5])', ['cab']);

    testBoth(
      'for-each with in operator check',
      `nums = [1, 2, 3]
for x in nums:
    if x in [2, 4]:
        print(x)`,
      ['2']
    );

    testBoth(
      'complex program with all features',
      `# Test program using multiple new features
data = [3.7, 16, 8]
results = []

for x in data:
    if x == 16:
        append(results, sqrt(x))
    else:
        append(results, round(x))

stars = "★" * len(results)
print(stars)
print(results[1:])`,
      ['★★★', '4,8']
    );
  });

  describe('String Methods', () => {
    testBoth('strip removes whitespace', 'print(strip("  hello  "))', ['hello']);

    testBoth('strip with newlines and tabs', 'print(strip("\\n\\thello\\t\\n"))', ['hello']);

    testBoth('replace single occurrence', 'print(replace("hello", "l", "L"))', ['heLLo']);

    testBoth('replace all occurrences', 'print(replace("banana", "a", "o"))', ['bonono']);

    testBoth('replace not found', 'print(replace("hello", "x", "y"))', ['hello']);

    testBoth('find returns index', 'print(find("hello", "ll"))', ['2']);

    testBoth('find returns -1 when not found', 'print(find("hello", "x"))', ['-1']);

    testBoth('find from start', 'print(find("hello", "h"))', ['0']);

    testBoth('startswith true', 'print(startswith("hello", "hel"))', ['true']);

    testBoth('startswith false', 'print(startswith("hello", "ell"))', ['false']);

    testBoth('startswith empty string', 'print(startswith("hello", ""))', ['true']);

    testBoth('endswith true', 'print(endswith("hello", "llo"))', ['true']);

    testBoth('endswith false', 'print(endswith("hello", "hel"))', ['false']);

    testBoth('endswith empty string', 'print(endswith("hello", ""))', ['true']);

    testBoth('Chinese alias 去空格', 'print(去空格("  你好  "))', ['你好']);

    testBoth('Chinese alias 替换', 'print(替换("你好世界", "世界", "中国"))', ['你好中国']);

    testBoth('Chinese alias 查找', 'print(查找("你好世界", "世界"))', ['2']);

    testBoth('Chinese alias 以开头', 'print(以开头("你好世界", "你好"))', ['true']);

    testBoth('Chinese alias 以结尾', 'print(以结尾("你好世界", "世界"))', ['true']);
  });

  describe('Array Methods', () => {
    testBoth('sort numbers', 'arr = [3, 1, 4, 1, 5, 9, 2, 6]\nsort(arr)\nprint(arr)', [
      '1,1,2,3,4,5,6,9',
    ]);

    testBoth('sort strings', 'arr = ["banana", "apple", "cherry"]\nsort(arr)\nprint(arr)', [
      'apple,banana,cherry',
    ]);

    testBoth('reverse array', 'arr = [1, 2, 3, 4, 5]\nreverse(arr)\nprint(arr)', ['5,4,3,2,1']);

    testBoth('index found', 'arr = [10, 20, 30, 40]\nprint(index(arr, 30))', ['2']);

    testBoth('index not found', 'arr = [10, 20, 30, 40]\nprint(index(arr, 50))', ['-1']);

    testBoth('count occurrences', 'arr = [1, 2, 2, 3, 2, 4]\nprint(count(arr, 2))', ['3']);

    testBoth('count zero occurrences', 'arr = [1, 2, 3]\nprint(count(arr, 5))', ['0']);

    testBoth('clear array', 'arr = [1, 2, 3]\nclear(arr)\nprint(len(arr))', ['0']);

    testBoth('Chinese alias 排序', 'arr = [3, 1, 2]\n排序(arr)\nprint(arr)', ['1,2,3']);

    testBoth('Chinese alias 反转', 'arr = [1, 2, 3]\n反转(arr)\nprint(arr)', ['3,2,1']);

    testBoth('Chinese alias 索引', 'print(索引([10, 20, 30], 20))', ['1']);

    testBoth('Chinese alias 计数', 'print(计数([1, 2, 2, 2], 2))', ['3']);

    testBoth('Chinese alias 清空', 'arr = [1, 2, 3]\n清空(arr)\nprint(arr)', ['']);
  });

  describe('Augmented Assignment', () => {
    testBoth('+= with numbers', 'x = 5\nx += 3\nprint(x)', ['8']);

    testBoth('+= with strings', 's = "hello"\ns += " world"\nprint(s)', ['hello world']);

    testBoth('-= with numbers', 'x = 10\nx -= 4\nprint(x)', ['6']);

    testBoth('*= with numbers', 'x = 3\nx *= 4\nprint(x)', ['12']);

    testBoth('*= with string', 's = "ab"\ns *= 3\nprint(s)', ['ababab']);

    testBoth('/= with numbers', 'x = 15\nx /= 3\nprint(x)', ['5']);

    testBoth(
      'augmented assignment in loop',
      'sum = 0\nfor i in range(5):\n    sum += i\nprint(sum)',
      ['10']
    );

    testBoth('multiple augmented assignments', 'x = 1\nx += 2\nx *= 3\nx -= 1\nprint(x)', ['8']);
  });

  describe('Power Operator **', () => {
    testBoth('basic power operation', 'print(2 ** 3)', ['8']);

    testBoth('power with zero exponent', 'print(5 ** 0)', ['1']);

    testBoth('power with negative exponent', 'print(2 ** -1)', ['0.5']);

    testBoth('fractional exponent (square root)', 'print(4 ** 0.5)', ['2']);

    testBoth(
      'power is right-associative',
      'print(2 ** 3 ** 2)',
      ['512'] // 2 ** (3 ** 2) = 2 ** 9 = 512, not (2 ** 3) ** 2 = 64
    );

    testBoth('power with variables', 'x = 3\ny = 4\nprint(x ** y)', ['81']);

    testBoth(
      'power in expression',
      'print(2 ** 3 + 1)',
      ['9'] // ** has higher precedence than +
    );

    testBoth(
      'power with multiplication',
      'print(2 * 3 ** 2)',
      ['18'] // ** has higher precedence than *, so 2 * (3 ** 2) = 2 * 9 = 18
    );

    testBoth('comparison with pow() function', 'print(pow(2, 10))\nprint(2 ** 10)', [
      '1024',
      '1024',
    ]);
  });
});
