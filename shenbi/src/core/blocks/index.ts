/**
 * Block System
 *
 * Central module for visual programming blocks.
 * Import this module to register all blocks and access the registry.
 */

// Types
export * from './types';

// Registry
export * from './registry';

// Import all blocks to register them
// Control flow blocks
import './repeat';
import './if';
import './ifelse';
import './while';
import './for';
import './forEach';

// Statement blocks
import './setVariable';
import './print';
import './break';
import './continue';
import './pass';

// Function blocks
import './functionDef';
import './functionCall';

// List blocks
import './listAppend';
import './listPop';
import './listInsert';

// Re-export individual blocks for direct access if needed
export { repeatBlock } from './repeat';
export { ifBlock } from './if';
export { ifelseBlock } from './ifelse';
export { whileBlock } from './while';
export { forBlock } from './for';
export { forEachBlock } from './forEach';
export { setVariableBlock } from './setVariable';
export { printBlock } from './print';
export { breakBlock } from './break';
export { continueBlock } from './continue';
export { passBlock } from './pass';
export { functionDefBlock } from './functionDef';
export { functionCallBlock } from './functionCall';
export { listAppendBlock } from './listAppend';
export { listPopBlock } from './listPop';
export { listInsertBlock } from './listInsert';
