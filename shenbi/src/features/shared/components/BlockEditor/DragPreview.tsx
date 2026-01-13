/**
 * DragPreview Component
 *
 * Shows a preview of the block being dragged on touch devices.
 */

import { usePreview } from 'react-dnd-multi-backend';
import { Block, CONTROL_BLOCKS, BlockDefinition, getCommandBlocks } from './types';

// Get all command blocks from both game types
const ALL_COMMAND_BLOCKS = [...getCommandBlocks('maze'), ...getCommandBlocks('turtle')];

function getBlockDef(block: Block): BlockDefinition | undefined {
  if (block.type === 'command') {
    return ALL_COMMAND_BLOCKS.find((b) => b.command === block.command);
  }
  return CONTROL_BLOCKS.find((b) => b.type === block.type);
}

export function DragPreview() {
  const preview = usePreview<{ block: Block }>();

  if (!preview.display || !preview.item) {
    return null;
  }

  const { item, style } = preview;
  const def = getBlockDef(item.block);

  const borderColor = def?.color || '#999';

  return (
    <div
      style={{
        ...style,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200"
        style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
      >
        <span className="text-lg">{def?.icon}</span>
        <span className="text-gray-800 font-semibold text-sm">{def?.label}</span>
      </div>
    </div>
  );
}
