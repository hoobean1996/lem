/**
 * Function Definition Block
 *
 * Defines a reusable function.
 * Example: def myFunction():
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const functionDefBlock: ControlBlockDefinition = {
  type: 'functionDef',
  label: 'Define Function',
  icon: '🔧',
  color: BLOCK_COLORS.function,
  category: 'function',

  createDefaults: () => ({
    functionName: 'myFunction',
    functionParams: [],
    children: [],
  }),

  toCode(block, ctx) {
    const name = block.functionName ?? 'myFunction';
    const params = block.functionParams?.join(', ') ?? '';
    ctx.addLine(`def ${name}(${params}):`, block.id);
    ctx.generateChildren(block.children);
  },

  astType: 'FunctionDef',
  fromAST(stmt, ctx) {
    return {
      type: 'functionDef',
      functionName: stmt.name,
      functionParams: stmt.params || [],
      children: ctx.parseStatements(stmt.body),
    };
  },

  render: {
    hasChildren: true,
    controls: [
      { type: 'textInput', field: 'functionName', placeholder: 'name', width: 'w-20' },
      { type: 'text', value: '()' },
    ],
  },
};

registerBlock(functionDefBlock);
