/**
 * Markdown Preview Component
 *
 * Renders markdown content with support for GFM (tables, strikethrough, etc.)
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  onDoubleClick: () => void;
}

export function MarkdownPreview({ content, onDoubleClick }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div
        className="p-4 text-gray-400 italic cursor-pointer hover:bg-gray-50"
        onDoubleClick={onDoubleClick}
      >
        Double-click to edit...
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none p-4 cursor-text hover:bg-gray-50/50 transition-colors"
      onDoubleClick={onDoubleClick}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tables
          table: ({ children }) => (
            <table className="border-collapse border border-gray-300 my-2">{children}</table>
          ),
          thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border border-gray-300 px-3 py-2">{children}</td>,

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg shadow-sm my-2"
            />
          ),

          // Code blocks
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-2">
              {children}
            </blockquote>
          ),

          // Lists
          ul: ({ children }) => <ul className="list-disc list-inside my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-2">{children}</ol>,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {children}
            </a>
          ),

          // Headings with distinct styling
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2 border-b pb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-800 mt-3 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-800 mt-2 mb-1">{children}</h3>
          ),

          // Paragraphs
          p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,

          // Horizontal rules
          hr: () => <hr className="my-4 border-gray-300" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
