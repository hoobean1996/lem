import type { MazeLevelData } from './types';

export const level07: MazeLevelData = {
  id: 'maze-07',
  name: 'Star Sensor',
  description: "Only collect stars when you're standing on them!",
  grid: [
    '########',
    '#>...*.#',
    '#.####.#',
    '#.*..*.#',
    '#.####.#',
    '#.....*#',
    '#.####G#',
    '########',
  ],
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'collect'],
  availableSensors: ['frontBlocked', 'hasStar', 'atGoal'],
  availableBlocks: ['command', 'repeat', 'if'],
  winCondition: 'collectedCount() >= 4 and atGoal()',
  failCondition: 'stepCount() > 35',
  teachingGoal: 'Use the hasStar sensor to check before collecting',
  hints: [
    "The 'Has Star' sensor tells you if there's a star here",
    'If Has Star, then Collect!',
    'Combine movement and star-checking in your loop',
  ],
};
