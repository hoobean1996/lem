/**
 * Shared types for game adventure components
 */

import type { LevelDefinition } from '../../../../core/engine';
import type { RenderTheme } from '../../../../infrastructure/themes';
import type { StdlibFunction } from '../../../../infrastructure/services/api';

/**
 * Common props for all game adventure components
 */
export interface GameAdventureProps {
  /** Current level definition */
  level: LevelDefinition;
  /** Current render theme (optional - not all games use themes) */
  theme?: RenderTheme;
  /** Key to force reset */
  resetKey: number;
  /** Whether this is a large screen */
  isLargeScreen: boolean;
  /** Standard library functions for this adventure */
  stdlibFunctions?: StdlibFunction[];
  /** Called when level is completed */
  onComplete: (stars: number) => void;
  /** Called when level fails */
  onFail: () => void;
  /** Called when code changes */
  onCodeChange: (code: string) => void;
}
