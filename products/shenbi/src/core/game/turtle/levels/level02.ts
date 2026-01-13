import type { TurtleLevelData } from './types';

export const level02: TurtleLevelData = {
  id: 'turtle-02',
  name: 'Learning to Turn',
  description: 'Draw an L-shape by turning the turtle!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: [],
  availableBlocks: ['command'],
  winCondition: 'lineCount >= 2',
  failCondition: 'stepCount() > 20',
  teachingGoal: 'Learn to turn right and draw in a new direction',
  hints: [
    'First draw a line forward',
    'Use Turn Right (90 degrees) to change direction',
    'Then draw another line - you made an L-shape!',
  ],
  expectedCode: 'forward(3)\nturnRight(90)\nforward(3)',
};
