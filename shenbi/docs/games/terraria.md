# Mini Crafter Adventure - Level Design Document

## Overview

**Adventure ID:** `terraria-adventure`
**Game Type:** 2D Crafting/Building (Minecraft/Terraria-style)
**Target Age:** 6-10 years
**Complexity:** Easy
**Total Levels:** 5

### Programming Concepts Covered
1. Sequential Commands (Levels 1-3)
2. Multi-step Problem Solving (Level 4)
3. Loops + Planning (Level 5)

### Available Commands
- `moveUp()` / `moveDown()` / `moveLeft()` / `moveRight()` - Grid movement
- `chop()` - Chop tree in front, get wood
- `mine()` - Mine stone/dirt in front
- `craft(item)` - Create items from materials
- `place(block)` - Place blocks in the world
- `equip(tool)` - Equip tools (pickaxe, axe)

### Game Mechanics
- **Inventory System**: Collect and store resources
- **Crafting Recipes**: Combine materials to make items
- **Tool Requirements**: Some blocks need specific tools
- **Gravity**: Platformer-style movement

---

## Level 1: First Steps

### Design
```
........
........
...P....
........
DDDDDDDD
```
Legend: P=Player, D=Dirt, .=Empty

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Sequence - directional movement |
| **Commands** | `move` |
| **Blocks** | command |
| **Win Condition** | None (tutorial) |
| **Step Limit** | - |

### Learning Goal
Introduce directional movement. Unlike maze (forward/turn), terraria uses up/down/left/right.

### How to Complete
```python
moveRight()
moveRight()
moveLeft()
moveUp()
```

### Why This Design
- Open space for free exploration
- No obstacles = zero frustration
- Teaches 4-direction movement model
- Ground (dirt) shows where you can walk

---

## Level 2: Chop Chop!

### Design
```
........
...T....
...P....
........
DDDDDDDD
```
Legend: T=Tree

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Action - resource gathering |
| **Commands** | `move`, `chop` |
| **Blocks** | command |
| **Win Condition** | wood >= 1 |
| **Step Limit** | - |

### Learning Goal
Introduce `chop()` command. Position yourself next to a tree, then chop.

### How to Complete
```python
moveUp()
chop()
```

### Why This Design
- Single tree, directly above player
- Minimal navigation required
- Immediate feedback: tree disappears, inventory shows wood
- Foundation for resource gathering

---

## Level 3: Mining Time

### Design
```
........
...S....
...P....
........
SSSSSSSS
```
Legend: S=Stone

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Action - mining |
| **Commands** | `move`, `mine` |
| **Blocks** | command |
| **Win Condition** | stone >= 1 |
| **Step Limit** | - |

### Learning Goal
Introduce `mine()` command. Similar to chop, but for stone blocks.

### How to Complete
```python
moveUp()
mine()
```

### Why This Design
- Mirrors Level 2 structure (consistent pattern)
- Different action (mine vs chop) for different materials
- Stone ground shows context: "this is a mining world"
- Builds vocabulary: trees=chop, stone=mine

---

## Level 4: Craft a Plank

### Design
```
..T.T...
........
...P....
........
DDDDDDDD
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Multi-step - crafting |
| **Commands** | `move`, `chop`, `craft` |
| **Blocks** | command |
| **Win Condition** | plank >= 1 |
| **Step Limit** | - |

### Learning Goal
Introduce crafting. Gather resources THEN transform them.

### How to Complete
```python
moveUp()
moveUp()
moveLeft()
chop()
craft("plank")
```

### Why This Design
- Two trees = choice (either works)
- Multi-step goal: navigate -> gather -> craft
- Introduces recipe concept: wood -> plank
- Planning required: can't craft without wood

### Crafting Recipe
```
1 wood -> 2 planks
```

---

## Level 5: Build a Bridge

### Design
```
T.T.....
........
P.......
DDD..DDD
SSS..SSS
```
Gap in the middle

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Complex problem - gather, craft, place |
| **Commands** | `move`, `chop`, `craft`, `place` |
| **Blocks** | command, repeat |
| **Win Condition** | x >= 6 (reach right side) |
| **Step Limit** | - |

### Learning Goal
Complete workflow: gather -> craft -> build -> achieve goal.

### How to Complete
```python
# Gather wood
moveUp()
moveUp()
chop()
moveRight()
moveRight()
chop()

# Craft planks
craft("plank")
craft("plank")

# Build bridge
moveDown()
moveRight()
place("plank")
moveRight()
place("plank")
moveRight()
```

### Why This Design
- Gap creates problem: can't just walk across
- Trees provide solution: wood for planks
- Place command builds bridge
- Combines ALL previous concepts
- Loop potential: "repeat 2: chop, moveRight"

---

## Progression Summary

| Level | Concept | Key Learning | Premium |
|-------|---------|--------------|---------|
| 1 | Movement | 4-direction navigation | Free |
| 2 | Actions | chop() for trees | Free |
| 3 | Actions | mine() for stone | Free |
| 4 | Crafting | craft() to make items | Free |
| 5 | Building | place() and complex planning | Free |

## Design Principles

1. **Real-world Metaphor**: Mining/crafting is intuitive from Minecraft familiarity
2. **Progressive Complexity**: Each level adds one new command
3. **Tangible Results**: Inventory shows collected resources
4. **Problem-Solving Focus**: Goals require planning, not just execution
5. **All Free**: Terraria adventure is currently all free (newer adventure)

## Unique to Terraria vs Maze/Turtle

- **Inventory System**: Track collected resources
- **Crafting Recipes**: Transform materials into items
- **Directional Movement**: Up/down/left/right instead of forward/turn
- **World Building**: Place blocks to modify the environment
- **Tool Requirements**: Some actions need specific tools (future levels)

## Future Level Ideas

### Level 6: Craft a Pickaxe
- Goal: Mine diamond (requires stone pickaxe)
- Recipe: 3 planks + 2 sticks = wooden pickaxe
- Recipe: 3 stone + 2 sticks = stone pickaxe

### Level 7: Diamond Hunter
- Goal: Collect diamond
- Diamond needs stone pickaxe to mine
- Multi-step: chop -> craft planks -> craft sticks -> craft pickaxe -> mine

### Level 8: Build a House
- Goal: Build walls around yourself
- Use loops to place many blocks efficiently
- Introduces conditional: "while hasItem('plank'): place"

### Level 9: Underground Adventure
- Goal: Navigate cave, collect treasures
- Use sensors: "blockAt('down')" to check before moving
- Combine mining and building

### Level 10: Master Builder
- Goal: Build a specific structure
- Nested loops for complex patterns
- Creative expression through building
