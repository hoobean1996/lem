/**
 * MazeCanvas Component
 *
 * Renders the maze world with walls, stars, goals, and animated player.
 * Follows the same pattern as TurtleCanvas for consistency.
 */

import { useEffect, useState, useRef } from 'react';
import { MazeWorld, CellType, Direction } from './MazeWorld';
import { RenderTheme, SpriteSource, defaultTheme } from '../../../infrastructure/themes';

interface MazeCanvasProps {
  world: MazeWorld;
  cellSize?: number;
  theme?: RenderTheme;
  className?: string;
  animationDuration?: number;
}

// Track previous player state for animation
interface PlayerAnimState {
  x: number;
  y: number;
  direction: Direction;
}

export function MazeCanvas({
  world,
  cellSize = 52,
  theme = defaultTheme,
  className = '',
  animationDuration = 300,
}: MazeCanvasProps) {
  const [, forceUpdate] = useState({});
  const prevPlayerStateRef = useRef<PlayerAnimState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Subscribe to world changes
  useEffect(() => {
    const unsubscribe = world.onChange(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, [world]);

  // Handle animation when player moves
  const player = world.getPlayer();
  const currentPlayerState: PlayerAnimState = {
    x: player.x,
    y: player.y,
    direction: player.direction,
  };

  useEffect(() => {
    const prev = prevPlayerStateRef.current;
    if (
      prev &&
      (prev.x !== currentPlayerState.x ||
        prev.y !== currentPlayerState.y ||
        prev.direction !== currentPlayerState.direction)
    ) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerState.x, currentPlayerState.y, currentPlayerState.direction, animationDuration]);

  // Update previous state after render
  useEffect(() => {
    prevPlayerStateRef.current = currentPlayerState;
  });

  const { grid: gridStyle } = theme;
  const gap = gridStyle.gap;
  const padding = 8;
  const width = world.getWidth();
  const height = world.getHeight();

  const totalWidth = padding * 2 + width * cellSize + (width - 1) * gap;
  const totalHeight = padding * 2 + height * cellSize + (height - 1) * gap;

  // Get rotation for direction (for rotation-type themes)
  const getRotation = (dir: Direction): number => {
    if (theme.directionIndicator.type === 'rotation') {
      const rotations = theme.directionIndicator.rotations;
      if (rotations) {
        return rotations[dir] ?? 0;
      }
    }
    return 0;
  };

  // Calculate pixel position for a cell
  const getPixelPosition = (x: number, y: number) => ({
    left: padding + x * (cellSize + gap),
    top: padding + y * (cellSize + gap),
  });

  const playerPos = getPixelPosition(player.x, player.y);
  const playerRotation = getRotation(player.direction);

  return (
    <div
      className={`relative rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: gridStyle.gridBackground,
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* Grid cells */}
      <div
        className="absolute inset-0 grid"
        style={{
          padding: padding,
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: height }).map((_, y) =>
          Array.from({ length: width }).map((_, x) => {
            const cell = world.getCell(x, y);
            const isAltCell = (x + y) % 2 === 1;
            const cellBg =
              isAltCell && gridStyle.cellBackgroundAlt
                ? gridStyle.cellBackgroundAlt
                : gridStyle.cellBackground;

            return (
              <div
                key={`${x},${y}`}
                className="relative flex items-center justify-center"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cellBg,
                  borderRadius: gridStyle.cellBorderRadius,
                }}
              >
                <CellContent cell={cell} cellSize={cellSize} theme={theme} />
              </div>
            );
          })
        )}
      </div>

      {/* Player (animated, absolute positioned) */}
      <div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          width: cellSize,
          height: cellSize,
          left: playerPos.left,
          top: playerPos.top,
          zIndex: 100,
          transition: isAnimating
            ? `left ${animationDuration}ms ease-out, top ${animationDuration}ms ease-out`
            : 'none',
        }}
      >
        {/* Direction arrow as the player indicator */}
        {theme.directionIndicator.type === 'arrow' && theme.directionIndicator.arrows ? (
          <SpriteRenderer
            sprite={theme.directionIndicator.arrows[player.direction]}
            size={cellSize * 0.6}
          />
        ) : (
          /* Rotation-based player sprite (for themes like space) */
          <div
            style={{
              transform: `rotate(${playerRotation}deg)`,
              transition: isAnimating ? `transform ${animationDuration}ms ease-out` : 'none',
            }}
          >
            <SpriteRenderer
              sprite={theme.entities.player?.sprite}
              size={cellSize * (theme.entities.player?.scale ?? 0.7)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Cell content renderer
interface CellContentProps {
  cell: CellType;
  cellSize: number;
  theme: RenderTheme;
}

function CellContent({ cell, cellSize, theme }: CellContentProps) {
  const entityType = cellTypeToEntityType(cell);
  if (!entityType) return null;

  const visual = theme.entities[entityType];
  if (!visual) return null;

  const scale = visual.scale ?? 0.7;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: visual.zIndex ?? 0 }}
    >
      <SpriteRenderer sprite={visual.sprite} size={cellSize * scale} />
    </div>
  );
}

// Map cell type to theme entity type
function cellTypeToEntityType(cell: CellType): string | null {
  switch (cell) {
    case 'wall':
      return 'wall';
    case 'star':
      return 'star';
    case 'goal':
      return 'goal';
    default:
      return null;
  }
}

// Sprite renderer (reused from GridRenderer)
interface SpriteRendererProps {
  sprite?: SpriteSource;
  size: number;
}

function SpriteRenderer({ sprite, size }: SpriteRendererProps) {
  if (!sprite) return null;

  switch (sprite.type) {
    case 'emoji':
      return (
        <span className="select-none leading-none" style={{ fontSize: size }}>
          {sprite.value}
        </span>
      );

    case 'image':
      return (
        <img
          src={sprite.url}
          alt=""
          className="select-none object-contain"
          style={{ width: size, height: size }}
          draggable={false}
        />
      );

    case 'color':
      return (
        <div
          className="rounded"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            backgroundColor: sprite.value,
          }}
        />
      );

    default:
      return null;
  }
}
