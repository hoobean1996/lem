/**
 * Set Variable Block
 *
 * Assigns a value to a variable.
 * Example: x = 5
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const setVariableBlock: ControlBlockDefinition = {
  type: 'setVariable',
  label: 'Set Variable',
  icon: '📦',
  color: BLOCK_COLORS.data,
  category: 'data',

  createDefaults: () => ({
    variableName: 'x',
    expression: { type: 'number', value: 0 },
  }),

  toCode(block, ctx) {
    const varName = block.variableName ?? 'x';
    const valueCode = ctx.expressionToCode(block.expression);
    ctx.addLine(`${varName} = ${valueCode}`, block.id);
  },

  astType: 'Assignment',
  fromAST(stmt, ctx) {
    return {
      type: 'setVariable',
      variableName: stmt.target,
      expression: ctx.astToExpression(stmt.value),
    };
  },

  render: {
    controls: [
      { type: 'textInput', field: 'variableName', placeholder: 'var', width: 'w-12' },
      { type: 'text', value: '=' },
      { type: 'expression', field: 'expression' },
    ],
  },
};

registerBlock(setVariableBlock);
