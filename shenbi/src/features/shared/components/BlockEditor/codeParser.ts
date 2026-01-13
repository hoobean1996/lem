/**
 * Code Parser
 *
 * Converts Mini Python code back to visual blocks.
 * Supports multiple game types: maze, turtle
 */

import { compile } from '../../../../core/lang';
import type { Statement, Expression, CallExpression } from '../../../../core/lang';
import {
  Block,
  BlockExpression,
  ConditionId,
  CommandId,
  GameType,
  MathOperator,
  ComparisonOperator,
  generateBlockId,
} from './types';

// ============ UNIFIED COMMAND MAP ============
// All games now use unified move/turn commands
const COMMAND_MAP: Record<string, CommandId> = {
  // Unified movement commands
  move: 'move',
  turn: 'turn',
  // Legacy maze/turtle commands (for backwards compatibility)
  forward: 'move', // Will be converted with "forward" arg
  backward: 'move', // Will be converted with "backward" arg
  turnLeft: 'turn', // Will be converted with "left" arg
  turnRight: 'turn', // Will be converted with "right" arg
  left: 'turn',
  right: 'turn',
  // Turtle-specific
  setColor: 'setColor',
};

// Map legacy command names to their implicit direction argument
const LEGACY_DIRECTION_MAP: Record<string, string> = {
  forward: 'forward',
  backward: 'backward',
  turnLeft: 'left',
  turnRight: 'right',
  left: 'left',
  right: 'right',
};

// ============ MAZE CONDITIONS ============
const MAZE_CONDITION_MAP: Record<string, ConditionId> = {
  frontBlocked: 'frontBlocked',
  'Front Blocked': 'frontBlocked',
  frontClear: 'frontClear',
  'Front Clear': 'frontClear',
  leftClear: 'leftClear',
  'Left Clear': 'leftClear',
  rightClear: 'rightClear',
  'Right Clear': 'rightClear',
  hasStar: 'hasStar',
  'Has Star': 'hasStar',
  atGoal: 'atGoal',
  'At Goal': 'atGoal',
  notAtGoal: 'notAtGoal',
  'Not At Goal': 'notAtGoal',
};

// Turtle has no conditions (always draws)
const TURTLE_CONDITION_MAP: Record<string, ConditionId> = {};

// Get command map for game type (unified for all games)
function getCommandMap(_gameType: GameType): Record<string, CommandId> {
  return COMMAND_MAP;
}

// Get condition map for game type
function getConditionMap(gameType: GameType): Record<string, ConditionId> {
  switch (gameType) {
    case 'maze':
      return MAZE_CONDITION_MAP;
    case 'turtle':
      return TURTLE_CONDITION_MAP;
  }
}

// Check if an operator is a comparison operator
function isComparisonOperator(op: string): op is ComparisonOperator {
  return ['==', '!=', '<', '>', '<=', '>='].includes(op);
}

// Convert AST expression to BlockExpression
function astToBlockExpression(
  expr: Expression,
  conditionMap: Record<string, ConditionId>
): BlockExpression {
  switch (expr.type) {
    case 'NumberLiteral':
      return { type: 'number', value: expr.value };
    case 'StringLiteral':
      return { type: 'string', value: expr.value };
    case 'BooleanLiteral':
      return { type: 'boolean', value: expr.value };
    case 'Identifier':
      return { type: 'variable', name: expr.name };
    case 'BinaryOp':
      const op = expr.operator as MathOperator | ComparisonOperator;
      // Use 'comparison' type for comparison operators
      if (isComparisonOperator(op)) {
        return {
          type: 'comparison',
          operator: op,
          left: astToBlockExpression(expr.left, conditionMap),
          right: astToBlockExpression(expr.right, conditionMap),
        };
      }
      return {
        type: 'binary',
        operator: op,
        left: astToBlockExpression(expr.left, conditionMap),
        right: astToBlockExpression(expr.right, conditionMap),
      };
    case 'CallExpression':
      // Check if it's len() function
      if (expr.callee === 'len') {
        if (expr.arguments.length > 0) {
          return {
            type: 'arrayLength',
            array: astToBlockExpression(expr.arguments[0], conditionMap),
          };
        }
      }
      // Check if it's random() function
      if (expr.callee === 'random') {
        return { type: 'random' };
      }
      // Check if it's randint() function
      if (expr.callee === 'randint') {
        if (expr.arguments.length >= 2) {
          return {
            type: 'randint',
            min: astToBlockExpression(expr.arguments[0], conditionMap),
            max: astToBlockExpression(expr.arguments[1], conditionMap),
          };
        }
      }
      // Check if it's a sensor call
      const conditionId = conditionMap[expr.callee];
      if (conditionId) {
        return { type: 'sensor', sensor: conditionId };
      }
      // Fallback to number
      return { type: 'number', value: 0 };
    case 'ArrayLiteral':
      return {
        type: 'array',
        elements: expr.elements.map((e) => astToBlockExpression(e, conditionMap)),
      };
    case 'IndexAccess':
      // Could be array access or object access - we'll treat as objectAccess if index is a string
      const indexExpr = astToBlockExpression(expr.index, conditionMap);
      if (indexExpr.type === 'string') {
        return {
          type: 'objectAccess',
          object: astToBlockExpression(expr.object, conditionMap),
          key: indexExpr,
        };
      }
      return {
        type: 'arrayAccess',
        array: astToBlockExpression(expr.object, conditionMap),
        index: indexExpr,
      };
    case 'ObjectLiteral':
      return {
        type: 'object',
        properties: expr.properties.map((p) => ({
          key: p.key,
          value: astToBlockExpression(p.value, conditionMap),
        })),
      };
    default:
      return { type: 'number', value: 0 };
  }
}

/**
 * Parse code string into blocks for a specific game type
 * Returns null if parsing fails
 */
export function parseCodeToBlocks(code: string, gameType: GameType = 'maze'): Block[] | null {
  try {
    // Skip empty code
    const trimmed = code.trim();
    if (!trimmed) {
      return [];
    }

    // Check if code is ONLY comments (no actual code)
    const nonCommentLines = trimmed.split('\n').filter((line) => {
      const l = line.trim();
      return l && !l.startsWith('#');
    });
    if (nonCommentLines.length === 0) {
      return [];
    }

    const commandMap = getCommandMap(gameType);
    const conditionMap = getConditionMap(gameType);
    const ast = compile(code);
    return ast.body
      .map((stmt) => statementToBlock(stmt, commandMap, conditionMap))
      .filter((b): b is Block => b !== null);
  } catch {
    // Parsing failed - code is invalid
    return null;
  }
}

/**
 * Convert a statement to a block
 */
function statementToBlock(
  stmt: Statement,
  commandMap: Record<string, CommandId>,
  conditionMap: Record<string, ConditionId>
): Block | null {
  switch (stmt.type) {
    case 'ExpressionStatement':
      // Should be a function call (command or print)
      if (stmt.expression.type === 'CallExpression') {
        const callee = stmt.expression.callee;
        const args = stmt.expression.arguments;

        // Check for print
        if (callee === 'print') {
          return {
            id: generateBlockId(),
            type: 'print',
            expression:
              args.length > 0
                ? astToBlockExpression(args[0], conditionMap)
                : { type: 'string', value: '' },
          };
        }

        // Check for append
        if (callee === 'append') {
          return {
            id: generateBlockId(),
            type: 'listAppend',
            listArray:
              args.length > 0
                ? astToBlockExpression(args[0], conditionMap)
                : { type: 'variable', name: 'arr' },
            listValue:
              args.length > 1
                ? astToBlockExpression(args[1], conditionMap)
                : { type: 'number', value: 0 },
          };
        }

        // Check for pop
        if (callee === 'pop') {
          return {
            id: generateBlockId(),
            type: 'listPop',
            listArray:
              args.length > 0
                ? astToBlockExpression(args[0], conditionMap)
                : { type: 'variable', name: 'arr' },
          };
        }

        // Check for insert
        if (callee === 'insert') {
          return {
            id: generateBlockId(),
            type: 'listInsert',
            listArray:
              args.length > 0
                ? astToBlockExpression(args[0], conditionMap)
                : { type: 'variable', name: 'arr' },
            listIndex:
              args.length > 1
                ? astToBlockExpression(args[1], conditionMap)
                : { type: 'number', value: 0 },
            listValue:
              args.length > 2
                ? astToBlockExpression(args[2], conditionMap)
                : { type: 'number', value: 0 },
          };
        }

        return callToCommandBlock(stmt.expression, commandMap, conditionMap);
      }
      return null;

    case 'Assignment':
      return {
        id: generateBlockId(),
        type: 'setVariable',
        variableName: stmt.target,
        expression: astToBlockExpression(stmt.value, conditionMap),
      };

    case 'IndexedAssignment':
      // For indexed assignment (arr[0] = value), we don't have a direct block type
      // This is a limitation of the block editor - indexed assignment shows as code only
      return null;

    case 'RepeatStatement':
      return {
        id: generateBlockId(),
        type: 'repeat',
        repeatCount: getNumberValue(stmt.count) || 3,
        children: stmt.body
          .map((s) => statementToBlock(s, commandMap, conditionMap))
          .filter((b): b is Block => b !== null),
      };

    case 'WhileStatement': {
      const cond = getCondition(stmt.condition, conditionMap);
      return {
        id: generateBlockId(),
        type: 'while',
        condition: cond.condition,
        conditionExpr: cond.conditionExpr,
        children: stmt.body
          .map((s) => statementToBlock(s, commandMap, conditionMap))
          .filter((b): b is Block => b !== null),
      };
    }

    case 'IfStatement': {
      const cond = getCondition(stmt.condition, conditionMap);
      if (stmt.alternate && stmt.alternate.length > 0) {
        // If-else
        return {
          id: generateBlockId(),
          type: 'ifelse',
          condition: cond.condition,
          conditionExpr: cond.conditionExpr,
          children: stmt.consequent
            .map((s) => statementToBlock(s, commandMap, conditionMap))
            .filter((b): b is Block => b !== null),
          elseChildren: stmt.alternate
            .map((s) => statementToBlock(s, commandMap, conditionMap))
            .filter((b): b is Block => b !== null),
        };
      } else {
        // If only
        return {
          id: generateBlockId(),
          type: 'if',
          condition: cond.condition,
          conditionExpr: cond.conditionExpr,
          children: stmt.consequent
            .map((s) => statementToBlock(s, commandMap, conditionMap))
            .filter((b): b is Block => b !== null),
        };
      }
    }

    case 'ForStatement':
      return {
        id: generateBlockId(),
        type: 'for',
        variableName: stmt.variable,
        rangeStart: astToBlockExpression(stmt.start, conditionMap),
        rangeEnd: astToBlockExpression(stmt.end, conditionMap),
        children: stmt.body
          .map((s) => statementToBlock(s, commandMap, conditionMap))
          .filter((b): b is Block => b !== null),
      };

    case 'ForEachStatement':
      return {
        id: generateBlockId(),
        type: 'forEach',
        variableName: stmt.variable,
        iterable: astToBlockExpression(stmt.iterable, conditionMap),
        children: stmt.body
          .map((s) => statementToBlock(s, commandMap, conditionMap))
          .filter((b): b is Block => b !== null),
      };

    case 'BreakStatement':
      return {
        id: generateBlockId(),
        type: 'break',
      };

    case 'ContinueStatement':
      return {
        id: generateBlockId(),
        type: 'continue',
      };

    case 'PassStatement':
      return {
        id: generateBlockId(),
        type: 'pass',
      };

    case 'FunctionDef':
      return {
        id: generateBlockId(),
        type: 'functionDef',
        functionName: stmt.name,
        functionParams: stmt.params,
        children: stmt.body
          .map((s) => statementToBlock(s, commandMap, conditionMap))
          .filter((b): b is Block => b !== null),
      };

    default:
      // Unsupported statement type
      return null;
  }
}

/**
 * Convert a call expression to a command block or function call block
 */
function callToCommandBlock(
  call: CallExpression,
  commandMap: Record<string, CommandId>,
  conditionMap: Record<string, ConditionId>
): Block | null {
  const commandId = commandMap[call.callee];
  if (commandId) {
    const block: Block = {
      id: generateBlockId(),
      type: 'command',
      command: commandId,
    };

    // Check if this is a legacy command that needs an implicit direction argument
    const legacyDirection = LEGACY_DIRECTION_MAP[call.callee];
    if (legacyDirection && call.arguments.length === 0) {
      // Legacy command without arguments - add implicit direction
      block.commandArg = { type: 'string', value: legacyDirection };
    } else if (legacyDirection && call.arguments.length === 1) {
      // Legacy command with one argument (e.g., forward(3)) - direction + distance/degrees
      block.commandArg = { type: 'string', value: legacyDirection };
      block.commandArg2 = astToBlockExpression(call.arguments[0], conditionMap);
    } else if (call.arguments.length > 0) {
      // New unified command format: move("forward"), turn("left", 90)
      block.commandArg = astToBlockExpression(call.arguments[0], conditionMap);
      if (call.arguments.length > 1) {
        block.commandArg2 = astToBlockExpression(call.arguments[1], conditionMap);
      }
    }
    return block;
  }

  // Not a built-in command - treat as user-defined function call
  return {
    id: generateBlockId(),
    type: 'functionCall',
    functionName: call.callee,
    functionArgs: call.arguments.map((arg) => astToBlockExpression(arg, conditionMap)),
  };
}

/**
 * Get number value from an expression
 */
function getNumberValue(expr: Expression): number | null {
  if (expr.type === 'NumberLiteral') {
    return expr.value;
  }
  return null;
}

/**
 * Get condition from an expression
 * Returns either a ConditionId (for sensor-based) or a BlockExpression (for comparisons)
 */
function getCondition(
  expr: Expression,
  conditionMap: Record<string, ConditionId>
): { condition?: ConditionId; conditionExpr?: BlockExpression } {
  if (expr.type === 'CallExpression') {
    const conditionId = conditionMap[expr.callee];
    if (conditionId) {
      return { condition: conditionId };
    }
  }
  // For comparison expressions (x > 5, etc.)
  if (expr.type === 'BinaryOp' && isComparisonOperator(expr.operator)) {
    return {
      conditionExpr: astToBlockExpression(expr, conditionMap),
    };
  }
  // Default to first condition if available, otherwise undefined
  const defaultCondition = Object.values(conditionMap)[0];
  return defaultCondition ? { condition: defaultCondition } : {};
}
