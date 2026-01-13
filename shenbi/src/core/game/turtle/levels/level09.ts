import type { TurtleLevelData } from './types';

export const level09: TurtleLevelData = {
  id: 'turtle-09',
  name: 'Spiral Pattern',
  description: 'Use the For loop to create a growing spiral!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'setColor'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat', 'for'],
  winCondition: 'lineCount >= 10',
  failCondition: 'stepCount() > 50',
  teachingGoal: 'Use For loops with changing values to create patterns',
  hints: [
    'For i in range(1, 10) gives i values 1, 2, 3... 9',
    'Use i as the distance: forward(i)',
    'The spiral grows because each line is longer!',
  ],
  expectedCode: 'setColor("purple")\nfor i in range(1, 12):\n    forward(i)\n    turnRight(90)',
};
