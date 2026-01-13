import type { MazeLevelData } from './types';

export const level04: MazeLevelData = {
  id: 'maze-04',
  name: 'Repeat Magic',
  description: 'Use the Repeat block to collect all stars in a row!',
  grid: ['###########', '#>*****.*G#', '###########'],
  availableCommands: ['forward'],
  availableSensors: ['atGoal'],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'collectedCount() >= 6 and atGoal()',
  failCondition: 'stepCount() > 15',
  teachingGoal: 'Introduction to loops - the Repeat block',
  hints: [
    'Instead of many Forward blocks, use Repeat!',
    'Put Forward inside Repeat, then set how many times',
    'Repeat 8 times { Forward } moves 8 steps!',
  ],
};
