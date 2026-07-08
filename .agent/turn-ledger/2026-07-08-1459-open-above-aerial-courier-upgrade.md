# The Open Above aerial courier readiness upgrade

## Summary

Upgraded `experiments/the-open-above/` with a renderer-neutral aerial courier readiness domain. The prior completed upgrade was `experiments/sora-the-infinite/`, so this run selected a different canonical route and kept the work on the existing Open Above base route.

## Chosen experiment

```txt
experiments/the-open-above/
```

## Why it was chosen

The Open Above was still one of the more passive canonical routes: it had responsive bird flight, terrain streaming, visual sky descriptors, and route readability, but no clear contract objective beyond free flight.

The new pass gives the route a light objective layer: identify courier pouch targets, fly ribbon checkpoints, keep the ride stable, avoid storm shear, line up meadow drop zones, and return toward a dock beacon.

## Last upgraded experiment

```txt
experiments/sora-the-infinite/
```

Latest known prior ledger / commit context:

```txt
4adee17679a0bfa4f77b1c20fd4aa14e7333fe54
Fix Sora sky rescue island CSS sizing
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
open-above-aerial-courier-readiness-domain
├─ courier-contract-domain
│  ├─ pouch-target-domain
│  │  └─ open-above-courier-pouch-target-kit
│  └─ ribbon-checkpoint-domain
│     └─ open-above-ribbon-checkpoint-kit
├─ passenger-safety-domain
│  ├─ comfort-stability-domain
│  │  └─ open-above-comfort-stability-meter-kit
│  └─ storm-shear-domain
│     └─ open-above-storm-shear-warning-kit
├─ landing-contract-domain
│  ├─ meadow-drop-zone-domain
│  │  └─ open-above-meadow-drop-zone-kit
│  └─ return-dock-domain
│     └─ open-above-return-dock-beacon-kit
└─ renderer-handoff
   └─ open-above-aerial-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
open-above-courier-pouch-target-kit
open-above-ribbon-checkpoint-kit
open-above-comfort-stability-meter-kit
open-above-storm-shear-warning-kit
open-above-meadow-drop-zone-kit
open-above-return-dock-beacon-kit
open-above-aerial-courier-renderer-handoff-kit
open-above-aerial-courier-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getAerialCourierReadiness()
GameHost.getOpenAboveAerialCourierReadiness()
GameHost.getAerialCourierReadinessTree()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/the-open-above/open-above-aerial-courier-readiness-kits.js
experiments/the-open-above/open-above-aerial-courier-entry.js
experiments/the-open-above/index.html
tests/open-above-aerial-courier-readiness-domain-kits-smoke.mjs
tests/open-above-aerial-courier-cdn-state-input-smoke.mjs
tests/open-above-playwright-cdn-state-input-smoke.mjs
tests/open-above-flight-route-readability-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1459-open-above-aerial-courier-upgrade.md
```

## Tests added

```txt
tests/open-above-aerial-courier-readiness-domain-kits-smoke.mjs
tests/open-above-aerial-courier-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
courier pouch target descriptors
ribbon checkpoint descriptors
comfort stability meter descriptors
storm shear warning descriptors
meadow drop zone descriptors
return dock beacon descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed aerial courier files
route shell pass marker and cache busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Open Above Playwright smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are wired into both full and deploy suites in `scripts/run-checks.mjs`, and `tests/open-above-playwright-cdn-state-input-smoke.mjs` now imports both new aerial courier checks before running the browser state/input assertions.

Refreshed the existing Open Above flight-route CDN smoke so it accepts the new `aerial-courier-readiness-20260708` cache marker while still validating the flight-route overlay.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed aerial courier overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new aerial courier readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The route shell still imports the existing shared `nexus-realtime-page-loader.js`, which is a historical loader name already present before this pass. No old NexusRealtime runtime CDN was added.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/the-open-above/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now declares the aerial courier pass through the manifest and loads a cache-busted aerial courier entry.

## Non-game handling

The Open Above is a small experience-driven flight route rather than a full progression game. The lesson captured: free flight becomes more meaningful when the domain exposes objective pressure and safety readability without turning the renderer into the owner of game truth.

## Next safe ledge

Turn aerial courier descriptors into light headless state:

```txt
pouches delivered
ribbon gates cleared
comfort held above threshold
storm shear avoided
meadow drops completed
return dock reached
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
