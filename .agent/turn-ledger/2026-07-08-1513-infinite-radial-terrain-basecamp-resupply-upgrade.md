# Infinite Radial Terrain basecamp resupply readiness upgrade

## Summary

Upgraded `experiments/infinite-radial-terrain/` with a renderer-neutral basecamp resupply readiness domain. The prior completed upgrade was `experiments/the-open-above/`, so this run selected a different canonical route and kept the work on the existing Infinite Radial Terrain base route.

## Chosen experiment

```txt
experiments/infinite-radial-terrain/
```

## Why it was chosen

Infinite Radial Terrain was still one of the more abstract/open-ended canonical routes: it had camera flight, radial LOD, visual descriptors, expedition readability, wayfinding, and survey contract readiness, but the player still lacked a concrete support-logistics loop.

The new pass makes the terrain survey feel more purposeful by adding basecamp resupply pressure: find supply caches, certify landing zones, watch weather windows, route sample crates, identify emergency bivouacs, and read return fuel beacons.

## Last upgraded experiment

```txt
experiments/the-open-above/
```

Latest known prior ledger / commit context:

```txt
7c937bb7cacef41eb8ffc5c0b65dc559c224ca76
Log Open Above aerial courier upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic/training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, clue pressure | No changed runtime import found in manifest audit | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer | Short arcade loop | movement, jump, coins, hazards, exit, skill rhythm | No changed runtime import found in manifest audit | Yes |
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
terrain-basecamp-resupply-readiness-domain
├─ supply-staging-domain
│  ├─ supply-cache-domain
│  │  └─ terrain-basecamp-supply-cache-kit
│  └─ sample-crate-domain
│     └─ terrain-sample-crate-route-kit
├─ landing-safety-domain
│  ├─ landing-zone-domain
│  │  └─ terrain-landing-zone-certification-kit
│  └─ weather-window-domain
│     └─ terrain-weather-window-flag-kit
├─ survival-return-domain
│  ├─ bivouac-shelter-domain
│  │  └─ terrain-emergency-bivouac-shelter-kit
│  └─ return-fuel-domain
│     └─ terrain-return-fuel-beacon-kit
└─ renderer-handoff
   └─ terrain-basecamp-resupply-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
terrain-basecamp-supply-cache-kit
terrain-landing-zone-certification-kit
terrain-weather-window-flag-kit
terrain-sample-crate-route-kit
terrain-emergency-bivouac-shelter-kit
terrain-return-fuel-beacon-kit
terrain-basecamp-resupply-renderer-handoff-kit
terrain-basecamp-resupply-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getBasecampResupplyReadiness()
GameHost.getInfiniteRadialTerrainBasecampResupplyReadiness()
GameHost.getBasecampResupplyReadinessTree()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/_kits/infinite-radial-terrain/terrain-basecamp-resupply-readiness-kits.js
experiments/infinite-radial-terrain/terrain-basecamp-resupply-readiness-entry.js
experiments/infinite-radial-terrain/index.html
tests/infinite-radial-terrain-basecamp-resupply-readiness-kits-smoke.mjs
tests/infinite-radial-terrain-basecamp-resupply-cdn-state-input-smoke.mjs
tests/infinite-radial-terrain-playwright-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1513-infinite-radial-terrain-basecamp-resupply-upgrade.md
```

## Tests added

```txt
tests/infinite-radial-terrain-basecamp-resupply-readiness-kits-smoke.mjs
tests/infinite-radial-terrain-basecamp-resupply-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
basecamp supply cache descriptors
landing zone certification descriptors
weather window flag descriptors
sample crate route descriptors
emergency bivouac shelter descriptors
return fuel beacon descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed basecamp resupply files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Infinite Radial Terrain Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through `tests/infinite-radial-terrain-playwright-state-input-smoke.mjs`, which is already present in both full and deploy validation suites through `scripts/run-checks.mjs`.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed basecamp resupply overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new basecamp resupply readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The changed Infinite Radial Terrain route remains on NexusEngine main CDN for runtime reference.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/infinite-radial-terrain/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares the basecamp resupply pass through the manifest and loads a cache-busted basecamp resupply entry.

## Non-game handling

Infinite Radial Terrain is a small experience-driven terrain-flight route rather than a full progression game. The lesson captured: a survey sandbox becomes more legible when support logistics are exposed as headless descriptors without turning the renderer into the owner of mission truth.

## Next safe ledge

Turn basecamp resupply descriptors into light headless state:

```txt
caches stocked
landing zones certified
weather windows used
sample crates recovered
bivouac shelters marked
fuel beacon route completed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
