/**
 * Break Block
 *
 * Exits the innermost loop immediately.
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const breakBlock: ControlBlockDefinition = {
  type: 'break',
  label: 'Break',
  icon: '🛑',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({}),

  toCode(_block, ctx) {
    ctx.addLine('break');
  },

  astType: 'BreakStatement',
  fromAST() {
    return { type: 'break' };
  },

  render: {
    controls: [],
  },
};

registerBlock(breakBlock);
