/**
 * ProgramEditor Component
 *
 * A unified editor that switches between block-based and code-based editing.
 * Wraps BlockEditor and CodeEditor to reduce duplication across the app.
 */

import { Block, BlockType, CommandId, GameType } from './BlockEditor/types';
import type { CustomCommandDefinition } from '../../../core/engine/types';
import { BlockEditor } from './BlockEditor';
import { CodeEditor } from './CodeEditor';
import { useLanguage } from '../../../infrastructure/i18n';

export type EditorMode = 'code' | 'blocks';

interface ProgramEditorProps {
  mode: EditorMode;
  // Block editor props
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  gameType: GameType;
  availableCommands?: CommandId[];
  availableBlocks?: BlockType[];
  customCommands?: CustomCommandDefinition[];
  highlightedBlockId?: string | null;
  // Code editor props
  code: string;
  onCodeChange: (code: string) => void;
  currentLine?: number | null;
  errorLine?: number | null;
  // Shared props
  disabled?: boolean;
  // Optional code editor extras
  breakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
}

export function ProgramEditor({
  mode,
  blocks,
  onBlocksChange,
  gameType,
  availableCommands,
  availableBlocks,
  customCommands,
  highlightedBlockId,
  code,
  onCodeChange,
  currentLine,
  errorLine,
  disabled = false,
  breakpoints,
  onToggleBreakpoint,
}: ProgramEditorProps) {
  const { language } = useLanguage();

  if (mode === 'code') {
    return (
      <div className="h-full bg-white rounded-xl overflow-hidden">
        <CodeEditor
          code={code}
          onChange={onCodeChange}
          currentLine={currentLine}
          errorLine={errorLine}
          disabled={disabled}
          placeholder={language === 'en' ? '# Write code here...' : '# 在这里编辑代码...'}
          className="h-full"
          breakpoints={breakpoints}
          onToggleBreakpoint={onToggleBreakpoint}
        />
      </div>
    );
  }

  return (
    <BlockEditor
      blocks={blocks}
      onBlocksChange={onBlocksChange}
      gameType={gameType}
      availableCommands={availableCommands}
      availableBlocks={availableBlocks}
      customCommands={customCommands}
      highlightedBlockId={highlightedBlockId}
      disabled={disabled}
    />
  );
}
