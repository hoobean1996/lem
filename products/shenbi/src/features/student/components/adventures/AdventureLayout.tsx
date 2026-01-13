/**
 * AdventureLayout Component
 *
 * Shared UI layout for adventure games.
 * Includes toolbar, program editor, and execution visualizer.
 * Features a resizable divider between editor and game canvas.
 */

import { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw, Code, Blocks, Undo2, Redo2 } from 'lucide-react';
import { Block, type CommandId, type BlockType } from '../../../shared/components/BlockEditor';
import type { CustomCommandDefinition } from '../../../../core/engine/types';
import { ProgramEditor } from '../../../shared/components/ProgramEditor';
import { ExecutionVisualizer } from '../../../shared/components/ExecutionVisualizer';
import { useLanguage } from '../../../../infrastructure/i18n';
import type { Value } from '../../../../core/lang';
import type { GameType, VMInterface } from './useAdventureExecution';

// Storage key for panel width preference
const PANEL_WIDTH_KEY = 'shenbi-panel-width';
const DEFAULT_PANEL_WIDTH = 440;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 700;

interface AdventureLayoutProps {
  // Game type
  gameType: GameType;
  availableCommands?: CommandId[];
  availableBlocks?: BlockType[];
  customCommands?: CustomCommandDefinition[];

  // Editor state
  editorMode: 'code' | 'blocks';
  code: string;
  blocks: Block[];
  error: string | null;
  canUndo: boolean;
  canRedo: boolean;

  // Execution state
  isRunning: boolean;
  isPaused: boolean;
  currentLine: number | null;
  highlightedBlockId: string | null;
  variables: Record<string, Value>;
  executionSpeed: number;

  // VM reference for call stack
  vmRef: React.MutableRefObject<VMInterface | null>;

  // Handlers
  onCodeChange: (code: string) => void;
  onBlocksChange: (blocks: Block[]) => void;
  onModeSwitch: (mode: 'code' | 'blocks') => void;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSpeedChange: (speed: number) => void;
  onPause: () => void;

  // Game canvas (rendered by specific adventure)
  renderCanvas: () => ReactNode;

  // Optional extra toolbar items
  renderToolbarExtra?: () => ReactNode;
}

export function AdventureLayout({
  gameType,
  availableCommands,
  availableBlocks,
  customCommands,
  editorMode,
  code,
  blocks,
  error,
  canUndo,
  canRedo,
  isRunning,
  isPaused,
  currentLine,
  highlightedBlockId,
  variables,
  executionSpeed,
  vmRef,
  onCodeChange,
  onBlocksChange,
  onModeSwitch,
  onRun,
  onStep,
  onReset,
  onUndo,
  onRedo,
  onSpeedChange,
  onPause,
  renderCanvas,
  renderToolbarExtra,
}: AdventureLayoutProps) {
  const { language } = useLanguage();

  // Panel resize state
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem(PANEL_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_PANEL_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));

      setRightPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save preference
      localStorage.setItem(PANEL_WIDTH_KEY, rightPanelWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, rightPanelWidth]);

  return (
    <div className="absolute inset-0 flex flex-col bg-white overflow-hidden">
      {/* Compact Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Mode Toggle + Undo/Redo */}
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => onModeSwitch('blocks')}
                disabled={isRunning}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  editorMode === 'blocks'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                } ${isRunning ? 'opacity-50' : ''}`}
              >
                <Blocks className="w-3.5 h-3.5" />
                {language === 'en' ? 'Blocks' : '积木'}
              </button>
              <button
                onClick={() => onModeSwitch('code')}
                disabled={isRunning}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  editorMode === 'code'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                } ${isRunning ? 'opacity-50' : ''}`}
              >
                <Code className="w-3.5 h-3.5" />
                {language === 'en' ? 'Code' : '代码'}
              </button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo || isRunning}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-all disabled:opacity-40"
                title={language === 'en' ? 'Undo' : '撤销'}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo || isRunning}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-all disabled:opacity-40"
                title={language === 'en' ? 'Redo' : '重做'}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Extra toolbar items (game-specific) */}
            {renderToolbarExtra?.()}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReset}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-all"
              title={language === 'en' ? 'Reset' : '重置'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onStep}
              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
              title={language === 'en' ? 'Step' : '单步'}
            >
              <StepForward className="w-4 h-4" />
            </button>
            <button
              onClick={onRun}
              data-tour="run-button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                isRunning && !isPaused
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRunning && !isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Pause' : '暂停'}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Run' : '运行'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={containerRef} className="flex-1 flex min-h-0">
        {/* Left Side: Editor */}
        <div className="flex-1 min-w-0 h-full bg-gray-100 relative" data-tour="block-editor">
          <ProgramEditor
            mode={editorMode}
            code={code}
            onCodeChange={onCodeChange}
            currentLine={currentLine}
            blocks={blocks}
            onBlocksChange={onBlocksChange}
            gameType={gameType}
            availableCommands={availableCommands}
            availableBlocks={availableBlocks}
            customCommands={customCommands}
            highlightedBlockId={highlightedBlockId}
            disabled={isRunning}
          />
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-400 transition-colors ${
            isResizing ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          title={language === 'en' ? 'Drag to resize' : '拖动调整大小'}
        />

        {/* Right Side: Game Canvas + Debug */}
        <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: rightPanelWidth }}>
          {/* Game Canvas */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200" data-tour="game-world">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {gameType === 'maze'
                  ? language === 'en'
                    ? 'Maze'
                    : '迷宫'
                  : language === 'en'
                    ? 'Canvas'
                    : '画布'}
              </span>
              {isRunning && !isPaused && (
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  {language === 'en' ? 'Running' : '运行中'}
                </span>
              )}
              {isPaused && (
                <span className="flex items-center gap-1.5 text-xs text-orange-600">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  {language === 'en' ? 'Paused' : '已暂停'}
                </span>
              )}
            </div>
            <div className="flex justify-center">{renderCanvas()}</div>
          </div>

          {/* Debug Panel */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ExecutionVisualizer
              variables={variables}
              callStack={vmRef.current?.getCallStackForVisualization() ?? []}
              currentLine={currentLine}
              isRunning={isRunning && !isPaused}
              isPaused={isPaused}
              speed={executionSpeed}
              onSpeedChange={onSpeedChange}
              onStep={onStep}
              onPlay={onRun}
              onPause={onPause}
              onReset={onReset}
            />
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-28 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm shadow-lg z-10">
          {error}
        </div>
      )}

      {/* Resize overlay to prevent iframe/canvas from capturing mouse events */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}
