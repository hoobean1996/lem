/**
 * CodeEditor Component
 *
 * A syntax-highlighted code editor using the overlay technique:
 * - Transparent textarea on top for editing (captures input)
 * - Syntax-highlighted code underneath (visual display)
 * - Breakpoint support with clickable line numbers
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { highlightLine } from './SyntaxHighlighter';
import { Circle } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  currentLine?: number | null;
  errorLine?: number | null;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  // Breakpoint support
  breakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
}

export function CodeEditor({
  code,
  onChange,
  currentLine,
  errorLine,
  disabled = false,
  placeholder = '# Write code here...',
  className = '',
  breakpoints = [],
  onToggleBreakpoint,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  };

  // Handle line number click for breakpoint toggle
  const handleLineClick = (lineNum: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleBreakpoint) {
      onToggleBreakpoint(lineNum);
    }
  };

  // Ensure highlight layer matches textarea scroll on mount and code change
  useEffect(() => {
    handleScroll();
  }, [code, handleScroll]);

  const lines = (code || placeholder).split('\n');
  const showPlaceholder = !code;
  const breakpointSet = new Set(breakpoints);

  return (
    <div className={`relative font-mono text-sm ${className}`}>
      {/* Syntax highlighted layer (visual) */}
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="p-3">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isCurrentLine = currentLine === lineNum;
            const isErrorLine = errorLine === lineNum;
            const hasBreakpoint = breakpointSet.has(lineNum);

            return (
              <div
                key={index}
                className={`flex min-h-[1.5em] ${
                  isCurrentLine
                    ? 'bg-yellow-100'
                    : isErrorLine
                      ? 'bg-red-100'
                      : hasBreakpoint
                        ? 'bg-red-50'
                        : ''
                }`}
              >
                {/* Line number with breakpoint indicator */}
                <span
                  className={`w-10 text-right pr-2 select-none flex-shrink-0 flex items-center justify-end gap-0.5 ${
                    onToggleBreakpoint ? 'pointer-events-auto cursor-pointer hover:bg-gray-100' : ''
                  } ${
                    isCurrentLine
                      ? 'text-yellow-700'
                      : isErrorLine
                        ? 'text-red-700'
                        : hasBreakpoint
                          ? 'text-red-600'
                          : 'text-gray-600'
                  }`}
                  onClick={(e) => handleLineClick(lineNum, e)}
                  title={
                    onToggleBreakpoint
                      ? hasBreakpoint
                        ? 'Remove breakpoint'
                        : 'Add breakpoint'
                      : undefined
                  }
                >
                  {hasBreakpoint && <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500" />}
                  <span className="w-5 text-right">{lineNum}</span>
                </span>
                <span className={`whitespace-pre flex-1 ${showPlaceholder ? 'text-gray-600' : ''}`}>
                  {showPlaceholder ? line : highlightLine(line)}
                  {/* Ensure empty lines have height */}
                  {line === '' && '\u200B'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Textarea layer (input) - transparent text, visible caret */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`
          relative w-full h-full min-h-[200px] p-3 pl-[52px]
          bg-transparent resize-none outline-none
          text-transparent caret-gray-800
          selection:bg-blue-200 selection:text-transparent
          disabled:cursor-not-allowed
        `}
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: '1.5em',
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto',
        }}
      />
    </div>
  );
}
