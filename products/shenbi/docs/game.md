# Game Architecture Guide

How to create new game types following Shenbi's **World + VM + Canvas** architecture pattern.

---

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    World    │────│     VM      │────│   Canvas    │
│ (Data Model)│    │(Code Runner)│    │ (Renderer)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       │   onChange()     │   step/run()     │
       └──────────────────┴──────────────────┘
```

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
| **World** | Pure state management | None (pure TypeScript) |
| **VM** | Code execution bridge | World + lang/vm |
| **Canvas** | Visual rendering | World + React |
| **commands.ts** | Single source of truth for commands | World |

---

## Existing Game Types

| Game | World | VM | Canvas | Description |
|------|-------|----|----|-------------|
| **Maze** | `MazeWorld` | `MazeVM` | `MazeCanvas` | Grid navigation |
| **Turtle** | `TurtleWorld` | `TurtleVM` | `TurtleCanvas` | Logo-style drawing |

---

## File Structure

Games are located in `src/core/game/`:

```
src/core/game/
├── index.ts              # Main exports
├── maze/
│   ├── index.ts          # Module exports
│   ├── MazeWorld.ts      # State & logic
│   ├── MazeVM.ts         # VM bindings
│   ├── MazeCanvas.tsx    # React renderer
│   ├── commands.ts       # Command definitions (single source of truth)
│   └── levels/           # Level definitions
│       ├── index.ts
│       ├── types.ts
│       ├── level01.ts
│       └── ...
└── turtle/
    ├── index.ts
    ├── TurtleWorld.ts
    ├── TurtleVM.ts
    ├── TurtleCanvas.tsx
    ├── commands.ts
    └── levels/
        └── ...
```

---

## Step-by-Step: Creating a New Game

### Step 1: Define Commands (`commands.ts`)

Commands are the **single source of truth** - used by VM, BlockEditor, and CodeGenerator.

```typescript
// src/core/game/mygame/commands.ts

import { MyGameWorld } from './MyGameWorld';
import { Value } from '../../lang/ir';

export type ArgType = 'none' | 'number' | 'string';

export interface CommandDefinition {
  id: string;           // Unique ID
  label: string;        // Display label
  icon: string;         // Emoji for block UI
  color: string;        // Block color (hex)
  codeName: string;     // Code name (e.g., 'forward')
  argType: ArgType;     // Argument type
  defaultArg?: number | string;
  handler: (world: MyGameWorld, args: Value[]) => Value | void;
}

export interface ConditionDefinition {
  id: string;
  label: string;
  codeName: string;
  handler: (world: MyGameWorld) => boolean;
}

export const MYGAME_COLORS = {
  action: '#3B82F6',  // Blue
  sensor: '#10B981',  // Green
} as const;

export const MYGAME_COMMANDS: CommandDefinition[] = [
  {
    id: 'doAction',
    label: 'Do Action',
    icon: '⚡',
    color: MYGAME_COLORS.action,
    codeName: 'doAction',
    argType: 'none',
    handler: (world) => world.doAction(),
  },
];

export const MYGAME_CONDITIONS: ConditionDefinition[] = [
  {
    id: 'isReady',
    label: 'Is Ready',
    codeName: 'isReady',
    handler: (world) => world.isReady(),
  },
];

export const MYGAME_SENSORS: CommandDefinition[] = [
  {
    id: 'getScore',
    label: 'Get Score',
    icon: '🔢',
    color: MYGAME_COLORS.sensor,
    codeName: 'getScore',
    argType: 'none',
    handler: (world) => world.getScore(),
  },
];
```

---

### Step 2: Create the World

The World is a pure TypeScript class that manages game state.

```typescript
// src/core/game/mygame/MyGameWorld.ts

export interface MyGameState {
  score: number;
  position: { x: number; y: number };
  isComplete: boolean;
}

export class MyGameWorld {
  private state: MyGameState;
  private initialState: MyGameState | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.getDefaultState();
  }

  private getDefaultState(): MyGameState {
    return { score: 0, position: { x: 0, y: 0 }, isComplete: false };
  }

  // ============ Level Loading ============

  loadLevel(levelData: MyGameLevel): void {
    this.state = {
      ...this.getDefaultState(),
      // Parse levelData...
    };
    this.initialState = { ...this.state };
    this.notifyListeners();
  }

  reset(): void {
    if (this.initialState) {
      this.state = { ...this.initialState };
      this.notifyListeners();
    }
  }

  // ============ Commands ============

  doAction(): boolean {
    this.state.score += 10;
    this.notifyListeners();
    return true;
  }

  // ============ Sensors ============

  isReady(): boolean {
    return this.state.score > 0;
  }

  getScore(): number {
    return this.state.score;
  }

  // ============ State Access ============

  getState(): MyGameState {
    return { ...this.state };
  }

  // ============ Events ============

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
```

**Key Points:**
- No React imports - pure TypeScript
- Immutable state access via `{ ...this.state }`
- `onChange()` pattern for subscriptions
- `reset()` restores initial level state

---

### Step 3: Create the VM

The VM bridges Mini Python execution to World commands using the command definitions.

```typescript
// src/core/game/mygame/MyGameVM.ts

import { VM, VMState, VMStepResult, CommandHandler } from '../../lang/vm';
import { CompiledProgram, Value } from '../../lang/ir';
import { compile, compileToIR } from '../../lang/index';
import { MyGameWorld } from './MyGameWorld';
import { MYGAME_COMMANDS, MYGAME_CONDITIONS, MYGAME_SENSORS } from './commands';

export interface MyGameVMConfig {
  world: MyGameWorld;
  onPrint?: (message: string) => void;
}

export class MyGameVM {
  private vm: VM;
  private world: MyGameWorld;
  private onPrint?: (message: string) => void;

  constructor(config: MyGameVMConfig) {
    this.vm = new VM();
    this.world = config.world;
    this.onPrint = config.onPrint;
    this.registerBindings();
  }

  private registerBindings(): void {
    // Print command
    const printHandler: CommandHandler = (args: Value[]) => {
      const message = args.map((a) => String(a)).join(' ');
      this.onPrint?.(message);
    };
    this.vm.registerCommand('print', printHandler);

    // Register commands from commands.ts
    for (const cmd of MYGAME_COMMANDS) {
      const handler = (args: Value[]) => cmd.handler(this.world, args);
      this.vm.registerCommand(cmd.codeName, handler);
    }

    // Register conditions
    for (const cond of MYGAME_CONDITIONS) {
      const handler = () => cond.handler(this.world);
      this.vm.registerCommand(cond.codeName, handler);
    }

    // Register sensors
    for (const sensor of MYGAME_SENSORS) {
      const handler = (args: Value[]) => sensor.handler(this.world, args);
      this.vm.registerCommand(sensor.codeName, handler);
    }
  }

  // Load from source code
  loadWithSource(userCode: string): void {
    const ast = compile(userCode);
    const program = compileToIR(ast);
    this.vm.load(program);
  }

  // ============ VM Delegation ============

  load(program: CompiledProgram): void { this.vm.load(program); }
  reset(): void { this.vm.reset(); }
  step(): VMStepResult { return this.vm.step(); }
  run(): VMStepResult { return this.vm.run(); }
  runAll(): VMStepResult[] { return this.vm.runAll(); }
  pause(): void { this.vm.pause(); }
  resume(): void { this.vm.resume(); }
  getState(): VMState { return this.vm.getState(); }
  getCurrentLine(): number | null { return this.vm.getCurrentLine(); }
  getVariables(): Record<string, Value> { return this.vm.getVariables(); }

  // ============ Debugging Features ============

  addBreakpoint(line: number): void { this.vm.addBreakpoint(line); }
  removeBreakpoint(line: number): void { this.vm.removeBreakpoint(line); }
  toggleBreakpoint(line: number): boolean { return this.vm.toggleBreakpoint(line); }
  getBreakpoints(): number[] { return this.vm.getBreakpoints(); }
  stepBack(): boolean { return this.vm.stepBack(); }
}
```

---

### Step 4: Create the Canvas

The Canvas is a React component that renders the World state with theme support.

```typescript
// src/core/game/mygame/MyGameCanvas.tsx

import { useEffect, useState } from 'react';
import { MyGameWorld } from './MyGameWorld';
import { RenderTheme, defaultTheme } from '../../../infrastructure/themes';

interface MyGameCanvasProps {
  world: MyGameWorld;
  theme?: RenderTheme;
  className?: string;
  animationDuration?: number;
}

export function MyGameCanvas({
  world,
  theme = defaultTheme,
  className = '',
  animationDuration = 300,
}: MyGameCanvasProps) {
  const [, forceUpdate] = useState({});

  // Subscribe to world changes
  useEffect(() => {
    const unsubscribe = world.onChange(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, [world]);

  const state = world.getState();

  return (
    <div className={`relative bg-white rounded-lg p-4 ${className}`}>
      <div>Score: {state.score}</div>
      <div>Position: ({state.position.x}, {state.position.y})</div>
      {state.isComplete && <div className="text-green-500">Complete!</div>}
    </div>
  );
}
```

---

### Step 5: Export Module

```typescript
// src/core/game/mygame/index.ts

export { MyGameWorld } from './MyGameWorld';
export type { MyGameState } from './MyGameWorld';

export { MyGameVM } from './MyGameVM';
export type { MyGameVMConfig } from './MyGameVM';

export { MyGameCanvas } from './MyGameCanvas';

// Command definitions (for BlockEditor, CodeGenerator)
export { MYGAME_COMMANDS, MYGAME_CONDITIONS, MYGAME_SENSORS, MYGAME_COLORS } from './commands';
export type { CommandDefinition, ConditionDefinition, ArgType } from './commands';
```

Update the main game exports:

```typescript
// src/core/game/index.ts

// Maze Game
export { MazeWorld, MazeVM, MazeCanvas } from './maze';
export type { Direction, CellType, Position, PlayerState, MazeLevel, MazeVMConfig } from './maze';

// Turtle Graphics Game
export { TurtleWorld, TurtleVM, TurtleCanvas } from './turtle';
export type { TurtleState, Line, Point, TurtleVMConfig } from './turtle';

// My Game (add this)
export { MyGameWorld, MyGameVM, MyGameCanvas } from './mygame';
export type { MyGameState, MyGameVMConfig } from './mygame';
```

---

### Step 6: Create Levels

Levels are defined as TypeScript files in `levels/` folder:

```typescript
// src/core/game/mygame/levels/types.ts

export interface MyGameLevelData {
  id: string;
  name: string;
  description: string;
  // Level-specific data...
  availableCommands: string[];
  availableConditions: string[];
  winCondition: string;
  hints: string[];
}
```

```typescript
// src/core/game/mygame/levels/level01.ts

import type { MyGameLevelData } from './types';

export const level01: MyGameLevelData = {
  id: 'mygame-01',
  name: 'First Level',
  description: 'Learn the basics',
  availableCommands: ['doAction'],
  availableConditions: ['isReady'],
  winCondition: 'getScore() >= 50',
  hints: ['Use doAction to increase score'],
};
```

```typescript
// src/core/game/mygame/levels/index.ts

import { level01 } from './level01';
import { level02 } from './level02';

export const MYGAME_LEVELS = [level01, level02];
export type { MyGameLevelData } from './types';
```

---

## Best Practices

1. **Single source of truth** - Commands defined once in `commands.ts`
2. **Keep World pure** - No React, no async, no side effects
3. **Use onChange pattern** - Let Canvas react to state changes
4. **Support themes** - Use RenderTheme for visual customization
5. **Reset properly** - Restore initial state on code re-run
6. **Immutable access** - Return copies from getters
7. **Type everything** - Full TypeScript types for safety

---

## Checklist for New Games

- [ ] Create `commands.ts` with command/condition/sensor definitions
- [ ] Create `MyGameWorld.ts` with state and methods
- [ ] Create `MyGameVM.ts` with command registration
- [ ] Create `MyGameCanvas.tsx` with rendering logic
- [ ] Create `index.ts` exports
- [ ] Create `levels/` folder with TypeScript level files
- [ ] Update `src/core/game/index.ts` with exports
- [ ] Add translations for commands in `i18n/translations.ts`
- [ ] Update BlockEditor to support new game type

---

*See also: [Language Design](./language.md)*
