import type { TurtleLevelData } from './types';

export const level07: TurtleLevelData = {
  id: 'turtle-07',
  name: 'Rainbow Square',
  description: 'Draw a square with each side in a different color!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'setColor'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'lineCount >= 4 and distanceFromStart < 30',
  failCondition: 'stepCount() > 30',
  teachingGoal: 'Use setColor to change the pen color',
  hints: [
    'Use setColor before drawing each side',
    'Colors: red, blue, green, yellow, purple, orange',
    'Each side can be a different color!',
  ],
  expectedCode:
    'setColor("red")\nforward(3)\nturnRight(90)\nsetColor("blue")\nforward(3)\nturnRight(90)\nsetColor("green")\nforward(3)\nturnRight(90)\nsetColor("yellow")\nforward(3)',
};
