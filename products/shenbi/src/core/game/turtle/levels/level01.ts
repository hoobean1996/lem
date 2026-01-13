import type { TurtleLevelData } from './types';

export const level01: TurtleLevelData = {
  id: 'turtle-01',
  name: 'My First Line',
  description: 'Help the turtle draw its first straight line!',
  gameType: 'turtle',
  availableCommands: ['forward'],
  availableSensors: [],
  availableBlocks: ['command'],
  winCondition: 'lineCount >= 1',
  failCondition: 'stepCount() > 20',
  teachingGoal: 'Learn the forward command to draw lines',
  hints: [
    'Use the Forward block to make the turtle move',
    'The turtle draws a line as it moves',
    'Try move("forward", 3) to draw a longer line!',
  ],
  expectedCode: 'forward(3)',
};
