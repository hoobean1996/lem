/**
 * StdlibViewerModal Component
 *
 * Displays available standard library functions for an adventure.
 * Shows function metadata, parameters, and code.
 */

import { useState } from 'react';
import { X, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import type { StdlibFunction } from '../../../infrastructure/services/api';
import { CodeEditor } from './CodeEditor';

interface StdlibViewerModalProps {
  functions: StdlibFunction[];
  onClose: () => void;
}

// Category display configuration
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  movement: { label: 'Movement', color: 'bg-blue-100 text-blue-700' },
  action: { label: 'Action', color: 'bg-green-100 text-green-700' },
  sensor: { label: 'Sensor', color: 'bg-purple-100 text-purple-700' },
  helper: { label: 'Helper', color: 'bg-gray-100 text-gray-700' },
  constant: { label: 'Constant', color: 'bg-amber-100 text-amber-700' },
};

export function StdlibViewerModal({ functions, onClose }: StdlibViewerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);

  // Group functions by category
  const categories = Array.from(new Set(functions.map((f) => f.category)));

  // Filter functions by selected category
  const filteredFunctions = selectedCategory
    ? functions.filter((f) => f.category === selectedCategory)
    : functions;

  // Filter out helper functions (internal use only)
  const visibleFunctions = filteredFunctions.filter((f) => f.category !== 'helper');

  const getCategoryLabel = (category: string) => {
    return CATEGORY_CONFIG[category]?.label;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_CONFIG[category]?.color || 'bg-gray-100 text-gray-700';
  };

  const formatParams = (func: StdlibFunction) => {
    if (!func.params || func.params.length === 0) return '()';
    const paramNames = func.params.map((p) => p.name);
    return `(${paramNames.join(', ')})`;
  };

  const formatReturns = (func: StdlibFunction) => {
    if (!func.returns || func.returns === 'void') return null;
    return func.returns;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-[bounceIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Available Functions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories
            .filter((c) => c !== 'helper')
            .map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
        </div>

        {/* Function list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {visibleFunctions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No functions available</div>
          ) : (
            <div className="space-y-3">
              {visibleFunctions.map((func) => (
                <div key={func.name} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Function header */}
                  <button
                    onClick={() =>
                      setExpandedFunction(expandedFunction === func.name ? null : func.name)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {expandedFunction === func.name ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-blue-600 font-mono font-semibold">
                          {func.name}
                          {formatParams(func)}
                        </code>
                        {formatReturns(func) && (
                          <span className="text-xs text-gray-400">→ {formatReturns(func)}</span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(func.category)}`}
                        >
                          {getCategoryLabel(func.category)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{func.description}</p>
                    </div>
                  </button>

                  {/* Expanded code view */}
                  {expandedFunction === func.name && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                      {/* Parameters */}
                      {func.params && func.params.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Parameters
                          </h4>
                          <div className="space-y-1">
                            {func.params.map((param) => (
                              <div key={param.name} className="flex items-center gap-2 text-sm">
                                <code className="text-purple-600 font-mono">{param.name}</code>
                                <span className="text-gray-400">:</span>
                                <span className="text-gray-600">{param.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code */}
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Code</h4>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <CodeEditor
                          code={func.code}
                          onChange={() => {}}
                          disabled={true}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
