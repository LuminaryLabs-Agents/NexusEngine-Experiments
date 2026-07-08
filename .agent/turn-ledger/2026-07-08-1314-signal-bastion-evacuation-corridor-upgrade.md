# Signal Bastion evacuation corridor readiness upgrade

## Summary

Upgraded `games/signal-bastion/` with a renderer-neutral evacuation-corridor readiness domain. The prior completed upgrade was `experiments/fogline-relay/`, so this run selected a different route and kept the work on the canonical Signal Bastion route.

## Chosen experiment

```txt
games/signal-bastion/
```

## Why it was chosen

Signal Bastion already had command fractal, wave choreography, and frontline tactics descriptors, but its human-stakes layer was still implicit. The game defended a vital point, yet did not expose civilian evacuation lanes, triage caches, gate integrity, power relay load, reserve convoy readiness, or final siren pressure as explicit descriptor domains.

This made it a good low-variability target: the base defense loop was stable, but the decision surface could become more meaningful without changing renderer ownership or creating a new route.

## Last upgraded experiment

```txt
experiments/fogline-relay/
```

Latest known prior ledger/commit context:

```txt
7d73dbb11b60f2ce8fc9d5ae3c779a56ba609e6e
Log Fogline survivor rescue upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Campaign map / Roman cavalry strategy route | Medium campaign loop | campaign map, world actions, orders, logistics | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer | Short arcade loop | movement, jump, coins, hazards, exit, skill rhythm | No changed runtime import found in manifest audit | Yes |
| `experiments/next-ledge/` | Grapple/climbing rescue route | Short skill loop | grapple, swing, cargo, traversal, rescue line | No changed runtime import found in manifest audit | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract | No changed runtime import found in manifest audit | Yes |
| `experiments/the-open-above/` | Bird flight sandbox | Open-ended flight loop | bird flight, terrain, sky descriptors, route readability | No changed runtime import found in manifest audit | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive / short ecology loop | grass, flowers, sheep, pasture route, flock safety | No changed runtime import found in manifest audit | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue | No changed runtime import found in manifest audit | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration / beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora launch gateway | Very short gateway | route preview, launch rehearsal, flightplan, preflight challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing | No changed runtime import found in manifest audit | Yes |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, frontline tactics | ProtoKits imports remain for generic defense bridges; changed runtime uses NexusEngine main CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
signal-bastion-evacuation-corridor-readiness-domain
├─ civilian-route-domain
│  ├─ evacuation-lane-domain
│  │  └─ bastion-civilian-evacuation-lane-kit
│  └─ casualty-cache-domain
│     └─ bastion-casualty-cache-triage-kit
├─ infrastructure-pressure-domain
│  ├─ gate-integrity-domain
│  │  └─ bastion-gate-integrity-shield-kit
│  └─ power-relay-domain
│     └─ bastion-power-relay-load-kit
├─ command-commitment-domain
│  ├─ reserve-convoy-domain
│  │  └─ bastion-reserve-convoy-thread-kit
│  └─ final-siren-domain
│     └─ bastion-final-siren-countdown-kit
└─ renderer-handoff
   └─ bastion-evacuation-corridor-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
bastion-civilian-evacuation-lane-kit
bastion-casualty-cache-triage-kit
bastion-gate-integrity-shield-kit
bastion-power-relay-load-kit
bastion-reserve-convoy-thread-kit
bastion-final-siren-countdown-kit
bastion-evacuation-corridor-renderer-handoff-kit
signal-bastion-evacuation-corridor-readiness-domain-kit
```

Changed composition:

```txt
signal-bastion-composed-renderer-handoff
GameHost.getEvacuationCorridorReadiness()
GameHost.getSignalBastionEvacuationCorridorReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
games/signal-bastion/src/signal-bastion-evacuation-corridor-readiness-domain-kit.js
games/signal-bastion/src/boot.js
games/signal-bastion/index.html
tests/signal-bastion-evacuation-corridor-readiness-kits-smoke.mjs
tests/signal-bastion-evacuation-corridor-readiness-cdn-state-input-smoke.mjs
tests/signal-bastion-frontline-tactics-domain-kits-smoke.mjs
tests/signal-bastion-frontline-tactics-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1314-signal-bastion-evacuation-corridor-upgrade.md
```

## Tests added

```txt
tests/signal-bastion-evacuation-corridor-readiness-kits-smoke.mjs
tests/signal-bastion-evacuation-corridor-readiness-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
civilian evacuation lanes
casualty cache triage cells
gate integrity shield segments
power relay load threads
reserve convoy threads
final siren rings
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed boot file
route shell cache marker
GameHost exposure
renderer handoff counts
manifest registration
existing Signal Bastion validation routing
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new evacuation-corridor readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

Signal Bastion still imports generic defense ProtoKits from `NexusRealtime-ProtoKits` for existing defense bridge functionality. This is not a changed runtime import to `LuminaryLabs-Dev/NexusRealtime@main`.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
games/signal-bastion/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

New descriptors reuse existing renderer-supported descriptor kinds:

```txt
economy-flow-ribbon-set
tower-synergy-cell-set
path-threat-gradient
enemy-intent-thread-set
wave-readiness-glyph
```

This made the pass visually meaningful without requiring a renderer rewrite.

## Non-game handling

Signal Bastion is already a small experience-driven web game, so no delete/rename/refactor-away action was needed.

The lesson captured: its defense mechanics were functional, but the stakes were mostly abstract. Evacuation descriptors turn the vital defense point into a readable civilian corridor problem.

## Next safe ledge

Add an optional `civilian-convoy-state` layer that lets future runs turn evacuation descriptors into actual score pressure:

```txt
civilians waiting
civilians moving
convoy interrupted
triage saved
exit reached
```

Keep that future layer as a state kit that still emits descriptors and does not own renderer/input/frame-loop concerns.
