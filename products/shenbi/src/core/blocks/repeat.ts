/**
 * Repeat Block
 *
 * Repeats the contained blocks a specified number of times.
 * Example: repeat 3 times:
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const repeatBlock: ControlBlockDefinition = {
  type: 'repeat',
  label: 'Repeat',
  icon: '🔁',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({
    repeatCount: 3,
    children: [],
  }),

  toCode(block, ctx) {
    const count = block.repeatCount ?? 3;
    ctx.addLine(`repeat ${count} times:`, block.id);
    ctx.generateChildren(block.children);
  },

  astType: 'RepeatStatement',
  fromAST(stmt, ctx) {
    return {
      type: 'repeat',
      repeatCount: ctx.getNumber(stmt.count) ?? 3,
      children: ctx.parseStatements(stmt.body),
    };
  },

  render: {
    hasChildren: true,
    controls: [
      { type: 'number', field: 'repeatCount', min: 1, max: 99, width: 'w-10' },
      { type: 'text', value: 'times' },
    ],
  },
};

registerBlock(repeatBlock);
