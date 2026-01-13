import type { TurtleLevelData } from './types';

export const level03: TurtleLevelData = {
  id: 'turtle-03',
  name: 'Left and Right',
  description: 'Use both turns to draw a staircase pattern!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: [],
  availableBlocks: ['command'],
  winCondition: 'lineCount >= 4',
  failCondition: 'stepCount() > 30',
  teachingGoal: 'Master both Turn Left and Turn Right',
  hints: [
    'Turn Left goes the opposite direction of Turn Right',
    'Alternate: forward, turn right, forward, turn left...',
    'Make a staircase pattern with 4 lines!',
  ],
  expectedCode:
    'forward(2)\nturnRight(90)\nforward(2)\nturnLeft(90)\nforward(2)\nturnRight(90)\nforward(2)',
};
