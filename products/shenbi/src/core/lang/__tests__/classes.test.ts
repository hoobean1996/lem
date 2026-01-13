/**
 * Class Tests
 *
 * Comprehensive tests for MiniPython class features:
 * - Class definition
 * - Constructor (__init__)
 * - Instance creation
 * - Member access (self.x)
 * - Method calls
 */

import { describe, it, expect } from 'vitest';
import { VM } from '../vm';
import { compile, compileToIR } from '../index';

// Helper to create world state from grid strings (for testing)
type Direction = 'up' | 'down' | 'left' | 'right';
function createWorldState(gridStrings: string[]) {
  const height = gridStrings.length;
  const width = gridStrings[0]?.length ?? 0;

  const charToCell: Record<string, string> = {
    '#': 'wall',
    '.': 'empty',
    '*': 'star',
    G: 'goal',
    '>': 'empty',
    '<': 'empty',
    '^': 'empty',
    v: 'empty',
  };

  const charToDirection: Record<string, Direction> = {
    '>': 'right',
    '<': 'left',
    '^': 'up',
    v: 'down',
  };

  let playerX = 0;
  let playerY = 0;
  let playerDirection: Direction = 'right';

  const grid: string[][] = [];

  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    const line = gridStrings[y];

    for (let x = 0; x < width; x++) {
      const char = line[x] || '.';
      const cellType = charToCell[char] ?? 'empty';
      row.push(cellType);

      if (charToDirection[char]) {
        playerX = x;
        playerY = y;
        playerDirection = charToDirection[char];
      }
    }
    grid.push(row);
  }

  return {
    x: playerX,
    y: playerY,
    direction: playerDirection,
    collected: 0,
    grid,
    width,
    height,
  };
}

// Run with bytecode VM and return output
function runVM(code: string): string[] {
  const prints: string[] = [];
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();

  // Register print to capture output
  vm.registerCommand('print', (args) => prints.push(String(args[0])));
  vm.registerCommand('打印', (args) => prints.push(String(args[0])));

  vm.load(program);
  while (!vm.step().done) {}
  return prints;
}

// Run and get the final stack value
function runVMGetResult(code: string): unknown {
  const ast = compile(code);
  const program = compileToIR(ast);
  const vm = new VM();
  vm.load(program);
  while (!vm.step().done) {}
  return vm.getState().stack[0];
}

// Register maze native commands for testing
// These are normally registered by MazeVM but tests use bare VM
type Direction = 'up' | 'down' | 'left' | 'right';
interface MazeWorldState {
  x: number;
  y: number;
  direction: Direction;
  collected: number;
  grid: string[][];
  width: number;
  height: number;
}

function registerMazeCommands(vm: VM, worldState: MazeWorldState) {
  const offsets: Record<Direction, [number, number]> = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };

  const turnLeftMap: Record<Direction, Direction> = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up',
  };

  const turnRightMap: Record<Direction, Direction> = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up',
  };

  // Helper to check if cell is blocked
  const getCell = (x: number, y: number): string => {
    if (x < 0 || x >= worldState.width || y < 0 || y >= worldState.height) {
      return 'wall';
    }
    return worldState.grid[y][x];
  };

  // Auto-collect stars when stepping on them
  const autoCollect = () => {
    const cell = getCell(worldState.x, worldState.y);
    if (cell === 'star') {
      worldState.grid[worldState.y][worldState.x] = 'empty';
      worldState.collected++;
    }
  };

  // Movement commands (with return values)
  const forwardCmd = () => {
    const [dx, dy] = offsets[worldState.direction];
    const newX = worldState.x + dx;
    const newY = worldState.y + dy;
    if (getCell(newX, newY) === 'wall') {
      return false;
    }
    worldState.x = newX;
    worldState.y = newY;
    autoCollect();
    return true;
  };

  const backwardCmd = () => {
    const [dx, dy] = offsets[worldState.direction];
    const newX = worldState.x - dx;
    const newY = worldState.y - dy;
    if (getCell(newX, newY) === 'wall') {
      return false;
    }
    worldState.x = newX;
    worldState.y = newY;
    autoCollect();
    return true;
  };

  const turnLeftCmd = () => {
    worldState.direction = turnLeftMap[worldState.direction];
  };

  const turnRightCmd = () => {
    worldState.direction = turnRightMap[worldState.direction];
  };

  const collectCmd = () => {
    if (worldState.grid[worldState.y][worldState.x] === 'star') {
      worldState.grid[worldState.y][worldState.x] = 'empty';
      worldState.collected++;
      return true;
    }
    return false;
  };

  // Sensors
  const frontBlockedCmd = () => {
    const [dx, dy] = offsets[worldState.direction];
    return getCell(worldState.x + dx, worldState.y + dy) === 'wall';
  };

  const frontClearCmd = () => !frontBlockedCmd();

  const atGoalCmd = () => getCell(worldState.x, worldState.y) === 'goal';

  const hasStarCmd = () => getCell(worldState.x, worldState.y) === 'star';

  const remainingStarsCmd = () => {
    let count = 0;
    for (const row of worldState.grid) {
      for (const cell of row) {
        if (cell === 'star') count++;
      }
    }
    return count;
  };

  const collectedCountCmd = () => worldState.collected;

  // Register commands (English)
  vm.registerCommand('forward', forwardCmd);
  vm.registerCommand('backward', backwardCmd);
  vm.registerCommand('turnLeft', turnLeftCmd);
  vm.registerCommand('turnRight', turnRightCmd);
  vm.registerCommand('collect', collectCmd);
  vm.registerCommand('frontBlocked', frontBlockedCmd);
  vm.registerCommand('frontClear', frontClearCmd);
  vm.registerCommand('atGoal', atGoalCmd);
  vm.registerCommand('hasStar', hasStarCmd);
  vm.registerCommand('remainingStars', remainingStarsCmd);
  vm.registerCommand('collectedCount', collectedCountCmd);

  // Register commands (Chinese)
  vm.registerCommand('前进', forwardCmd);
  vm.registerCommand('后退', backwardCmd);
  vm.registerCommand('左转', turnLeftCmd);
  vm.registerCommand('右转', turnRightCmd);
  vm.registerCommand('收集', collectCmd);
  vm.registerCommand('前方有墙', frontBlockedCmd);
  vm.registerCommand('前方无墙', frontClearCmd);
  vm.registerCommand('到达终点', atGoalCmd);
  vm.registerCommand('有星星', hasStarCmd);
  vm.registerCommand('剩余星星', remainingStarsCmd);
  vm.registerCommand('已收集', collectedCountCmd);
}

describe('Classes', () => {
  describe('Basic Class Definition', () => {
    it('defines an empty class', () => {
      const code = `
class Empty:
  pass
`;
      // Should not throw
      runVM(code);
    });

    it('defines a class with __init__', () => {
      const code = `
class Point:
  def __init__(self, x, y):
    self.x = x
    self.y = y

p = Point(3, 4)
print(p.x)
print(p.y)
`;
      expect(runVM(code)).toEqual(['3', '4']);
    });
  });

  describe('Instance Creation', () => {
    it('creates instance with constructor arguments', () => {
      const code = `
class Counter:
  def __init__(self, start):
    self.value = start

c = Counter(10)
print(c.value)
`;
      expect(runVM(code)).toEqual(['10']);
    });

    it('creates multiple instances independently', () => {
      const code = `
class Box:
  def __init__(self, val):
    self.val = val

a = Box(1)
b = Box(2)
print(a.val)
print(b.val)
`;
      expect(runVM(code)).toEqual(['1', '2']);
    });
  });

  describe('Member Access', () => {
    it('reads instance members', () => {
      const code = `
class Point:
  def __init__(self, x, y):
    self.x = x
    self.y = y

p = Point(5, 10)
print(p.x + p.y)
`;
      expect(runVM(code)).toEqual(['15']);
    });

    it('modifies instance members', () => {
      const code = `
class Counter:
  def __init__(self, start):
    self.value = start

c = Counter(0)
c.value = 42
print(c.value)
`;
      expect(runVM(code)).toEqual(['42']);
    });
  });

  describe('Methods', () => {
    it('calls simple method', () => {
      const code = `
class Greeter:
  def __init__(self, name):
    self.name = name

  def greet(self):
    print(self.name)

g = Greeter("World")
g.greet()
`;
      expect(runVM(code)).toEqual(['World']);
    });

    it('calls method with arguments', () => {
      const code = `
class Calculator:
  def __init__(self, base):
    self.base = base

  def add(self, x):
    return self.base + x

calc = Calculator(10)
print(calc.add(5))
`;
      expect(runVM(code)).toEqual(['15']);
    });

    it('calls method that modifies state', () => {
      const code = `
class Counter:
  def __init__(self):
    self.count = 0

  def increment(self):
    self.count = self.count + 1

c = Counter()
c.increment()
c.increment()
c.increment()
print(c.count)
`;
      expect(runVM(code)).toEqual(['3']);
    });

    it('chains method calls', () => {
      const code = `
class Value:
  def __init__(self, n):
    self.n = n

  def double(self):
    self.n = self.n * 2
    return self

  def add(self, x):
    self.n = self.n + x
    return self

v = Value(5)
v.double().add(3)
print(v.n)
`;
      expect(runVM(code)).toEqual(['13']);
    });
  });

  describe('Complex Scenarios', () => {
    it('simulates a simple game world', () => {
      const code = `
class Player:
  def __init__(self, x, y):
    self.x = x
    self.y = y

  def move(self, dx, dy):
    self.x = self.x + dx
    self.y = self.y + dy

  def position(self):
    return self.x * 10 + self.y

p = Player(0, 0)
p.move(3, 4)
print(p.position())
`;
      expect(runVM(code)).toEqual(['34']);
    });

    it('handles multiple classes', () => {
      const code = `
class Point:
  def __init__(self, x, y):
    self.x = x
    self.y = y

class Rectangle:
  def __init__(self, p1, p2):
    self.p1 = p1
    self.p2 = p2

  def width(self):
    return self.p2.x - self.p1.x

  def height(self):
    return self.p2.y - self.p1.y

a = Point(0, 0)
b = Point(10, 5)
rect = Rectangle(a, b)
print(rect.width())
print(rect.height())
`;
      expect(runVM(code)).toEqual(['10', '5']);
    });
  });

  describe('Chinese Syntax', () => {
    it('supports Chinese class keyword', () => {
      const code = `
类 计数器:
  定义 __init__(self, 初始值):
    self.值 = 初始值

  定义 增加(self):
    self.值 = self.值 + 1

c = 计数器(0)
c.增加()
c.增加()
打印(c.值)
`;
      expect(runVM(code)).toEqual(['2']);
    });
  });

  describe('Shared State Pattern', () => {
    it('can inject JS object as global and modify it from MiniPython', () => {
      const code = `
world.x = 10
world.y = 20
world.name = "test"
`;
      const ast = compile(code);
      const program = compileToIR(ast);
      const vm = new VM();

      // Inject shared state object
      const sharedState: Record<string, unknown> = {
        x: 0,
        y: 0,
        name: '',
      };
      vm.load(program);
      vm.setGlobal('world', sharedState);

      // Run MiniPython code
      while (!vm.step().done) {}

      // Verify TypeScript can see the changes
      expect(sharedState.x).toBe(10);
      expect(sharedState.y).toBe(20);
      expect(sharedState.name).toBe('test');
    });

    it('can read injected JS object properties from MiniPython', () => {
      const code = `
print(world.x + world.y)
print(world.name)
`;
      const prints: string[] = [];
      const ast = compile(code);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Inject shared state with initial values
      const sharedState = {
        x: 5,
        y: 3,
        name: 'hello',
      };
      vm.load(program);
      vm.setGlobal('world', sharedState);

      while (!vm.step().done) {}

      expect(prints).toEqual(['8', 'hello']);
    });

    it('simulates MazeWorld with shared state', () => {
      const stdlib = `
# Direction offsets
OFFSETS = {'up': [0, -1], 'down': [0, 1], 'left': [-1, 0], 'right': [1, 0]}

def getCell(x, y):
    if x < 0 or y < 0:
        return 'wall'
    if y >= len(world.grid) or x >= len(world.grid[0]):
        return 'wall'
    return world.grid[y][x]

def moveForward():
    offset = OFFSETS[world.direction]
    newX = world.x + offset[0]
    newY = world.y + offset[1]
    if getCell(newX, newY) == 'wall':
        return False
    world.x = newX
    world.y = newY
    return True

def moveBackward():
    offset = OFFSETS[world.direction]
    newX = world.x - offset[0]
    newY = world.y - offset[1]
    if getCell(newX, newY) == 'wall':
        return False
    world.x = newX
    world.y = newY
    return True

def turnLeft():
    turns = {'up': 'left', 'left': 'down', 'down': 'right', 'right': 'up'}
    world.direction = turns[world.direction]

def turnRight():
    turns = {'up': 'right', 'right': 'down', 'down': 'left', 'left': 'up'}
    world.direction = turns[world.direction]
`;

      const userCode = `
# User's program
moveForward()
moveForward()
turnRight()
moveForward()
print(world.x)
print(world.y)
print(world.direction)
`;

      const prints: string[] = [];
      const ast = compile(stdlib + userCode);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Inject world state - simple 5x5 grid with empty cells
      const grid = [
        ['.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.'],
      ];
      const worldState = {
        x: 0,
        y: 2, // Start in middle-left
        direction: 'right',
        grid: grid,
      };
      vm.load(program);
      vm.setGlobal('world', worldState);

      while (!vm.step().done) {}

      // After: forward, forward, turnRight, forward
      // x: 0 -> 1 -> 2, then turn right (now facing down), move forward
      // y: 2 -> 2 -> 2, then 2 -> 3
      expect(prints).toEqual(['2', '3', 'down']);
      expect(worldState.x).toBe(2);
      expect(worldState.y).toBe(3);
      expect(worldState.direction).toBe('down');
    });

    it('uses native maze commands with createWorldState helper', () => {
      const userCode = `
# Navigate through maze
while not atGoal():
    if frontBlocked():
        turnRight()
    else:
        forward()
`;

      const prints: string[] = [];
      const ast = compile(userCode);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Create world state from grid strings
      // Simple corridor: player at left, goal at right
      const worldState = createWorldState(['########', '#>....G#', '########']);

      // Register native maze commands
      registerMazeCommands(vm, worldState);

      vm.load(program);
      vm.setGlobal('world', worldState);

      while (!vm.step().done) {}

      // Player should be at goal position (6, 1)
      expect(worldState.x).toBe(6);
      expect(worldState.y).toBe(1);
      expect(worldState.direction).toBe('right');
    });

    it('handles star collection with native maze commands', () => {
      const userCode = `
# Collect all stars
forward()
forward()
forward()
print(collectedCount())
print(remainingStars())
`;

      const prints: string[] = [];
      const ast = compile(userCode);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Grid with stars
      const worldState = createWorldState(['#######', '#>*.*G#', '#######']);

      // Register native maze commands
      registerMazeCommands(vm, worldState);

      vm.load(program);
      vm.setGlobal('world', worldState);

      while (!vm.step().done) {}

      // Should have collected 2 stars, 0 remaining
      expect(prints).toEqual(['2', '0']);
      expect(worldState.collected).toBe(2);
    });

    it('handles wall collision with native maze commands', () => {
      const userCode = `
# Try to walk into wall
result = forward()
print(result)
print(world.x)
`;

      const prints: string[] = [];
      const ast = compile(userCode);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Wall directly in front
      const worldState = createWorldState(['###', '#>#', '###']);

      // Register native maze commands
      registerMazeCommands(vm, worldState);

      vm.load(program);
      vm.setGlobal('world', worldState);

      while (!vm.step().done) {}

      // forward() should return false, position unchanged
      expect(prints).toEqual(['false', '1']);
      expect(worldState.x).toBe(1);
    });

    it('uses Chinese commands with native maze commands', () => {
      const userCode = `
前进()
前进()
左转()
前进()
print(world.x)
print(world.y)
print(world.direction)
`;

      const prints: string[] = [];
      const ast = compile(userCode);
      const program = compileToIR(ast);
      const vm = new VM();
      vm.registerCommand('print', (args) => prints.push(String(args[0])));

      // Open area
      const worldState = createWorldState(['........', '.>......', '........', '........']);

      // Register native maze commands
      registerMazeCommands(vm, worldState);

      vm.load(program);
      vm.setGlobal('world', worldState);

      while (!vm.step().done) {}

      // forward, forward (x: 1->2->3), turnLeft (up), forward (y: 1->0)
      expect(prints).toEqual(['3', '0', 'up']);
    });
  });
});
