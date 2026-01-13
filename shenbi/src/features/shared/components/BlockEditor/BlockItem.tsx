/**
 * BlockItem Component
 *
 * Renders a single block in the workspace.
 * Blocks are not draggable - only palette blocks can be dragged to the workspace.
 */

import { useDrop } from 'react-dnd';
import {
  Block,
  BlockDefinition,
  BlockExpression,
  MathOperator,
  ComparisonOperator,
  CONTROL_BLOCKS,
  VARIABLE_BLOCKS,
  FUNCTION_BLOCKS,
  LIST_BLOCKS,
  BLOCK_COLORS,
  ConditionId,
  GameType,
  getCommandBlocks,
  getConditions,
} from './types';
import type { CustomCommandDefinition } from '../../../../core/engine/types';
import { SoundManager } from '../../../../infrastructure/sounds/SoundManager';
import { useLanguage } from '../../../../infrastructure/i18n';

interface BlockItemProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onRemove: () => void;
  onAddChild: (parentId: string, block: Block, target?: 'else') => void;
  isNested?: boolean;
  highlightedBlockId?: string | null;
  gameType?: GameType;
  customCommands?: CustomCommandDefinition[];
}

const ITEM_TYPE = 'BLOCK';

// Math operators for expression builder
const MATH_OPERATORS: { op: MathOperator; label: string }[] = [
  { op: '+', label: '+' },
  { op: '-', label: '-' },
  { op: '*', label: '×' },
  { op: '/', label: '÷' },
];

// Comparison operators for conditions
const COMPARISON_OPERATORS: { op: ComparisonOperator; label: string }[] = [
  { op: '==', label: '=' },
  { op: '!=', label: '≠' },
  { op: '<', label: '<' },
  { op: '>', label: '>' },
  { op: '<=', label: '≤' },
  { op: '>=', label: '≥' },
];

// Expression type options
type ExpressionTypeOption = 'number' | 'string' | 'variable' | 'math' | 'boolean';

// Simple expression editor component
interface ExpressionEditorProps {
  expression: BlockExpression;
  onChange: (expr: BlockExpression) => void;
  variables?: string[];
  allowMath?: boolean;
}

function ExpressionEditor({
  expression,
  onChange,
  variables = [],
  allowMath = true,
}: ExpressionEditorProps) {
  // Handle type change from dropdown
  const handleTypeChange = (newType: ExpressionTypeOption) => {
    switch (newType) {
      case 'number':
        onChange({ type: 'number', value: 0 });
        break;
      case 'string':
        onChange({ type: 'string', value: '' });
        break;
      case 'boolean':
        onChange({ type: 'boolean', value: true });
        break;
      case 'variable':
        onChange({ type: 'variable', name: 'x' });
        break;
      case 'math':
        onChange({
          type: 'binary',
          operator: '+',
          left: { type: 'variable', name: 'x' },
          right: { type: 'number', value: 1 },
        });
        break;
    }
  };

  // For number expression
  if (expression.type === 'number') {
    return (
      <div className="inline-flex items-center gap-0.5">
        <input
          type="number"
          value={expression.value}
          onChange={(e) => onChange({ type: 'number', value: parseFloat(e.target.value) || 0 })}
          className={`${allowMath ? 'w-14 px-1' : 'w-8 px-0.5'} py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm`}
          onClick={(e) => e.stopPropagation()}
        />
        {allowMath && (
          <select
            value="number"
            onChange={(e) => handleTypeChange(e.target.value as ExpressionTypeOption)}
            className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="number">Number</option>
            <option value="variable">Variable</option>
            <option value="math">Math</option>
            <option value="string">Text</option>
            <option value="boolean">Boolean</option>
          </select>
        )}
      </div>
    );
  }

  // For string expression
  if (expression.type === 'string') {
    return (
      <div className="inline-flex items-center gap-0.5">
        <span className="text-gray-600 text-sm">"</span>
        <input
          type="text"
          value={expression.value}
          onChange={(e) => onChange({ type: 'string', value: e.target.value })}
          className={`${allowMath ? 'w-20' : 'w-10'} px-0.5 py-0.5 text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm`}
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-gray-600 text-sm">"</span>
        {allowMath && (
          <select
            value="string"
            onChange={(e) => handleTypeChange(e.target.value as ExpressionTypeOption)}
            className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="number">Number</option>
            <option value="variable">Variable</option>
            <option value="math">Math</option>
            <option value="string">Text</option>
            <option value="boolean">Boolean</option>
          </select>
        )}
      </div>
    );
  }

  // For boolean expression
  if (expression.type === 'boolean') {
    return (
      <div className="inline-flex items-center gap-0.5">
        <select
          value={expression.value ? 'true' : 'false'}
          onChange={(e) => onChange({ type: 'boolean', value: e.target.value === 'true' })}
          className="px-2 py-0.5 text-black rounded text-sm font-mono bg-purple-100"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        {allowMath && (
          <select
            value="boolean"
            onChange={(e) => handleTypeChange(e.target.value as ExpressionTypeOption)}
            className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="number">Number</option>
            <option value="variable">Variable</option>
            <option value="math">Math</option>
            <option value="string">Text</option>
            <option value="boolean">Boolean</option>
          </select>
        )}
      </div>
    );
  }

  // For variable expression
  if (expression.type === 'variable') {
    return (
      <div className="inline-flex items-center gap-0.5">
        <input
          type="text"
          value={expression.name}
          onChange={(e) => onChange({ type: 'variable', name: e.target.value || 'x' })}
          className={`${allowMath ? 'w-14 px-1' : 'w-10 px-0.5'} py-0.5 text-center text-gray-800 bg-amber-50 border border-amber-300 rounded text-sm font-mono`}
          onClick={(e) => e.stopPropagation()}
          placeholder="x"
        />
        {allowMath && (
          <select
            value="variable"
            onChange={(e) => handleTypeChange(e.target.value as ExpressionTypeOption)}
            className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="number">Number</option>
            <option value="variable">Variable</option>
            <option value="math">Math</option>
            <option value="string">Text</option>
            <option value="boolean">Boolean</option>
          </select>
        )}
      </div>
    );
  }

  // For binary (math) expression
  if (expression.type === 'binary') {
    return (
      <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded px-1 py-0.5">
        <ExpressionEditor
          expression={expression.left}
          onChange={(left) => onChange({ ...expression, left })}
          variables={variables}
          allowMath={false}
        />
        <select
          value={expression.operator}
          onChange={(e) => onChange({ ...expression, operator: e.target.value as MathOperator })}
          className="px-1 py-0.5 text-black rounded text-sm font-bold"
          onClick={(e) => e.stopPropagation()}
        >
          {MATH_OPERATORS.map((op) => (
            <option key={op.op} value={op.op}>
              {op.label}
            </option>
          ))}
        </select>
        <ExpressionEditor
          expression={expression.right}
          onChange={(right) => onChange({ ...expression, right })}
          variables={variables}
          allowMath={false}
        />
        <select
          value="math"
          onChange={(e) => handleTypeChange(e.target.value as ExpressionTypeOption)}
          className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="number">Number</option>
          <option value="variable">Variable</option>
          <option value="math">Math</option>
          <option value="string">Text</option>
          <option value="boolean">Boolean</option>
        </select>
      </div>
    );
  }

  // For array expression [1, 2, 3]
  if (expression.type === 'array') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <span className="text-gray-600 text-sm">[</span>
        {expression.elements.map((elem, idx) => (
          <span key={idx} className="inline-flex items-center">
            {idx > 0 && <span className="text-gray-600 text-sm">,</span>}
            <ExpressionEditor
              expression={elem}
              onChange={(newElem) => {
                const newElements = [...expression.elements];
                newElements[idx] = newElem;
                onChange({ ...expression, elements: newElements });
              }}
              variables={variables}
              allowMath={false}
            />
          </span>
        ))}
        <span className="text-gray-600 text-sm">]</span>
      </div>
    );
  }

  // For array access expression arr[i]
  if (expression.type === 'arrayAccess') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <ExpressionEditor
          expression={expression.array}
          onChange={(arr) => onChange({ ...expression, array: arr })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-sm">[</span>
        <ExpressionEditor
          expression={expression.index}
          onChange={(idx) => onChange({ ...expression, index: idx })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-sm">]</span>
      </div>
    );
  }

  // For array length expression len(arr)
  if (expression.type === 'arrayLength') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <span className="text-gray-600 text-xs">len(</span>
        <ExpressionEditor
          expression={expression.array}
          onChange={(arr) => onChange({ ...expression, array: arr })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-xs">)</span>
      </div>
    );
  }

  // For random() expression
  if (expression.type === 'random') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-1">
        <span className="text-gray-600 text-xs font-mono">random()</span>
      </div>
    );
  }

  // For randint(min, max) expression
  if (expression.type === 'randint') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <span className="text-gray-600 text-xs">randint(</span>
        <ExpressionEditor
          expression={expression.min}
          onChange={(min) => onChange({ ...expression, min })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-xs">,</span>
        <ExpressionEditor
          expression={expression.max}
          onChange={(max) => onChange({ ...expression, max })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-xs">)</span>
      </div>
    );
  }

  // For object expression {key: value, ...}
  if (expression.type === 'object') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <span className="text-gray-600 text-xs">{'{'}</span>
        {expression.properties.map((prop, idx) => (
          <span key={idx} className="inline-flex items-center">
            {idx > 0 && <span className="text-gray-600 text-xs">,</span>}
            <span className="text-amber-600 text-xs">{prop.key}:</span>
            <ExpressionEditor
              expression={prop.value}
              onChange={(newValue) => {
                const newProps = [...expression.properties];
                newProps[idx] = { ...prop, value: newValue };
                onChange({ ...expression, properties: newProps });
              }}
              variables={variables}
              allowMath={false}
            />
          </span>
        ))}
        <span className="text-gray-600 text-xs">{'}'}</span>
      </div>
    );
  }

  // For object access expression obj["key"]
  if (expression.type === 'objectAccess') {
    return (
      <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded px-0.5">
        <ExpressionEditor
          expression={expression.object}
          onChange={(obj) => onChange({ ...expression, object: obj })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-sm">[</span>
        <ExpressionEditor
          expression={expression.key}
          onChange={(key) => onChange({ ...expression, key })}
          variables={variables}
          allowMath={false}
        />
        <span className="text-gray-600 text-sm">]</span>
      </div>
    );
  }

  // Fallback for unhandled types (sensor, comparison used in conditions)
  return <span className="text-gray-600">Expression</span>;
}

// Condition type: sensor or expression
type ConditionType = 'sensor' | 'expression';

// Condition editor component - allows sensor or comparison expression
interface ConditionEditorProps {
  condition?: ConditionId;
  conditionExpr?: BlockExpression;
  onChange: (condition?: ConditionId, conditionExpr?: BlockExpression) => void;
  conditions: { id: ConditionId; label: string }[];
}

function ConditionEditor({ condition, conditionExpr, onChange, conditions }: ConditionEditorProps) {
  // Determine if using expression or sensor
  const conditionType: ConditionType = conditionExpr ? 'expression' : 'sensor';
  const defaultCondition = conditions[0]?.id || 'frontClear';

  const handleTypeChange = (newType: ConditionType) => {
    if (newType === 'sensor') {
      onChange(defaultCondition, undefined);
    } else {
      // Default comparison: x > 0
      onChange(undefined, {
        type: 'comparison',
        operator: '>',
        left: { type: 'variable', name: 'x' },
        right: { type: 'number', value: 0 },
      });
    }
  };

  if (conditionType === 'sensor') {
    // If no conditions available (e.g., music game), only show expression option
    if (conditions.length === 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-white/80 text-sm">No sensors</span>
          <select
            value="expression"
            onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
            className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="expression">Compare</option>
          </select>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <select
          value={condition || defaultCondition}
          onChange={(e) => onChange(e.target.value as ConditionId, undefined)}
          className="px-2 py-0.5 text-black rounded text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {conditions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value="sensor"
          onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
          className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="sensor">Sensor</option>
          <option value="expression">Compare</option>
        </select>
      </div>
    );
  }

  // Expression-based condition (comparison)
  if (conditionExpr && conditionExpr.type === 'comparison') {
    return (
      <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded px-1 py-0.5">
        <ExpressionEditor
          expression={conditionExpr.left}
          onChange={(left) => onChange(undefined, { ...conditionExpr, left })}
          allowMath={false}
        />
        <select
          value={conditionExpr.operator}
          onChange={(e) =>
            onChange(undefined, {
              ...conditionExpr,
              operator: e.target.value as ComparisonOperator,
            })
          }
          className="px-1 py-0.5 text-black rounded text-sm font-bold"
          onClick={(e) => e.stopPropagation()}
        >
          {COMPARISON_OPERATORS.map((op) => (
            <option key={op.op} value={op.op}>
              {op.label}
            </option>
          ))}
        </select>
        <ExpressionEditor
          expression={conditionExpr.right}
          onChange={(right) => onChange(undefined, { ...conditionExpr, right })}
          allowMath={false}
        />
        <select
          value="expression"
          onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
          className="px-1 py-0.5 text-black rounded text-xs bg-white/80"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="sensor">Sensor</option>
          <option value="expression">Compare</option>
        </select>
      </div>
    );
  }

  // Fallback - show sensor selector or expression selector if no conditions
  if (conditions.length === 0) {
    return <span className="text-white/80 text-sm">No sensors</span>;
  }
  return (
    <select
      value={condition || defaultCondition}
      onChange={(e) => onChange(e.target.value as ConditionId, undefined)}
      className="px-2 py-0.5 text-black rounded text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {conditions.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

function getBlockDef(
  block: Block,
  gameType: GameType = 'maze',
  customCommands?: CustomCommandDefinition[]
): BlockDefinition | undefined {
  if (block.type === 'command') {
    // Check built-in commands first
    const commandBlocks = getCommandBlocks(gameType);
    const builtIn = commandBlocks.find((b) => b.command === block.command);
    if (builtIn) return builtIn;

    // Check custom commands
    if (customCommands) {
      const customCmd = customCommands.find((c) => c.id === block.command);
      if (customCmd) {
        return {
          type: 'command',
          command: customCmd.id,
          label: customCmd.label,
          icon: customCmd.icon,
          color: customCmd.color || BLOCK_COLORS.action,
          argType: customCmd.argType || 'none',
          defaultArg: customCmd.defaultArg
            ? customCmd.argType === 'number'
              ? { type: 'number', value: customCmd.defaultArg as number }
              : { type: 'string', value: customCmd.defaultArg as string }
            : undefined,
        };
      }
    }
    return undefined;
  }
  const controlDef = CONTROL_BLOCKS.find((b) => b.type === block.type);
  if (controlDef) return controlDef;
  const variableDef = VARIABLE_BLOCKS.find((b) => b.type === block.type);
  if (variableDef) return variableDef;
  const listDef = LIST_BLOCKS.find((b) => b.type === block.type);
  if (listDef) return listDef;
  return FUNCTION_BLOCKS.find((b) => b.type === block.type);
}

export function BlockItem({
  block,
  onUpdate,
  onRemove,
  onAddChild,
  isNested,
  highlightedBlockId,
  gameType = 'maze',
  customCommands,
}: BlockItemProps) {
  const def = getBlockDef(block, gameType, customCommands);
  const conditions = getConditions(gameType);
  const isHighlighted = block.id === highlightedBlockId;
  const blockLabel = def?.label || '';

  const hasChildren = ![
    'command',
    'setVariable',
    'print',
    'functionCall',
    'listAppend',
    'listPop',
    'listInsert',
    'break',
    'continue',
    'pass',
  ].includes(block.type);

  const borderColor = def?.color || '#999';

  return (
    <div
      className={`relative rounded-lg shadow-sm transition-all border border-gray-200 ${isNested ? 'ml-4' : ''} ${
        isHighlighted
          ? 'ring-2 ring-yellow-400 ring-opacity-100 scale-[1.02] z-10 bg-yellow-50'
          : 'bg-white'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      {/* Block Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-gray-800">
        {def?.icon && <span className="text-lg">{def.icon}</span>}
        <span className="font-semibold">{blockLabel}</span>

        {/* Command argument input (for turtle: forward(3), turnRight(90)) */}
        {block.type === 'command' && block.commandArg && !block.commandArg2 && (
          <ExpressionEditor
            expression={block.commandArg}
            onChange={(expr) => onUpdate({ ...block, commandArg: expr })}
            allowMath={false}
          />
        )}

        {/* XY coordinate inputs (e.g., moveTo(x, y)) */}
        {block.type === 'command' && block.commandArg && block.commandArg2 && (
          <div className="flex items-center gap-1">
            <span className="text-white/80 text-xs">X:</span>
            <ExpressionEditor
              expression={block.commandArg}
              onChange={(expr) => onUpdate({ ...block, commandArg: expr })}
              allowMath={false}
            />
            <span className="text-white/80 text-xs">Y:</span>
            <ExpressionEditor
              expression={block.commandArg2}
              onChange={(expr) => onUpdate({ ...block, commandArg2: expr })}
              allowMath={false}
            />
          </div>
        )}

        {/* Repeat count input */}
        {block.type === 'repeat' && (
          <input
            type="number"
            min={1}
            max={99}
            value={block.repeatCount || 3}
            onChange={(e) => onUpdate({ ...block, repeatCount: parseInt(e.target.value) || 1 })}
            className="w-10 px-0.5 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Condition selector */}
        {(block.type === 'while' || block.type === 'if' || block.type === 'ifelse') && (
          <ConditionEditor
            condition={block.condition}
            conditionExpr={block.conditionExpr}
            onChange={(condition, conditionExpr) =>
              onUpdate({ ...block, condition, conditionExpr })
            }
            conditions={conditions}
          />
        )}

        {/* For loop: variable in range(start, end) */}
        {block.type === 'for' && (
          <>
            <input
              type="text"
              value={block.variableName || 'i'}
              onChange={(e) => onUpdate({ ...block, variableName: e.target.value || 'i' })}
              className="w-8 px-1 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-gray-600 text-sm">from</span>
            {block.rangeStart && (
              <ExpressionEditor
                expression={block.rangeStart}
                onChange={(expr) => onUpdate({ ...block, rangeStart: expr })}
                allowMath={false}
              />
            )}
            <span className="text-gray-600 text-sm">to</span>
            {block.rangeEnd && (
              <ExpressionEditor
                expression={block.rangeEnd}
                onChange={(expr) => onUpdate({ ...block, rangeEnd: expr })}
                allowMath={false}
              />
            )}
          </>
        )}

        {/* For-each loop: variable in iterable */}
        {block.type === 'forEach' && (
          <>
            <input
              type="text"
              value={block.variableName || 'item'}
              onChange={(e) => onUpdate({ ...block, variableName: e.target.value || 'item' })}
              className="w-12 px-1 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-gray-600 text-sm">in</span>
            {block.iterable && (
              <ExpressionEditor
                expression={block.iterable}
                onChange={(expr) => onUpdate({ ...block, iterable: expr })}
                allowMath={false}
              />
            )}
          </>
        )}

        {/* Set Variable: name = expression */}
        {block.type === 'setVariable' && (
          <>
            <input
              type="text"
              value={block.variableName || 'x'}
              onChange={(e) => onUpdate({ ...block, variableName: e.target.value || 'x' })}
              className="w-12 px-0.5 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
              onClick={(e) => e.stopPropagation()}
              placeholder="var"
            />
            <span className="text-gray-600 font-bold">=</span>
            {block.expression && (
              <ExpressionEditor
                expression={block.expression}
                onChange={(expr) => onUpdate({ ...block, expression: expr })}
                allowMath={false}
              />
            )}
          </>
        )}

        {/* Print: print(expression) */}
        {block.type === 'print' && block.expression && (
          <ExpressionEditor
            expression={block.expression}
            onChange={(expr) => onUpdate({ ...block, expression: expr })}
            allowMath={false}
          />
        )}

        {/* Function Definition: def name(): */}
        {block.type === 'functionDef' && (
          <>
            <input
              type="text"
              value={block.functionName || 'myFunction'}
              onChange={(e) => onUpdate({ ...block, functionName: e.target.value || 'myFunction' })}
              className="w-20 px-0.5 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
              onClick={(e) => e.stopPropagation()}
              placeholder="name"
            />
            <span className="text-gray-600">()</span>
          </>
        )}

        {/* Function Call: name() */}
        {block.type === 'functionCall' && (
          <>
            <input
              type="text"
              value={block.functionName || 'myFunction'}
              onChange={(e) => onUpdate({ ...block, functionName: e.target.value || 'myFunction' })}
              className="w-20 px-0.5 py-0.5 text-center text-gray-800 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
              onClick={(e) => e.stopPropagation()}
              placeholder="name"
            />
            <span className="text-gray-600">()</span>
          </>
        )}

        {/* List Append: append(array, value) */}
        {block.type === 'listAppend' && block.listArray && block.listValue && (
          <>
            <span className="text-gray-600 text-sm">(</span>
            <ExpressionEditor
              expression={block.listArray}
              onChange={(expr) => onUpdate({ ...block, listArray: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">,</span>
            <ExpressionEditor
              expression={block.listValue}
              onChange={(expr) => onUpdate({ ...block, listValue: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">)</span>
          </>
        )}

        {/* List Pop: pop(array) */}
        {block.type === 'listPop' && block.listArray && (
          <>
            <span className="text-gray-600 text-sm">(</span>
            <ExpressionEditor
              expression={block.listArray}
              onChange={(expr) => onUpdate({ ...block, listArray: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">)</span>
          </>
        )}

        {/* List Insert: insert(array, index, value) */}
        {block.type === 'listInsert' && block.listArray && block.listIndex && block.listValue && (
          <>
            <span className="text-gray-600 text-sm">(</span>
            <ExpressionEditor
              expression={block.listArray}
              onChange={(expr) => onUpdate({ ...block, listArray: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">,</span>
            <ExpressionEditor
              expression={block.listIndex}
              onChange={(expr) => onUpdate({ ...block, listIndex: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">,</span>
            <ExpressionEditor
              expression={block.listValue}
              onChange={(expr) => onUpdate({ ...block, listValue: expr })}
              allowMath={false}
            />
            <span className="text-gray-600 text-sm">)</span>
          </>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full text-sm text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Children container for control blocks */}
      {hasChildren && (
        <div className="mx-2 mb-2">
          <DropZone
            onDrop={(droppedBlock) => onAddChild(block.id, droppedBlock)}
            blocks={block.children || []}
            onUpdateChild={(index, updated) => {
              const newChildren = [...(block.children || [])];
              newChildren[index] = updated;
              onUpdate({ ...block, children: newChildren });
            }}
            onRemoveChild={(index) => {
              const newChildren = [...(block.children || [])];
              newChildren.splice(index, 1);
              onUpdate({ ...block, children: newChildren });
            }}
            onAddChild={onAddChild}
            color={def?.color || '#999'}
            highlightedBlockId={highlightedBlockId}
            gameType={gameType}
            customCommands={customCommands}
          />
        </div>
      )}

      {/* Else branch for ifelse */}
      {block.type === 'ifelse' && (
        <>
          <div className="px-3 py-1 text-gray-600 font-semibold border-t border-gray-200 bg-gray-50">
            else
          </div>
          <div className="mx-2 mb-2">
            <DropZone
              onDrop={(droppedBlock) => onAddChild(block.id, droppedBlock, 'else')}
              blocks={block.elseChildren || []}
              onUpdateChild={(index, updated) => {
                const newElseChildren = [...(block.elseChildren || [])];
                newElseChildren[index] = updated;
                onUpdate({ ...block, elseChildren: newElseChildren });
              }}
              onRemoveChild={(index) => {
                const newElseChildren = [...(block.elseChildren || [])];
                newElseChildren.splice(index, 1);
                onUpdate({ ...block, elseChildren: newElseChildren });
              }}
              onAddChild={onAddChild}
              color={def?.color || '#999'}
              highlightedBlockId={highlightedBlockId}
              gameType={gameType}
              customCommands={customCommands}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Drop zone for nested blocks
interface DropZoneProps {
  onDrop: (block: Block) => void;
  blocks: Block[];
  onUpdateChild: (index: number, block: Block) => void;
  onRemoveChild: (index: number) => void;
  onAddChild: (parentId: string, block: Block, target?: 'else') => void;
  color: string;
  highlightedBlockId?: string | null;
  gameType?: GameType;
  customCommands?: CustomCommandDefinition[];
}

function DropZone({
  onDrop,
  blocks,
  onUpdateChild,
  onRemoveChild,
  onAddChild,
  color: _color,
  highlightedBlockId,
  gameType = 'maze',
  customCommands,
}: DropZoneProps) {
  const { t } = useLanguage();
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { block: Block; isFromWorkspace?: boolean }, monitor) => {
      if (monitor.didDrop()) return; // Already handled by nested drop zone
      onDrop(item.block);
      SoundManager.play('drop');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`min-h-[40px] rounded-lg p-2 transition-all border-2 border-dashed ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      {blocks.length === 0 ? (
        <div className="text-gray-600 text-sm text-center py-2">{t('blocks.dragHere')}</div>
      ) : (
        <div className="space-y-2">
          {blocks.map((child, index) => (
            <BlockItem
              key={child.id}
              block={child}
              onUpdate={(updated) => onUpdateChild(index, updated)}
              onRemove={() => onRemoveChild(index)}
              onAddChild={onAddChild}
              isNested
              highlightedBlockId={highlightedBlockId}
              gameType={gameType}
              customCommands={customCommands}
            />
          ))}
        </div>
      )}
    </div>
  );
}
