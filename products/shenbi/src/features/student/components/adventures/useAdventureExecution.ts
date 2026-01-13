/**
 * useAdventureExecution Hook
 *
 * Shared state and logic for adventure game execution.
 * Handles editor state, execution state, and VM lifecycle.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { compileProgram, SyntaxError, RuntimeError, type Value } from '../../../../core/lang';
import {
  Block,
  generateCode,
  generateCodeWithLineMap,
  LineToBlockMap,
  parseCodeToBlocks,
  useBlockHistory,
} from '../../../shared/components/BlockEditor';

export type GameType = 'maze' | 'turtle';

export interface VMInterface {
  load(program: unknown): void;
  loadWithSource?(code: string): void; // Optional: load source with stdlib prepended
  run(): { done: boolean; highlightLine: number | null };
  getVariables(): Record<string, Value>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCallStackForVisualization(): any[];
  evaluateExpression?(source: string): Value; // Evaluate win/fail conditions using VM
}

export interface UseAdventureExecutionOptions {
  gameType: GameType;
  createVM: () => VMInterface | null;
  resetWorld: () => void;
  onExecutionComplete: (hasError: boolean) => void;
  onCodeChange?: (code: string) => void;
}

export interface UseAdventureExecutionReturn {
  // Editor state
  editorMode: 'code' | 'blocks';
  code: string;
  blocks: Block[];
  output: string[];
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

  // VM reference for visualization
  vmRef: React.MutableRefObject<VMInterface | null>;

  // Handlers
  setEditorMode: (mode: 'code' | 'blocks') => void;
  handleCodeChange: (code: string) => void;
  handleBlocksChange: (blocks: Block[]) => void;
  handleModeSwitch: (mode: 'code' | 'blocks') => void;
  handleRun: () => void;
  handleStep: () => void;
  resetExecution: () => void;
  undo: () => void;
  redo: () => void;
  setExecutionSpeed: (speed: number) => void;
  setError: (error: string | null) => void;
}

export function useAdventureExecution({
  gameType,
  createVM,
  resetWorld,
  onExecutionComplete,
  onCodeChange,
}: UseAdventureExecutionOptions): UseAdventureExecutionReturn {
  // Editor state
  const [editorMode, setEditorMode] = useState<'code' | 'blocks'>('blocks');
  const [code, setCode] = useState('');
  const { blocks, setBlocks, undo, redo, canUndo, canRedo, resetHistory } = useBlockHistory([]);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, Value>>({});
  const [executionSpeed, setExecutionSpeed] = useState(500); // Default to 2x speed

  // Refs
  const vmRef = useRef<VMInterface | null>(null);
  const lineMapRef = useRef<LineToBlockMap>(new Map());
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  // Sync code from blocks when in blocks mode
  useEffect(() => {
    if (editorMode === 'blocks') {
      const { code: generatedCode, lineMap } = generateCodeWithLineMap(blocks, gameType);
      lineMapRef.current = lineMap;
      setCode(generatedCode);
      onCodeChange?.(generatedCode);
    }
  }, [blocks, editorMode, gameType, onCodeChange]);

  // Handle code change in code mode
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setError(null);
      onCodeChange?.(newCode);

      // Try to parse code back to blocks
      const parsedBlocks = parseCodeToBlocks(newCode, gameType);
      if (parsedBlocks !== null) {
        setBlocks(parsedBlocks);
      }
    },
    [gameType, setBlocks, onCodeChange]
  );

  // Handle blocks change
  const handleBlocksChange = useCallback(
    (newBlocks: Block[]) => {
      setBlocks(newBlocks);
      setError(null);
    },
    [setBlocks]
  );

  // Handle mode switch
  const handleModeSwitch = useCallback(
    (mode: 'code' | 'blocks') => {
      if (isRunning) return;

      if (mode === 'blocks' && editorMode === 'code') {
        const parsedBlocks = parseCodeToBlocks(code, gameType);
        if (parsedBlocks) {
          setBlocks(parsedBlocks);
        } else {
          setError('Code cannot be converted to blocks');
          return;
        }
      } else if (mode === 'code' && editorMode === 'blocks') {
        const generatedCode = generateCode(blocks, gameType);
        setCode(generatedCode);
      }
      setEditorMode(mode);
      setError(null);
    },
    [code, blocks, editorMode, isRunning, gameType, setBlocks]
  );

  // Initialize VM
  const initializeVM = useCallback(() => {
    try {
      // Generate code with line map
      const { code: generatedCode, lineMap } = generateCodeWithLineMap(blocks, gameType);
      lineMapRef.current = lineMap;

      const vm = createVM();
      if (!vm) return false;

      // Use loadWithSource if available (includes stdlib), otherwise compile and load
      if (vm.loadWithSource) {
        vm.loadWithSource(generatedCode);
      } else {
        const compiled = compileProgram(generatedCode);
        vm.load(compiled);
      }

      vmRef.current = vm;
      return true;
    } catch (e) {
      if (e instanceof SyntaxError || e instanceof RuntimeError) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      return false;
    }
  }, [blocks, gameType, createVM]);

  // Execute a single step
  // checkResult: whether to check win/fail conditions when done (false for step mode)
  const executeStep = useCallback(
    (checkResult: boolean = true) => {
      const vm = vmRef.current;
      if (!vm) return false;

      try {
        const result = vm.run();
        setCurrentLine(result.highlightLine);

        // Update variables
        const vars = vm.getVariables();
        setVariables(vars);

        // Update block highlighting
        if (result.highlightLine !== null && result.highlightLine !== undefined) {
          const blockId = lineMapRef.current.get(result.highlightLine);
          setHighlightedBlockId(blockId || null);
        }

        if (result.done) {
          setIsRunning(false);
          setIsPaused(false);
          runningRef.current = false;
          setCurrentLine(null);
          setHighlightedBlockId(null);

          // Only check win/fail conditions when running (not stepping)
          if (checkResult) {
            setTimeout(() => {
              onExecutionComplete(false);
            }, 400);
          }
          return false;
        }

        return true;
      } catch (e) {
        setIsRunning(false);
        setIsPaused(false);
        runningRef.current = false;
        if (e instanceof SyntaxError || e instanceof RuntimeError) {
          setError(e.message);
        } else {
          setError(String(e));
        }
        if (checkResult) {
          onExecutionComplete(true);
        }
        return false;
      }
    },
    [onExecutionComplete]
  );

  // Run continuously
  const runContinuous = useCallback(() => {
    if (!runningRef.current || pausedRef.current) return;

    const continueRunning = executeStep(true);
    if (continueRunning && runningRef.current && !pausedRef.current) {
      timeoutRef.current = window.setTimeout(runContinuous, executionSpeed);
    }
  }, [executeStep, executionSpeed]);

  // Reset execution state
  const resetExecution = useCallback(() => {
    // Stop any running execution
    runningRef.current = false;
    pausedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setOutput([]);
    setError(null);
    setCurrentLine(null);
    setHighlightedBlockId(null);
    setIsRunning(false);
    setIsPaused(false);
    setVariables({});
    vmRef.current = null;

    // Reset the game world
    resetWorld();
  }, [resetWorld]);

  // Handle run button
  const handleRun = useCallback(() => {
    if (isRunning && !isPaused) {
      // Pause
      runningRef.current = false;
      pausedRef.current = true;
      setIsPaused(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else if (isPaused) {
      // Resume
      runningRef.current = true;
      pausedRef.current = false;
      setIsPaused(false);
      runContinuous();
    } else {
      // Start fresh
      resetExecution();

      if (!initializeVM()) {
        return;
      }

      runningRef.current = true;
      pausedRef.current = false;
      setIsRunning(true);
      setIsPaused(false);
      runContinuous();
    }
  }, [isRunning, isPaused, resetExecution, initializeVM, runContinuous]);

  // Handle step button (single step - no win/fail check)
  const handleStep = useCallback(() => {
    // Stop continuous running
    if (runningRef.current) {
      runningRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    if (!vmRef.current) {
      resetExecution();
      if (!initializeVM()) return;
      setIsRunning(true);
    }

    setIsPaused(true);
    pausedRef.current = true;
    // Pass false to skip win/fail detection in step mode
    executeStep(false);
  }, [resetExecution, initializeVM, executeStep]);

  // Reset block history when needed (exposed via resetExecution indirectly)
  const resetAll = useCallback(() => {
    resetHistory([]);
    resetExecution();
  }, [resetHistory, resetExecution]);

  return {
    // Editor state
    editorMode,
    code,
    blocks,
    output,
    error,
    canUndo,
    canRedo,

    // Execution state
    isRunning,
    isPaused,
    currentLine,
    highlightedBlockId,
    variables,
    executionSpeed,

    // VM reference
    vmRef,

    // Handlers
    setEditorMode,
    handleCodeChange,
    handleBlocksChange,
    handleModeSwitch,
    handleRun,
    handleStep,
    resetExecution: resetAll,
    undo,
    redo,
    setExecutionSpeed,
    setError,
  };
}
