# The Cavalry of Rome

A NexusRealtime experiment seed for a Roman campaign-map tactics game.

The prototype direction is intentionally **not** a board-game adaptation. The strategic layer uses a terrain-styled world map where the player clicks linked locations to move a field army. When an army enters a hostile location, play shifts into a formation-command encounter built around morale, cohesion, fatigue, command posture, terrain pressure, and cavalry momentum.

## Current slice

- Campaign map with linked Roman-world locations.
- Click-to-move army marker with travel progress.
- Three troop classes: light, medium, and heavy.
- Hostile locations that trigger tactical encounters.
- Original tactical command loop: advance, hold, wheel, charge, skirmish, fall back, regroup.
- Canvas renderer and HUD only; reusable domain-kit extraction remains future work.

## Controls

```txt
Campaign
- Click a linked location to march there.
- Click the current location or any other visible node to inspect it.

Encounter
- Click a Roman formation to select it.
- Click a command button to issue an order.
- Win by breaking enemy morale or force strength.
```

## Design boundary

This experiment should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The battle model should evolve around formation intent, morale, cohesion, fatigue, terrain friction, command timing, troop-class doctrine, and cavalry momentum rather than copied board-game structures.

## Future ProtoKit pressure

Likely reusable boundaries, once the slice proves worthwhile:

```txt
campaign-map-kit
terrain-region-kit
army-march-kit
formation-command-kit
morale-cohesion-kit
encounter-director-kit
battlefield-objective-kit
fixed-tick-replay-harness
```

For now, this folder is a contained experiment seed. It does not claim canonical-route status, deterministic replay coverage, or reusable ProtoKit ownership.

## Next ledge

Add a small headless smoke around the formation resolver before expanding campaign content. The first useful check should prove that identical command sequences produce identical encounter outcomes without Canvas or DOM dependencies.
