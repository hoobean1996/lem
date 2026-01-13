/**
 * Mini Python Language Module
 *
 * A simplified Python subset for children's programming education.
 */

// AST Types (used by block editor code parser)
export type {
  Statement,
  Expression,
  CallExpression,
  BinaryOp,
  ForStatement,
  ForEachStatement,
  ArrayLiteral,
  IndexAccess,
  FunctionDef,
  ObjectLiteral,
} from './ast';

// Errors
export { SyntaxError, RuntimeError } from './errors';

// Value type for VM values
export type { Value } from './ir';

/**
 * Convenience function to compile source code to AST
 */
import { tokenize } from './lexer';
import { parse } from './parser';
import type { Program } from './ast';

export function compile(source: string): Program {
  const tokens = tokenize(source);
  return parse(tokens);
}

/**
 * Convenience function to compile source to IR
 */
import { compileToIR } from './compiler';
import type { CompiledProgram } from './ir';

export { compileToIR };

export function compileProgram(source: string): CompiledProgram {
  const ast = compile(source);
  return compileToIR(ast);
}
