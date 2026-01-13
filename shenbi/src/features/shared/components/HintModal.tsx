/**
 * HintModal Component
 *
 * Shows a single hint to help the player progress.
 * Hints are revealed progressively - one at a time.
 */

import { Lightbulb } from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';

interface HintModalProps {
  hint: string;
  currentIndex: number;
  totalHints: number;
  onClose: () => void;
}

export function HintModal({ hint, currentIndex, totalHints, onClose }: HintModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-[bounceIn_0.3s_ease-out]">
        {/* Lightbulb icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {/* Hint text */}
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">{hint}</p>

        {/* Progress indicator */}
        <p className="text-sm text-gray-500 mb-6">
          {t('adventure.hintOf')
            .replace('{current}', String(currentIndex + 1))
            .replace('{total}', String(totalHints))}
        </p>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-[#5a8a3a] to-[#7dad4c] text-white font-bold rounded-xl hover:opacity-90 transition-all"
        >
          {t('adventure.gotIt')}
        </button>
      </div>
    </div>
  );
}
