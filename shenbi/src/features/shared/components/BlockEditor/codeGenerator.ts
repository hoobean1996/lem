/**
 * Code Generator
 *
 * Converts visual blocks to Mini Python code.
 * Supports multiple game types: maze, turtle
 *
 * Uses block definitions from core/blocks for control block code generation.
 * Command code names come from game modules (single source of truth).
 */

import { Block, BlockExpression, GameType, ConditionId, getCommandCodeName } from './types';
import { getBlockDefinition, type CodeGenContext } from '../../../../core/blocks';

function getConditionCode(conditionId: ConditionId, _gameType: GameType): string {
  // Return the condition ID directly - it's the function name (e.g., 'notAtGoal', 'frontClear')
  return conditionId;
}

// Convert BlockExpression to code string
function expressionToCode(expr: BlockExpression | undefined, gameType: GameType): string {
  if (!expr) return '0';

  switch (expr.type) {
    case 'number':
      return String(expr.value);
    case 'string':
      return `"${expr.value}"`;
    case 'boolean':
      return expr.value ? 'True' : 'False';
    case 'variable':
      return expr.name;
    case 'binary':
      return `(${expressionToCode(expr.left, gameType)} ${expr.operator} ${expressionToCode(expr.right, gameType)})`;
    case 'comparison':
      return `(${expressionToCode(expr.left, gameType)} ${expr.operator} ${expressionToCode(expr.right, gameType)})`;
    case 'sensor':
      return `${getConditionCode(expr.sensor, gameType)}()`;
    case 'array':
      return `[${expr.elements.map((e) => expressionToCode(e, gameType)).join(', ')}]`;
    case 'arrayAccess':
      return `${expressionToCode(expr.array, gameType)}[${expressionToCode(expr.index, gameType)}]`;
    case 'arrayLength':
      return `len(${expressionToCode(expr.array, gameType)})`;
    case 'random':
      return 'random()';
    case 'randint':
      return `randint(${expressionToCode(expr.min, gameType)}, ${expressionToCode(expr.max, gameType)})`;
    case 'object': {
      const props = expr.properties
        .map((p) => `${p.key}: ${expressionToCode(p.value, gameType)}`)
        .join(', ');
      return `{${props}}`;
    }
    case 'objectAccess':
      return `${expressionToCode(expr.object, gameType)}[${expressionToCode(expr.key, gameType)}]`;
    default:
      return '0';
  }
}

// Get condition code - can be sensor or expression-based
function getBlockConditionCode(
  block: { condition?: ConditionId; conditionExpr?: BlockExpression },
  gameType: GameType
): string {
  if (block.conditionExpr) {
    return expressionToCode(block.conditionExpr, gameType);
  }
  if (block.condition) {
    return `${getConditionCode(block.condition, gameType)}()`;
  }
  return 'true';
}

// Line number to block ID mapping
export type LineToBlockMap = Map<number, string>;

// State for code generation with line mapping
interface CodeGenState {
  lines: string[];
  currentLine: number;
  lineMap: LineToBlockMap;
  indent: number;
  gameType: GameType;
}

// Generate code for a single block using block definitions
function generateBlockCode(block: Block, state: CodeGenState): void {
  const spaces = '    '.repeat(state.indent);

  // Try to use block definition from registry
  const blockDef = getBlockDefinition(block.type);

  if (blockDef && block.type !== 'command') {
    // Create context for block's toCode method
    const ctx: CodeGenContext = {
      indent: state.indent,
      gameType: state.gameType,
      addLine: (code: string, blockId?: string) => {
        state.lines.push(`${spaces}${code}`);
        if (blockId) {
          state.lineMap.set(state.currentLine, blockId);
        }
        state.currentLine++;
      },
      generateChildren: (children: Block[] | undefined) => {
        if (children && children.length > 0) {
          const childState = { ...state, indent: state.indent + 1 };
          for (const child of children) {
            generateBlockCode(child, childState);
          }
          state.currentLine = childState.currentLine;
          state.lines = childState.lines;
        } else {
          // Empty body placeholder
          state.lines.push(`${spaces}    # Add instructions here`);
          state.currentLine++;
        }
      },
      expressionToCode: (expr) => expressionToCode(expr, state.gameType),
      getConditionCode: (b) => getBlockConditionCode(b, state.gameType),
      getCommandCodeName: (cmdId) => getCommandCodeName(cmdId, state.gameType),
    };

    blockDef.toCode(block, ctx);
    return;
  }

  // Handle command blocks (game-specific, not in registry)
  if (block.type === 'command' && block.command) {
    const name = getCommandCodeName(block.command, state.gameType);
    let args = '';
    if (block.commandArg && block.commandArg2) {
      args = `${expressionToCode(block.commandArg, state.gameType)}, ${expressionToCode(block.commandArg2, state.gameType)}`;
    } else if (block.commandArg) {
      args = expressionToCode(block.commandArg, state.gameType);
    }
    state.lines.push(`${spaces}${name}(${args})`);
    state.lineMap.set(state.currentLine, block.id);
    state.currentLine++;
  }
}

export function generateCode(blocks: Block[], gameType: GameType = 'maze'): string {
  if (blocks.length === 0) {
    return '# Drag blocks here from the left';
  }

  const state: CodeGenState = {
    lines: [],
    currentLine: 1,
    lineMap: new Map(),
    indent: 0,
    gameType,
  };

  for (const block of blocks) {
    generateBlockCode(block, state);
  }

  return state.lines.join('\n');
}

export function generateCodeWithLineMap(
  blocks: Block[],
  gameType: GameType = 'maze'
): { code: string; lineMap: LineToBlockMap } {
  if (blocks.length === 0) {
    return { code: '# Drag blocks here from the left', lineMap: new Map() };
  }

  const state: CodeGenState = {
    lines: [],
    currentLine: 1,
    lineMap: new Map(),
    indent: 0,
    gameType,
  };

  for (const block of blocks) {
    generateBlockCode(block, state);
  }

  return { code: state.lines.join('\n'), lineMap: state.lineMap };
}
