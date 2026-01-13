/**
 * Continue Block
 *
 * Skips to the next iteration of the innermost loop.
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const continueBlock: ControlBlockDefinition = {
  type: 'continue',
  label: 'Continue',
  icon: '⏭️',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({}),

  toCode(_block, ctx) {
    ctx.addLine('continue');
  },

  astType: 'ContinueStatement',
  fromAST() {
    return { type: 'continue' };
  },

  render: {
    controls: [],
  },
};

registerBlock(continueBlock);
