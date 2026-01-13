/**
 * Block Registry
 *
 * Central registry for all control block definitions.
 * Provides lookup functions for code generation, parsing, and rendering.
 */

import type { BlockType, ControlBlockDefinition, Block, BlockRegistry } from './types';

// The registry - populated by block files
const registry: BlockRegistry = new Map();

// AST type to block type mapping
const astTypeMap: Map<string, BlockType> = new Map();

/**
 * Register a block definition
 */
export function registerBlock(def: ControlBlockDefinition): void {
  registry.set(def.type, def);
  astTypeMap.set(def.astType, def.type);
}

/**
 * Get a block definition by type
 */
export function getBlockDefinition(type: BlockType): ControlBlockDefinition | undefined {
  return registry.get(type);
}

/**
 * Get a block definition by AST statement type
 */
export function getBlockByAstType(astType: string): ControlBlockDefinition | undefined {
  const blockType = astTypeMap.get(astType);
  if (!blockType) return undefined;
  return registry.get(blockType);
}

/**
 * Get all registered block definitions
 */
export function getAllBlockDefinitions(): ControlBlockDefinition[] {
  return Array.from(registry.values());
}

/**
 * Get block definitions by category
 */
export function getBlocksByCategory(category: string): ControlBlockDefinition[] {
  return getAllBlockDefinitions().filter((def) => def.category === category);
}

/**
 * Check if a block type is registered
 */
export function isRegisteredBlock(type: string): type is BlockType {
  return registry.has(type as BlockType);
}

/**
 * Create a new block instance from a definition
 */
let blockIdCounter = 0;
export function generateBlockId(): string {
  return `block_${++blockIdCounter}`;
}

export function createBlockFromDefinition(type: BlockType): Block | undefined {
  const def = registry.get(type);
  if (!def) return undefined;

  return {
    id: generateBlockId(),
    type,
    ...def.createDefaults(),
  } as Block;
}

/**
 * Get palette items for the block editor
 * Returns blocks suitable for display in the palette
 */
export function getPaletteBlocks(
  categories: string[]
): Array<{ type: BlockType; label: string; icon: string; color: string }> {
  return getAllBlockDefinitions()
    .filter((def) => categories.includes(def.category))
    .map((def) => ({
      type: def.type,
      label: def.label,
      icon: def.icon,
      color: def.color,
    }));
}
