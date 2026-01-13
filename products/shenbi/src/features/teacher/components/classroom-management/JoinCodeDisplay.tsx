/**
 * Join Code Display Component
 *
 * Shows the classroom join code with copy and regenerate functionality.
 */

import { useState } from 'react';
import { Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { classroomApi, ApiError } from '../../../../infrastructure/services/api';

interface JoinCodeDisplayProps {
  code: string;
  classroomId: number;
  allowJoin: boolean;
  onCodeRegenerated: (newCode: string) => void;
}

export default function JoinCodeDisplay({
  code,
  classroomId,
  allowJoin,
  onCodeRegenerated,
}: JoinCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Generate a new join code? The old code will stop working.')) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await classroomApi.regenerateCode(classroomId);
      onCodeRegenerated(response.join_code);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to regenerate code');
      }
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border ${
          allowJoin ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
        }`}
      >
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-0.5">
            {allowJoin ? 'Join Code' : 'Joining Disabled'}
          </div>
          <div className="font-mono text-xl font-bold text-gray-800 tracking-wider">{code}</div>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Copy join code"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="Generate new code"
      >
        {regenerating ? (
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
}
