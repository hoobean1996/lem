# Maze Adventure - Level Design Document

## Overview

**Adventure ID:** `maze-adventure`
**Game Type:** Maze Navigation
**Target Age:** 5-8 years
**Complexity:** Beginner
**Total Levels:** 10

### Programming Concepts Covered
1. Sequential Commands (Levels 1-3)
2. Loops - Repeat (Levels 4-5)
3. Conditionals - If (Levels 6-7)
4. Loops - While (Levels 8-9)
5. Combined Concepts (Level 10)

### Available Commands
- `forward()` / `backward()` - Move one cell
- `turnLeft()` / `turnRight()` - Rotate 90 degrees
- `collect()` - Pick up star at current position

### Available Sensors
- `frontBlocked()` / `frontClear()` - Check wall ahead
- `hasStar()` - Check for star at current position
- `atGoal()` / `notAtGoal()` - Check if at goal

---

## Level 1: First Steps

### Design
```
########
#>...*G#
########
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Sequence - forward movement |
| **Commands** | `move` |
| **Blocks** | command |
| **Stars** | 1 |
| **Step Limit** | 10 |

### Learning Goal
Introduce the most basic command: `forward()`. Students learn that code executes sequentially, one instruction at a time.

### How to Complete
```python
forward()
forward()
forward()
forward()
forward()
```

### Why This Design
- Straight path with no turns = zero cognitive load on navigation
- Single star along the path provides immediate visual feedback
- Short path (5 steps) keeps solution code minimal
- Builds confidence: "I can make the robot move!"

---

## Level 2: Turn Right

### Design
```
#####
#>*.#
#.#.#
#.*.#
#.*G#
#####
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Sequence - turning |
| **Commands** | `move`, `turn` |
| **Blocks** | command |
| **Stars** | 3 |
| **Step Limit** | 15 |

### Learning Goal
Introduce `turnRight()`. Students understand that turning changes direction without moving position.

### How to Complete
```python
forward()
turnRight()
forward()
forward()
forward()
```

### Why This Design
- Simple L-shaped path requires exactly one turn
- Stars placed to encourage forward movement, not experimentation with turns
- Reinforces: turn changes direction, then forward moves in new direction
- Only right turn needed - simpler mental model

---

## Level 3: Left and Right

### Design
```
#######
#>..*.#
####.##
#..*..#
#.#####
#.*..G#
#######
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Sequence - both turns |
| **Commands** | `move`, `turn` |
| **Blocks** | command |
| **Stars** | 3 |
| **Step Limit** | 20 |

### Learning Goal
Master both `turnLeft()` and `turnRight()`. Students can now navigate any path.

### How to Complete
```python
forward()
forward()
forward()
turnRight()
forward()
turnLeft()
forward()
forward()
forward()
turnLeft()
forward()
forward()
forward()
```

### Why This Design
- Zigzag pattern forces use of both turns
- Path is still deterministic - one correct route
- Longer solution prepares students to appreciate loops in next level
- Mental model complete: 4 directions, 2 turn commands

---

## Level 4: Repeat Magic

### Design
```
###########
#>*****.*G#
###########
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Loops - Repeat |
| **Commands** | `move` |
| **Blocks** | command, repeat |
| **Stars** | 6 |
| **Step Limit** | 15 |

### Learning Goal
Introduce the `repeat` block. Students see that loops reduce code repetition.

### How to Complete
```python
repeat 8:
    forward()
```

### Why This Design
- Straight path makes the loop concept obvious
- Contrast with Level 1: same idea, but 8 steps would need 8 forward blocks
- No turns = focus purely on the repeat concept
- Students feel clever: "I did it with just 2 lines!"

---

## Level 5: Square Path

### Design
```
#######
#>*.*G#
#.###.#
#.....#
#.###.#
#*...*#
#######
```

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Loops - nested commands |
| **Commands** | `move`, `turn` |
| **Blocks** | command, repeat |
| **Stars** | 4 |
| **Step Limit** | 25 |

### Learning Goal
Use repeat with multiple commands inside. Recognize repeating patterns in real problems.

### How to Complete
```python
repeat 4:
    forward()
    forward()
    turnRight()
```

### Why This Design
- Square shape = 4 identical sides
- Each side: forward, forward, turn right
- Pattern recognition: "I'm doing the same thing 4 times"
- Bridge from simple repeat to complex loop bodies

---

## Level 6: Wall Detector

### Design
```
#########
#>*...*.#
#######.#
#G....*.#
#########
```

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Conditionals - If |
| **Commands** | `move`, `turn` |
| **Sensors** | `frontBlocked` |
| **Blocks** | command, repeat, if |
| **Stars** | 3 |
| **Step Limit** | 25 |

### Learning Goal
Introduce conditionals with `if frontBlocked()`. Robot can now make decisions.

### How to Complete
```python
repeat 12:
    if frontBlocked():
        turnRight()
    forward()
```

### Why This Design
- Simple L-path with one wall to detect
- Sensor provides binary decision: blocked or not
- `if` without `else` - simpler mental model
- First "smart" program - robot adapts to environment

---

## Level 7: Star Sensor

### Design
```
########
#>...*.#
#.####.#
#.*..*.#
#.####.#
#.....*#
#.####G#
########
```

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Conditionals - hasStar sensor |
| **Commands** | `move`, `turn`, `collect` |
| **Sensors** | `frontBlocked`, `hasStar` |
| **Blocks** | command, repeat, if |
| **Stars** | 4 |
| **Step Limit** | 35 |

### Learning Goal
Use multiple sensors. Combine movement logic with collection logic.

### How to Complete
```python
repeat 20:
    if hasStar():
        collect()
    if frontBlocked():
        turnRight()
    forward()
```

### Why This Design
- Stars not on every cell = must check before collecting
- Multiple if blocks in one loop iteration
- Sensors for different purposes: navigation vs. action
- More complex decision-making

---

## Level 8: While Loop

### Design
```
###############
#>*.*.*.*.*.*G#
###############
```

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Loops - While |
| **Commands** | `move` |
| **Sensors** | `atGoal`, `notAtGoal` |
| **Blocks** | command, while |
| **Stars** | 6 |
| **Step Limit** | 20 |

### Learning Goal
Introduce `while` loops. Loop until a condition becomes false.

### How to Complete
```python
while notAtGoal():
    forward()
```

### Why This Design
- Straight path focuses on while concept, not navigation
- Unknown length (to student) - can't use repeat with known count
- `notAtGoal()` is intuitive: "keep going until you arrive"
- Elegant 2-line solution demonstrates while power

---

## Level 9: Smart Navigator

### Design
```
##########
#>...#...#
#.##.#.#.#
#.*#...#*#
##.#####.#
#..*...#.#
#.###.##.#
#...#..*.#
#.#.###..#
#.#.....G#
##########
```

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | While + If combined |
| **Commands** | `move`, `turn` |
| **Sensors** | `frontBlocked`, `frontClear`, `hasStar`, `atGoal`, `notAtGoal` |
| **Blocks** | command, repeat, if, while |
| **Stars** | 4 |
| **Step Limit** | 60 |

### Learning Goal
Combine while loops with if conditions. Create an adaptive navigation algorithm.

### How to Complete
```python
while notAtGoal():
    if hasStar():
        collect()
    if frontBlocked():
        turnRight()
    else:
        forward()
```

### Why This Design
- Complex maze requires adaptive behavior
- While provides the "keep going" structure
- If/else provides the decision logic
- Multiple sensors used together
- Preparation for final challenge

---

## Level 10: Master Challenge

### Design
```
############
#*.#...#..*#
#..#.#.#.#.#
#.##.#...#.#
#....###.#.#
###.##.*.#.#
#>...*...#.#
#.########.#
#.*.......*#
######.###.#
#G...*.....#
############
```

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | All concepts combined |
| **Commands** | `move`, `turn` |
| **Sensors** | `frontBlocked`, `frontClear`, `leftClear`, `rightClear`, `hasStar`, `atGoal`, `notAtGoal` |
| **Blocks** | command, repeat, if, ifelse, while |
| **Stars** | 6 |
| **Step Limit** | 80 |

### Learning Goal
Master challenge combining all programming concepts learned.

### How to Complete
Multiple valid solutions. Example using right-hand rule:
```python
while notAtGoal():
    if hasStar():
        collect()
    if rightClear():
        turnRight()
        forward()
    elif frontClear():
        forward()
    else:
        turnLeft()
```

### Why This Design
- Large maze with multiple valid paths
- All sensors available for creative solutions
- High step limit allows exploration
- Tests mastery, not memorization
- Satisfying finale to the adventure

---

## Progression Summary

| Level | Concept | Key Learning | Premium |
|-------|---------|--------------|---------|
| 1 | Sequence | forward() command | Free |
| 2 | Sequence | turnRight() command | Free |
| 3 | Sequence | Both turns, planning paths | Free |
| 4 | Loops | repeat block basics | Free |
| 5 | Loops | Multiple commands in repeat | Free |
| 6 | Conditionals | if frontBlocked() | Premium |
| 7 | Conditionals | Multiple sensors | Premium |
| 8 | While Loops | while notAtGoal() | Premium |
| 9 | Combined | while + if together | Premium |
| 10 | Mastery | All concepts | Premium |

## Design Principles

1. **One Concept Per Level**: Each level introduces exactly one new idea
2. **Build on Prior Knowledge**: New concepts use previously learned commands
3. **Visual Clarity**: Maze layouts clearly show the intended path
4. **Gradual Complexity**: Grid size and star count increase progressively
5. **Free Tier Foundation**: First 5 levels teach core concepts for free
6. **Premium Value**: Advanced concepts (conditionals, while) in premium levels
