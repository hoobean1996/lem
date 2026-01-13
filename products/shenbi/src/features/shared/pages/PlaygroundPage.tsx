/**
 * Playground Page
 *
 * Demonstrates all MiniPython language features with interactive examples.
 * Uses a maze game as the execution environment.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, RotateCcw, Code, Terminal, Blocks, Maximize2, Minimize2 } from 'lucide-react';
import { MazeWorld, MazeCanvas, MazeVM } from '../../../core/game';
import { compileProgram, SyntaxError, RuntimeError, type Value } from '../../../core/lang';
import { defaultTheme } from '../../../infrastructure/themes';
import { Block } from '../components/BlockEditor/types';
import {
  generateCode,
  generateCodeWithLineMap,
  LineToBlockMap,
} from '../components/BlockEditor/codeGenerator';
import { parseCodeToBlocks } from '../components/BlockEditor/codeParser';
import { ProgramEditor } from '../components/ProgramEditor';
import { ExecutionVisualizer } from '../components/ExecutionVisualizer';
import { useLanguage } from '../../../infrastructure/i18n';
import { error as logError } from '../../../infrastructure/logging';

const FEATURE_CATEGORIES = [
  {
    id: 'comprehensive',
    name: '综合示例',
    nameEn: 'Comprehensive',
    icon: '🚀',
    examples: [
      {
        id: 'comprehensive-demo',
        title: '综合示例',
        titleEn: 'Comprehensive Demo',
        description: '演示所有语言特性：数组、切片、数学函数、循环等',
        descriptionEn: 'Demo all features: arrays, slicing, math functions, loops and more',
        code: `# MiniPython 综合示例
# 演示: 数组、切片、数学函数、for-each循环

# 1. 数组和切片
nums = [1, 2, 3, 4, 5]
first = nums[0]
last = nums[-1]
middle = nums[1:4]
print(middle)

# 2. 数学函数
x = 3.7
print(round(x))
print(sqrt(16))
print(pow(2, 3))

# 3. 字符串乘法
stars = "★" * 3
print(stars)

# 4. For-each 遍历
moves = ["F", "L", "F", "R"]
for m in moves:
    if m == "F":
        if frontClear():
            forward()
    if m == "L":
        turnLeft()
    if m == "R":
        turnRight()

# 5. 对象
robot = {name: "小明", steps: 0}

# 6. While + break/continue
running = True
while running:
    if atGoal():
        print("到达终点!")
        break
    if frontBlocked():
        turnRight()
        continue
    forward()
    robot["steps"] = robot["steps"] + 1

print(robot["steps"])`,
        codeEn: `# MiniPython Comprehensive Example
# Demo: arrays, slicing, math functions, for-each loops

# 1. Arrays and Slicing
nums = [1, 2, 3, 4, 5]
first = nums[0]
last = nums[-1]
middle = nums[1:4]
print(middle)

# 2. Math Functions
x = 3.7
print(round(x))
print(sqrt(16))
print(pow(2, 3))

# 3. String Multiplication
stars = "★" * 3
print(stars)

# 4. For-each Loop
moves = ["F", "L", "F", "R"]
for m in moves:
    if m == "F":
        if frontClear():
            forward()
    if m == "L":
        turnLeft()
    if m == "R":
        turnRight()

# 5. Object
robot = {name: "Robo", steps: 0}

# 6. While + break/continue
running = True
while running:
    if atGoal():
        print("Goal reached!")
        break
    if frontBlocked():
        turnRight()
        continue
    forward()
    robot["steps"] = robot["steps"] + 1

print(robot["steps"])`,
        grid: [
          '# # # # # # # #',
          '# . . . . . . #',
          '# . # # # . . #',
          '# > . . # . . #',
          '# . . . # . . #',
          '# . . . . . . #',
          '# . . . . . G #',
          '# # # # # # # #',
        ],
      },
    ],
  },
];

// Output console component
function OutputConsole({ output }: { output: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      ref={scrollRef}
      className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg h-32 overflow-y-auto"
    >
      {output.length === 0 ? (
        <span className="text-gray-600">// 输出将显示在这里...</span>
      ) : (
        output.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-gray-600 mr-2 select-none">&gt;</span>
            <span>{line}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  const { language } = useLanguage();

  // State - single example
  const selectedExample = FEATURE_CATEGORIES[0].examples[0];
  const initialCode = language === 'en' ? selectedExample.codeEn : selectedExample.code;
  const [code, setCode] = useState(initialCode);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editorMode, setEditorMode] = useState<'code' | 'blocks'>('code');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);

  // Execution visualizer state
  const [_showVisualizer, _setShowVisualizer] = useState(true);
  const [variables, setVariables] = useState<Record<string, Value>>({});
  const [executionSpeed, setExecutionSpeed] = useState(500); // ms per step
  const vmRef = useRef<MazeVM | null>(null);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);

  // Debugging features
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [watchedVariables, setWatchedVariables] = useState<string[]>([]);
  const [historyLength, setHistoryLength] = useState(0);

  // Maze world
  const mazeWorldRef = useRef<MazeWorld | null>(null);
  const lineMapRef = useRef<LineToBlockMap>(new Map());
  const [, forceUpdate] = useState({});

  // Fullscreen
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive cell size based on window width
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = useMemo(() => {
    if (isFullscreen) return 45;
    // Mobile: smaller cells
    if (windowWidth < 768) return 28;
    // Tablet (iPad): medium cells
    if (windowWidth < 1280) return 30;
    // Large desktop: normal cells
    return 36;
  }, [windowWidth, isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!editorContainerRef.current) return;

    if (!document.fullscreenElement) {
      editorContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          logError('Failed to enter fullscreen', err, undefined, 'PlaygroundPage');
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen change (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize maze world
  useEffect(() => {
    if (!mazeWorldRef.current) {
      mazeWorldRef.current = new MazeWorld();
      mazeWorldRef.current.onChange(() => forceUpdate({}));
    }
    mazeWorldRef.current.loadFromStrings(selectedExample.grid);
    forceUpdate({});
  }, []);

  // Load example on mount and when language changes
  useEffect(() => {
    const codeToUse = language === 'en' ? selectedExample.codeEn : selectedExample.code;
    setCode(codeToUse);
    const parsedBlocks = parseCodeToBlocks(codeToUse, 'maze');
    setBlocks(parsedBlocks || []);
  }, [language, selectedExample]);

  // Handle blocks change - generate code from blocks
  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    const generatedCode = generateCode(newBlocks, 'maze');
    setCode(generatedCode);
  }, []);

  // Handle mode switch
  const handleModeSwitch = useCallback(
    (mode: 'code' | 'blocks') => {
      if (mode === 'blocks' && editorMode === 'code') {
        // Switching to blocks mode - parse current code
        const parsedBlocks = parseCodeToBlocks(code, 'maze');
        if (parsedBlocks) {
          setBlocks(parsedBlocks);
        } else {
          // Code can't be parsed - show error
          setError('代码无法转换为积木块 / Code cannot be converted to blocks');
          return;
        }
      } else if (mode === 'code' && editorMode === 'blocks') {
        // Switching to code mode - generate code from blocks
        const generatedCode = generateCode(blocks, 'maze');
        setCode(generatedCode);
      }
      setEditorMode(mode);
      setError(null);
    },
    [code, blocks, editorMode]
  );

  // Reset maze world only (for re-running)
  const resetMazeWorld = useCallback(() => {
    if (mazeWorldRef.current) {
      mazeWorldRef.current.loadFromStrings(selectedExample.grid);
      forceUpdate({});
    }
    setOutput([]);
    setError(null);
    setCurrentLine(null);
    setHighlightedBlockId(null);
    setIsRunning(false);
    setIsPaused(false);
    setVariables({});
    setHistoryLength(0);
    vmRef.current = null;
    pausedRef.current = false;
    runningRef.current = false;
  }, [selectedExample.grid]);

  // Toggle breakpoint at a line
  const handleToggleBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => {
      if (prev.includes(line)) {
        return prev.filter((l) => l !== line);
      } else {
        return [...prev, line].sort((a, b) => a - b);
      }
    });
    // Also toggle in the VM if it exists
    if (vmRef.current) {
      vmRef.current.toggleBreakpoint(line);
    }
  }, []);

  // Add variable to watch list
  const handleAddWatch = useCallback((name: string) => {
    setWatchedVariables((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
    if (vmRef.current) {
      vmRef.current.addWatch(name);
    }
  }, []);

  // Remove variable from watch list
  const handleRemoveWatch = useCallback((name: string) => {
    setWatchedVariables((prev) => prev.filter((n) => n !== name));
    if (vmRef.current) {
      vmRef.current.removeWatch(name);
    }
  }, []);

  // Step back in execution
  const handleStepBack = useCallback(() => {
    if (!vmRef.current) return;

    const success = vmRef.current.stepBack();
    if (success) {
      // Update UI state from VM
      const vars = vmRef.current.getVariables();
      setVariables(vars);
      setCurrentLine(vmRef.current.getCurrentLine());
      setHistoryLength(vmRef.current.getHistoryLength());

      // Update block highlighting
      const line = vmRef.current.getCurrentLine();
      if (line !== null) {
        const blockId = lineMapRef.current.get(line);
        setHighlightedBlockId(blockId || null);
      }

      // Restore maze state (if possible - would need snapshot)
      // For now, step-back only affects variable/line state
    }
  }, []);

  // Full reset - maze world AND code/blocks to original
  const resetAll = useCallback(() => {
    resetMazeWorld();
    // Reset code and blocks to original (respect language setting)
    const codeToUse = language === 'en' ? selectedExample.codeEn : selectedExample.code;
    setCode(codeToUse);
    const parsedBlocks = parseCodeToBlocks(codeToUse, 'maze');
    setBlocks(parsedBlocks || []);
  }, [language, selectedExample.code, selectedExample.codeEn, resetMazeWorld]);

  // Single step execution
  const executeStep = useCallback(async () => {
    if (!vmRef.current || !mazeWorldRef.current) return false;

    try {
      const result = vmRef.current.step();
      setCurrentLine(result.highlightLine);

      // Update variables from VM
      const vars = vmRef.current.getVariables();
      setVariables(vars);

      // Update history length for step-back
      setHistoryLength(vmRef.current.getHistoryLength());

      // Update block highlighting using line map
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
      return false;
    }
  }, []);

  // Initialize VM for execution
  const initializeVM = useCallback(() => {
    if (!mazeWorldRef.current) return false;

    try {
      // Generate code with line map for block highlighting
      const { code: generatedCode, lineMap } = generateCodeWithLineMap(blocks, 'maze');

      // Use line map directly (no stdlib offset needed)
      lineMapRef.current = lineMap;

      // Compile user code (native commands registered by MazeVM)
      const compiled = compileProgram(generatedCode);

      // Collect print outputs
      const outputs: string[] = [];

      const vm = new MazeVM({
        world: mazeWorldRef.current,
        onPrint: (message: string) => {
          outputs.push(message);
          setOutput([...outputs]);
        },
      });
      vm.load(compiled);

      // Sync breakpoints and watched variables
      breakpoints.forEach((line) => vm.addBreakpoint(line));
      watchedVariables.forEach((name) => vm.addWatch(name));

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
  }, [blocks, breakpoints, watchedVariables]);

  // Run until breakpoint
  const handleRunUntilBreakpoint = useCallback(async () => {
    if (!mazeWorldRef.current) return;

    // Initialize if needed
    if (!vmRef.current) {
      resetMazeWorld();
      setIsRunning(true);
      setError(null);
      runningRef.current = true;

      if (!initializeVM()) {
        setIsRunning(false);
        runningRef.current = false;
        return;
      }

      // Set breakpoints in VM
      breakpoints.forEach((line) => vmRef.current?.addBreakpoint(line));
      watchedVariables.forEach((name) => vmRef.current?.addWatch(name));
    }

    // Run until breakpoint
    const runLoop = async () => {
      while (runningRef.current && !pausedRef.current) {
        const continueRunning = await executeStep();
        if (!continueRunning) break;

        // Check if we hit a breakpoint
        const line = vmRef.current?.getCurrentLine();
        if (line !== null && breakpoints.includes(line!)) {
          setIsPaused(true);
          pausedRef.current = true;
          break;
        }

        // Small delay for visualization
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    };

    await runLoop();
  }, [breakpoints, watchedVariables, resetMazeWorld, executeStep, initializeVM]);

  // Continue after breakpoint
  const handleContinue = useCallback(async () => {
    if (!vmRef.current) return;

    setIsPaused(false);
    pausedRef.current = false;

    // Step once to get past current breakpoint
    await executeStep();

    // Then run until next breakpoint
    await handleRunUntilBreakpoint();
  }, [executeStep, handleRunUntilBreakpoint]);

  // Run code continuously
  const runCode = useCallback(async () => {
    if (!mazeWorldRef.current) return;

    // If paused, resume
    if (isPaused && vmRef.current) {
      setIsPaused(false);
      pausedRef.current = false;
      runningRef.current = true;
    } else if (!isRunning) {
      // Fresh start - reset and initialize
      resetMazeWorld();
      setIsRunning(true);
      setError(null);
      runningRef.current = true;

      if (!initializeVM()) {
        setIsRunning(false);
        runningRef.current = false;
        return;
      }
    }

    // Run step by step with animation
    const runLoop = async () => {
      while (runningRef.current && !pausedRef.current) {
        const continueRunning = await executeStep();
        if (!continueRunning) break;

        // Wait based on execution speed
        await new Promise((resolve) => setTimeout(resolve, executionSpeed));
      }
    };

    await runLoop();
  }, [isRunning, isPaused, executionSpeed, resetMazeWorld, initializeVM, executeStep]);

  // Pause execution
  const pauseExecution = useCallback(() => {
    setIsPaused(true);
    pausedRef.current = true;
  }, []);

  // Step once
  const stepOnce = useCallback(async () => {
    if (!mazeWorldRef.current) return;

    // If not initialized, initialize first
    if (!vmRef.current) {
      resetMazeWorld();
      setIsRunning(true);
      setIsPaused(true);
      pausedRef.current = true;
      setError(null);

      if (!initializeVM()) {
        setIsRunning(false);
        return;
      }
    }

    await executeStep();
  }, [resetMazeWorld, initializeVM, executeStep]);

  return (
    <div
      ref={editorContainerRef}
      className={`h-screen flex flex-col bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Compact Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Mode Toggle + Palette Toggle */}
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeSwitch('code')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  editorMode === 'code'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Code className="w-4 h-4" />
                {language === 'en' ? 'Code' : '代码'}
              </button>
              <button
                onClick={() => handleModeSwitch('blocks')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  editorMode === 'blocks'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Blocks className="w-4 h-4" />
                {language === 'en' ? 'Blocks' : '积木'}
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'en' ? 'Reset' : '重置'}
            </button>
            <button
              onClick={runCode}
              disabled={isRunning && !isPaused}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isRunning && !isPaused
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
              }`}
            >
              <Play className="w-4 h-4" />
              {language === 'en' ? 'Run' : '运行'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Workspace + Output */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Area */}
          <div className="flex-1 overflow-hidden bg-gray-100 relative">
            <ProgramEditor
              mode={editorMode}
              code={code}
              onCodeChange={setCode}
              currentLine={currentLine}
              blocks={blocks}
              onBlocksChange={handleBlocksChange}
              gameType="maze"
              highlightedBlockId={highlightedBlockId}
              disabled={isRunning}
              breakpoints={breakpoints}
              onToggleBreakpoint={handleToggleBreakpoint}
            />
          </div>

          {/* Output Console - Bottom of Left Side */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
              <Terminal className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm text-gray-600">
                {language === 'en' ? 'Output' : '输出'}
              </span>
            </div>
            <div className="h-28">
              <OutputConsole output={output} />
            </div>
          </div>
        </div>

        {/* Right Side: Maze + Debug */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
          {/* Maze Display */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Maze' : '迷宫'}
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
            {mazeWorldRef.current && (
              <div className="flex justify-center">
                <MazeCanvas world={mazeWorldRef.current} cellSize={cellSize} theme={defaultTheme} />
              </div>
            )}
          </div>

          {/* Debug Panel */}
          <div className="flex-1 overflow-y-auto">
            <ExecutionVisualizer
              variables={variables}
              callStack={vmRef.current?.getCallStackForVisualization() ?? []}
              currentLine={currentLine}
              isRunning={isRunning}
              isPaused={isPaused}
              speed={executionSpeed}
              onSpeedChange={setExecutionSpeed}
              onStep={stepOnce}
              onPlay={runCode}
              onPause={pauseExecution}
              onReset={resetMazeWorld}
              onStepBack={handleStepBack}
              canStepBack={historyLength > 0}
              historyLength={historyLength}
              watchedVariables={watchedVariables}
              onAddWatch={handleAddWatch}
              onRemoveWatch={handleRemoveWatch}
              breakpoints={breakpoints}
              onRunUntilBreakpoint={handleRunUntilBreakpoint}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-20 left-4 right-80 mx-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
