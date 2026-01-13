/**
 * Block System Types
 *
 * Centralized type definitions for the visual programming block system.
 * Each block type (repeat, if, while, etc.) is defined in its own file
 * and registered here.
 */

// ============ BLOCK COLORS ============
export const BLOCK_COLORS = {
  action: '#3B82F6', // Blue - commands/actions
  control: '#8B5CF6', // Purple - loops, conditions
  data: '#F59E0B', // Amber - variables, lists, print
  function: '#10B981', // Green - functions
} as const;

export type BlockCategory = 'command' | 'control' | 'data' | 'function';

// ============ BLOCK TYPES ============
export type BlockType =
  | 'command'
  | 'repeat'
  | 'while'
  | 'if'
  | 'ifelse'
  | 'for'
  | 'forEach'
  | 'setVariable'
  | 'print'
  | 'functionDef'
  | 'functionCall'
  | 'listAppend'
  | 'listPop'
  | 'listInsert'
  | 'break'
  | 'continue'
  | 'pass';

// ============ EXPRESSION TYPES ============
export type MathOperator = '+' | '-' | '*' | '/';
export type ComparisonOperator = '==' | '!=' | '<' | '>' | '<=' | '>=';
export type LogicalOperator = 'and' | 'or';

export interface ObjectProperty {
  key: string;
  value: BlockExpression;
}

export type BlockExpression =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'variable'; name: string }
  | {
      type: 'binary';
      operator: MathOperator | ComparisonOperator | LogicalOperator;
      left: BlockExpression;
      right: BlockExpression;
    }
  | { type: 'sensor'; sensor: string }
  | {
      type: 'comparison';
      operator: ComparisonOperator;
      left: BlockExpression;
      right: BlockExpression;
    }
  | { type: 'array'; elements: BlockExpression[] }
  | { type: 'arrayAccess'; array: BlockExpression; index: BlockExpression }
  | { type: 'arrayLength'; array: BlockExpression }
  | { type: 'random' }
  | { type: 'randint'; min: BlockExpression; max: BlockExpression }
  | { type: 'object'; properties: ObjectProperty[] }
  | { type: 'objectAccess'; object: BlockExpression; key: BlockExpression };

// ============ BLOCK INSTANCE ============
// Runtime representation of a block in the editor
export interface Block {
  id: string;
  type: BlockType;
  // For command blocks
  command?: string;
  commandArg?: BlockExpression;
  commandArg2?: BlockExpression;
  // For repeat blocks
  repeatCount?: number;
  // For conditional blocks (sensor-based)
  condition?: string;
  // For conditional blocks (expression-based)
  conditionExpr?: BlockExpression;
  // Nested blocks
  children?: Block[];
  // For ifelse - the else branch
  elseChildren?: Block[];
  // For setVariable, for, forEach blocks
  variableName?: string;
  // For setVariable, print blocks
  expression?: BlockExpression;
  // For for blocks - range
  rangeStart?: BlockExpression;
  rangeEnd?: BlockExpression;
  // For functionDef/functionCall
  functionName?: string;
  functionParams?: string[];
  functionArgs?: BlockExpression[];
  // For list operations
  listArray?: BlockExpression;
  listValue?: BlockExpression;
  listIndex?: BlockExpression;
  // For forEach
  iterable?: BlockExpression;
}

// ============ RENDER CONFIG ============
// Configuration for how a block is rendered in the UI
export type RenderControl =
  | { type: 'number'; field: keyof Block; min?: number; max?: number; width?: string }
  | { type: 'text'; value: string }
  | { type: 'textInput'; field: keyof Block; placeholder?: string; width?: string }
  | { type: 'condition' }
  | { type: 'expression'; field: keyof Block };

export interface RenderConfig {
  hasChildren?: boolean;
  hasElseChildren?: boolean;
  controls: RenderControl[];
}

// ============ CODE GENERATION CONTEXT ============
export interface CodeGenContext {
  indent: number;
  gameType: 'maze' | 'turtle';
  addLine: (code: string, blockId?: string) => void;
  generateChildren: (children: Block[] | undefined) => void;
  expressionToCode: (expr: BlockExpression | undefined) => string;
  getConditionCode: (block: Block) => string;
  getCommandCodeName: (commandId: string) => string;
}

// ============ AST PARSING CONTEXT ============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ASTStatement = any; // AST types from compiler

export interface ParseContext {
  gameType: 'maze' | 'turtle';
  generateBlockId: () => string;
  parseStatements: (stmts: ASTStatement[]) => Block[];
  parseStatement: (stmt: ASTStatement) => Block | null;
  astToExpression: (expr: ASTStatement) => BlockExpression;
  getNumber: (expr: ASTStatement) => number | undefined;
  getCondition: (expr: ASTStatement) => {
    condition?: string;
    conditionExpr?: BlockExpression;
  };
}

// ============ BLOCK DEFINITION ============
// Complete definition of a block type - all logic in one place
export interface ControlBlockDefinition {
  // Identity
  type: BlockType;
  label: string;
  icon: string;
  color: string;
  category: BlockCategory;

  // Creation defaults - returns partial Block with default values
  createDefaults: () => Partial<Block>;

  // Code generation
  toCode: (block: Block, ctx: CodeGenContext) => void;

  // AST parsing - which AST node type this block handles
  astType: string;
  fromAST: (stmt: ASTStatement, ctx: ParseContext) => Omit<Block, 'id'> | null;

  // Render configuration
  render: RenderConfig;
}

// Registry of all control blocks
export type BlockRegistry = Map<BlockType, ControlBlockDefinition>;
