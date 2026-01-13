/**
 * Connection Error Component
 *
 * Displays a friendly error message when API is unavailable.
 */

import { WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header with icon */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-8 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
            <WifiOff className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Unable to Connect</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-center mb-6">
            {message || "We couldn't reach the server. Please check your connection and try again."}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#4a7a2a] hover:bg-[#3a6a1a] text-white font-medium rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
