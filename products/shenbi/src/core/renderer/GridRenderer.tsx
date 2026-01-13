import { useMemo, useRef, useEffect, useState } from 'react';
import { Entity, Direction } from '../engine';
import { RenderTheme, SpriteSource, defaultTheme } from '../../infrastructure/themes';

interface GridRendererProps {
  width: number;
  height: number;
  entities: Entity[];
  cellSize?: number;
  theme?: RenderTheme;
  className?: string;
  animationDuration?: number;
}

// Track previous state for animation
interface EntityAnimState {
  x: number;
  y: number;
  direction?: Direction;
}

export function GridRenderer({
  width,
  height,
  entities,
  cellSize = 48,
  theme = defaultTheme,
  className = '',
  animationDuration = 500,
}: GridRendererProps) {
  const { grid: gridStyle } = theme;
  const gap = gridStyle.gap;
  const padding = 8; // p-2 = 8px

  // Track previous positions for animation
  const prevStatesRef = useRef<Map<string, EntityAnimState>>(new Map());
  const [animatingEntities, setAnimatingEntities] = useState<Map<string, EntityAnimState>>(
    new Map()
  );

  // Separate actors (animated) from static entities
  const { staticEntities, actors } = useMemo(() => {
    const staticEnts: Entity[] = [];
    const actorEnts: Entity[] = [];

    for (const entity of entities) {
      const isActor = entity.components.some((c) => c.type === 'Actor');
      if (isActor) {
        actorEnts.push(entity);
      } else {
        staticEnts.push(entity);
      }
    }

    return { staticEntities: staticEnts, actors: actorEnts };
  }, [entities]);

  // Group static entities by position
  const grid = useMemo(() => {
    const cells: Map<string, Entity[]> = new Map();

    for (const entity of staticEntities) {
      const key = `${entity.position.x},${entity.position.y}`;
      if (!cells.has(key)) {
        cells.set(key, []);
      }
      cells.get(key)!.push(entity);
    }

    // Sort by zIndex
    for (const [, cellEntities] of cells) {
      cellEntities.sort((a, b) => {
        const aVisual = theme.entities[a.type];
        const bVisual = theme.entities[b.type];
        return (aVisual?.zIndex ?? 0) - (bVisual?.zIndex ?? 0);
      });
    }

    return cells;
  }, [staticEntities, theme]);

  // Handle animation when actor positions change
  useEffect(() => {
    const newAnimating = new Map<string, EntityAnimState>();

    for (const actor of actors) {
      const prevState = prevStatesRef.current.get(actor.id);
      const currentState: EntityAnimState = {
        x: actor.position.x,
        y: actor.position.y,
        direction: actor.state.direction as Direction,
      };

      if (
        prevState &&
        (prevState.x !== currentState.x ||
          prevState.y !== currentState.y ||
          prevState.direction !== currentState.direction)
      ) {
        // Position or direction changed, animate from previous
        newAnimating.set(actor.id, prevState);
      }

      // Update previous state
      prevStatesRef.current.set(actor.id, currentState);
    }

    if (newAnimating.size > 0) {
      setAnimatingEntities(newAnimating);

      // Clear animation state after duration
      const timer = setTimeout(() => {
        setAnimatingEntities(new Map());
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [actors, animationDuration]);

  // Calculate pixel position for an entity
  const getPixelPosition = (x: number, y: number) => ({
    left: padding + x * (cellSize + gap),
    top: padding + y * (cellSize + gap),
  });

  const totalWidth = padding * 2 + width * cellSize + (width - 1) * gap;
  const totalHeight = padding * 2 + height * cellSize + (height - 1) * gap;

  return (
    <div
      className={`relative rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: gridStyle.gridBackground,
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* Grid cells (background) */}
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
            const key = `${x},${y}`;
            const cellEntities = grid.get(key) ?? [];

            const isAltCell = (x + y) % 2 === 1;
            const cellBg =
              isAltCell && gridStyle.cellBackgroundAlt
                ? gridStyle.cellBackgroundAlt
                : gridStyle.cellBackground;

            return (
              <div
                key={key}
                className="relative flex items-center justify-center"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cellBg,
                  borderRadius: gridStyle.cellBorderRadius,
                }}
              >
                {/* Static entities rendered in grid cells */}
                {cellEntities.map((entity) => (
                  <StaticEntitySprite
                    key={entity.id}
                    entity={entity}
                    cellSize={cellSize}
                    theme={theme}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Actors (animated, absolute positioned) */}
      {actors.map((actor) => {
        const animState = animatingEntities.get(actor.id);
        const pos = getPixelPosition(actor.position.x, actor.position.y);

        return (
          <AnimatedActorSprite
            key={actor.id}
            entity={actor}
            cellSize={cellSize}
            theme={theme}
            left={pos.left}
            top={pos.top}
            animatingFrom={animState}
            animationDuration={animationDuration}
          />
        );
      })}
    </div>
  );
}

// Static entity sprite (walls, stars, goals)
interface StaticEntitySpriteProps {
  entity: Entity;
  cellSize: number;
  theme: RenderTheme;
}

function StaticEntitySprite({ entity, cellSize, theme }: StaticEntitySpriteProps) {
  const visual = theme.entities[entity.type];

  if (!visual) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center text-xs text-gray-600"
        style={{ fontSize: cellSize * 0.25 }}
      >
        {entity.type}
      </div>
    );
  }

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

// Animated actor sprite (player)
interface AnimatedActorSpriteProps {
  entity: Entity;
  cellSize: number;
  theme: RenderTheme;
  left: number;
  top: number;
  animatingFrom?: EntityAnimState;
  animationDuration: number;
}

function AnimatedActorSprite({
  entity,
  cellSize,
  theme,
  left,
  top,
  animatingFrom,
  animationDuration,
}: AnimatedActorSpriteProps) {
  const visual = theme.entities[entity.type];
  const direction = entity.state.direction as Direction;
  const scale = visual?.scale ?? 0.7;
  const { directionIndicator } = theme;

  // Calculate rotation
  const getRotation = (dir: Direction) => {
    if (directionIndicator.type === 'rotation') {
      return directionIndicator.rotations?.[dir] ?? 0;
    }
    return 0;
  };

  const currentRotation = getRotation(direction);

  // Use CSS transition for smooth animation
  const isAnimating = !!animatingFrom;

  if (!visual) {
    return null;
  }

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        width: cellSize,
        height: cellSize,
        left,
        top,
        zIndex: 100,
        transition: isAnimating
          ? `left ${animationDuration}ms ease-out, top ${animationDuration}ms ease-out`
          : 'none',
      }}
    >
      <div
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: isAnimating ? `transform ${animationDuration}ms ease-out` : 'none',
        }}
      >
        <SpriteRenderer sprite={visual.sprite} size={cellSize * scale} />
      </div>
    </div>
  );
}

interface SpriteRendererProps {
  sprite: SpriteSource;
  size: number;
}

function SpriteRenderer({ sprite, size }: SpriteRendererProps) {
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
