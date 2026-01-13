/**
 * List Append Block
 *
 * Adds a value to the end of a list.
 * Example: append(myList, 42)
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const listAppendBlock: ControlBlockDefinition = {
  type: 'listAppend',
  label: 'Append',
  icon: '➕',
  color: BLOCK_COLORS.data,
  category: 'data',

  createDefaults: () => ({
    listArray: { type: 'variable', name: 'arr' },
    listValue: { type: 'number', value: 0 },
  }),

  toCode(block, ctx) {
    const arrayCode = ctx.expressionToCode(block.listArray);
    const valueCode = ctx.expressionToCode(block.listValue);
    ctx.addLine(`append(${arrayCode}, ${valueCode})`, block.id);
  },

  // List operations are parsed as CallExpressions
  astType: 'AppendCall',
  fromAST(stmt, ctx) {
    return {
      type: 'listAppend',
      listArray: stmt.arguments?.[0] ? ctx.astToExpression(stmt.arguments[0]) : { type: 'variable', name: 'arr' },
      listValue: stmt.arguments?.[1] ? ctx.astToExpression(stmt.arguments[1]) : { type: 'number', value: 0 },
    };
  },

  render: {
    controls: [
      { type: 'text', value: '(' },
      { type: 'expression', field: 'listArray' },
      { type: 'text', value: ',' },
      { type: 'expression', field: 'listValue' },
      { type: 'text', value: ')' },
    ],
  },
};

registerBlock(listAppendBlock);
