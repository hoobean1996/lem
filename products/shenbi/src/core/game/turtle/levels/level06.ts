import type { TurtleLevelData } from './types';

export const level06: TurtleLevelData = {
  id: 'turtle-06',
  name: 'Triangle Challenge',
  description: 'Draw a triangle - hint: the turns are NOT 90 degrees!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'lineCount >= 3 and distanceFromStart < 30',
  failCondition: 'stepCount() > 25',
  teachingGoal: 'Understand angles - triangle needs 120 degree turns',
  hints: [
    'A triangle has 3 sides',
    'For a closed shape, total turns = 360 degrees',
    '360 / 3 = 120 degrees per turn!',
  ],
  expectedCode: 'repeat 3 times:\n    forward(4)\n    turnRight(120)',
};
