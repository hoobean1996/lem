/**
 * Pass Block
 *
 * No operation - placeholder statement.
 */

import type { ControlBlockDefinition } from './types';
import { BLOCK_COLORS } from './types';
import { registerBlock } from './registry';

export const passBlock: ControlBlockDefinition = {
  type: 'pass',
  label: 'Pass',
  icon: '⏸️',
  color: BLOCK_COLORS.control,
  category: 'control',

  createDefaults: () => ({}),

  toCode(_block, ctx) {
    ctx.addLine('pass');
  },

  astType: 'PassStatement',
  fromAST() {
    return { type: 'pass' };
  },

  render: {
    controls: [],
  },
};

registerBlock(passBlock);
