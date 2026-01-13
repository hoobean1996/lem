# Core Features Guide

Detailed user stories and step-by-step guides for Shenbi's main features.

---

## Table of Contents

1. [Adventure Mode](#1-adventure-mode) - Solo learning
2. [Battle Mode](#2-battle-mode) - PvP competitions
3. [My Classes (Student)](#3-my-classes-student) - Join classrooms
4. [Classroom Management (Teacher)](#4-classroom-management-teacher) - Manage classes
5. [Live Classroom Sessions](#5-live-classroom-sessions) - Real-time teaching
6. [Adventure Studio](#6-adventure-studio) - Create custom content

---

## 1. Adventure Mode

**Purpose:** Self-paced learning where students progress through themed coding adventures.

### User Story

> As a student, I want to learn programming by solving fun puzzles at my own pace, so that I can build coding skills progressively.

### Detailed Flow

#### Step 1: Access Adventures

1. Log in to Shenbi
2. From the home page, click **"Adventures"** in the bottom navigation bar
3. View the list of available adventures with icons and descriptions

#### Step 2: Select an Adventure

1. Browse available adventures:
   - **Rabbit's Garden** (Maze) - Guide a rabbit through mazes
   - **Turtle Artist** (Turtle) - Draw pictures with code
   - **Tower Defense** - Strategic unit placement
2. Each adventure card shows:
   - Adventure icon and name
   - Number of levels
   - Your progress (e.g., "3/10 completed")
3. Click on an adventure to enter

#### Step 3: Choose a Level

1. See the level list with:
   - Level number and name
   - Difficulty indicator (stars)
   - Completion status (checkmark if done)
   - Stars collected (0-3)
2. Completed levels show a green checkmark
3. Locked levels appear grayed out (must complete previous levels first)
4. Click on an unlocked level to start

#### Step 4: Solve the Puzzle

1. The game view loads with:
   - **Left panel:** Game canvas showing the puzzle
   - **Right panel:** Code editor (blocks or text)
   - **Top bar:** Level name, hints button, settings
2. Read the level objective displayed at the top
3. Write code using either:
   - **Block editor:** Drag and drop code blocks
   - **Text editor:** Type code directly (toggle with button)

#### Step 5: Run and Test

1. Click the **"Run"** button (green play icon)
2. Watch the code execute step-by-step:
   - Current line highlights in the editor
   - Character moves/draws on the canvas
   - Execution speed adjustable
3. If stuck, click **"Hint"** for guidance
4. Click **"Reset"** to try again

#### Step 6: Complete and Progress

1. **Success:** Level objective achieved
   - Celebration animation plays
   - Stars awarded based on:
     - Completing the level (1 star)
     - Collecting all items (2 stars)
     - Optimal solution (3 stars)
   - Click "Next Level" to continue
2. **Failure:** Objective not met
   - See what went wrong
   - Click "Try Again" to retry
   - Use hints if needed

### Available Commands by Game Type

**Maze (Rabbit):**
| Command | Chinese | Description |
|---------|---------|-------------|
| `forward()` | `前进()` | Move forward one cell |
| `left()` | `左转()` | Turn left 90 degrees |
| `right()` | `右转()` | Turn right 90 degrees |
| `canMove()` | `可以前进()` | Check if path ahead is clear |

**Turtle (Drawing):**
| Command | Chinese | Description |
|---------|---------|-------------|
| `forward(n)` | `前进(n)` | Move forward n pixels |
| `backward(n)` | `后退(n)` | Move backward n pixels |
| `left(n)` | `左转(n)` | Turn left n degrees |
| `right(n)` | `右转(n)` | Turn right n degrees |
| `penUp()` | `抬笔()` | Stop drawing |
| `penDown()` | `落笔()` | Start drawing |

---

## 2. Battle Mode

**Purpose:** Real-time competitive coding where two players race to solve the same puzzle.

### User Story

> As a student, I want to compete against my friends in coding challenges, so that learning feels exciting and social.

### Detailed Flow

#### Creating a Battle Room

##### Step 1: Access Battle Mode

1. From home page, click **"Battle"** in the navigation
2. The Battle lobby page loads

##### Step 2: Create a Room

1. Click the **"Create Room"** button
2. System generates a unique 6-character room code (e.g., `ABC123`)
3. You enter the room as the host

##### Step 3: Configure the Battle

1. As host, you see the room setup screen:
   - Room code displayed prominently (for sharing)
   - Copy button to copy code to clipboard
   - Level selector dropdown
2. Select a level for the battle:
   - Browse available levels
   - Preview the level before selecting
   - Both players will solve the same level

##### Step 4: Wait for Opponent

1. Share the room code with your friend (verbally, chat, etc.)
2. See "Waiting for opponent..." status
3. When opponent joins:
   - Their name appears in the player list
   - Status changes to "Ready"

##### Step 5: Start the Battle

1. Once both players are ready, host clicks **"Start Battle"**
2. 3-2-1 countdown begins
3. Battle starts simultaneously for both players

#### Joining a Battle Room

##### Step 1: Get the Room Code

1. Receive the 6-character room code from the host

##### Step 2: Join the Room

1. From Battle lobby, click **"Join Room"**
2. Enter the room code (case-insensitive)
3. Click **"Join"**
4. If successful, you enter the room
5. If code invalid, error message shown

##### Step 3: Wait for Battle Start

1. See the selected level preview
2. See host's name in player list
3. Wait for host to start the battle

#### During the Battle

##### Racing to Complete

1. Both players see:
   - Their own game canvas and code editor
   - Opponent's progress indicator (percentage or stage)
   - Timer showing elapsed time
2. Write and run code to solve the level
3. First player to complete the objective wins

##### Battle End

1. **Winner announced:**
   - Victory screen for winner
   - Shows completion time
   - Option to rematch or exit
2. **Both players see:**
   - Final times comparison
   - Option to play again with same or different level

### Battle Rules

- Same level for both players (fair competition)
- No hints available during battle
- First to complete wins (time is tiebreaker)
- Disconnection counts as forfeit

---

## 3. My Classes (Student)

**Purpose:** Students join teacher-managed classrooms to receive assignments and participate in live sessions.

### User Story

> As a student, I want to join my teacher's class so that I can access assignments and participate in live coding sessions.

### Detailed Flow

#### Joining a Class

##### Step 1: Get Join Code

1. Teacher provides a 6-character join code (e.g., `2S8YNA`)
2. This code is unique to each classroom
3. Code can be shared verbally, on whiteboard, or via message

##### Step 2: Access My Classes

1. From home page, click **"My Classes"** in the navigation
2. See list of enrolled classes (empty if first time)
3. Click **"Join Class"** button (top right)

##### Step 3: Enter Join Code

1. Join modal appears with input field
2. Enter the 6-character code
3. Optionally enter a display name (how teacher sees you)
4. Click **"Join"** button

##### Step 4: Confirmation

1. **Success:**
   - Modal closes
   - New class appears in your list
   - Shows class name, teacher name, assignments
2. **Error:**
   - "Invalid code" - check code and retry
   - "Already enrolled" - you're already in this class

#### Viewing Class Details

##### Class Card Information

Each enrolled class shows:
- **Class name** (e.g., "Math Coding 101")
- **Teacher name** (if set)
- **Join Live Session** button (green)
- **Leave** button (to unenroll)
- **Assignments section** below

##### Assignments List

For each class, see assignments:
- Assignment title
- Adventure/level information
- Number of levels to complete
- Due date (if set)
- Completion status

##### Completing Assignments

1. Click on an assignment to view details
2. See list of required levels
3. Click a level to play it
4. Progress saves automatically
5. Return to see updated completion status

#### Joining Live Sessions

##### Step 1: Teacher Starts Session

1. Teacher launches a live session for the class
2. Teacher shares the session room code

##### Step 2: Join the Session

1. From My Classes, click **"Join Live Session"** on the class card
2. Enter the room code provided by teacher
3. Click **"Join"**

##### Step 3: In the Lobby

1. See "Connected to [Teacher Name]'s classroom"
2. See the level teacher has selected (if any)
3. Status shows "Waiting for teacher to start..."

##### Step 4: Session Begins

1. Teacher clicks "Start Class"
2. Your screen automatically shows the game
3. Complete the level while teacher monitors
4. Your progress is visible to teacher in real-time

##### Step 5: Session Ends

1. Teacher ends the session
2. You see "Session ended" message
3. Click to return home or stay for new session

#### Leaving a Class

1. On the class card, click **"Leave"** button
2. Confirm the action
3. You're removed from the class
4. To rejoin, you'll need the join code again

---

## 4. Classroom Management (Teacher)

**Purpose:** Teachers create classrooms, enroll students, and manage assignments.

### User Story

> As a teacher, I want to create a class and manage my students so that I can assign coding exercises and track their progress.

### Detailed Flow

#### Creating a Classroom

##### Step 1: Access Classes

1. From teacher home (`/t`), click **"Classes"** card
2. See list of your classrooms (empty if first time)

##### Step 2: Create New Class

1. Click **"Create Class"** button (top right)
2. Modal appears with form fields

##### Step 3: Enter Class Details

1. **Class Name** (required): e.g., "Grade 3 Coding"
2. **Description** (optional): e.g., "Monday afternoon coding class"
3. Click **"Create"** button

##### Step 4: Class Created

1. Modal closes
2. New class appears in your list
3. System generates a unique **Join Code**
4. You're redirected to the class detail page

#### Managing Students

##### Sharing Join Code

1. On class detail page, see the **Join Code** prominently displayed
2. Click copy button to copy to clipboard
3. Share with students via:
   - Write on whiteboard
   - Project on screen
   - Send via class communication tool

##### Viewing Enrolled Students

1. On class detail page, see **Members** section
2. Each student shows:
   - Name / display name
   - Join date
   - Status (active/removed)
3. Click on student to see their progress

##### Removing Students

1. Find student in members list
2. Click the remove/kick button
3. Confirm the action
4. Student loses access to class assignments

#### Creating Assignments

##### Step 1: Open Assignments Section

1. On class detail page, find **Assignments** section
2. Click **"Create Assignment"** button

##### Step 2: Configure Assignment

1. **Title** (required): e.g., "Week 1: Basic Movement"
2. **Adventure**: Select from available adventures
3. **Levels**: Choose which levels to include
4. **Due Date** (optional): Set deadline
5. **Instructions** (optional): Add notes for students

##### Step 3: Save and Publish

1. Click **"Save as Draft"** to save without publishing
2. Click **"Publish"** to make visible to students
3. Published assignments appear in students' class view

##### Managing Assignments

- **Edit:** Modify unpublished assignments
- **Publish/Unpublish:** Control visibility
- **Delete:** Remove assignment entirely
- **View Progress:** See student completion rates

#### Tracking Progress

##### Class Overview

1. See overall class statistics:
   - Number of students
   - Average completion rate
   - Most/least completed assignments

##### Individual Progress

1. Click on a student name
2. See their progress across all assignments
3. See which levels completed, scores, time spent

##### Assignment Progress

1. Click on an assignment
2. See completion status per student
3. Identify students who need help

---

## 5. Live Classroom Sessions

**Purpose:** Real-time teacher-led coding sessions where teacher controls the pace and monitors all students.

### User Story

> As a teacher, I want to lead a live coding session where I can see all students' progress in real-time, so that I can help struggling students and keep the class engaged.

### Detailed Flow (Teacher)

#### Starting a Live Session

##### Step 1: Launch Session

1. Go to class detail page (`/t/classes/[id]`)
2. Click **"Launch Live Session"** button
3. System creates a new room automatically
4. You're redirected to the session page

##### Step 2: Share Room Code

1. Session page shows the **Room Code** prominently (e.g., `NLJUUZ`)
2. Display this code to students:
   - Project on classroom screen
   - Write on whiteboard
   - Announce verbally
3. Students enter this code to join

##### Step 3: Monitor Lobby

1. See **Students** section with connected students
2. Each student shows:
   - Name
   - Connection status (green dot = connected)
3. Wait for students to join
4. No minimum required - can start with any number

##### Step 4: Select a Level

1. Use the **Level Picker** section
2. Browse available levels by adventure
3. Click on a level to select it
4. Selected level shown to all connected students
5. Can change selection before starting

##### Step 5: Start the Class

1. Once ready, click **"Start Class"** button
2. All students' screens switch to game mode
3. Everyone sees the same level simultaneously

#### During the Session

##### Teacher Dashboard View

1. **Room Code**: Always visible for late joiners
2. **Student Grid**: See all students' progress:
   - Student name
   - Current status (coding/running/completed/stuck)
   - Progress indicator
   - Completion checkmark when done
3. **Level Info**: Current level details

##### Monitoring Students

1. See real-time progress updates:
   - Students writing code
   - Students running code
   - Students who completed
   - Students who might be stuck
2. Identify who needs help
3. Walk around classroom to assist

##### Late Joiners

1. Students can join after class starts
2. They automatically receive:
   - The current level
   - Instruction to start immediately
3. No action needed from teacher

##### Resetting the Level

1. Click **"Reset"** button
2. All students' levels reset
3. Useful for:
   - Trying a different approach
   - Explaining concepts again
   - Starting fresh

#### Ending the Session

##### Step 1: End Session

1. Click **"End Session"** button
2. Confirmation modal appears
3. Click **"Confirm"**

##### Step 2: Students Notified

1. All students see "Session ended" message
2. Students can return to home page
3. Progress from session is saved

##### Step 3: Post-Session Options

1. **New Session**: Start another session
2. **Back to Home**: Return to teacher dashboard
3. Session data available for review

### Detailed Flow (Student)

#### Joining a Live Session

##### Step 1: Get Room Code

1. Teacher displays room code on screen
2. Note the 6-character code

##### Step 2: Navigate to Classroom

1. Go to `/classroom` or click "Join Live Session" from My Classes
2. See the join form

##### Step 3: Enter Code and Join

1. Type the room code (case-insensitive)
2. Click **"Join"** button
3. **Success**: Enter the lobby
4. **Error**: Check code and retry

##### Step 4: Wait in Lobby

1. See "Connected to [Teacher]'s classroom"
2. See the level teacher selected (preview)
3. Status: "Waiting for teacher to start..."
4. Cannot start on your own - teacher controls

##### Step 5: Class Starts

1. Teacher clicks "Start Class"
2. Your screen changes to game view automatically
3. Level loads with objectives shown
4. Begin coding!

#### During the Session

##### Working on the Level

1. Write code using blocks or text editor
2. Run code to test
3. Your progress is sent to teacher in real-time
4. Teacher can see if you're stuck

##### Completing the Level

1. When you complete the objective:
   - Success animation plays
   - Teacher sees your completion
2. Wait for further instructions
3. Teacher may reset for another try

##### Session Ends

1. Teacher ends the session
2. You see "Session ended by teacher" message
3. Options:
   - Return to home
   - Wait for new session (if teacher starts another)

---

## 6. Adventure Studio

**Purpose:** Teachers create custom adventures and levels tailored to their curriculum.

### User Story

> As a teacher, I want to create my own coding puzzles so that I can align the content with my lesson plans and student skill levels.

### Detailed Flow

#### Accessing Adventure Studio

##### Step 1: Navigate to Studio

1. From teacher home (`/t`), click **"Adventure Studio"** card
2. See list of your custom adventures
3. System-provided adventures are separate (in main Adventures)

##### Step 2: View Your Adventures

1. Each adventure card shows:
   - Icon and name
   - Number of levels
   - Description
   - Edit/Play/Delete buttons

#### Creating an Adventure

##### Step 1: Start New Adventure

1. Click **"New Adventure"** button (top right)
2. Adventure editor page opens

##### Step 2: Set Adventure Details

1. **Name** (required): e.g., "Loops Practice"
2. **Icon**: Select an emoji or icon
3. **Description** (optional): What students will learn
4. Click **"Save"** to create

##### Step 3: Adventure Created

1. Empty adventure created
2. Now add levels to it

#### Creating Levels

##### Step 1: Add New Level

1. Inside an adventure, click **"Add Level"**
2. Level editor page opens

##### Step 2: Set Level Info

1. **Level Name**: e.g., "Simple Path"
2. **Hints**: Add helpful hints for stuck students
3. **Grid Size**: Set width and height (default 8x8)

##### Step 3: Design the Grid

Using the toolbar, place elements on the grid:

| Tool | Icon | What it Does |
|------|------|--------------|
| **Player** | Rabbit | Set starting position (only one allowed) |
| **Goal** | House | Set target destination (only one allowed) |
| **Wall** | Brick | Add obstacles that block movement |
| **Star** | Carrot | Add collectible items |
| **Empty** | White | Clear a cell to empty |
| **Eraser** | Broom | Remove any element |

##### Step 4: Place Elements

1. Click a tool in the toolbar
2. Click on grid cells to place
3. Player and Goal auto-replace if placed again
4. Walls and Stars can have multiple

##### Step 5: Validate Level

System checks for:
- Player position exists
- Goal position exists
- Level is solvable (path exists)

##### Step 6: Preview and Test

1. Click **"Preview"** button
2. Play through your level
3. Make sure it's solvable
4. Adjust difficulty as needed

##### Step 7: Save Level

1. Click **"Save"** button
2. Level added to adventure
3. Can edit later if needed

#### Managing Levels

##### Editing Levels

1. In adventure view, click **"Edit"** on a level
2. Make changes in the level editor
3. Save changes

##### Reordering Levels

1. Drag and drop levels to reorder
2. First level is what students see first
3. Progression follows the order

##### Deleting Levels

1. Click delete button on level
2. Confirm deletion
3. Level removed from adventure

#### Using Custom Adventures

##### In Assignments

1. When creating assignments, your custom adventures appear
2. Select your adventure and levels
3. Assign to students as usual

##### In Live Sessions

1. Custom adventure levels appear in level picker
2. Select for live classroom use
3. All features work the same

##### Direct Play

1. From Adventure Studio, click **"Play"** on adventure
2. Enter adventure and play levels
3. Test student experience

#### Best Practices

1. **Start simple**: First levels should be easy
2. **Progressive difficulty**: Gradually increase challenge
3. **Clear objectives**: Make goals obvious
4. **Test thoroughly**: Play every level before assigning
5. **Add hints**: Help students who get stuck
6. **Iterate**: Adjust based on student feedback

---

## Appendix

### Navigation Reference

| Path | Page | User |
|------|------|------|
| `/` | Student Home | Student |
| `/adventure` | Adventure List | Student |
| `/adventure/:id/levels` | Level List | Student |
| `/adventure/:id/levels/:levelId` | Game Page | Student |
| `/battle` | Battle Lobby | Both |
| `/battle/:roomCode` | Battle Room | Both |
| `/my-classes` | My Classes | Student |
| `/classroom` | Join Live Session | Student |
| `/classroom/:roomCode` | Live Session | Student |
| `/t` | Teacher Home | Teacher |
| `/t/classes` | Class Management | Teacher |
| `/t/classes/:id` | Class Detail | Teacher |
| `/t/classroom` | Create Live Session | Teacher |
| `/t/classroom/:roomCode` | Teacher Dashboard | Teacher |
| `/t/creator` | Adventure Studio | Teacher |
| `/t/creator/adventure/:id` | Adventure Editor | Teacher |
| `/t/creator/level/:id` | Level Editor | Teacher |

### Room Code Types

| Type | Purpose | Created By | Valid For |
|------|---------|------------|-----------|
| Class Join Code | Join a classroom | System | Permanent |
| Battle Room Code | Join a battle | Player | Until room closes |
| Live Session Code | Join live session | Teacher | Until session ends |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't join class | Verify join code with teacher |
| Room code not working | Check code is correct, room may have closed |
| Level won't load | Refresh page, check internet |
| Progress not saving | Check login status, refresh |
| Can't start class | Select a level first |
| Student not appearing | Have student refresh and rejoin |

---

*Last Updated: December 2024*

*See also: [Architecture](./architecture.md) | [Game Guide](./game.md) | [Backend API](./backend.md)*
