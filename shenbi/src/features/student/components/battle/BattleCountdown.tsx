/**
 * BattleCountdown Component
 *
 * Displays 3-2-1-GO countdown before battle starts.
 */

import { useState, useEffect } from 'react';
import { SoundManager } from '../../../../infrastructure/sounds/SoundManager';

interface BattleCountdownProps {
  onComplete: () => void;
}

export function BattleCountdown({ onComplete }: BattleCountdownProps) {
  const [count, setCount] = useState(3);
  const [isGo, setIsGo] = useState(false);

  useEffect(() => {
    // Initialize sound manager
    SoundManager.init();

    // Play countdown sound immediately for first number
    SoundManager.play('countdown');

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) {
          // Play countdown beep
          SoundManager.play('countdown');
          return prev - 1;
        } else {
          // Show GO!
          setIsGo(true);
          SoundManager.play('battleStart');
          clearInterval(timer);

          // Call onComplete after GO! is shown
          setTimeout(() => {
            onComplete();
          }, 500);

          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="text-center">
        {isGo ? (
          <div className="animate-bounce">
            <span className="text-9xl font-bold text-green-400 drop-shadow-lg">GO!</span>
          </div>
        ) : (
          <div className="animate-pulse">
            <span className="text-9xl font-bold text-white drop-shadow-lg">{count}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes count-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
