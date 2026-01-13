/**
 * For Block (Range-based)
 *
 * Iterates over a numeric range.
 * Example: for i in range(0, 10):
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const forBlock: ControlBlockDefinition = {
  type: 'for',
  label: 'For',
  icon: '🔢',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    variableName: 'i',
    rangeStart: { type: 'number', value: 0 },
    rangeEnd: { type: 'number', value: 5 },
    children: [],
  }),

  toCode(block, ctx) {
    const varName = block.variableName ?? 'i';
    const startCode = ctx.expressionToCode(block.rangeStart);
    const endCode = ctx.expressionToCode(block.rangeEnd);
    ctx.addLine(`for ${varName} in range(${startCode}, ${endCode}):`, block.id);
    ctx.generateChildren(block.children);
  },

  astType: 'ForStatement',
  fromAST(stmt, ctx) {
    return {
      type: 'for',
      variableName: stmt.variable,
      rangeStart: ctx.astToExpression(stmt.start),
      rangeEnd: ctx.astToExpression(stmt.end),
      children: ctx.parseStatements(stmt.body),
    };
  },

  render: {
    hasChildren: true,
    controls: [
      { type: 'textInput', field: 'variableName', placeholder: 'i', width: 'w-8' },
      { type: 'text', value: 'from' },
      { type: 'expression', field: 'rangeStart' },
      { type: 'text', value: 'to' },
      { type: 'expression', field: 'rangeEnd' },
    ],
  },
};

registerBlock(forBlock);
