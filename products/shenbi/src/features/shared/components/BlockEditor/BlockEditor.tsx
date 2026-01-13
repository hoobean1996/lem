/**
 * BlockEditor Component
 *
 * Visual programming editor with drag-and-drop blocks.
 * Supports both mouse and touch interactions.
 * Supports multiple game types: maze, turtle, music
 */

import { DndProvider } from 'react-dnd';
import { MultiBackend, TouchTransition, MouseTransition } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Block, BlockType, CommandId, GameType } from './types';
import type { CustomCommandDefinition } from '../../../../core/engine/types';
import { BlockPalette } from './BlockPalette';
import { BlockWorkspace } from './BlockWorkspace';
import { DragPreview } from './DragPreview';

// Multi-backend configuration for mouse + touch support
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  gameType?: GameType;
  availableCommands?: CommandId[];
  availableBlocks?: BlockType[];
  customCommands?: CustomCommandDefinition[];
  highlightedBlockId?: string | null;
  disabled?: boolean;
}

export function BlockEditor({
  blocks,
  onBlocksChange,
  gameType = 'maze',
  availableCommands,
  availableBlocks,
  customCommands,
  highlightedBlockId,
  disabled = false,
}: BlockEditorProps) {
  return (
    <div className="absolute inset-0">
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <div className="flex gap-3 h-full overflow-hidden p-3">
          {/* Palette */}
          <div className="w-44 flex-shrink-0 overflow-auto">
            <BlockPalette
              gameType={gameType}
              availableCommands={availableCommands}
              availableBlocks={availableBlocks}
              customCommands={customCommands}
              disabled={disabled}
            />
          </div>

          {/* Workspace */}
          <div className="flex-1 min-w-0 overflow-auto">
            <BlockWorkspace
              blocks={blocks}
              onBlocksChange={onBlocksChange}
              highlightedBlockId={highlightedBlockId}
              gameType={gameType}
              disabled={disabled}
              customCommands={customCommands}
            />
          </div>
        </div>

        {/* Touch drag preview */}
        <DragPreview />
      </DndProvider>
    </div>
  );
}
