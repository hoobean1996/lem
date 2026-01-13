/**
 * Level 11 - Custom Commands
 *
 * Demonstrates the custom command feature where levels can define
 * their own reusable commands as code macros.
 */

import type { MazeLevelData } from './types';

export const level11: MazeLevelData = {
  id: 'maze-11',
  name: 'Custom Powers',
  description: 'Learn to use special commands unique to this level!',
  grid: [
    '##########',
    '#>......*#',
    '#........#',
    '#........#',
    '#*......G#',
    '##########',
  ],
  availableCommands: ['forward', 'turnLeft', 'turnRight'],
  availableSensors: ['atGoal', 'frontBlocked', 'hasStar'],
  availableBlocks: ['command', 'repeat'],
  winCondition: 'collectedCount() >= 2 and atGoal()',
  failCondition: 'stepCount() > 50',
  teachingGoal: 'Understand that commands can be composed from simpler commands',
  hints: [
    'Use "Double Step" to move forward twice at once!',
    'Use "Turn Around" to face the opposite direction!',
    'Try combining custom commands with regular ones',
  ],
  customCommands: [
    {
      id: 'doubleStep',
      label: 'Double Step',
      icon: '⏩',
      color: '#8B5CF6', // Purple to distinguish from regular commands
      codeName: 'doubleStep',
      argType: 'none',
      code: 'forward()\nforward()',
    },
    {
      id: 'turnAround',
      label: 'Turn Around',
      icon: '🔄',
      color: '#8B5CF6',
      codeName: 'turnAround',
      argType: 'none',
      code: 'turnLeft()\nturnLeft()',
    },
    {
      id: 'moveN',
      label: 'Move N',
      icon: '🚀',
      color: '#10B981', // Green
      codeName: 'moveN',
      argType: 'number',
      defaultArg: 3,
      code: 'repeat arg times:\n    forward()',
    },
  ],
};
