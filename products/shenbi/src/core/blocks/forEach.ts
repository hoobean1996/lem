/**
 * For-Each Block
 *
 * Iterates over elements in an iterable (array, list).
 * Example: for item in myList:
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const forEachBlock: ControlBlockDefinition = {
  type: 'forEach',
  label: 'For Each',
  icon: '🔄',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    variableName: 'item',
    iterable: { type: 'variable', name: 'arr' },
    children: [],
  }),

  toCode(block, ctx) {
    const varName = block.variableName ?? 'item';
    const iterCode = ctx.expressionToCode(block.iterable);
    ctx.addLine(`for ${varName} in ${iterCode}:`, block.id);
    ctx.generateChildren(block.children);
  },

  astType: 'ForEachStatement',
  fromAST(stmt, ctx) {
    return {
      type: 'forEach',
      variableName: stmt.variable,
      iterable: ctx.astToExpression(stmt.iterable),
      children: ctx.parseStatements(stmt.body),
    };
  },

  render: {
    hasChildren: true,
    controls: [
      { type: 'textInput', field: 'variableName', placeholder: 'item', width: 'w-12' },
      { type: 'text', value: 'in' },
      { type: 'expression', field: 'iterable' },
    ],
  },
};

registerBlock(forEachBlock);
