# Mini Python Language Design

A simplified Python subset for children's programming education.

---

## Overview

Mini Python is designed for children aged 5-12, focusing on core programming concepts.

### Design Principles

1. **Simplicity** - Only essential concepts, no complex syntax
2. **Visual mapping** - Every construct maps to a visual block
3. **Safe execution** - Sandboxed, no dangerous operations
4. **Progressive** - Concepts unlock by level

---

## Language Levels

### Level 1: Sequential Execution

```python
# Commands run in order
forward()
forward()
turnLeft()
forward()
```

**Concepts:** Programs execute top to bottom

**Blocks:** Command blocks (blue)

---

### Level 2: Repeat Loops

```python
# Fixed count loops
repeat 4 times:
    forward()
    turnLeft()
```

**Concepts:** Reducing repetition

**Blocks:** Loop blocks (orange)

---

### Level 3: Conditionals

```python
# If statement
if frontBlocked():
    turnLeft()

# If-else statement
if hasStar():
    collect()
else:
    forward()
```

**Concepts:** Making decisions

**Blocks:** Condition blocks (yellow)

---

### Level 4: While Loops

```python
# Conditional loop
while notAtGoal():
    if frontBlocked():
        turnLeft()
    else:
        forward()
```

**Concepts:** Unknown iteration count

**Blocks:** While blocks (orange)

---

### Level 5: Variables

```python
# Assignment
stars = 0

# Arithmetic
stars = stars + 1

# Comparison
if stars >= 3:
    celebrate()
```

**Concepts:** Storing and manipulating data

**Blocks:** Variable blocks (red)

---

### Level 6: Functions

```python
# Define function
def walkTwo():
    forward()
    forward()

# Call function
walkTwo()
turnLeft()
walkTwo()

# With parameters
def walkN(n):
    repeat n times:
        forward()

walkN(3)
```

**Concepts:** Code reuse and abstraction

**Blocks:** Function blocks (purple)

---

## Lexical Structure

### Keywords

```typescript
KEYWORDS = {
  // Control flow
  'if': 'IF',
  'else': 'ELSE',
  'repeat': 'REPEAT',
  'times': 'TIMES',
  'while': 'WHILE',

  // Functions
  'def': 'DEF',
  'return': 'RETURN',

  // Booleans
  'True': 'TRUE',
  'False': 'FALSE',

  // Logical
  'and': 'AND',
  'or': 'OR',
  'not': 'NOT',
}
```

### Operators

```typescript
OPERATORS = {
  '+': 'PLUS',
  '-': 'MINUS',
  '*': 'MULTIPLY',
  '/': 'DIVIDE',
  '=': 'ASSIGN',
  '==': 'EQ',
  '!=': 'NEQ',
  '<': 'LT',
  '>': 'GT',
  '<=': 'LTE',
  '>=': 'GTE',
}
```

### Special Tokens

```
INDENT      # Indentation increase
DEDENT      # Indentation decrease
NEWLINE     # Line break
NUMBER      # Numeric literal
STRING      # String literal
IDENTIFIER  # Variable/function name
```

---

## Grammar (EBNF)

```ebnf
program     = statement* EOF

statement   = simple_stmt NEWLINE
            | compound_stmt

simple_stmt = assignment
            | expr_stmt
            | return_stmt

compound_stmt = if_stmt
              | repeat_stmt
              | while_stmt
              | func_def

if_stmt     = 'if' expression ':' block
              ['else' ':' block]

repeat_stmt = 'repeat' expression 'times' ':' block

while_stmt  = 'while' expression ':' block

func_def    = 'def' IDENTIFIER '(' params? ')' ':' block

block       = NEWLINE INDENT statement+ DEDENT

expression  = or_expr
or_expr     = and_expr ('or' and_expr)*
and_expr    = not_expr ('and' not_expr)*
not_expr    = 'not' not_expr | comparison
comparison  = arith_expr (comp_op arith_expr)*
arith_expr  = term (('+' | '-') term)*
term        = factor (('*' | '/') factor)*
factor      = '-' factor | atom
atom        = NUMBER | STRING | BOOL | IDENTIFIER | func_call | '(' expression ')'
func_call   = IDENTIFIER '(' args? ')'
```

---

## AST Node Types

```typescript
type ASTNode = Program | Statement | Expression

// Statements
type Statement =
  | ExpressionStatement
  | Assignment
  | IfStatement
  | RepeatStatement
  | WhileStatement
  | FunctionDef
  | ReturnStatement

interface IfStatement {
  type: 'IfStatement'
  condition: Expression
  consequent: Statement[]
  alternate: Statement[] | null
}

interface RepeatStatement {
  type: 'RepeatStatement'
  count: Expression
  body: Statement[]
}

interface WhileStatement {
  type: 'WhileStatement'
  condition: Expression
  body: Statement[]
}

// Expressions
type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | BinaryOp
  | UnaryOp
  | CallExpression

interface CallExpression {
  type: 'CallExpression'
  callee: string
  arguments: Expression[]
}
```

---

## Execution Model

### VM State

```typescript
interface VMState {
  status: 'ready' | 'running' | 'paused' | 'completed' | 'error'
  currentLine: number | null
  callStack: StackFrame[]
  globals: Map<string, Value>
  error: string | null
}

interface StackFrame {
  functionName: string | null
  locals: Map<string, Value>
  returnTo: number | null
}
```

### Step Execution

For educational purposes, the VM supports step-by-step execution:

```typescript
interface VMStepResult {
  done: boolean
  action: string | null    // 'forward', 'turnLeft', etc.
  actionArgs: any[]
  highlightLine: number | null
}

// Usage
const vm = new VM()
vm.load(program)
while (!vm.getState().done) {
  const result = vm.step()
  // Animate the action, highlight the line
}
```

---

## Game Integration

Commands and sensors are defined in each game's `commands.ts` file:

```typescript
// src/core/game/maze/commands.ts
export const MAZE_COMMANDS: CommandDefinition[] = [
  {
    id: 'forward',
    label: 'Forward',
    codeName: 'forward',
    handler: (world) => world.moveForward(),
  },
  {
    id: 'turnLeft',
    label: 'Turn Left',
    codeName: 'turnLeft',
    handler: (world) => world.turnLeft(),
  },
  // ...
];

export const MAZE_CONDITIONS: ConditionDefinition[] = [
  {
    id: 'frontBlocked',
    label: 'Front Blocked',
    codeName: 'frontBlocked',
    handler: (world) => world.isFrontBlocked(),
  },
  // ...
];
```

---

## Error Handling

### Syntax Errors (Compile Time)

```typescript
interface SyntaxError {
  type: 'SyntaxError'
  message: string
  line: number
  column: number
  suggestion?: string    // Fix suggestion
}

// Example
{
  type: 'SyntaxError',
  message: 'Incorrect indentation',
  line: 3,
  column: 0,
  suggestion: 'Check that this line has the same number of spaces as the previous line'
}
```

### Runtime Errors

```typescript
interface RuntimeError {
  type: 'RuntimeError'
  message: string
  line: number
  suggestion?: string
}

// Example
{
  type: 'RuntimeError',
  message: 'Variable "stars" is not defined',
  line: 5,
  suggestion: 'Before using a variable, you need to assign a value to it, e.g.: stars = 0'
}
```

---

## Block Mapping

Each AST node corresponds to a visual block:

```typescript
interface BlockDefinition {
  type: string
  category: 'action' | 'control' | 'sensor' | 'operator' | 'variable' | 'function'
  color: string
  template: string  // e.g., "repeat {count} times"
  inputs: InputSlot[]
  hasBody: boolean
}

// Example: Repeat block
const repeatBlock: BlockDefinition = {
  type: 'repeat',
  category: 'control',
  color: '#FF9800',
  template: 'repeat {count} times',
  inputs: [{ name: 'count', type: 'number', default: 4 }],
  hasBody: true,
}
```

---

## File Structure

```
src/core/lang/
├── index.ts           # Module exports
├── lexer.ts           # Tokenization
├── parser.ts          # AST generation
├── ast.ts             # AST type definitions
├── compiler.ts        # AST -> IR
├── ir.ts              # IR opcodes
├── vm.ts              # Virtual machine
└── errors.ts          # Error types
```

---

## Example Programs

### Simple Maze (Level 1-2)

```python
# Sequential
forward()
forward()
forward()

# With loop
repeat 3 times:
    forward()
```

### Smart Navigation (Level 3-4)

```python
# Left-hand rule maze solver
while notAtGoal():
    if leftClear():
        turnLeft()
        forward()
    else:
        if frontBlocked():
            turnRight()
        else:
            forward()
```

### With Functions (Level 6)

```python
def findPath():
    if frontBlocked():
        if leftClear():
            turnLeft()
        else:
            turnRight()

def takeStep():
    findPath()
    forward()
    if hasStar():
        collect()

while notAtGoal():
    takeStep()
```

---

*See also: [Game Architecture](./game.md)*
