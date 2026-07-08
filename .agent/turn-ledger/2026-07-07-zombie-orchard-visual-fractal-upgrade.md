# 2026-07-07 Zombie Orchard Visual Fractal Upgrade

## Summary

Upgraded `experiments/zombie-orchard/` instead of the last upgraded `vr-platformer-board` lane.

This pass made Zombie Orchard read less like a flat survival canvas and more like a small experience-driven web game by introducing renderer-facing visual domain descriptors for orchard lanes, tree trunks, leaf clusters, apple glow, threat silhouettes, and tension lighting.

## Experiment inventory reviewed

```txt
NexusEngine-Experiments
├─ experiments/peer-scene-transition
│  ├─ description: peer HTML scene transition validation route
│  ├─ gameplay length: short puzzle chain, roughly 3-6 minutes
│  └─ mechanics: inventory flags, scene manifest exits, lantern/bridge/shrine puzzles
├─ experiments/next-ledge
│  ├─ description: cinematic grapple-climb validation demo
│  ├─ gameplay length: short climb route, roughly 2-5 minutes
│  └─ mechanics: grapple, swing, sector advance, route progress, snapshot renderer
├─ experiments/fogline-relay
│  ├─ description: first-person fog-forest relay experiment
│  ├─ gameplay length: short relay loop, roughly 3-7 minutes
│  └─ mechanics: movement/look, hold scan, relay objectives, fog volumes, wraith pressure
├─ experiments/nexus-frontier-signal-isles
│  ├─ description: broad kit-utilization field-engineer showcase
│  ├─ gameplay length: medium objective route, roughly 8-15 minutes
│  └─ mechanics: scan, harvest, build mast, pressure wave, root gate, cargo/checkpoint/beacon
├─ experiments/sora-the-infinite
│  ├─ description: canonical redirect to the aerial/open traversal lane
│  ├─ gameplay length: open traversal slice, roughly 3-10 minutes
│  └─ mechanics: pitch/bank/boost, rings, updrafts, terrain descriptors
├─ experiments/zombie-orchard
│  ├─ description: kit-composed survival orchard experiment
│  ├─ gameplay length: repeatable wave survival, roughly 5-12 minutes
│  └─ mechanics: move/sprint/dodge, collect apples, pick up gear, swap/use gear, survival waves
├─ games/signal-bastion
│  ├─ description: strategic-pressure tower/defense route-domain lane
│  ├─ gameplay length: authored wave game, roughly 20-45 minutes
│  └─ mechanics: placement, towers, enemies, bosses, economy, wave preview, upgrades
└─ games/rogue-lite-hellscape-siege
   ├─ description: rogue-lite base-defense route
   ├─ gameplay length: medium roguelite defense run, roughly 10-25 minutes
   └─ mechanics: realm portals, inventory, harvesting, pickups, building, wave/core defense
```

## Selection decision

```txt
last upgraded route
└─ vr-platformer-board

selected route
└─ zombie-orchard
   ├─ reason: the survival loop already existed, but the visual/game-feel domain was still too flat
   ├─ reason: lots of concepts were still physically coupled in renderer shapes
   └─ reason: it is a good fit for small atomic visual kits with many possible future splits
```

## Domain fractalization model

The key change is that a tree is not one renderer object anymore at the domain-design level.

```txt
tree-domain
├─ trunk-domain
│  └─ orchard-trunk-form-kit
├─ leaf-domain
│  └─ orchard-leaf-cluster-kit
└─ renderer
   └─ consumes descriptors only
```

The same split applies outside physical objects too.

```txt
zombie-orchard
├─ navigation / orchard rows
│  └─ orchard-lane-band-kit
├─ collectible meaning
│  └─ orchard-apple-glow-kit
├─ agent readability
│  └─ orchard-threat-silhouette-kit
├─ pressure mood
│  └─ orchard-tension-lighting-kit
└─ composition
   └─ zombie-orchard-visual-fractal-domain-kit
      └─ emits one renderer-facing descriptor payload
```

## Kits added

```txt
experiments/zombie-orchard/src/visual-fractal-kits.js
├─ orchard-leaf-cluster-kit
├─ orchard-trunk-form-kit
├─ orchard-apple-glow-kit
├─ orchard-lane-band-kit
├─ orchard-threat-silhouette-kit
├─ orchard-tension-lighting-kit
└─ zombie-orchard-visual-fractal-domain-kit
```

## Integration

```txt
session.js
├─ creates zombie-orchard-visual-fractal-domain-kit
├─ keeps gameplay state in existing survival/domain kits
├─ builds visualDomains from snapshot state
└─ exposes visualDomains through GameHost.getState()

three-view.js
├─ consumes visualDomains.lighting
├─ consumes visualDomains.lanes
├─ consumes visualDomains.trees
├─ consumes visualDomains.apples
├─ consumes visualDomains.threats
└─ remains presentation-only
```

## Validation added

```txt
tests/zombie-orchard-visual-fractal-kits-smoke.mjs
├─ 10 intake cases: orchard-leaf-cluster-kit
├─ 10 intake cases: orchard-trunk-form-kit
├─ 10 intake cases: orchard-apple-glow-kit
├─ 10 intake cases: orchard-lane-band-kit
├─ 10 intake cases: orchard-threat-silhouette-kit
├─ 10 intake cases: orchard-tension-lighting-kit
└─ 10 intake cases: zombie-orchard-visual-fractal-domain-kit

tests/zombie-orchard-playwright-state-input-smoke.mjs
├─ validates CDN imports are present in kit-stack.js
├─ serves the repo locally
├─ opens /experiments/zombie-orchard/
├─ sends keyboard and direct GameHost input
└─ asserts visualDomains and state bounds
```

## Cleanup pass

The cleanup was additive and non-destructive.

```txt
cleanup
├─ kept existing survival, horde, weapon, objective, movement, and navigation mechanics
├─ did not delete functionality
├─ moved visual meaning out of anonymous Three.js object construction
├─ kept browser/renderer concerns out of reusable domain descriptors
└─ wired new smokes into scripts/run-checks.mjs
```

## Lessons

- Visual upgrades should not just add geometry; they should split meaning into scoped descriptor domains.
- Renderer code should consume descriptor surfaces, not own orchard rules.
- Trees, apples, threats, lanes, and tension are separate domains even when they appear in one scene.
- Zombie Orchard is still viable as a small web game and should not be deleted or renamed.

## Next ledge

Move the new Zombie Orchard visual-fractal kits into `NexusRealtime-ProtoKits` after this Experiments-hosted proof has at least one stable CI pass and one follow-up route consumption check.
