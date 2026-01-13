import type { TurtleLevelData } from './types';

export const level08: TurtleLevelData = {
  id: 'turtle-08',
  name: 'Draw a Star',
  description: 'Draw a 5-pointed star - a geometry challenge!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'setColor'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'lineCount >= 5 and distanceFromStart < 30',
  failCondition: 'stepCount() > 30',
  teachingGoal: 'Apply geometry knowledge - 144 degree turns for a star',
  hints: [
    'A 5-pointed star needs 5 lines',
    'The secret: turn 144 degrees each time',
    '144 = 720 / 5 (stars use double rotation!)',
  ],
  expectedCode: 'setColor("yellow")\nrepeat 5 times:\n    forward(4)\n    turnRight(144)',
};
