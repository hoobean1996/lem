import type { MazeLevelData } from './types';

export const level08: MazeLevelData = {
  id: 'maze-08',
  name: 'While Loop',
  description: 'Keep going until you reach the goal!',
  grid: ['###############', '#>*.*.*.*.*.*G#', '###############'],
  availableCommands: ['forward'],
  availableSensors: ['atGoal', 'notAtGoal'],
  availableBlocks: ['command', 'while'],
  winCondition: 'collectedCount() >= 6 and atGoal()',
  failCondition: 'stepCount() > 20',
  teachingGoal: 'Introduction to While loops - repeat until condition is false',
  hints: [
    'While loops repeat until a condition becomes false',
    "While 'Not At Goal', keep moving Forward",
    'The loop automatically stops when you reach the goal!',
  ],
};
