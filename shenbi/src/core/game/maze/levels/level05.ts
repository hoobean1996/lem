import type { MazeLevelData } from './types';

export const level05: MazeLevelData = {
  id: 'maze-05',
  name: 'Square Path',
  description: 'Walk around the square to collect all stars!',
  grid: ['#######', '#>*.*G#', '#.###.#', '#.....#', '#.###.#', '#*...*#', '#######'],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['atGoal'],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'collectedCount() >= 4 and atGoal()',
  failCondition: 'stepCount() > 25',
  teachingGoal: 'Use Repeat with multiple commands inside',
  hints: [
    'The path forms a square shape',
    'Try using "Walk Side" to walk one edge of the square!',
    'Repeat this pattern 4 times for all 4 sides!',
  ],
  customCommands: [
    {
      id: 'walkSide',
      label: 'Walk Side',
      icon: '📐',
      color: '#8B5CF6',
      codeName: 'walkSide',
      argType: 'none',
      code: 'forward()\nforward()\nturnRight()',
    },
  ],
};
