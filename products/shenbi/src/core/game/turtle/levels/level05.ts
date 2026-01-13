import type { TurtleLevelData } from './types';

export const level05: TurtleLevelData = {
  id: 'turtle-05',
  name: 'Loop Magic',
  description: 'Draw a square using the Repeat block - less code, same result!',
  gameType: 'turtle',
  requiredTier: 'premium',
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: [],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'lineCount >= 4 and distanceFromStart < 30',
  failCondition: 'stepCount() > 20',
  teachingGoal: 'Use Repeat loops to simplify repetitive code',
  hints: [
    "The pattern 'forward + turn' repeats 4 times",
    'Put both commands inside a Repeat 4 block',
    '4 lines of code become just 2!',
  ],
  expectedCode: 'repeat 4 times:\n    forward(3)\n    turnRight(90)',
};
