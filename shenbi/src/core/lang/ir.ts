/**
 * Mini Python Intermediate Representation (IR)
 *
 * A linear, stack-based instruction set that's easy to execute step by step.
 */

// ============ Value Types ============

// Python runtime values - includes primitives, arrays, and complex objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Value = number | string | boolean | null | Value[] | Record<string, any>;

// Instance represents a class instance with fields and a reference to its class
// Instance is stored as a plain object with special __class__ and __fields__ properties
export interface Instance {
  __class__: string;
  __fields__: Map<string, Value>;
}

// Helper to check if a value is an Instance
export function isInstance(value: unknown): value is Instance {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__class__' in value &&
    '__fields__' in value &&
    (value as Instance).__fields__ instanceof Map
  );
}

// ============ Instructions ============

export type OpCode =
  // Stack manipulation
  | 'PUSH' // Push constant value
  | 'POP' // Discard top of stack
  | 'DUP' // Duplicate top of stack

  // Variables
  | 'LOAD' // Load variable onto stack
  | 'STORE' // Store top of stack into variable

  // Arithmetic
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'MOD' // Modulo
  | 'FLOOR_DIV' // Floor division
  | 'POW' // Power/exponentiation
  | 'NEG' // Unary negation

  // Comparison (push boolean result)
  | 'EQ'
  | 'NEQ'
  | 'LT'
  | 'GT'
  | 'LTE'
  | 'GTE'
  | 'IN' // Membership test (x in array/string)

  // Logical
  | 'NOT'
  | 'AND'
  | 'OR'

  // Control flow
  | 'JUMP' // Unconditional jump
  | 'JUMP_IF' // Jump if top of stack is truthy
  | 'JUMP_IF_NOT' // Jump if top of stack is falsy

  // Function calls
  | 'CALL' // Call built-in command/sensor
  | 'CALL_USER' // Call user-defined function
  | 'RETURN' // Return from function

  // Arrays
  | 'ARRAY_CREATE' // Create array from N stack elements
  | 'ARRAY_GET' // Get element at index: [array, index] -> element
  | 'ARRAY_SET' // Set element at index: [array, index, value] -> (mutates array)
  | 'SLICE' // Slice array/string: [object, start, end] -> sliced (null for default)

  // Objects
  | 'OBJECT_CREATE' // Create object from N key-value pairs on stack
  | 'OBJECT_GET' // Get property: [object, key] -> value
  | 'OBJECT_SET' // Set property: [object, key, value] -> (mutates object)

  // Classes
  | 'CLASS_DEF' // Define a class: arg = className
  | 'NEW' // Create instance: arg = className:argCount
  | 'MEMBER_GET' // Get instance member: [instance, propName] -> value
  | 'MEMBER_SET' // Set instance member: [instance, propName, value] -> (mutates)
  | 'METHOD_CALL' // Call method: arg = methodName:argCount, [instance, ...args] -> result

  // Special
  | 'HALT' // End of program
  | 'NOP'; // No operation (for labels)

export interface Instruction {
  op: OpCode;
  arg?: Value | string | number; // Optional argument
  sourceLine?: number; // Source line for debugging/highlighting
}

// ============ Program ============

export interface CompiledProgram {
  instructions: Instruction[];
  // Function table: name -> start address
  functions: Map<string, number>;
  // Source map for debugging: instruction index -> source line
  sourceMap: Map<number, number>;
}

// ============ Instruction Builders (for cleaner compiler code) ============

export const IR = {
  push: (value: Value, line?: number): Instruction => ({
    op: 'PUSH',
    arg: value,
    sourceLine: line,
  }),

  pop: (line?: number): Instruction => ({ op: 'POP', sourceLine: line }),

  dup: (line?: number): Instruction => ({ op: 'DUP', sourceLine: line }),

  load: (name: string, line?: number): Instruction => ({ op: 'LOAD', arg: name, sourceLine: line }),

  store: (name: string, line?: number): Instruction => ({
    op: 'STORE',
    arg: name,
    sourceLine: line,
  }),

  add: (line?: number): Instruction => ({ op: 'ADD', sourceLine: line }),
  sub: (line?: number): Instruction => ({ op: 'SUB', sourceLine: line }),
  mul: (line?: number): Instruction => ({ op: 'MUL', sourceLine: line }),
  div: (line?: number): Instruction => ({ op: 'DIV', sourceLine: line }),
  mod: (line?: number): Instruction => ({ op: 'MOD', sourceLine: line }),
  floorDiv: (line?: number): Instruction => ({ op: 'FLOOR_DIV', sourceLine: line }),
  pow: (line?: number): Instruction => ({ op: 'POW', sourceLine: line }),
  neg: (line?: number): Instruction => ({ op: 'NEG', sourceLine: line }),

  eq: (line?: number): Instruction => ({ op: 'EQ', sourceLine: line }),
  neq: (line?: number): Instruction => ({ op: 'NEQ', sourceLine: line }),
  lt: (line?: number): Instruction => ({ op: 'LT', sourceLine: line }),
  gt: (line?: number): Instruction => ({ op: 'GT', sourceLine: line }),
  lte: (line?: number): Instruction => ({ op: 'LTE', sourceLine: line }),
  gte: (line?: number): Instruction => ({ op: 'GTE', sourceLine: line }),
  in_: (line?: number): Instruction => ({ op: 'IN', sourceLine: line }),

  not: (line?: number): Instruction => ({ op: 'NOT', sourceLine: line }),
  and: (line?: number): Instruction => ({ op: 'AND', sourceLine: line }),
  or: (line?: number): Instruction => ({ op: 'OR', sourceLine: line }),

  jump: (target: number, line?: number): Instruction => ({
    op: 'JUMP',
    arg: target,
    sourceLine: line,
  }),

  jumpIf: (target: number, line?: number): Instruction => ({
    op: 'JUMP_IF',
    arg: target,
    sourceLine: line,
  }),

  jumpIfNot: (target: number, line?: number): Instruction => ({
    op: 'JUMP_IF_NOT',
    arg: target,
    sourceLine: line,
  }),

  call: (name: string, argCount: number, line?: number): Instruction => ({
    op: 'CALL',
    arg: `${name}:${argCount}`,
    sourceLine: line,
  }),

  callUser: (name: string, argCount: number, line?: number): Instruction => ({
    op: 'CALL_USER',
    arg: `${name}:${argCount}`,
    sourceLine: line,
  }),

  return: (line?: number): Instruction => ({ op: 'RETURN', sourceLine: line }),

  halt: (line?: number): Instruction => ({ op: 'HALT', sourceLine: line }),

  nop: (line?: number): Instruction => ({ op: 'NOP', sourceLine: line }),

  // Array operations
  arrayCreate: (count: number, line?: number): Instruction => ({
    op: 'ARRAY_CREATE',
    arg: count,
    sourceLine: line,
  }),

  arrayGet: (line?: number): Instruction => ({ op: 'ARRAY_GET', sourceLine: line }),

  arraySet: (line?: number): Instruction => ({ op: 'ARRAY_SET', sourceLine: line }),

  slice: (line?: number): Instruction => ({ op: 'SLICE', sourceLine: line }),

  // Object operations
  objectCreate: (count: number, line?: number): Instruction => ({
    op: 'OBJECT_CREATE',
    arg: count,
    sourceLine: line,
  }),

  objectGet: (line?: number): Instruction => ({ op: 'OBJECT_GET', sourceLine: line }),

  objectSet: (line?: number): Instruction => ({ op: 'OBJECT_SET', sourceLine: line }),

  // Class operations
  classDef: (className: string, line?: number): Instruction => ({
    op: 'CLASS_DEF',
    arg: className,
    sourceLine: line,
  }),

  new_: (className: string, argCount: number, line?: number): Instruction => ({
    op: 'NEW',
    arg: `${className}:${argCount}`,
    sourceLine: line,
  }),

  memberGet: (line?: number): Instruction => ({ op: 'MEMBER_GET', sourceLine: line }),

  memberSet: (line?: number): Instruction => ({ op: 'MEMBER_SET', sourceLine: line }),

  methodCall: (methodName: string, argCount: number, line?: number): Instruction => ({
    op: 'METHOD_CALL',
    arg: `${methodName}:${argCount}`,
    sourceLine: line,
  }),
};

// ============ Helpers ============

export function parseCallArg(arg: string): { name: string; argCount: number } {
  const [name, count] = arg.split(':');
  return { name, argCount: parseInt(count, 10) };
}
