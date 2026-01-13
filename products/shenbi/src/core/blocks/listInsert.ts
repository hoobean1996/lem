/**
 * List Insert Block
 *
 * Inserts a value at a specific index in a list.
 * Example: insert(myList, 0, 42)
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const listInsertBlock: ControlBlockDefinition = {
  type: 'listInsert',
  label: 'Insert',
  icon: '📥',
  color: BLOCK_COLORS.data,
  category: 'data',

  createDefaults: () => ({
    listArray: { type: 'variable', name: 'arr' },
    listIndex: { type: 'number', value: 0 },
    listValue: { type: 'number', value: 0 },
  }),

  toCode(block, ctx) {
    const arrayCode = ctx.expressionToCode(block.listArray);
    const indexCode = ctx.expressionToCode(block.listIndex);
    const valueCode = ctx.expressionToCode(block.listValue);
    ctx.addLine(`insert(${arrayCode}, ${indexCode}, ${valueCode})`, block.id);
  },

  astType: 'InsertCall',
  fromAST(stmt, ctx) {
    return {
      type: 'listInsert',
      listArray: stmt.arguments?.[0] ? ctx.astToExpression(stmt.arguments[0]) : { type: 'variable', name: 'arr' },
      listIndex: stmt.arguments?.[1] ? ctx.astToExpression(stmt.arguments[1]) : { type: 'number', value: 0 },
      listValue: stmt.arguments?.[2] ? ctx.astToExpression(stmt.arguments[2]) : { type: 'number', value: 0 },
    };
  },

  render: {
    controls: [
      { type: 'text', value: '(' },
      { type: 'expression', field: 'listArray' },
      { type: 'text', value: ',' },
      { type: 'expression', field: 'listIndex' },
      { type: 'text', value: ',' },
      { type: 'expression', field: 'listValue' },
      { type: 'text', value: ')' },
    ],
  },
};

registerBlock(listInsertBlock);
