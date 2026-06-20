# Nexus Arcade Game Ideas

This repository is the organized idea bank for Nexus Arcade.

It will hold game concepts, arcade cabinet experiments, prototype outlines, and long-term content planning for the Nexus Arcade ecosystem.

The goal is to keep every game idea easy to find, compare, refine, and eventually move toward prototype or production.

## Purpose

This repo exists to:

- Capture new arcade game ideas quickly.
- Organize ideas by category, genre, status, and prototype readiness.
- Track how ideas evolve over time.
- Separate raw concepts from refined production candidates.
- Create a reusable structure for future Nexus Arcade game planning.
- Build a backlog of possible games for the Nexus Arcade cabinet and related platforms.

## Repo Philosophy

A game idea should not disappear inside a chat thread.

Every useful idea should become a small, trackable document.

Ideas can start messy.

The repo should help them become clearer over time.

A rough idea can move through these stages:

```txt
raw idea
  ↓
refined concept
  ↓
prototype candidate
  ↓
playtest candidate
  ↓
production candidate
  ↓
archived, shipped, merged, or retired
```

## Planned Folder Structure

```txt
NexusArcade-GameIdeas/
├─ README.md
├─ README.pdf
├─ templates/
│  ├─ game-idea-template.md
│  ├─ prototype-template.md
│  ├─ playtest-notes-template.md
│  └─ scoring-template.md
├─ ideas/
│  ├─ raw/
│  ├─ refined/
│  ├─ ready-for-prototype/
│  ├─ playtest-candidates/
│  └─ production-candidates/
├─ genres/
│  ├─ action/
│  ├─ puzzle/
│  ├─ racing/
│  ├─ rhythm/
│  ├─ co-op/
│  ├─ competitive/
│  ├─ party/
│  ├─ experimental/
│  └─ educational/
├─ cabinet-fit/
│  ├─ single-player/
│  ├─ two-player/
│  ├─ joystick-and-buttons/
│  ├─ trackball/
│  ├─ touchscreen/
│  └─ specialty-input/
├─ tracking/
│  ├─ idea-index.md
│  ├─ status-board.md
│  ├─ prototype-queue.md
│  └─ shipped-or-retired.md
└─ archive/
   ├─ merged/
   ├─ retired/
   └─ superseded/
```

## Game Idea Template

Each game idea should eventually follow this structure.

```txt
# Game Title

## One-Line Pitch

A short sentence explaining the game.

## Core Fantasy

What does the player feel like they are doing?

Examples:

- Escaping a collapsing space station.
- Running a goblin repair shop.
- Racing through neon tunnels.
- Defending a haunted vending machine.

## Arcade Cabinet Fit

Why does this work well on an arcade cabinet?

Consider:

- Short play sessions.
- Immediate controls.
- Clear visual feedback.
- Easy to understand from a distance.
- Fun to watch.
- Replayable score chase.
- Works with joystick and buttons.

## Player Count

- Single-player
- Two-player co-op
- Two-player competitive
- Alternating turns
- Drop-in party play

## Controls

Describe the exact control scheme.

Example:

Joystick: move
Button A: primary action
Button B: secondary action
Home: pause / return to launcher

## Core Loop

Describe what the player does repeatedly.

Example:

enter arena
collect resource
avoid threat
use resource
score points
survive escalation
repeat until failure

## Win State

What counts as success?

Examples:

- High score.
- Survive as long as possible.
- Complete stages.
- Beat a boss.
- Reach the finish line.
- Clear waves.

## Failure State

What causes the run to end?

Examples:

- Health reaches zero.
- Timer runs out.
- Base is destroyed.
- Too many mistakes.
- Player falls off the arena.

## Scoring

How does the game reward skill?

Consider:

- Combos.
- Speed.
- Accuracy.
- Survival time.
- Risk-taking.
- Resource efficiency.
- Style points.
- Perfect clears.

## Difficulty Curve

How does the game get harder?

Examples:

- Faster enemies.
- More hazards.
- Less time.
- Smaller safe zones.
- More complex patterns.
- Stronger score multipliers with higher risk.

## Visual Identity

Describe the look.

Include:

- Art style.
- Color palette.
- Camera angle.
- Character style.
- Environment style.
- Animation feel.
- Screen readability.

## Audio Identity

Describe the sound.

Include:

- Music style.
- Sound effect style.
- Feedback sounds.
- Failure sounds.
- Success sounds.
- Ambient layer.

## Cabinet Attract Mode

What should the game show when nobody is playing?

Include:

- Looping animation.
- Title screen.
- Demo gameplay.
- High scores.
- Flashing prompt.
- Cabinet-friendly visual hook.

## Prototype Scope

What is the smallest playable version?

Example:

One arena.
One player character.
One enemy type.
One scoring rule.
One failure state.
One 60-second loop.

## Production Scope

What would a fuller version include?

Examples:

- Multiple levels.
- Multiple enemy types.
- Boss fights.
- Unlockable modes.
- Local multiplayer.
- Scoreboards.
- Cabinet effects.
- Themed visual packs.

## Required Assets

List likely assets.

characters:
environments:
props:
VFX:
music:
SFX:
UI:

## Required Systems

List likely systems.

movement:
input:
camera:
collision:
scoring:
timer:
enemy behavior:
spawning:
audio:
save data:
leaderboard:

## Replay Value

Why would someone play again?

Examples:

- High score chase.
- Randomized levels.
- Daily challenge.
- Increasing mastery.
- Local competition.
- Secret routes.
- Unlockable modifiers.

## Similar References

List references without copying them directly.

Examples:

- Pac-Man for maze pressure.
- Galaga for wave readability.
- Downwell for compact action.
- WarioWare for fast toy-like loops.
- Geometry Wars for readable chaos.

## Risks

What might make the idea fail?

Examples:

- Too complex for arcade controls.
- Not readable on cabinet screen.
- Too slow to become fun.
- Requires too much content.
- Weak replay value.
- Hard to explain quickly.

## Open Questions

List unresolved questions.

Examples:

- Is this better single-player or co-op?
- Does it need a timer?
- Should scoring reward speed or survival?
- Can the game be understood in 5 seconds?
- Is the control scheme simple enough?

## Status

Choose one:

raw
refined
ready-for-prototype
playtest-candidate
production-candidate
merged
retired
superseded
shipped

## Tags

Example:

tags:
- arcade
- joystick
- two-button
- score-chase
- co-op
- action
- short-session

## Version History

v0.1 - initial idea
v0.2 - refined core loop
v0.3 - added prototype scope
```

## Tracking Ideas Over Time

Every idea should be tracked by:

- Status
- Genre
- Player count
- Cabinet input type
- Prototype difficulty
- Visual complexity
- Replay potential
- Production priority

## Suggested Scoring Rubric

Each idea can be rated from 1 to 5.

```txt
Arcade Fit:
Control Simplicity:
Visual Hook:
Replay Value:
Prototype Speed:
Production Potential:
Multiplayer Potential:
Originality:
```

Example:

```txt
Arcade Fit: 5
Control Simplicity: 4
Visual Hook: 5
Replay Value: 4
Prototype Speed: 3
Production Potential: 5
Multiplayer Potential: 2
Originality: 4
```

## Idea Lifecycle

```txt
Raw
A quick idea with minimal structure.

Refined
The idea has a clear loop, controls, and arcade fit.

Ready for Prototype
The idea is scoped tightly enough to build a small playable version.

Playtest Candidate
The prototype is playable enough to test.

Production Candidate
The idea has proven enough promise to expand.

Merged
The idea was combined with another idea.

Retired
The idea is intentionally abandoned.

Superseded
A better version replaced it.

Shipped
The idea became a finished or released game.
```

## First Goal

The first goal of this repo is to become a clean home for future Nexus Arcade game ideas.

We will start by adding structured idea documents.

Then we will sort them by genre, cabinet fit, and prototype readiness.

The repo should eventually become a living design backlog for Nexus Arcade.
