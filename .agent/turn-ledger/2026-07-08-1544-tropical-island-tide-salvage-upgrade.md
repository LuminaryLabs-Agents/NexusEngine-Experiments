# Tropical Island tide salvage readiness upgrade

## Summary

Upgraded `experiments/tropical-island-scene/` with a renderer-neutral tide salvage readiness domain. The prior completed upgrade was `experiments/vr-platformer-board/`, so this run selected a different canonical route and kept the work on the existing Tropical Island base route.

## Chosen experiment

```txt
experiments/tropical-island-scene/
```

## Why it was chosen

Tropical Island was still one of the most passive routes in the current inventory: it had island orbit, fish, coconuts, lagoon visuals, navigation readability, weather shelter, and reef rescue overlays, but the player still lacked an explicit salvage economy that turns lagoon hazards and reef rescue into a concrete objective loop.

The new pass adds shipwreck cargo beacons, pearl cache glimmers, tide surge windows, reef cut hazards, outrigger route threads, and sunset market delivery beacons.

## Last upgraded experiment

```txt
experiments/vr-platformer-board/
```

Latest known prior ledger / commit context:

```txt
ed01c8e4e0012fbcb3135fdb7a4b8edc22fdd26c
Log VR board companion rescue upgrade
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
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor | ProtoKits imports remain for generic defense bridges | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival/defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract | No changed runtime import found in manifest audit | Yes |

## Domain ASCII tree

```txt
tropical-tide-salvage-readiness-domain
├─ salvage-resource-domain
│  ├─ shipwreck-cargo-domain
│  │  └─ tropical-shipwreck-cargo-beacon-kit
│  └─ pearl-cache-domain
│     └─ tropical-pearl-cache-glimmer-kit
├─ lagoon-hazard-domain
│  ├─ tide-surge-domain
│  │  └─ tropical-tide-surge-window-kit
│  └─ reef-cut-domain
│     └─ tropical-reef-cut-hazard-kit
├─ return-handoff-domain
│  ├─ outrigger-route-domain
│  │  └─ tropical-outrigger-route-thread-kit
│  └─ sunset-market-domain
│     └─ tropical-sunset-market-delivery-kit
└─ renderer-handoff
   └─ tropical-tide-salvage-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
tropical-shipwreck-cargo-beacon-kit
tropical-pearl-cache-glimmer-kit
tropical-tide-surge-window-kit
tropical-reef-cut-hazard-kit
tropical-outrigger-route-thread-kit
tropical-sunset-market-delivery-kit
tropical-tide-salvage-renderer-handoff-kit
tropical-tide-salvage-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getTideSalvageReadiness()
GameHost.getTropicalTideSalvageReadiness()
GameHost.getRendererHandoff()
```

## Files changed

```txt
experiments/tropical-island-scene/src/tropical-tide-salvage-readiness-domain-kit.js
experiments/tropical-island-scene/src/tide-salvage-readiness-entry.js
experiments/tropical-island-scene/index.html
tests/tropical-tide-salvage-readiness-kits-smoke.mjs
tests/tropical-tide-salvage-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1544-tropical-island-tide-salvage-upgrade.md
```

## Tests added

```txt
tests/tropical-tide-salvage-readiness-kits-smoke.mjs
tests/tropical-tide-salvage-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
shipwreck cargo beacon descriptors
pearl cache glimmer descriptors
tide surge window descriptors
reef cut hazard descriptors
outrigger route thread descriptors
sunset market delivery descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed tide salvage files
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through full and deploy suites
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

The new tests are routed through `scripts/run-checks.mjs` in both full and deploy validation suites.

Runtime shell execution was not available in this run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed tide salvage overlay uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new tide salvage readiness kit does not import old NexusRealtime and does not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

The older Tropical Island import map still contains historical local redirects for old NexusRealtime ProtoKits in the island/water stack. This was preserved because those legacy imports are outside the changed tide salvage files and still back the existing scene composition.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
experiments/tropical-island-scene/
```

No new versioned route was created.

No destructive route deletion was performed.

No renderer-only logic was moved into reusable kits.

The route shell now draws the tide salvage layer from descriptor buckets only and records the pass in the manifest.

## Non-game handling

Tropical Island is a small experience-driven web scene rather than a full game. The lesson captured: a passive lagoon becomes more legible when existing reef hazards and shelter pressure are reframed as a lightweight salvage economy without letting the renderer own mission truth.

## Next safe ledge

Turn tide salvage descriptors into light headless state:

```txt
cargo recovered
pearls mapped
tide windows used
reef cuts avoided
outrigger lanes cleared
market delivery committed
```

Keep that future layer as a headless state kit and let the renderer continue consuming descriptors only.
