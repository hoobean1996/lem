/**
 * Function Call Block
 *
 * Calls a previously defined function.
 * Example: myFunction()
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const functionCallBlock: ControlBlockDefinition = {
  type: 'functionCall',
  label: 'Call Function',
  icon: '▶️',
  color: BLOCK_COLORS.function,
  category: 'function',

  createDefaults: () => ({
    functionName: 'myFunction',
    functionArgs: [],
  }),

  toCode(block, ctx) {
    const name = block.functionName ?? 'myFunction';
    const args = block.functionArgs?.map((arg) => ctx.expressionToCode(arg)).join(', ') ?? '';
    ctx.addLine(`${name}(${args})`, block.id);
  },

  // Function calls are parsed as CallExpression
  // The parser handles this specially for non-builtin functions
  astType: 'FunctionCall',
  fromAST(stmt, ctx) {
    return {
      type: 'functionCall',
      functionName: stmt.callee,
      functionArgs: stmt.arguments?.map((arg: unknown) => ctx.astToExpression(arg)) || [],
    };
  },

  render: {
    controls: [
      { type: 'textInput', field: 'functionName', placeholder: 'name', width: 'w-20' },
      { type: 'text', value: '()' },
    ],
  },
};

registerBlock(functionCallBlock);
