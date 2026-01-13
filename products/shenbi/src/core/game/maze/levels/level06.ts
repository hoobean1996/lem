import type { MazeLevelData } from './types';

export const level06: MazeLevelData = {
  id: 'maze-06',
  name: 'Wall Detector',
  description: 'Use sensors to detect walls and turn automatically!',
  grid: ['#########', '#>*...*.#', '#######.#', '#G....*.#', '#########'],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['frontBlocked', 'atGoal'],
  availableBlocks: ['command', 'repeat', 'if'],
  winCondition: 'collectedCount() >= 3 and atGoal()',
  failCondition: 'stepCount() > 25',
  teachingGoal: 'Introduction to If conditions with frontBlocked sensor',
  hints: [
    "The robot can sense walls with 'Front Blocked'",
    'If Front Blocked, then Turn Right to avoid the wall',
    'Use If inside your Repeat loop to auto-turn at walls',
  ],
};
