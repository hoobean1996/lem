/**
 * BlockWorkspace Component
 *
 * The main area where blocks are assembled into a program.
 * Features auto-scroll when dragging near edges.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { Block, cloneBlock, GameType } from './types';
import { BlockItem } from './BlockItem';
import { SoundManager } from '../../../../infrastructure/sounds/SoundManager';
import { useLanguage } from '../../../../infrastructure/i18n';
import type { CustomCommandDefinition } from '../../../../core/engine/types';

const ITEM_TYPE = 'BLOCK';
const SCROLL_ZONE_SIZE = 60; // pixels from edge to trigger scroll
const SCROLL_SPEED = 8; // pixels per frame

interface BlockWorkspaceProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  highlightedBlockId?: string | null;
  gameType?: GameType;
  disabled?: boolean;
  customCommands?: CustomCommandDefinition[];
}

export function BlockWorkspace({
  blocks,
  onBlocksChange,
  highlightedBlockId,
  gameType = 'maze',
  disabled = false,
  customCommands,
}: BlockWorkspaceProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Auto-scroll logic
  const startAutoScroll = useCallback((direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return;

    const scrollContainer = containerRef.current?.parentElement;
    if (!scrollContainer) return;

    scrollIntervalRef.current = window.setInterval(() => {
      if (direction === 'down') {
        scrollContainer.scrollTop += SCROLL_SPEED;
      } else {
        scrollContainer.scrollTop -= SCROLL_SPEED;
      }
    }, 16); // ~60fps
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoScroll();
  }, [stopAutoScroll]);

  const [{ isOver, canDrop: canDropMonitor }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: () => !disabled,
    drop: (item: { block: Block; isFromWorkspace?: boolean }, monitor) => {
      stopAutoScroll();
      isDraggingRef.current = false;

      if (disabled) return; // Don't drop when disabled
      if (monitor.didDrop()) return; // Already handled by nested drop zone

      if (item.isFromWorkspace) {
        // Moving within workspace - already handled by individual block
        return;
      }

      // Adding new block from palette
      const newBlock = cloneBlock(item.block);
      onBlocksChange([...blocks, newBlock]);
      SoundManager.play('drop');
    },
    hover: (_item, monitor) => {
      if (disabled) return; // Don't handle hover when disabled
      isDraggingRef.current = true;

      const scrollContainer = containerRef.current?.parentElement;
      if (!scrollContainer) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        stopAutoScroll();
        return;
      }

      const containerRect = scrollContainer.getBoundingClientRect();
      const relativeY = clientOffset.y - containerRect.top;

      // Check if near top or bottom edge
      if (relativeY < SCROLL_ZONE_SIZE) {
        stopAutoScroll();
        startAutoScroll('up');
      } else if (relativeY > containerRect.height - SCROLL_ZONE_SIZE) {
        stopAutoScroll();
        startAutoScroll('down');
      } else {
        stopAutoScroll();
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Determine if dropping is allowed (not disabled and canDrop from monitor)
  const canDrop = !disabled && canDropMonitor;

  const handleUpdateBlock = (index: number, updatedBlock: Block) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onBlocksChange(newBlocks);
  };

  const handleRemoveBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    onBlocksChange(newBlocks);
  };

  const handleAddChild = (parentId: string, childBlock: Block, target?: 'else') => {
    const newBlock = cloneBlock(childBlock);

    const addToParent = (blockList: Block[]): Block[] => {
      return blockList.map((block) => {
        if (block.id === parentId) {
          if (target === 'else') {
            return {
              ...block,
              elseChildren: [...(block.elseChildren || []), newBlock],
            };
          }
          return {
            ...block,
            children: [...(block.children || []), newBlock],
          };
        }

        // Recursively search in children
        if (block.children) {
          block = { ...block, children: addToParent(block.children) };
        }
        if (block.elseChildren) {
          block = { ...block, elseChildren: addToParent(block.elseChildren) };
        }

        return block;
      });
    };

    onBlocksChange(addToParent(blocks));
  };

  // Combine refs
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      drop(node);
    },
    [drop]
  );

  return (
    <div
      ref={setRefs}
      className={`p-4 bg-white rounded-xl min-h-full min-w-[240px] transition-all ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''
      } ${canDrop && !isOver ? 'ring-1 ring-blue-200' : ''}`}
    >
      {blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <div>{t('blocks.dragFromLeft')}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              onUpdate={(updated) => handleUpdateBlock(index, updated)}
              onRemove={() => handleRemoveBlock(index)}
              onAddChild={handleAddChild}
              highlightedBlockId={highlightedBlockId}
              gameType={gameType}
              customCommands={customCommands}
            />
          ))}
          {/* Extra drop zone at bottom for easier dropping */}
          <div
            className={`min-h-[80px] rounded-lg border-2 border-dashed transition-all ${
              canDrop ? 'border-blue-300 bg-blue-50/50' : 'border-transparent'
            } ${isOver ? 'border-blue-400 bg-blue-100/50' : ''}`}
          />
        </div>
      )}
    </div>
  );
}
