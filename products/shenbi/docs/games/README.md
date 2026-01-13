# Shenbi Games - Level Design Documentation

## Overview

This documentation describes the educational design and learning progression for each game adventure in Shenbi.

## Game Adventures

| Adventure | Game Type | Levels | Target Age | Key Concepts |
|-----------|-----------|--------|------------|--------------|
| [Maze Adventure](./maze.md) | Navigation | 10 | 5-8 | Sequences, Loops, Conditionals |
| [Turtle Adventure](./turtle.md) | Drawing | 10 | 5-8 | Geometry, Loops, Variables |
| [Mini Crafter](./terraria.md) | Crafting | 5 | 6-10 | Planning, Resource Management |

## Educational Philosophy

### Progressive Learning
Each adventure follows a carefully designed progression:
1. **Foundation** (Levels 1-3): Basic commands, sequential thinking
2. **Patterns** (Levels 4-5): Introduction to loops
3. **Logic** (Levels 6-7): Conditionals and sensors
4. **Mastery** (Levels 8-10): Combined concepts

### Concept Mapping

| Concept | Maze | Turtle | Terraria |
|---------|------|--------|----------|
| Sequential Commands | L1-3 | L1-4 | L1-3 |
| Loops (repeat) | L4-5 | L5-6 | L5 |
| Conditionals (if) | L6-7 | - | Future |
| While Loops | L8-9 | - | Future |
| Variables | - | L9 | Future |
| Functions | - | - | Future |

### Premium Content Strategy

- **Free Levels**: First 5 levels of Maze Adventure teach core concepts
- **Premium Levels**: Advanced concepts (conditionals, while loops) require subscription
- **Turtle/Terraria**: Currently mixed free/premium

## Level Design Template

When creating new levels, include:

```json
{
  "id": "unique-id",
  "name": "Level Name",
  "description": "One-line description for students",
  "grid": ["..."],
  "availableCommands": ["move", "turn"],
  "availableSensors": ["frontBlocked"],
  "availableBlocks": ["command", "repeat", "if"],
  "winCondition": "atGoal() and collectedCount() >= 3",
  "failCondition": "stepCount > 30",
  "teachingGoal": "What students learn (internal use)",
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "requiredTier": "free|premium"
}
```

## Quality Checklist

Before publishing a level:

- [ ] **One New Concept**: Level introduces exactly one new idea
- [ ] **Builds on Prior**: Uses previously learned commands
- [ ] **Clear Goal**: Win condition is obvious from description
- [ ] **Appropriate Difficulty**: Step limit allows some trial-and-error
- [ ] **Good Hints**: 3 progressive hints guide without revealing solution
- [ ] **Visual Clarity**: Grid layout clearly shows intended path
- [ ] **Tested Solution**: At least one working solution verified

## Content Review Process

1. Design level following template
2. Test with target age group
3. Adjust difficulty based on feedback
4. Document in corresponding game .md file
5. Add to level index JSON

## Future Games

Planned adventures:
- **Math Quest**: Number operations, equations
- **Story Builder**: Variables, string manipulation
- **Robot Factory**: Functions, modularity
