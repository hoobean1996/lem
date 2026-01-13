/**
 * MazeAdventure Component
 *
 * Handles maze game logic, world management, and rendering.
 * Uses shared useAdventureExecution hook and AdventureLayout component.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { MazeWorld, MazeCanvas, MazeVM } from '../../../../core/game';
import { SoundManager } from '../../../../infrastructure/sounds';
import type { GameAdventureProps } from './types';
import type { RenderTheme } from '../../../../infrastructure/themes';
import { useAdventureExecution, VMInterface } from './useAdventureExecution';
import { AdventureLayout } from './AdventureLayout';
import type { CommandId, BlockType } from '../../../shared/components/BlockEditor';
import { StdlibViewerModal } from '../../../shared/components/StdlibViewerModal';

export function MazeAdventure({
  level,
  theme,
  resetKey,
  isLargeScreen,
  stdlibFunctions,
  onComplete,
  onFail,
  onCodeChange,
}: GameAdventureProps) {
  // Stdlib viewer modal state
  const [showStdlibViewer, setShowStdlibViewer] = useState(false);

  // Maze world state
  const mazeWorldRef = useRef<MazeWorld | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState({});
  const [_collectCount, setCollectCount] = useState(0);

  // Condition evaluation refs
  const stepCountRef = useRef(0);
  const levelRef = useRef(level);
  const isCompleteRef = useRef(false);

  // Update level ref when level changes
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Check win/fail conditions using VM's evaluateExpression
  const checkConditions = useCallback((vm: VMInterface | null) => {
    const mazeWorld = mazeWorldRef.current;
    const currentLevel = levelRef.current;
    if (!vm?.evaluateExpression || !mazeWorld || !currentLevel) return { win: false, fail: false };

    // Check win condition using MiniPython expression
    if (currentLevel.winCondition) {
      const winResult = vm.evaluateExpression(currentLevel.winCondition);
      if (winResult) {
        return { win: true, fail: false };
      }
    }

    // Check fail condition using MiniPython expression
    if (currentLevel.failCondition) {
      const failResult = vm.evaluateExpression(currentLevel.failCondition);
      if (failResult) {
        return { win: false, fail: true };
      }
    }

    return { win: false, fail: false };
  }, []);

  // Execution ref for accessing VM in callbacks (set after hook is created)
  const executionRef = useRef<{ vmRef: React.MutableRefObject<VMInterface | null> } | null>(null);

  // Delay before showing result modal (must be longer than animation duration of 300ms)
  const RESULT_DELAY = 500;

  // Handle execution complete
  const handleExecutionComplete = useCallback(
    (hasError: boolean) => {
      if (hasError) return;
      if (isCompleteRef.current) return;

      const mazeWorld = mazeWorldRef.current;
      if (!mazeWorld) return;

      // Get VM from execution ref (not synced via useEffect, so always current)
      const vm = executionRef.current?.vmRef.current ?? null;
      const { win, fail } = checkConditions(vm);

      // Debug logging
      console.log('[MazeAdventure] handleExecutionComplete:', {
        hasVm: !!vm,
        hasEvaluateExpression: !!vm?.evaluateExpression,
        win,
        fail,
        winCondition: levelRef.current?.winCondition,
        levelName: levelRef.current?.name,
      });

      if (win) {
        isCompleteRef.current = true;
        setTimeout(() => {
          SoundManager.play('win');
          onComplete(mazeWorld.getCollectedCount());
        }, RESULT_DELAY);
      } else if (fail) {
        setTimeout(() => {
          SoundManager.play('blocked');
          onFail();
        }, RESULT_DELAY);
      } else if (!levelRef.current?.winCondition) {
        // No win condition - sandbox mode, always succeed
        isCompleteRef.current = true;
        setTimeout(() => {
          SoundManager.play('win');
          onComplete(mazeWorld.getCollectedCount());
        }, RESULT_DELAY);
      } else {
        // Win condition not met
        setTimeout(() => {
          SoundManager.play('blocked');
          onFail();
        }, RESULT_DELAY);
      }
    },
    [checkConditions, onComplete, onFail]
  );

  // Reset world function for the hook
  const resetWorld = useCallback(() => {
    if (mazeWorldRef.current && level?.grid) {
      mazeWorldRef.current.loadFromStrings(level.grid);
      setCollectCount(0);
      stepCountRef.current = 0;
      isCompleteRef.current = false;
      forceUpdate({});
    }
  }, [level?.grid]);

  // Create VM function for the hook
  const createVM = useCallback(() => {
    const mazeWorld = mazeWorldRef.current;
    if (!mazeWorld) return null;

    const vm = new MazeVM({
      world: mazeWorld,
      onPrint: (message: string) => {
        console.log('Maze output:', message);
      },
    });

    // Register custom commands from level if present
    if (level?.customCommands && level.customCommands.length > 0) {
      vm.registerCustomCommands(level.customCommands);
    }

    return vm;
  }, [level?.customCommands]);

  // Use the shared execution hook
  const execution = useAdventureExecution({
    gameType: 'maze',
    createVM,
    resetWorld,
    onExecutionComplete: handleExecutionComplete,
    onCodeChange,
  });

  // Store execution ref for accessing VM in callbacks
  executionRef.current = execution;

  // Initialize maze world
  useEffect(() => {
    if (level && level.grid) {
      isCompleteRef.current = false;

      if (!mazeWorldRef.current) {
        mazeWorldRef.current = new MazeWorld();

        // Subscribe to changes for re-render and game logic
        mazeWorldRef.current.onChange(() => {
          forceUpdate({});

          const player = mazeWorldRef.current?.getPlayer();
          if (player) {
            setCollectCount(player.collected);
          }

          stepCountRef.current++;
        });
      }

      mazeWorldRef.current.loadFromStrings(level.grid);

      setCollectCount(0);
      stepCountRef.current = 0;
      forceUpdate({});
      setIsReady(true);
    }
  }, [level]);

  // Reset when resetKey changes
  useEffect(() => {
    if (mazeWorldRef.current && level?.grid) {
      execution.resetExecution();
    }
  }, [resetKey]);

  // Calculate dynamic cell size - bigger cells for better visibility
  const cellSize = useMemo(() => {
    if (!mazeWorldRef.current) return 56;
    const gridMax = Math.max(mazeWorldRef.current.getWidth(), mazeWorldRef.current.getHeight());
    // Large cells - maze is the main focus
    if (gridMax <= 7) return isLargeScreen ? 64 : 56;
    if (gridMax <= 10) return isLargeScreen ? 52 : 44;
    return isLargeScreen ? 42 : 36;
  }, [isLargeScreen, mazeWorldRef.current?.getWidth(), mazeWorldRef.current?.getHeight()]);

  if (!isReady || !mazeWorldRef.current) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <AdventureLayout
        gameType="maze"
        availableCommands={level.availableCommands as CommandId[] | undefined}
        availableBlocks={level.availableBlocks as BlockType[] | undefined}
        customCommands={level.customCommands}
        editorMode={execution.editorMode}
        code={execution.code}
        blocks={execution.blocks}
        error={execution.error}
        canUndo={execution.canUndo}
        canRedo={execution.canRedo}
        isRunning={execution.isRunning}
        isPaused={execution.isPaused}
        currentLine={execution.currentLine}
        highlightedBlockId={execution.highlightedBlockId}
        variables={execution.variables}
        executionSpeed={execution.executionSpeed}
        vmRef={execution.vmRef}
        onCodeChange={execution.handleCodeChange}
        onBlocksChange={execution.handleBlocksChange}
        onModeSwitch={execution.handleModeSwitch}
        onRun={execution.handleRun}
        onStep={execution.handleStep}
        onReset={execution.resetExecution}
        onUndo={execution.undo}
        onRedo={execution.redo}
        onSpeedChange={execution.setExecutionSpeed}
        onPause={() => {
          // Pause handled by handleRun when isRunning
        }}
        renderCanvas={() => (
          <MazeCanvas
            world={mazeWorldRef.current!}
            cellSize={cellSize}
            theme={theme as RenderTheme}
          />
        )}
        renderToolbarExtra={() =>
          stdlibFunctions && stdlibFunctions.length > 0 ? (
            <button
              onClick={() => setShowStdlibViewer(true)}
              className="ml-2 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-all flex items-center gap-1"
              title="View Functions"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Lib</span>
            </button>
          ) : null
        }
      />
      {showStdlibViewer && stdlibFunctions && (
        <StdlibViewerModal functions={stdlibFunctions} onClose={() => setShowStdlibViewer(false)} />
      )}
    </>
  );
}
