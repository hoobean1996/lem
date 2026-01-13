/**
 * If-Else Block
 *
 * Conditional execution with else branch.
 * Example:
 *   if frontClear():
 *     forward()
 *   else:
 *     turnLeft()
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const ifelseBlock: ControlBlockDefinition = {
  type: 'ifelse',
  label: 'If-Else',
  icon: '🔀',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    condition: 'frontClear',
    children: [],
    elseChildren: [],
  }),

  toCode(block, ctx) {
    const condCode = ctx.getConditionCode(block);

    // If branch
    ctx.addLine(`if ${condCode}:`, block.id);
    ctx.generateChildren(block.children);

    // Else branch
    ctx.addLine('else:', block.id);
    ctx.generateChildren(block.elseChildren);
  },

  // ifelse uses IfStatement with alternate
  astType: 'IfElseStatement', // Marker to differentiate from if
  fromAST(stmt, ctx) {
    const cond = ctx.getCondition(stmt.condition);
    return {
      type: 'ifelse',
      condition: cond.condition,
      conditionExpr: cond.conditionExpr,
      children: ctx.parseStatements(stmt.consequent),
      elseChildren: ctx.parseStatements(stmt.alternate || []),
    };
  },

  render: {
    hasChildren: true,
    hasElseChildren: true,
    controls: [{ type: 'condition' }],
  },
};

registerBlock(ifelseBlock);
