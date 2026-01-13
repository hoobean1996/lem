/**
 * List Pop Block
 *
 * Removes and returns the last element from a list.
 * Example: pop(myList)
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const listPopBlock: ControlBlockDefinition = {
  type: 'listPop',
  label: 'Pop',
  icon: '➖',
  color: BLOCK_COLORS.data,
  category: 'data',

  createDefaults: () => ({
    listArray: { type: 'variable', name: 'arr' },
  }),

  toCode(block, ctx) {
    const arrayCode = ctx.expressionToCode(block.listArray);
    ctx.addLine(`pop(${arrayCode})`, block.id);
  },

  astType: 'PopCall',
  fromAST(stmt, ctx) {
    return {
      type: 'listPop',
      listArray: stmt.arguments?.[0] ? ctx.astToExpression(stmt.arguments[0]) : { type: 'variable', name: 'arr' },
    };
  },

  render: {
    controls: [
      { type: 'text', value: '(' },
      { type: 'expression', field: 'listArray' },
      { type: 'text', value: ')' },
    ],
  },
};

registerBlock(listPopBlock);
