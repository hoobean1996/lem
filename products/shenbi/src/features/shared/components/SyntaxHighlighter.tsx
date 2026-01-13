/**
 * Syntax Highlighter for MiniPython
 *
 * Provides syntax highlighting for MiniPython code.
 */

import React from 'react';

// Keywords (English and Chinese)
const KEYWORDS = [
  'if',
  'else',
  'elif',
  'while',
  'for',
  'repeat',
  'times',
  'def',
  'return',
  'in',
  'range',
  'and',
  'or',
  'not',
  'True',
  'False',
  'break',
  'continue',
  '如果',
  '否则',
  '否则如果',
  '当',
  '时',
  '对于',
  '重复',
  '次',
  '定义',
  '返回',
  '在',
  '范围',
  '和',
  '或',
  '不',
  '真',
  '假',
  '停止',
  '跳出',
  '继续',
];

// Built-in functions
const BUILTINS = [
  'print',
  'len',
  'append',
  'pop',
  'insert',
  'random',
  'randint',
  'abs',
  'min',
  'max',
  'sum',
  'int',
  'str',
  'float',
  'upper',
  'lower',
  'split',
  'join',
  'forward',
  'backward',
  'turnLeft',
  'turnRight',
  'frontClear',
  'frontBlocked',
  'leftClear',
  'rightClear',
  'hasStar',
  'atGoal',
  'notAtGoal',
  'setColor',
  '打印',
  '长度',
  '添加',
  '弹出',
  '插入',
  '随机',
  '随机整数',
  '绝对值',
  '最小值',
  '最大值',
  '求和',
  '整数',
  '字符串',
  '浮点数',
  '大写',
  '小写',
  '分割',
  '连接',
];

/**
 * Highlight a single line of MiniPython code
 */
export function highlightLine(line: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Comment
    if (remaining.startsWith('#')) {
      result.push(
        <span key={key++} className="text-gray-600 italic">
          {remaining}
        </span>
      );
      break;
    }

    // String (double quotes)
    const doubleStringMatch = remaining.match(/^"([^"\\]|\\.)*"/);
    if (doubleStringMatch) {
      result.push(
        <span key={key++} className="text-green-600">
          {doubleStringMatch[0]}
        </span>
      );
      remaining = remaining.slice(doubleStringMatch[0].length);
      continue;
    }

    // String (single quotes)
    const singleStringMatch = remaining.match(/^'([^'\\]|\\.)*'/);
    if (singleStringMatch) {
      result.push(
        <span key={key++} className="text-green-600">
          {singleStringMatch[0]}
        </span>
      );
      remaining = remaining.slice(singleStringMatch[0].length);
      continue;
    }

    // Number
    const numberMatch = remaining.match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      result.push(
        <span key={key++} className="text-orange-500">
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // Word (keyword, builtin, or identifier)
    const wordMatch = remaining.match(/^[a-zA-Z_\u4e00-\u9fff][a-zA-Z0-9_\u4e00-\u9fff]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (KEYWORDS.includes(word)) {
        result.push(
          <span key={key++} className="text-purple-600 font-semibold">
            {word}
          </span>
        );
      } else if (BUILTINS.includes(word)) {
        result.push(
          <span key={key++} className="text-blue-600">
            {word}
          </span>
        );
      } else {
        result.push(
          <span key={key++} className="text-gray-800">
            {word}
          </span>
        );
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Operators
    const operatorMatch = remaining.match(/^(==|!=|<=|>=|\/\/|[+\-*/%=<>])/);
    if (operatorMatch) {
      result.push(
        <span key={key++} className="text-red-500">
          {operatorMatch[0]}
        </span>
      );
      remaining = remaining.slice(operatorMatch[0].length);
      continue;
    }

    // Brackets and punctuation
    const punctMatch = remaining.match(/^[[\]{}():,]/);
    if (punctMatch) {
      result.push(
        <span key={key++} className="text-gray-600">
          {punctMatch[0]}
        </span>
      );
      remaining = remaining.slice(1);
      continue;
    }

    // Whitespace or other characters
    result.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return result;
}
