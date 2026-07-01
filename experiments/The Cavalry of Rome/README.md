# The Cavalry of Rome

A NexusRealtime Roman campaign-to-hex tactical experiment.

This route is now a playable tactical seed: a campaign terrain reveal leads into a WebGL2-shaded hex battlefield with mini low-poly squads, a bottom action-card UI, action points with carryover, constrained maneuver movement, enemy counterplay, and full 2d6 combat resolution.

## Active modules

```txt
src/main-realistic.js
src/vegetation-pass.js
src/hex-battlefield-pass.js
src/hex-squad-visual-pass.js
src/hex-gameplay-pass.js
src/hex-action-ui-pass.js
src/hex-roll-controller-pass.js
src/hex-opponent-ai-pass.js
src/hex-combat-controller-pass.js
```

## Current tactical loop

```txt
Roll AP: 0 AP, roll 2d6 once per player turn
Pass Turn: end player turn and keep unused AP
Concede: immediately lose the battle
Attack: 1 AP, select a Rome unit and attack an eligible enemy
Advance Left: 1 AP, move all eligible Rome units in the left third
Advance Center: 1 AP, move all eligible Rome units in the center third
Advance Right: 1 AP, move all eligible Rome units in the right third
Line Brigade: 2 AP, select one connected adjacent line, only that original line can move
Heavy Brigade: 3 AP, move all Rome heavy units
Berserk: 4 AP, move one unit up to two spaces, then attack an adjacent enemy
Scout: 4 AP, move one unit up to three spaces
```

Units still **cannot move freely**. Movement remains locked to the existing maneuver system, reachable-hex highlights, water blocking, hill/fence stop behavior, brigade restrictions, Scout range, Berserk range, and section-based advances.

## Action points

```txt
Action points carry over between turns.
Roll AP can be used once per player turn.
Passing does not erase unused AP.
```

## Combat rules

Combat uses two six-sided dice on each side.

```txt
Attacker: 2d6 + rank advantage + range penalty
Defender: 2d6
Highest final total wins
Damage = absolute difference between final totals
The losing unit loses that many squad members
A unit at 0 strength is routed/wiped out
```

Rank advantage:

```txt
same rank: 0
one rank above: +2
two ranks above: +5
one rank below: -2
two ranks below: -5
```

Range penalty:

```txt
adjacent attack: 0
range two light attack: -4
range two non-light attack: -6
```

This means a light unit can still beat a heavy unit with strong rolls, but it takes the rank and range penalties seriously.

Combat dice land and stay visible on the board for about one minute before fading out.

## Win/loss conditions

```txt
Rome wins when all enemy units are wiped out.
Enemy wins when all Rome units are wiped out.
Enemy also wins if the player presses Concede.
```

## Enemy AI

Enemy movement happens after each completed player maneuver or pass.

The enemy controller exposes a RAG/ONNX-shaped policy surface:

```txt
requested: rag-onnx-enemy-policy
modelUrl: ./models/cavalry-enemy-policy.onnx
runtime: rag-memory-fallback
```

No trained ONNX model artifact is bundled yet. Until a trained model is added, the enemy uses tactical memory retrieval plus stochastic scoring. It counters the last player maneuver, weighs pressure by battlefield third, avoids water, values hills/fences, attacks adjacent or range-two Rome units when useful, and injects randomness so moves feel less deterministic.

## Visual rules

```txt
Hex interiors: WebGL2 procedural terrain materials
Units: mini low-poly squad formations
Unit identity: body color + military band
Selection: lift, brightness, pennant, and hex highlight
No circular unit bases or selection rings
No screen-space vegetation overlay
```

## UI

The route has a dedicated tactical UI, not the old debug HUD:

```txt
bottom native card action bar
Action Points card
Pass Turn button above the action cards
Concede button opposite Pass Turn
Roll AP card
Attack card
seven maneuver cards
active/disabled card states
```

The old HUD/footer/commandBar DOM remains removed.

## Design boundary

Do not copy tabletop scenarios, cards, dice faces, stat tables, named rule text, or board layouts from existing games. This route should remain original Roman-history inspired tactical gameplay.

## Next ledge

Browser-test full combat, AP carryover, pass/concede, win/loss states, enemy turns, and one-minute dice persistence. Then add a real trained ONNX policy artifact and retrieval dataset.
