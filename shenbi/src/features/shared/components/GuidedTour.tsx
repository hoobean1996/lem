import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useGlobalSettings } from '../contexts/SettingsContext';

export interface TourStep {
  /** CSS selector or element ID to highlight */
  target: string;
  /** Title of the tour step */
  title: string;
  /** Description text */
  description: string;
  /** Position of the tooltip relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional custom action text for the button */
  actionText?: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function GuidedTour({ steps, isActive, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);

  const step = steps[currentStep];

  // Find and highlight target element
  const updateTargetPosition = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate tooltip position
      const padding = 16;
      const tooltipWidth = 320;
      const tooltipHeight = 180;
      const position = step.position || 'bottom';

      let top = 0;
      let left = 0;
      let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'bottom';
          break;
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'top';
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          arrowPosition = 'right';
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          arrowPosition = 'left';
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setTooltipPos({ top, left, arrowPosition });
    }
  }, [step]);

  useEffect(() => {
    if (!isActive) return;

    updateTargetPosition();

    // Update on resize/scroll
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isActive, currentStep, updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete();
  };

  if (!isActive || !step || !targetRect || !tooltipPos) {
    return null;
  }

  const highlightPadding = 8;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with hole for highlighted element */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - highlightPadding}
              y={targetRect.top - highlightPadding}
              width={targetRect.width + highlightPadding * 2}
              height={targetRect.height + highlightPadding * 2}
              rx="16"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border */}
      <div
        className="absolute border-4 border-[#7dad4c] rounded-2xl pointer-events-none animate-pulse"
        style={{
          top: targetRect.top - highlightPadding,
          left: targetRect.left - highlightPadding,
          width: targetRect.width + highlightPadding * 2,
          height: targetRect.height + highlightPadding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute w-80 bg-white rounded-2xl shadow-2xl p-5 animate-[fadeIn_0.3s_ease-out]"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-[#4a7a2a]'
                  : index < currentStep
                    ? 'w-3 bg-[#7dad4c]'
                    : 'w-3 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-[#4a7a2a] mb-2">{step.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>

        {/* Action button */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-[#4a7a2a] hover:bg-[#5a8a3a] text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg"
        >
          {step.actionText || (currentStep < steps.length - 1 ? 'Next' : 'Start Coding!')}
        </button>
      </div>
    </div>
  );
}

// Hook to manage tour state with API persistence
export function useTour(tourId: string) {
  const { isTourCompleted, markTourCompleted, resetTourCompleted } = useGlobalSettings();
  const [isActive, setIsActive] = useState(false);

  const hasCompleted = isTourCompleted(tourId);

  const startTour = useCallback(() => {
    setIsActive(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    markTourCompleted(tourId);
  }, [tourId, markTourCompleted]);

  const resetTour = useCallback(() => {
    resetTourCompleted(tourId);
  }, [tourId, resetTourCompleted]);

  return {
    isActive,
    hasCompleted,
    startTour,
    completeTour,
    resetTour,
  };
}
