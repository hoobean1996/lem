/**
 * While Block
 *
 * Repeats children while condition is true.
 * Example: while frontClear():
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const whileBlock: ControlBlockDefinition = {
  type: 'while',
  label: 'While',
  icon: '🔃',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    condition: 'frontClear',
    children: [],
  }),

  toCode(block, ctx) {
    const condCode = ctx.getConditionCode(block);
    ctx.addLine(`while ${condCode}:`, block.id);
    ctx.generateChildren(block.children);
  },

  astType: 'WhileStatement',
  fromAST(stmt, ctx) {
    const cond = ctx.getCondition(stmt.condition);
    return {
      type: 'while',
      condition: cond.condition,
      conditionExpr: cond.conditionExpr,
      children: ctx.parseStatements(stmt.body),
    };
  },

  render: {
    hasChildren: true,
    controls: [{ type: 'condition' }],
  },
};

registerBlock(whileBlock);
