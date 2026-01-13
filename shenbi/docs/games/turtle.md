# Turtle Adventure - Level Design Document

## Overview

**Adventure ID:** `turtle-adventure`
**Game Type:** Turtle Graphics / Drawing
**Target Age:** 5-8 years
**Complexity:** Beginner
**Total Levels:** 10

### Programming Concepts Covered
1. Sequential Commands (Levels 1-4)
2. Loops - Repeat (Levels 5-6)
3. State Changes - Colors (Levels 7-8)
4. Loops - For with Variables (Levels 9-10)

### Available Commands
- `forward(distance)` / `backward(distance)` - Move and draw
- `turnLeft(degrees)` / `turnRight(degrees)` - Rotate turtle
- `setColor(color)` - Change pen color
- `penUp()` / `penDown()` - Control drawing

### Math Concepts Integrated
- Angles (90, 120, 144 degrees)
- Shape geometry (squares, triangles, stars)
- Pattern recognition
- Variables and sequences

---

## Level 1: My First Line

### Design
Single forward movement to draw a line.

| Property | Value |
|----------|-------|
| **Premium** | No (Free) |
| **Concept** | Sequence - forward with distance |
| **Commands** | `move` |
| **Blocks** | command |
| **Win Condition** | lineCount >= 1 |
| **Step Limit** | 20 |

### Learning Goal
Introduce `forward(distance)`. Students learn that the turtle leaves a trail as it moves.

### How to Complete
```python
forward(3)
```

### Why This Design
- Single command = lowest possible complexity
- Visual feedback: line appears as turtle moves
- Distance parameter introduces the concept of values
- Builds foundation: "forward makes lines"

---

## Level 2: Learning to Turn

### Design
Draw an L-shape using forward and turn.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Sequence - turning |
| **Commands** | `move`, `turn` |
| **Blocks** | command |
| **Win Condition** | lineCount >= 2 |
| **Step Limit** | 20 |

### Learning Goal
Introduce `turnRight(90)`. Understand that turning changes direction without drawing.

### How to Complete
```python
forward(3)
turnRight(90)
forward(3)
```

### Why This Design
- L-shape is simplest multi-line drawing
- 90 degrees is intuitive (quarter turn)
- Turn doesn't draw = important distinction
- Foundation for closed shapes

---

## Level 3: Left and Right

### Design
Draw a staircase pattern using both turns.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Sequence - both turns |
| **Commands** | `move`, `turn` |
| **Blocks** | command |
| **Win Condition** | lineCount >= 4 |
| **Step Limit** | 30 |

### Learning Goal
Master both `turnLeft()` and `turnRight()`. Plan multi-step drawings.

### How to Complete
```python
forward(2)
turnRight(90)
forward(2)
turnLeft(90)
forward(2)
turnRight(90)
forward(2)
```

### Why This Design
- Alternating turns creates interesting pattern
- 4 lines is achievable but requires planning
- Prepares for recognizing repetitive patterns
- Staircase is visually appealing result

---

## Level 4: Draw a Square

### Design
Create a closed square shape.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Closed shapes |
| **Commands** | `move`, `turn` |
| **Blocks** | command |
| **Win Condition** | lineCount >= 4 AND distanceFromStart < 30 |
| **Step Limit** | 30 |

### Learning Goal
Create a closed shape by returning to start. Understand 4 x 90 = 360 degrees.

### How to Complete
```python
forward(3)
turnRight(90)
forward(3)
turnRight(90)
forward(3)
turnRight(90)
forward(3)
```

### Why This Design
- Closed shape = satisfying visual result
- distanceFromStart check ensures proper closure
- 4 identical sides = obvious pattern (sets up loops)
- Square is foundational shape for geometry

---

## Level 5: Loop Magic

### Design
Draw the same square using repeat loops.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Loops - Repeat |
| **Commands** | `move`, `turn` |
| **Blocks** | command, repeat |
| **Win Condition** | lineCount >= 4 AND distanceFromStart < 30 |
| **Step Limit** | 20 |

### Learning Goal
Recognize patterns and use `repeat` to simplify code. Same result, less code.

### How to Complete
```python
repeat 4:
    forward(3)
    turnRight(90)
```

### Why This Design
- Direct comparison to Level 4: same output
- 8 lines become 3 lines = dramatic improvement
- Pattern recognition: "I'm doing the same thing 4 times"
- Lower step limit encourages loop usage

---

## Level 6: Triangle Challenge

### Design
Draw a triangle - requires different angle.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Geometry - angles |
| **Commands** | `move`, `turn` |
| **Blocks** | command, repeat |
| **Win Condition** | lineCount >= 3 AND distanceFromStart < 30 |
| **Step Limit** | 25 |

### Learning Goal
Apply geometry knowledge: 360 / 3 = 120 degrees per turn for triangle.

### How to Complete
```python
repeat 3:
    forward(4)
    turnRight(120)
```

### Why This Design
- Transfers loop knowledge to new shape
- Introduces mathematical thinking: 360/sides = angle
- 120 degrees is less intuitive than 90 - requires thinking
- Builds confidence in applying formulas

---

## Level 7: Rainbow Square

### Design
Draw a square with each side in a different color.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | State - colors |
| **Commands** | `move`, `turn`, `setColor` |
| **Blocks** | command, repeat |
| **Win Condition** | lineCount >= 4 AND distanceFromStart < 30 |
| **Step Limit** | 30 |

### Learning Goal
Use `setColor()` to change pen color. Understand state changes.

### How to Complete
```python
setColor("red")
forward(3)
turnRight(90)
setColor("blue")
forward(3)
turnRight(90)
setColor("green")
forward(3)
turnRight(90)
setColor("yellow")
forward(3)
```

### Why This Design
- Colors add visual interest and creativity
- setColor before forward = order matters
- Can't use simple repeat (colors must change)
- Introduces state management concept

---

## Level 8: Draw a Star

### Design
Draw a 5-pointed star.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Advanced geometry |
| **Commands** | `move`, `turn`, `setColor` |
| **Blocks** | command, repeat |
| **Win Condition** | lineCount >= 5 AND distanceFromStart < 30 |
| **Step Limit** | 30 |

### Learning Goal
Apply advanced angle math: 144 = 720/5 for star shape (exterior angles).

### How to Complete
```python
setColor("yellow")
repeat 5:
    forward(4)
    turnRight(144)
```

### Why This Design
- Star is aspirational shape for kids
- 144 degrees is counter-intuitive (teaches research/experimentation)
- Explains exterior vs interior angles
- Combines loops + colors + geometry

---

## Level 9: Spiral Pattern

### Design
Draw a growing spiral using for loops.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | For loops with variables |
| **Commands** | `move`, `turn`, `setColor` |
| **Blocks** | command, repeat, for |
| **Win Condition** | lineCount >= 10 |
| **Step Limit** | 50 |

### Learning Goal
Use `for i in range()` with variable distances. Lines get progressively longer.

### How to Complete
```python
setColor("purple")
for i in range(1, 12):
    forward(i)
    turnRight(90)
```

### Why This Design
- Introduces variables in loops
- Visual result clearly shows increasing values
- forward(i) makes the "variable as value" concept visible
- Spiral is mesmerizing pattern

---

## Level 10: Master Artist

### Design
Draw a flower pattern using nested loops.

| Property | Value |
|----------|-------|
| **Premium** | Yes |
| **Concept** | Nested loops |
| **Commands** | `move`, `turn`, `setColor` |
| **Blocks** | command, repeat, for |
| **Win Condition** | lineCount >= 20 |
| **Step Limit** | 100 |

### Learning Goal
Combine all skills. Nested loops create complex patterns from simple shapes.

### How to Complete
```python
setColor("red")
repeat 8:
    repeat 4:
        forward(3)
        turnRight(90)
    turnRight(45)
```

### Why This Design
- Flower = 8 rotated squares (nested loops)
- Inner loop: draw one square
- Outer loop: rotate and repeat
- Complex output from simple code = programming magic
- Satisfying finale demonstrating all learned concepts

---

## Progression Summary

| Level | Concept | Key Learning | Premium |
|-------|---------|--------------|---------|
| 1 | Sequence | forward(distance) | Free |
| 2 | Sequence | turnRight(90) | Premium |
| 3 | Sequence | Both turns, planning | Premium |
| 4 | Shapes | Closed shapes, 360 degrees | Premium |
| 5 | Loops | repeat block | Premium |
| 6 | Geometry | Angles formula (360/sides) | Premium |
| 7 | State | setColor() | Premium |
| 8 | Geometry | Star angles (144 degrees) | Premium |
| 9 | Variables | for i in range() | Premium |
| 10 | Mastery | Nested loops | Premium |

## Design Principles

1. **Visual Results**: Every level produces a satisfying drawing
2. **Math Integration**: Geometry concepts (angles, shapes) embedded naturally
3. **Progressive Complexity**: Each level builds on previous knowledge
4. **Creativity Enabled**: Colors and shapes allow self-expression
5. **Pattern Recognition**: Repeated patterns lead to loop discovery
6. **Free Tier**: Level 1 demonstrates core concept; premium unlocks full curriculum

## Unique to Turtle vs Maze

- **No Win/Fail State**: Drawings are subjective, win condition is flexible
- **Geometry Focus**: Angles and shapes are core learning
- **Creative Expression**: Colors and patterns encourage experimentation
- **No Sensors**: Pure output-focused programming
- **expectedCode Field**: Provides target drawing for comparison
