import type { MazeLevelData } from './types';

export const level02: MazeLevelData = {
  id: 'maze-02',
  name: 'Turn Right',
  description: 'Learn to turn! The path goes around the corner.',
  grid: ['#####', '#>*.#', '#.#.#', '#.*.#', '#.*G#', '#####'],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['atGoal'],
  availableBlocks: ['command'],
  winCondition: 'collectedCount() >= 3 and atGoal()',
  failCondition: 'stepCount() > 15',
  teachingGoal: 'Learn the Turn Right command to change direction',
  hints: [
    'Turn Right makes the robot face a new direction',
    'After turning, Forward will move in the new direction',
    'Go forward, turn right, then continue forward',
  ],
};
