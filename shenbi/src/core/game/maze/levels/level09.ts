import type { MazeLevelData } from './types';

export const level09: MazeLevelData = {
  id: 'maze-09',
  name: 'Smart Navigator',
  description: 'Navigate the maze using While and If together!',
  grid: [
    '##########',
    '#>...#...#',
    '#.##.#.#.#',
    '#.*#...#*#',
    '##.#####.#',
    '#..*...#.#',
    '#.###.##.#',
    '#...#..*.#',
    '#.#.###..#',
    '#.#.....G#',
    '##########',
  ],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['frontBlocked', 'frontClear', 'hasStar', 'atGoal', 'notAtGoal'],
  availableBlocks: ['command', 'repeat', 'if', 'while'],
  winCondition: 'collectedCount() >= 4 and atGoal()',
  failCondition: 'stepCount() > 60',
  teachingGoal: 'Combine While loops with If conditions for smart navigation',
  hints: [
    'While Not At Goal: check walls and move',
    'If Front Blocked, turn. Otherwise, move forward.',
    'Add star collection: If Has Star, Collect!',
  ],
};
