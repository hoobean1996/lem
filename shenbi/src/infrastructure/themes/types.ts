import { Direction } from '../../core/engine';

/**
 * Theme System Types
 *
 * Themes define how entities are rendered visually,
 * completely decoupled from game logic and level data.
 */

// Sprite source can be emoji, image URL, or color
export type SpriteSource =
  | { type: 'emoji'; value: string }
  | { type: 'image'; url: string }
  | { type: 'color'; value: string };

// Helper to create sprite sources
export const Sprite = {
  emoji: (value: string): SpriteSource => ({ type: 'emoji', value }),
  image: (url: string): SpriteSource => ({ type: 'image', url }),
  color: (value: string): SpriteSource => ({ type: 'color', value }),
};

// Entity visual configuration
export interface EntityVisual {
  sprite: SpriteSource;
  scale?: number; // 0.0 - 1.0, relative to cell size
  zIndex?: number;
}

// Direction indicator style for actors
export interface DirectionIndicator {
  type: 'arrow' | 'rotation' | 'overlay' | 'none';
  // For 'arrow' type - show arrow below/beside entity
  arrows?: Record<Direction, SpriteSource>;
  // For 'rotation' type - degrees to rotate for each direction
  rotations?: Record<Direction, number>;
  // For 'overlay' type - different sprite per direction
  overlays?: Record<Direction, SpriteSource>;
}

// Grid visual styling
export interface GridStyle {
  cellBackground: string;
  cellBackgroundAlt?: string; // for checkerboard pattern
  gridBackground: string;
  cellBorderRadius: number;
  gap: number;
}

// Complete theme definition
export interface RenderTheme {
  id: string;
  name: string;
  description?: string;
  icon?: string; // emoji or icon for theme selector

  // Entity type -> visual mapping
  entities: Record<string, EntityVisual>;

  // How to show actor direction
  directionIndicator: DirectionIndicator;

  // Grid styling
  grid: GridStyle;
}

// Default direction arrows (shared across themes)
export const DEFAULT_DIRECTION_ARROWS: Record<Direction, SpriteSource> = {
  up: Sprite.emoji('⬆️'),
  down: Sprite.emoji('⬇️'),
  left: Sprite.emoji('⬅️'),
  right: Sprite.emoji('➡️'),
};

// Default grid style
export const DEFAULT_GRID_STYLE: GridStyle = {
  cellBackground: 'rgb(226 232 240)', // slate-200
  gridBackground: 'rgb(241 245 249)', // slate-100
  cellBorderRadius: 4,
  gap: 2,
};
