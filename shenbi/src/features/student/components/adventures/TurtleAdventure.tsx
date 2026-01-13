/**
 * TurtleAdventure Component
 *
 * Handles turtle graphics game logic, world management, and rendering.
 * Uses shared useAdventureExecution hook and AdventureLayout component.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { TurtleWorld, TurtleCanvas, TurtleVM } from '../../../../core/game';
import type { Line } from '../../../../core/game/turtle/TurtleWorld';
import { SoundManager } from '../../../../infrastructure/sounds';
import type { GameAdventureProps } from './types';
import { useAdventureExecution, VMInterface } from './useAdventureExecution';
import { AdventureLayout } from './AdventureLayout';
import type { CommandId, BlockType } from '../../../shared/components/BlockEditor';
import { StdlibViewerModal } from '../../../shared/components/StdlibViewerModal';
import { warn } from '../../../../infrastructure/logging';

// Consistent world size - must match what's used to create TurtleWorld
// 360 = 18 grid units * 20 pixels, origin at 180 (9 units from edge)
const WORLD_SIZE = 360;

/**
 * Generate target lines by executing expectedCode on a temporary world
 */
function generateTargetLines(expectedCode: string | undefined): Line[] {
  if (!expectedCode) return [];

  try {
    // Create temporary world and VM with same size as actual world
    const tempWorld = new TurtleWorld(WORLD_SIZE, WORLD_SIZE);
    const tempVM = new TurtleVM({ world: tempWorld });

    // Load and execute the expected code with stdlib
    tempVM.loadWithSource(expectedCode);
    tempVM.runAll();

    // Return the resulting lines
    return tempWorld.getLines();
  } catch (e) {
    // If expected code fails to compile/execute, return empty
    warn('Failed to generate target lines', { error: e }, 'TurtleAdventure');
    return [];
  }
}

export function TurtleAdventure({
  level,
  resetKey,
  isLargeScreen,
  stdlibFunctions,
  onComplete,
  onFail,
  onCodeChange,
}: GameAdventureProps) {
  // Stdlib viewer modal state
  const [showStdlibViewer, setShowStdlibViewer] = useState(false);

  // Turtle world state
  const turtleWorldRef = useRef<TurtleWorld | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState({});

  // Condition evaluation refs
  const hasCustomWinConditionRef = useRef(false);
  const levelRef = useRef(level);
  const isCompleteRef = useRef(false);

  // VM ref for condition evaluation (will be set after execution hook is created)
  const vmRef = useRef<VMInterface | null>(null);

  // Update level ref when level changes
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Generate target lines from expectedCode (memoized)
  const targetLines = useMemo(() => {
    if (!level?.expectedCode) return [];
    return generateTargetLines(level.expectedCode);
  }, [level?.expectedCode]);

  // Check win/fail conditions using VM's evaluateExpression
  const checkConditions = useCallback((vm: VMInterface | null) => {
    const turtleWorld = turtleWorldRef.current;
    const currentLevel = levelRef.current;
    if (!vm?.evaluateExpression || !turtleWorld || !currentLevel)
      return { win: false, fail: false };

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

  // Handle execution complete
  const handleExecutionComplete = useCallback(
    (hasError: boolean) => {
      if (hasError) return;
      if (isCompleteRef.current) return;

      const { win, fail } = checkConditions(vmRef.current);

      if (win) {
        isCompleteRef.current = true;
        setTimeout(() => {
          SoundManager.play('win');
          onComplete(0);
        }, 400);
      } else if (fail) {
        setTimeout(() => {
          SoundManager.play('blocked');
          onFail();
        }, 400);
      } else if (!levelRef.current?.winCondition) {
        // No win condition defined - always succeed (sandbox mode)
        isCompleteRef.current = true;
        setTimeout(() => {
          SoundManager.play('win');
          onComplete(0);
        }, 400);
      } else {
        // Win condition not met - show failure
        setTimeout(() => {
          SoundManager.play('blocked');
          onFail();
        }, 400);
      }
    },
    [checkConditions, onComplete, onFail]
  );

  // Reset world function for the hook
  const resetWorld = useCallback(() => {
    if (turtleWorldRef.current) {
      turtleWorldRef.current.reset();
      isCompleteRef.current = false;
      forceUpdate({});
    }
  }, []);

  // Create VM function for the hook
  const createVM = useCallback(() => {
    const turtleWorld = turtleWorldRef.current;
    if (!turtleWorld) return null;

    return new TurtleVM({
      world: turtleWorld,
      onPrint: (message: string) => {
        console.log('Turtle output:', message);
      },
    });
  }, []);

  // Use the shared execution hook
  const execution = useAdventureExecution({
    gameType: 'turtle',
    createVM,
    resetWorld,
    onExecutionComplete: handleExecutionComplete,
    onCodeChange,
  });

  // Sync vmRef with execution's vmRef
  useEffect(() => {
    vmRef.current = execution.vmRef.current;
  });

  // Initialize turtle world
  useEffect(() => {
    if (level) {
      isCompleteRef.current = false;
      hasCustomWinConditionRef.current = !!level.winCondition;

      // Create or reset turtle world
      if (!turtleWorldRef.current) {
        turtleWorldRef.current = new TurtleWorld(WORLD_SIZE, WORLD_SIZE);
        turtleWorldRef.current.onChange(() => forceUpdate({}));
      } else {
        turtleWorldRef.current.reset();
      }

      forceUpdate({});
      setIsReady(true);
    }
  }, [level]);

  // Reset when resetKey changes
  useEffect(() => {
    if (turtleWorldRef.current && level) {
      execution.resetExecution();
    }
  }, [resetKey]);

  // Calculate canvas size - smaller for right panel layout
  const canvasSize = useMemo(() => {
    return isLargeScreen ? 280 : 240;
  }, [isLargeScreen]);

  if (!isReady || !turtleWorldRef.current) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <AdventureLayout
        gameType="turtle"
        availableCommands={level.availableCommands as CommandId[] | undefined}
        availableBlocks={level.availableBlocks as BlockType[] | undefined}
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
          <TurtleCanvas
            world={turtleWorldRef.current!}
            size={canvasSize}
            targetLines={targetLines}
            showTarget={true}
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
