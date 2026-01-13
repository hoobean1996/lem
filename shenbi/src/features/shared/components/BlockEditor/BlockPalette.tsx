/**
 * BlockPalette Component
 *
 * Shows available blocks that can be dragged to the workspace.
 * Filters blocks based on game type and level configuration.
 * Supports custom commands defined in levels.
 */

import { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import {
  BlockDefinition,
  BlockType,
  CommandId,
  GameType,
  CONTROL_BLOCKS,
  VARIABLE_BLOCKS,
  FUNCTION_BLOCKS,
  LIST_BLOCKS,
  BLOCK_COLORS,
  getCommandBlocks,
  createBlock,
} from './types';
import type { CustomCommandDefinition } from '../../../../core/engine/types';
import { SoundManager } from '../../../../infrastructure/sounds/SoundManager';
import { useTranslation } from '../../../../infrastructure/i18n';

const ITEM_TYPE = 'BLOCK';

interface PaletteBlockProps {
  definition: BlockDefinition;
  dataTour?: string;
  disabled?: boolean;
}

function PaletteBlock({ definition, dataTour, disabled = false }: PaletteBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      SoundManager.play('dragStart');
      return { block: createBlock(definition), isFromWorkspace: false };
    },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      data-tour={dataTour}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-white border border-gray-200 shadow-sm ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-grab active:cursor-grabbing hover:shadow-md'
      } ${isDragging ? 'opacity-50 scale-95' : disabled ? '' : 'hover:scale-[1.02]'}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: definition.color }}
    >
      <span className="text-lg">{definition.icon}</span>
      <span className="text-gray-800 font-semibold text-sm">{definition.label}</span>
    </div>
  );
}

interface BlockPaletteProps {
  gameType?: GameType;
  availableCommands?: CommandId[];
  availableBlocks?: BlockType[];
  customCommands?: CustomCommandDefinition[];
  disabled?: boolean;
}

// Convert CustomCommandDefinition to BlockDefinition
function customCommandToBlockDef(cmd: CustomCommandDefinition): BlockDefinition {
  const def: BlockDefinition = {
    type: 'command',
    command: cmd.id as CommandId,
    label: cmd.label,
    color: cmd.color || BLOCK_COLORS.action,
    icon: cmd.icon,
  };

  // Handle argument types
  if (cmd.argType === 'number' && cmd.defaultArg !== undefined) {
    def.argType = 'number';
    def.defaultArg = { type: 'number', value: cmd.defaultArg as number };
  } else if (cmd.argType === 'string' && cmd.defaultArg !== undefined) {
    def.argType = 'string';
    def.defaultArg = { type: 'string', value: cmd.defaultArg as string };
  } else {
    def.argType = 'none';
  }

  return def;
}

export function BlockPalette({
  gameType = 'maze',
  availableCommands,
  availableBlocks,
  customCommands,
  disabled = false,
}: BlockPaletteProps) {
  const { t } = useTranslation();

  // Get command blocks for the current game type
  const commandBlocks = getCommandBlocks(gameType);

  // Convert custom commands to block definitions
  const customBlockDefs = useMemo(
    () => (customCommands ? customCommands.map(customCommandToBlockDef) : []),
    [customCommands]
  );

  // Filter command blocks based on availableCommands (if specified)
  // and combine with custom commands
  const filteredCommandBlocks = useMemo(() => {
    const builtIn = availableCommands
      ? commandBlocks.filter((def) => def.command && availableCommands.includes(def.command))
      : commandBlocks;
    return [...builtIn, ...customBlockDefs];
  }, [commandBlocks, availableCommands, customBlockDefs]);

  // Filter control blocks based on availableBlocks
  const filteredControlBlocks = availableBlocks
    ? CONTROL_BLOCKS.filter((def) => availableBlocks.includes(def.type))
    : CONTROL_BLOCKS;

  // Filter variable blocks based on availableBlocks
  const filteredVariableBlocks = availableBlocks
    ? VARIABLE_BLOCKS.filter((def) => availableBlocks.includes(def.type))
    : VARIABLE_BLOCKS;

  // Filter function blocks based on availableBlocks
  const filteredFunctionBlocks = availableBlocks
    ? FUNCTION_BLOCKS.filter((def) => availableBlocks.includes(def.type))
    : FUNCTION_BLOCKS;

  // Filter list blocks based on availableBlocks
  const filteredListBlocks = availableBlocks
    ? LIST_BLOCKS.filter((def) => availableBlocks.includes(def.type))
    : LIST_BLOCKS;

  return (
    <div className="flex flex-col gap-4 p-3 bg-gray-100 rounded-xl h-full overflow-auto">
      {/* Command blocks */}
      {filteredCommandBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-2">{t('blocks.actions')}</h3>
          <div className="space-y-2">
            {filteredCommandBlocks.map((def, index) => (
              <PaletteBlock
                key={`${def.command}-${def.label}`}
                definition={def}
                dataTour={index === 0 ? 'first-block' : undefined}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Control blocks */}
      {filteredControlBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-2">{t('blocks.control')}</h3>
          <div className="space-y-2">
            {filteredControlBlocks.map((def) => (
              <PaletteBlock key={def.type} definition={def} disabled={disabled} />
            ))}
          </div>
        </div>
      )}

      {/* Variable blocks */}
      {filteredVariableBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-2">{t('blocks.variables')}</h3>
          <div className="space-y-2">
            {filteredVariableBlocks.map((def) => (
              <PaletteBlock key={def.type} definition={def} disabled={disabled} />
            ))}
          </div>
        </div>
      )}

      {/* Function blocks */}
      {filteredFunctionBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-2">{t('blocks.functions')}</h3>
          <div className="space-y-2">
            {filteredFunctionBlocks.map((def) => (
              <PaletteBlock key={def.type} definition={def} disabled={disabled} />
            ))}
          </div>
        </div>
      )}

      {/* List blocks */}
      {filteredListBlocks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-2">List</h3>
          <div className="space-y-2">
            {filteredListBlocks.map((def) => (
              <PaletteBlock key={def.type} definition={def} disabled={disabled} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
