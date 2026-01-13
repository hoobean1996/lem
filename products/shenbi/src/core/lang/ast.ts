/**
 * Mini Python AST Type Definitions
 */

// Source location for error reporting
export interface SourceLocation {
  line: number;
  column: number;
}

// Base node with location
interface BaseNode {
  loc?: SourceLocation;
}

// Program (root node)
export interface Program extends BaseNode {
  type: 'Program';
  body: Statement[];
}

// ============ Statements ============

export type Statement =
  | ExpressionStatement
  | Assignment
  | AugmentedAssignment
  | IndexedAssignment
  | MemberAssignment
  | IfStatement
  | RepeatStatement
  | WhileStatement
  | ForStatement
  | ForEachStatement
  | BreakStatement
  | ContinueStatement
  | PassStatement
  | FunctionDef
  | ClassDef
  | ReturnStatement;

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface Assignment extends BaseNode {
  type: 'Assignment';
  target: string;
  value: Expression;
}

// Augmented assignment: x += 1, x -= 1, x *= 2, x /= 2
export interface AugmentedAssignment extends BaseNode {
  type: 'AugmentedAssignment';
  target: string;
  operator: '+=' | '-=' | '*=' | '/=';
  value: Expression;
}

// Assignment to indexed location: arr[0] = value or obj["key"] = value
export interface IndexedAssignment extends BaseNode {
  type: 'IndexedAssignment';
  object: Expression;
  index: Expression;
  value: Expression;
}

// Assignment to member: self.x = value or obj.prop = value
export interface MemberAssignment extends BaseNode {
  type: 'MemberAssignment';
  object: Expression;
  property: string;
  value: Expression;
}

// Elif branch
export interface ElifBranch {
  condition: Expression;
  consequent: Statement[];
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement[];
  elifBranches?: ElifBranch[];
  alternate: Statement[] | null;
}

export interface RepeatStatement extends BaseNode {
  type: 'RepeatStatement';
  count: Expression;
  body: Statement[];
}

export interface WhileStatement extends BaseNode {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface ForStatement extends BaseNode {
  type: 'ForStatement';
  variable: string;
  start: Expression;
  end: Expression;
  step?: Expression;
  body: Statement[];
}

// For-each: for item in array:
export interface ForEachStatement extends BaseNode {
  type: 'ForEachStatement';
  variable: string;
  iterable: Expression;
  body: Statement[];
}

export interface BreakStatement extends BaseNode {
  type: 'BreakStatement';
}

export interface ContinueStatement extends BaseNode {
  type: 'ContinueStatement';
}

export interface PassStatement extends BaseNode {
  type: 'PassStatement';
}

export interface FunctionDef extends BaseNode {
  type: 'FunctionDef';
  name: string;
  params: string[];
  body: Statement[];
}

// Class definition: class ClassName:
export interface ClassDef extends BaseNode {
  type: 'ClassDef';
  name: string;
  methods: FunctionDef[]; // Methods defined in the class body
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  value: Expression | null;
}

// ============ Expressions ============

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | BinaryOp
  | UnaryOp
  | CallExpression
  | ArrayLiteral
  | IndexAccess
  | SliceAccess
  | ObjectLiteral
  | MemberAccess
  | MethodCall
  | NewExpression;

export interface NumberLiteral extends BaseNode {
  type: 'NumberLiteral';
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: 'StringLiteral';
  value: string;
}

export interface BooleanLiteral extends BaseNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface Identifier extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface BinaryOp extends BaseNode {
  type: 'BinaryOp';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryOp extends BaseNode {
  type: 'UnaryOp';
  operator: string;
  operand: Expression;
}

export interface CallExpression extends BaseNode {
  type: 'CallExpression';
  callee: string;
  arguments: Expression[];
}

export interface ArrayLiteral extends BaseNode {
  type: 'ArrayLiteral';
  elements: Expression[];
}

export interface IndexAccess extends BaseNode {
  type: 'IndexAccess';
  object: Expression;
  index: Expression;
}

// Slice access: arr[start:end] or str[start:end]
export interface SliceAccess extends BaseNode {
  type: 'SliceAccess';
  object: Expression;
  start: Expression | null; // null means from beginning
  end: Expression | null; // null means to end
}

export interface ObjectLiteral extends BaseNode {
  type: 'ObjectLiteral';
  properties: { key: string; value: Expression }[];
}

// Member access: obj.property or self.x
export interface MemberAccess extends BaseNode {
  type: 'MemberAccess';
  object: Expression;
  property: string;
}

// Method call: obj.method(args) or self.move(x, y)
export interface MethodCall extends BaseNode {
  type: 'MethodCall';
  object: Expression;
  method: string;
  arguments: Expression[];
}

// Class instantiation: ClassName(args)
export interface NewExpression extends BaseNode {
  type: 'NewExpression';
  className: string;
  arguments: Expression[];
}
