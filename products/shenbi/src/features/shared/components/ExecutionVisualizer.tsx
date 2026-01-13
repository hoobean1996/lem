/**
 * Execution Visualizer
 *
 * Advanced visualization of code execution showing:
 * - Variable values with change animations
 * - Visual call stack
 * - Data structure visualization (arrays, objects)
 * - Step-by-step execution controls
 * - Variable watch feature
 * - Step-back debugging
 * - Breakpoint indicators
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Variable,
  Layers,
  Box,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Undo2,
  Eye,
  Plus,
  X,
  StopCircle,
  PlayCircle,
} from 'lucide-react';
import type { Value } from '../../../core/lang';

interface CallStackFrame {
  name: string;
  line: number;
  locals: Record<string, Value>;
}

interface VariableInfo {
  name: string;
  value: Value;
  type: string;
  changed: boolean;
  isWatched: boolean;
}

interface ExecutionVisualizerProps {
  variables: Record<string, Value>;
  callStack?: CallStackFrame[];
  currentLine: number | null;
  isRunning: boolean;
  isPaused?: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStep: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  // New debugging features
  onStepBack?: () => void;
  canStepBack?: boolean;
  historyLength?: number;
  watchedVariables?: string[];
  onAddWatch?: (name: string) => void;
  onRemoveWatch?: (name: string) => void;
  breakpoints?: number[];
  onRunUntilBreakpoint?: () => void;
  onContinue?: () => void;
}

// Classify value type
function getValueType(value: Value): string {
  if (value === null) return 'null';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
  if (typeof value === 'string') return 'str';
  if (typeof value === 'boolean') return 'bool';
  if (Array.isArray(value)) return 'list';
  if (typeof value === 'object') return 'dict';
  return 'unknown';
}

// Format value for display
function formatValue(value: Value, compact: boolean = false): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) {
    if (compact && value.length > 3) {
      return `[${value
        .slice(0, 3)
        .map((v: Value) => formatValue(v, true))
        .join(', ')}, ...]`;
    }
    return `[${value.map((v: Value) => formatValue(v, true)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value) as [string, Value][];
    if (compact && entries.length > 2) {
      return `{${entries
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${formatValue(v, true)}`)
        .join(', ')}, ...}`;
    }
    return `{${entries.map(([k, v]) => `${k}: ${formatValue(v, true)}`).join(', ')}}`;
  }
  return String(value);
}

// Color for value type
function getTypeColor(type: string): string {
  switch (type) {
    case 'int':
    case 'float':
      return 'text-orange-600 bg-orange-50';
    case 'str':
      return 'text-green-600 bg-green-50';
    case 'bool':
      return 'text-purple-600 bg-purple-50';
    case 'list':
      return 'text-blue-600 bg-blue-50';
    case 'dict':
      return 'text-pink-600 bg-pink-50';
    case 'null':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Array visualization component
function ArrayVisualizer({ value, name: _name }: { value: Value[]; name: string }) {
  const [expanded, setExpanded] = useState(value.length <= 10);

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-blue-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-blue-500" />
        )}
        <span className="text-sm font-medium text-blue-700">{value.length} elements</span>
      </button>

      {/* Elements as visual boxes */}
      {expanded && (
        <div className="p-3">
          <div className="flex flex-wrap gap-2">
            {value.map((item, i) => (
              <div key={i} className="flex flex-col items-center min-w-[40px]">
                {/* Index badge */}
                <div className="text-[10px] font-bold text-blue-400 bg-blue-100 px-1.5 rounded-t">
                  {i}
                </div>
                {/* Value box */}
                <div
                  className={`px-3 py-1.5 rounded-b border-t-2 border-blue-300 text-sm font-mono font-medium shadow-sm ${getTypeColor(getValueType(item))}`}
                >
                  {formatValue(item, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Object visualization component
function ObjectVisualizer({ value, name: _name }: { value: Record<string, Value>; name: string }) {
  const [expanded, setExpanded] = useState(true);
  const entries = Object.entries(value);

  return (
    <div className="bg-white rounded-lg border border-pink-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-pink-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-pink-500" />
        )}
        <span className="text-sm font-medium text-pink-700">{entries.length} properties</span>
      </button>

      {/* Properties */}
      {expanded && (
        <div className="divide-y divide-pink-100">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
              <span className="text-sm font-semibold text-pink-600">{key}</span>
              <span
                className={`px-2 py-1 rounded text-sm font-mono ${getTypeColor(getValueType(val))}`}
              >
                {formatValue(val, true)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Single variable display
function VariableDisplay({
  info,
  onRemoveWatch,
}: {
  info: VariableInfo;
  onRemoveWatch?: () => void;
}) {
  const isComplex = info.type === 'list' || info.type === 'dict';

  return (
    <div
      className={`p-3 rounded-lg transition-all duration-300 ${
        info.changed
          ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md'
          : info.isWatched
            ? 'bg-cyan-50 border-2 border-cyan-300'
            : 'bg-gray-50 border border-gray-200'
      }`}
    >
      {/* Variable header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-base font-bold text-gray-900">{info.name}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getTypeColor(info.type)}`}
        >
          {info.type}
        </span>
        {info.changed && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
        {info.isWatched && <Eye className="w-4 h-4 text-cyan-500" />}
        {info.isWatched && onRemoveWatch && (
          <button
            onClick={onRemoveWatch}
            className="ml-auto p-0.5 text-gray-600 hover:text-red-500 transition-colors"
            title="Remove from watch"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Value display */}
      {isComplex ? (
        info.type === 'list' ? (
          <ArrayVisualizer value={info.value as Value[]} name={info.name} />
        ) : (
          <ObjectVisualizer value={info.value as Record<string, Value>} name={info.name} />
        )
      ) : (
        <div
          className={`px-3 py-2 rounded-lg text-base font-mono font-medium ${getTypeColor(info.type)}`}
        >
          {formatValue(info.value)}
        </div>
      )}
    </div>
  );
}

// Call stack visualization - shows function hierarchy as a visual stack
function CallStackDisplay({ callStack }: { callStack: CallStackFrame[] }) {
  if (callStack.length === 0) return null;

  // Reverse to show most recent at top (like a real stack)
  const reversedStack = [...callStack].reverse();

  return (
    <div className="bg-white rounded-lg border border-indigo-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-b border-indigo-200">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-indigo-700">Call Stack</span>
        <span className="text-xs text-indigo-400">({callStack.length} frames)</span>
      </div>

      {/* Stack frames */}
      <div className="divide-y divide-indigo-100">
        {reversedStack.map((frame, i) => {
          const isCurrentFrame = i === 0;
          const localEntries = Object.entries(frame.locals);

          return (
            <div key={i} className={`px-3 py-2 ${isCurrentFrame ? 'bg-indigo-50' : 'bg-white'}`}>
              {/* Frame header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCurrentFrame && (
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                  <span
                    className={`font-mono font-semibold ${isCurrentFrame ? 'text-indigo-700' : 'text-gray-600'}`}
                  >
                    {frame.name || '<main>'}()
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${isCurrentFrame ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  line {frame.line}
                </span>
              </div>

              {/* Local variables as chips */}
              {localEntries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {localEntries.map(([k, v]) => {
                    const type = getValueType(v);
                    return (
                      <div
                        key={k}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${getTypeColor(type)}`}
                      >
                        <span className="font-semibold">{k}</span>
                        <span className="opacity-50">=</span>
                        <span>{formatValue(v, true)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Speed control
function SpeedControl({ speed, onChange }: { speed: number; onChange: (s: number) => void }) {
  const speeds = [
    { value: 2000, label: '0.5x' },
    { value: 1000, label: '1x' },
    { value: 500, label: '2x' },
    { value: 200, label: '5x' },
    { value: 50, label: '20x' },
  ];

  return (
    <div className="flex items-center gap-1">
      {speeds.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-2 py-1 text-xs font-medium rounded transition-all ${
            speed === s.value
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// Watch panel for adding variables to watch
function WatchPanel({
  variables,
  watchedVariables,
  onAddWatch,
}: {
  variables: Record<string, Value>;
  watchedVariables: string[];
  onAddWatch: (name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const availableVars = Object.keys(variables).filter((v) => !watchedVariables.includes(v));

  if (availableVars.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-cyan-600 hover:bg-cyan-50 rounded transition-all"
      >
        <Eye className="w-3.5 h-3.5" />
        <Plus className="w-2.5 h-2.5" />
        Watch
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          {availableVars.map((name) => (
            <button
              key={name}
              onClick={() => {
                onAddWatch(name);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExecutionVisualizer({
  variables,
  callStack = [],
  currentLine,
  isRunning,
  isPaused = false,
  speed,
  onSpeedChange,
  onStep,
  onPlay,
  onPause,
  onReset,
  // New debugging features
  onStepBack,
  canStepBack = false,
  historyLength = 0,
  watchedVariables = [],
  onAddWatch,
  onRemoveWatch,
  breakpoints = [],
  onRunUntilBreakpoint,
  onContinue,
}: ExecutionVisualizerProps) {
  const prevVariablesRef = useRef<Record<string, Value>>({});
  const [varInfos, setVarInfos] = useState<VariableInfo[]>([]);

  // Memoize watched variables to prevent infinite re-renders
  const stableWatchedVariables = useMemo(() => watchedVariables, [watchedVariables.join(',')]);
  const watchedSet = useMemo(() => new Set(stableWatchedVariables), [stableWatchedVariables]);

  // Memoize variables key to prevent unnecessary updates
  const variablesKey = useMemo(() => JSON.stringify(variables), [variables]);

  // Update variable infos and detect changes
  useEffect(() => {
    const prev = prevVariablesRef.current;
    const infos: VariableInfo[] = Object.entries(variables).map(([name, value]) => ({
      name,
      value,
      type: getValueType(value),
      changed: JSON.stringify(prev[name]) !== JSON.stringify(value),
      isWatched: watchedSet.has(name),
    }));

    // Sort: watched first, then changed, then by name
    infos.sort((a, b) => {
      if (a.isWatched !== b.isWatched) return a.isWatched ? -1 : 1;
      if (a.changed !== b.changed) return a.changed ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    setVarInfos(infos);
    prevVariablesRef.current = { ...variables };

    // Clear change indicators after animation
    const timer = setTimeout(() => {
      setVarInfos((prev) => prev.map((v) => ({ ...v, changed: false })));
    }, 1000);

    return () => clearTimeout(timer);
  }, [variablesKey, watchedSet]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with controls */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Box className="w-4 h-4" />
            <span className="font-semibold text-sm">Variables</span>
          </div>
          <div className="flex items-center gap-2">
            {currentLine !== null && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Line {currentLine}
              </span>
            )}
            {breakpoints.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                <StopCircle className="w-3 h-3" />
                {breakpoints.length}
              </span>
            )}
            {historyLength > 0 && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                {historyLength} steps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Execution controls */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Step Back */}
            {onStepBack && (
              <button
                onClick={onStepBack}
                disabled={!canStepBack}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title={`Step Back (${historyLength} available)`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}

            {/* Step Forward */}
            <button
              onClick={onStep}
              disabled={isRunning && !isPaused}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-all disabled:opacity-50"
              title="Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            {isRunning && !isPaused ? (
              <button
                onClick={onPause}
                className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-all"
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-all"
                title="Play"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* Run until breakpoint */}
            {onRunUntilBreakpoint && breakpoints.length > 0 && (
              <button
                onClick={isPaused && onContinue ? onContinue : onRunUntilBreakpoint}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all"
                title={isPaused ? 'Continue to next breakpoint' : 'Run until breakpoint'}
              >
                <PlayCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <SpeedControl speed={speed} onChange={onSpeedChange} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-4">
        {/* Call Stack */}
        {callStack.length > 0 && <CallStackDisplay callStack={callStack} />}

        {/* Variables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <Variable className="w-4 h-4" />
              Variables ({varInfos.length})
            </div>
            {onAddWatch && (
              <WatchPanel
                variables={variables}
                watchedVariables={watchedVariables}
                onAddWatch={onAddWatch}
              />
            )}
          </div>
          {varInfos.length === 0 ? (
            <div className="text-sm text-gray-600 italic">No variables yet</div>
          ) : (
            <div className="space-y-2">
              {varInfos.map((info) => (
                <VariableDisplay
                  key={info.name}
                  info={info}
                  onRemoveWatch={
                    info.isWatched && onRemoveWatch ? () => onRemoveWatch(info.name) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
