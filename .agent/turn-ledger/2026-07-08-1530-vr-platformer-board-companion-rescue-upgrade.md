# VR Platformer Board companion rescue readiness upgrade

## Summary

Upgraded `experiments/vr-platformer-board/` with a renderer-neutral companion rescue readiness domain. The prior completed upgrade was `experiments/infinite-radial-terrain/`, so this run selected a different canonical route and kept the work on the existing VR Platformer Board base route.

## Chosen experiment

```txt
experiments/vr-platformer-board/
```

## Why it was chosen

VR Platformer Board was still one of the more constrained short-form routes: it had movement, jump, coins, hazards, exit, traversal readability, objective readability, and skill rhythm readiness, but the player still lacked a clear rescue-mission layer tying coins, hazards, recovery, and the exit into one meaning loop.

The new pass turns the route into a companion rescue course by adding lost companion beacons, escort lane ribbons, rescue net anchors, shield bubble timing, medal cache signals, and exit stretcher commitment.

## Last upgraded experiment

```txt
experiments/infinite-radial-terrain/
```

Latest known prior ledger / commit context:

```txt
c578e8ea72d3ce72b9d09c5992d309783c8aa9a0
Log Infinite Radial Terrain basecamp resupply upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer rescue course | Short arcade loop | A/D movement, Space jump, coins, hazards, exit, traversal readability, skill rhythm, companion rescue | No old NexusRealtime import in changed companion rescue files | Yes |
| `experiments/next-ledge/` | Grapple/climbing rescue route | Short skill loop | grapple, swing, cargo, traversal, rescue line | No changed runtime import found in manifest audit | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract, basecamp resupply | No old NexusRealtime import in changed basecamp resupply files | Yes |
| `experiments/the-open-above/` | Bird flight sandbox | Open-ended flight loop | bird flight, terrain streaming, route readability, aerial courier readiness | Shared loader retains historical NexusRealtime name; runtime config and changed overlays use NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive / short ecology loop | grass, flowers, sheep, pasture route, flock safety | No changed runtime import found in manifest audit | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue | No changed runtime import found in manifest audit | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration / beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor | No changed runtime import found in manifest audit | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short rescue overlay loop | orbit, fish, coconuts, lagoon navigation, reef rescue | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
vr-board-companion-rescue-readiness-domain
├─ companion-route-domain
│  ├─ lost-companion-domain
│  │  └─ vr-board-lost-companion-beacon-kit
│  └─ escort-lane-domain
│     └─ vr-board-escort-lane-ribbon-kit
├─ hazard-triage-domain
│  ├─ rescue-net-domain
│  │  └─ vr-board-rescue-net-anchor-kit
│  └─ shield-bubble-domain
│     └─ vr-board-shield-bubble-timing-kit
├─ exit-handoff-domain
│  ├─ medal-cache-domain
│  │  └─ vr-board-medal-cache-signal-kit
│  └─ exit-stretcher-domain
│     └─ vr-board-exit-stretcher-commit-kit
└─ renderer-handoff
   └─ vr-board-companion-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
vr-board-lost-companion-beacon-kit
vr-board-escort-lane-ribbon-kit
vr-board-rescue-net-anchor-kit
vr-board-shield-bubble-timing-kit
vr-board-medal-cache-signal-kit
vr-board-exit-stretcher-commit-kit
vr-board-companion-rescue-renderer-handoff-kit
vr-board-companion-rescue-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getCompanionRescueReadiness()
GameHost.getVrBoardCompanionRescueReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/_kits/vr-platformer-board/vr-board-companion-rescue-readiness-kits.js
experiments/vr-platformer-board/index.html
tests/vr-board-companion-rescue-readiness-kits-smoke.mjs
tests/vr-board-companion-rescue-cdn-state-input-smoke.mjs
tests/vr-platformer-board-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1530-vr-platformer-board-companion-rescue-upgrade.md
```

## Tests added

```txt
tests/vr-board-companion-rescue-readiness-kits-smoke.mjs
tests/vr-board-companion-rescue-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
lost companion beacon descriptors
escort lane ribbon descriptors
rescue net anchor descriptors
shield bubble timing descriptors
medal cache signal descriptors
exit stretcher commitment descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed VR board files
route integration tokens
GameHost exposure
renderer handoff composition
manifest registration
validation routing through VR Platformer Board Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through `tests/vr-platformer-board-playwright-state-input-smoke.mjs`, which is already present in both full and deploy validation suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed companion rescue route uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new companion rescue readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The changed VR Platformer Board route remains on NexusEngine main CDN for runtime reference.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/vr-platformer-board/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now draws the companion rescue layer from descriptor buckets only and records the pass in the manifest.

## Non-game handling

VR Platformer Board is a small experience-driven web game. The lesson captured: a training board becomes more legible when collectible, hazard, recovery, and exit pressure are surfaced as one rescue contract without letting renderer code own mission truth.

## Next safe ledge

Turn companion rescue descriptors into light headless state:

```txt
companions found
escort lanes cleared
rescue nets armed
shield windows used
medals cached
exit stretcher committed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
