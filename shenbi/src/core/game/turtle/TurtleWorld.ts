/**
 * Turtle World
 *
 * A simple 2D drawing world for turtle graphics.
 * Independent of the main game engine - demonstrates VM flexibility.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  from: Point;
  to: Point;
  color: string;
  width: number;
}

export interface TurtleState {
  x: number;
  y: number;
  angle: number; // degrees, 0 = right, 90 = up
  penDown: boolean;
  penColor: string;
  penWidth: number;
}

/**
 * TurtleWorld - A canvas-based drawing world
 */
export class TurtleWorld {
  private width: number;
  private height: number;
  private turtle: TurtleState;
  private lines: Line[] = [];
  private stepSize: number = 20; // pixels per "forward" unit
  private listeners: Set<() => void> = new Set();

  constructor(width: number = 400, height: number = 400) {
    this.width = width;
    this.height = height;
    this.turtle = {
      x: width / 2,
      y: height / 2,
      angle: 0, // facing right
      penDown: true,
      penColor: '#000000',
      penWidth: 2,
    };
  }

  // ============ State Access ============

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getTurtle(): TurtleState {
    return { ...this.turtle };
  }

  getLines(): Line[] {
    return [...this.lines];
  }

  // ============ Commands ============

  forward(distance: number = 1): void {
    const radians = (this.turtle.angle * Math.PI) / 180;
    const dx = Math.cos(radians) * distance * this.stepSize;
    const dy = -Math.sin(radians) * distance * this.stepSize; // negative because canvas Y is inverted

    const from = { x: this.turtle.x, y: this.turtle.y };
    this.turtle.x += dx;
    this.turtle.y += dy;
    const to = { x: this.turtle.x, y: this.turtle.y };

    if (this.turtle.penDown) {
      this.lines.push({
        from,
        to,
        color: this.turtle.penColor,
        width: this.turtle.penWidth,
      });
    }

    this.notifyListeners();
  }

  backward(distance: number = 1): void {
    this.forward(-distance);
  }

  turnLeft(degrees: number = 90): void {
    this.turtle.angle = (this.turtle.angle + degrees) % 360;
    this.notifyListeners();
  }

  turnRight(degrees: number = 90): void {
    this.turtle.angle = (this.turtle.angle - degrees + 360) % 360;
    this.notifyListeners();
  }

  penUp(): void {
    this.turtle.penDown = false;
    this.notifyListeners();
  }

  penDown(): void {
    this.turtle.penDown = true;
    this.notifyListeners();
  }

  setColor(color: string): void {
    this.turtle.penColor = color;
    this.notifyListeners();
  }

  setWidth(width: number): void {
    this.turtle.penWidth = width;
    this.notifyListeners();
  }

  // ============ Sensors ============

  isPenDown(): boolean {
    return this.turtle.penDown;
  }

  getX(): number {
    return Math.round(this.turtle.x);
  }

  getY(): number {
    return Math.round(this.turtle.y);
  }

  getAngle(): number {
    return this.turtle.angle;
  }

  // ============ Control ============

  reset(): void {
    this.turtle = {
      x: this.width / 2,
      y: this.height / 2,
      angle: 0,
      penDown: true,
      penColor: '#000000',
      penWidth: 2,
    };
    this.lines = [];
    this.notifyListeners();
  }

  clear(): void {
    this.lines = [];
    this.notifyListeners();
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

  // ============ Shared State (for MiniPython VM) ============

  /**
   * Export current state as a plain object for MiniPython VM
   */
  toSharedState(): SharedTurtleState {
    return {
      x: this.turtle.x,
      y: this.turtle.y,
      angle: this.turtle.angle,
      penDown: this.turtle.penDown,
      penColor: this.turtle.penColor,
      penWidth: this.turtle.penWidth,
      stepSize: this.stepSize,
      width: this.width,
      height: this.height,
      lines: this.lines.map((l) => ({
        fromX: l.from.x,
        fromY: l.from.y,
        toX: l.to.x,
        toY: l.to.y,
        color: l.color,
        width: l.width,
      })),
    };
  }

  /**
   * Sync state from the shared state object modified by MiniPython
   */
  syncFromSharedState(state: SharedTurtleState): void {
    this.turtle.x = state.x;
    this.turtle.y = state.y;
    this.turtle.angle = state.angle;
    this.turtle.penDown = state.penDown;
    this.turtle.penColor = state.penColor;
    this.turtle.penWidth = state.penWidth;
    // Sync lines from shared state
    this.lines = state.lines.map((l) => ({
      from: { x: l.fromX, y: l.fromY },
      to: { x: l.toX, y: l.toY },
      color: l.color,
      width: l.width,
    }));
    this.notifyListeners();
  }
}

/**
 * Shared turtle state for MiniPython VM
 */
export interface SharedTurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  penColor: string;
  penWidth: number;
  stepSize: number;
  width: number;
  height: number;
  lines: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
    width: number;
  }>;
}
