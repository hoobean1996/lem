import { RenderTheme, Sprite, DEFAULT_DIRECTION_ARROWS, DEFAULT_GRID_STYLE } from './types';

/**
 * Robot Theme (Default)
 * Classic robot navigating through walls
 */
const robotTheme: RenderTheme = {
  id: 'robot',
  name: '机器人',
  description: '经典机器人主题',
  icon: '🤖',

  entities: {
    player: { sprite: Sprite.emoji('🤖'), scale: 0.7, zIndex: 10 },
    wall: { sprite: Sprite.emoji('🧱'), scale: 0.85, zIndex: 1 },
    star: { sprite: Sprite.emoji('⭐'), scale: 0.65, zIndex: 5 },
    goal: { sprite: Sprite.emoji('🚩'), scale: 0.7, zIndex: 2 },
  },

  directionIndicator: {
    type: 'arrow',
    arrows: DEFAULT_DIRECTION_ARROWS,
  },

  grid: DEFAULT_GRID_STYLE,
};

/**
 * Bunny Theme
 * A cute bunny collecting carrots in the garden
 */
export const bunnyTheme: RenderTheme = {
  id: 'bunny',
  name: '小兔子',
  description: '小兔子在花园里收集胡萝卜',
  icon: '🐰',

  entities: {
    player: { sprite: Sprite.emoji('🐰'), scale: 0.8, zIndex: 10 },
    wall: { sprite: Sprite.emoji('🌳'), scale: 0.9, zIndex: 1 },
    star: { sprite: Sprite.emoji('🥕'), scale: 0.65, zIndex: 5 },
    goal: { sprite: Sprite.emoji('🏡'), scale: 0.75, zIndex: 2 },
  },

  directionIndicator: {
    type: 'arrow',
    arrows: DEFAULT_DIRECTION_ARROWS,
  },

  grid: {
    cellBackground: 'rgb(254 249 195)', // yellow-100
    cellBackgroundAlt: 'rgb(254 240 138)', // yellow-200
    gridBackground: 'rgb(134 239 172)', // green-300
    cellBorderRadius: 8,
    gap: 3,
  },
};

// Default theme
export const defaultTheme = robotTheme;
