# Cozy Island castaway comfort readiness upgrade

## Summary

Upgraded `experiments/cozy-island/` with a renderer-neutral castaway-comfort readiness domain. The prior completed upgrade was `games/rogue-lite-hellscape-siege/`, so this run selected a different canonical route and kept the work on the existing base Cozy Island route.

## Chosen experiment

```txt
experiments/cozy-island/
```

## Why it was chosen

Cozy Island was still a mostly passive cloudbar island scene. It rendered island landform, foliage, grass, water, campfire, smoke, clouds, and a first-person-ish cozy space, but it did not expose a clear small experience loop.

The new pass adds a castaway-comfort layer: water, food, shade, signal fire, storm cover, and canoe launch windows. This gives the player readable survival choices while leaving reusable logic as snapshot-to-descriptor kits and keeping presentation in the integration entry.

## Last upgraded experiment

```txt
games/rogue-lite-hellscape-siege/
```

Latest known prior ledger/commit context:

```txt
93db408c66d74094d8ec70fa95b955e003dc5ffe
Log Hellscape infernal contract upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
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
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges; changed runtime uses NexusEngine main CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
cozy-island-castaway-comfort-readiness-domain
├─ survival-resource-domain
│  ├─ fresh-water-domain
│  │  └─ cozy-island-fresh-water-spring-kit
│  └─ forage-cache-domain
│     └─ cozy-island-forage-cache-ring-kit
├─ shelter-signal-domain
│  ├─ shade-shelter-domain
│  │  └─ cozy-island-shade-shelter-canopy-kit
│  └─ signal-fire-domain
│     └─ cozy-island-signal-fire-readiness-kit
├─ tide-return-domain
│  ├─ storm-cover-domain
│  │  └─ cozy-island-storm-cover-pocket-kit
│  └─ canoe-launch-domain
│     └─ cozy-island-canoe-launch-window-kit
└─ renderer-handoff
   └─ cozy-island-castaway-comfort-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
cozy-island-fresh-water-spring-kit
cozy-island-forage-cache-ring-kit
cozy-island-shade-shelter-canopy-kit
cozy-island-signal-fire-readiness-kit
cozy-island-storm-cover-pocket-kit
cozy-island-canoe-launch-window-kit
cozy-island-castaway-comfort-renderer-handoff-kit
cozy-island-castaway-comfort-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getCastawayComfortReadinessDomain()
GameHost.getCastawayComfortReadiness()
GameHost.getCozyIslandCastawayComfortReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/cozy-island/cozy-island-castaway-comfort-kits.js
experiments/cozy-island/cozy-island-castaway-comfort-entry.js
experiments/cozy-island/index.html
tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs
tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1359-cozy-island-castaway-comfort-upgrade.md
```

## Tests added

```txt
tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs
tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
fresh water spring descriptors
forage cache ring descriptors
shade shelter canopy descriptors
signal fire readiness descriptors
storm cover pocket descriptors
canoe launch window descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime absence in changed overlay and kit files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests were added to both full and deploy check suites in `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new castaway-comfort readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The existing `cozy-island-cloudbar.js` still imports older `LuminaryLabs-Agents/NexusRealtime-ProtoKits@main` island generation modules. This run did not remove that legacy stack because it still provides landform, foliage, grass, campfire, smoke, fenced clearing, ocean floor, and cloud generation. The changed readiness overlay moved toward NexusEngine main CDN without destructively replacing working island generation.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/cozy-island/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares `castaway-comfort-readiness-renderer-handoff-pass` and loads a cache-busted castaway comfort entry.

## Non-game handling

Cozy Island is a small experience-driven web scene, but before this pass it was mostly passive. The lesson captured: a visually rich island still needs a readable intent loop. Castaway comfort descriptors provide a light survival loop without turning the scene into a heavy systems game.

## Next safe ledge

Turn castaway-comfort descriptors into light headless state:

```txt
water collected
forage gathered
shade rest timer
signal fire maintained
storm shelter committed
canoe launch preparation
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
