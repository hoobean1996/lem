import type { TurtleLevelData } from './types';

export const level04: TurtleLevelData = {
  id: 'turtle-04',
  name: 'Draw a Square',
  description: 'Draw a complete square - end where you started!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: [],
  availableBlocks: ['command'],
  winCondition: 'lineCount >= 4 and distanceFromStart < 30',
  failCondition: 'stepCount() > 30',
  teachingGoal: 'Create a closed shape by returning to the starting point',
  hints: [
    'A square has 4 equal sides',
    'After each side, turn right 90 degrees',
    "If done correctly, you'll end up where you started!",
  ],
  expectedCode:
    'forward(3)\nturnRight(90)\nforward(3)\nturnRight(90)\nforward(3)\nturnRight(90)\nforward(3)',
};
