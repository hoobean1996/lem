/**
 * Print Block
 *
 * Outputs a value to the console.
 * Example: print("Hello")
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const printBlock: ControlBlockDefinition = {
  type: 'print',
  label: 'Print',
  icon: '📝',
  color: BLOCK_COLORS.data,
  category: 'data',

  createDefaults: () => ({
    expression: { type: 'string', value: 'Hello' },
  }),

  toCode(block, ctx) {
    const valueCode = ctx.expressionToCode(block.expression);
    ctx.addLine(`print(${valueCode})`, block.id);
  },

  // Print is parsed as a CallExpression with callee 'print'
  // This is handled specially in the parser, not as a statement type
  astType: 'PrintCall',
  fromAST(stmt, ctx) {
    return {
      type: 'print',
      expression:
        stmt.arguments?.length > 0
          ? ctx.astToExpression(stmt.arguments[0])
          : { type: 'string', value: '' },
    };
  },

  render: {
    controls: [{ type: 'expression', field: 'expression' }],
  },
};

registerBlock(printBlock);
