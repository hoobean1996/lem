import type { TurtleLevelData } from './types';

export const level10: TurtleLevelData = {
  id: 'turtle-10',
  name: 'Master Artist',
  description: 'Create a flower pattern - combine loops and shapes!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'setColor'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat', 'for'],
  winCondition: 'lineCount >= 20',
  failCondition: 'stepCount() > 100',
  teachingGoal: 'Combine all skills to create complex artwork',
  hints: [
    'A flower = multiple squares rotated around a center',
    'Draw a square, then turn 45 degrees, repeat',
    '8 squares with 45 degree rotation = flower!',
  ],
  expectedCode:
    'setColor("red")\nrepeat 8 times:\n    repeat 4 times:\n        forward(3)\n        turnRight(90)\n    turnRight(45)',
};
