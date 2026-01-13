/**
 * Markdown Editor Component
 *
 * Simple textarea for editing markdown content.
 */

import { useRef, useEffect, useCallback } from 'react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur: () => void;
  onShiftEnter: () => void;
}

export function MarkdownEditor({ content, onChange, onBlur, onShiftEnter }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Shift+Enter to exit edit mode
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        onShiftEnter();
        return;
      }

      // Escape to exit edit mode
      if (e.key === 'Escape') {
        e.preventDefault();
        onBlur();
        return;
      }

      // Tab to insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + '  ' + content.substring(end);
        onChange(newContent);

        // Restore cursor position
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [content, onChange, onBlur, onShiftEnter]
  );

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[100px] p-4 font-mono text-sm bg-white border-0 resize-none focus:outline-none focus:ring-0"
        placeholder="# Heading&#10;&#10;Write markdown here...&#10;&#10;Press Shift+Enter to preview"
        spellCheck={false}
      />
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">Shift+Enter to preview</div>
    </div>
  );
}
