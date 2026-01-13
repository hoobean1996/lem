import type { MazeLevelData } from './types';

export const level03: MazeLevelData = {
  id: 'maze-03',
  name: 'Left and Right',
  description: 'Navigate through the zigzag path using both turns!',
  grid: ['#######', '#>..*.#', '####.##', '#..*..#', '#.#####', '#.*..G#', '#######'],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['atGoal'],
  availableBlocks: ['command'],
  winCondition: 'collectedCount() >= 3 and atGoal()',
  failCondition: 'stepCount() > 20',
  teachingGoal: 'Master both Turn Left and Turn Right commands',
  hints: [
    'Turn Left and Turn Right let you face any direction',
    'Plan your path before you start coding',
    "The path zigzags - you'll need multiple turns",
  ],
};
