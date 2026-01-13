/**
 * If Block
 *
 * Conditional execution - runs children if condition is true.
 * Example: if frontClear():
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const ifBlock: ControlBlockDefinition = {
  type: 'if',
  label: 'If',
  icon: '❓',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    condition: 'frontClear',
    children: [],
  }),

  toCode(block, ctx) {
    const condCode = ctx.getConditionCode(block);
    ctx.addLine(`if ${condCode}:`, block.id);
    ctx.generateChildren(block.children);
  },

  // Note: IfStatement with alternate is handled by ifelse block
  astType: 'IfStatement',
  fromAST(stmt, ctx) {
    // If there's an alternate (else branch), this should be ifelse, not if
    if (stmt.alternate && stmt.alternate.length > 0) {
      return null; // Let ifelse handle it
    }

    const cond = ctx.getCondition(stmt.condition);
    return {
      type: 'if',
      condition: cond.condition,
      conditionExpr: cond.conditionExpr,
      children: ctx.parseStatements(stmt.consequent),
    };
  },

  render: {
    hasChildren: true,
    controls: [{ type: 'condition' }],
  },
};

registerBlock(ifBlock);
