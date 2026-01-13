import type { MazeLevelData } from './types';

export const level01: MazeLevelData = {
  id: 'maze-01',
  name: 'First Steps',
  description: 'Help the robot move forward to reach the goal!',
  grid: ['########', '#>...*G#', '########'],
  availableCommands: ['forward'],
  availableSensors: ['atGoal'],
  availableBlocks: ['command'],
  winCondition: 'collectedCount() >= 1 and atGoal()',
  failCondition: 'stepCount() > 10',
  teachingGoal: 'Learn the forward command - the most basic movement',
  hints: [
    'Use the Forward block to move the robot',
    'Each Forward moves one step ahead',
    'Keep going until you reach the flag!',
  ],
};
