# Rogue-Lite Hellscape Siege ash caravan readiness upgrade

## Summary

Upgraded `games/rogue-lite-hellscape-siege/` with a renderer-neutral ash caravan readiness domain. The latest completed upgrade before this run was `games/signal-bastion/`, so this run selected a different canonical game route and kept all work inside `LuminaryLabs-Agents/NexusEngine-Experiments` on `main`.

## Chosen experiment

```txt
games/rogue-lite-hellscape-siege/
```

## Why it was chosen

Rogue-Lite Hellscape Siege already had realm portals, harvesting, inventory, build placement, core defense, expedition readability, siegecraft readiness, and infernal contract pressure.

It still needed a more human-stakes objective layer. The ash caravan pass adds survivor caravan columns, soul lantern guidance, hellgate breach mapping, ash shelter pockets, brimstone ration caches, and dawn extraction circles. This makes the route read less like only a resource-defense board and more like a siege evacuation with people to move, routes to protect, and a final extraction condition.

## Last upgraded experiment

```txt
games/signal-bastion/
```

Latest prior completed ledger context:

```txt
.agent/turn-ledger/2026-07-08-1745-signal-bastion-reconstruction-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller diagnostic and training route | Short sandbox | WASD, spring-arm camera, debug rays, navigation challenge, stealth extraction | No changed runtime import found in manifest audit | Yes |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | Short narrative route | scene navigation, inventory, gates, oracle readability, clue pressure, evidence ritual readiness | No old NexusRealtime runtime CDN in changed evidence ritual files | Yes |
| `apps/the-cavalry-of-rome/` | Roman strategy campaign map | Medium campaign loop | campaign map, world actions, orders, logistics, diplomatic command, field hospital readiness | No changed runtime import found in manifest audit | Yes |
| `experiments/vr-platformer-board/` | Board-style platformer rescue course | Short arcade loop | A/D movement, Space jump, coins, hazards, exit, companion rescue | No old NexusRealtime import in changed companion rescue files | Yes |
| `experiments/next-ledge/` | Grapple and climbing mountain rescue route | Short skill loop | grapple, swing, cargo, traversal, anchor timing, rescue line, summit bivouac | Shared loader keeps historical helper name, changed overlays use NexusEngine main CDN | Yes |
| `experiments/infinite-radial-terrain/` | Infinite radial terrain survey route | Open-ended short flight loop | camera flight, radial LOD, wayfinding, survey contract, basecamp resupply | No old NexusRealtime import in changed basecamp resupply files | Yes |
| `experiments/the-open-above/` | Open flight sandbox | Open-ended flight loop | bird flight, terrain streaming, route readability, aerial courier readiness | Shared loader retains historical NexusRealtime helper name; changed overlays use NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Pastoral meadow scene | Passive scene now upgraded into short harvest prep loop | grass, flowers, sheep, ecology, flock safety, harvest festival readiness | No old NexusRealtime import in changed harvest festival files | Yes |
| `experiments/fogline-relay/` | Fog rescue relay route | Short first-person route | movement, scan, relays, operator rhythm, survivor rescue, storm evacuation, blackout recovery | No old NexusRealtime runtime CDN in changed blackout recovery files | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island restoration and beacon activation route | Medium objective loop | scan, harvest, build, cargo, storm anchor, harbor relief | No old NexusRealtime runtime CDN in changed harbor relief files | Yes |
| `experiments/sora-the-infinite/` | Sora route-preview gateway | Very short gateway / rescue rehearsal | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue | No old NexusRealtime import in changed sky rescue files | Yes |
| `experiments/zombie-orchard/` | Orchard survival wave route | Short survival loop | move, collect, waves, foraging, horde pathing, cure crafting | ProtoKits import remains for generic survival stack | Yes for changed overlays |
| `experiments/tropical-island-scene/` | Tropical lagoon exploration route | Passive / short salvage loop | orbit, fish, coconuts, lagoon navigation, reef rescue, tide salvage | Legacy local import map remains for old island/water stack | Yes for changed overlays |
| `experiments/cozy-island/` | Cozy procedural island scene | Passive / short castaway comfort loop | cloudbar island, campfire, smoke, grass, clouds, castaway comfort | Legacy NexusRealtime ProtoKits remain in cloudbar generation | Yes for changed overlay |
| `games/signal-bastion/` | 2.5D tower defense route | 30-wave defense loop | tower placement, upgrades, waves, command descriptors, evacuation corridor, reconstruction readiness | ProtoKits imports remain for generic defense bridges; changed reconstruction files do not import old NexusRealtime runtime CDN | Yes |
| `games/rogue-lite-hellscape-siege/` | Hellscape defense roguelite | Medium survival and defense loop | harvesting, inventory, build, core defense, siegecraft, infernal contract, ash caravan readiness | Shared route shell still uses a historical page-loader helper name; changed runtime imports NexusEngine main CDN and not old NexusRealtime runtime CDN | Yes |

## Domain ASCII tree

```txt
hellscape-ash-caravan-readiness-domain
├─ survivor-route-domain
│  ├─ survivor-caravan-domain
│  │  └─ hellscape-survivor-caravan-column-kit
│  └─ soul-lantern-domain
│     └─ hellscape-soul-lantern-chain-kit
├─ hazard-relief-domain
│  ├─ hellgate-breach-domain
│  │  └─ hellscape-hellgate-breach-map-kit
│  └─ ash-shelter-domain
│     └─ hellscape-ash-shelter-pocket-kit
├─ extraction-provision-domain
│  ├─ brimstone-ration-domain
│  │  └─ hellscape-brimstone-ration-cache-kit
│  └─ dawn-extraction-domain
│     └─ hellscape-dawn-extraction-circle-kit
└─ renderer-handoff
   └─ hellscape-ash-caravan-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
hellscape-survivor-caravan-column-kit
hellscape-soul-lantern-chain-kit
hellscape-hellgate-breach-map-kit
hellscape-ash-shelter-pocket-kit
hellscape-brimstone-ration-cache-kit
hellscape-dawn-extraction-circle-kit
hellscape-ash-caravan-renderer-handoff-kit
hellscape-ash-caravan-readiness-domain-kit
```

Changed composition:

```txt
GameHost.getAshCaravanReadiness()
GameHost.getHellscapeAshCaravanReadiness()
GameHost.getAshCaravanReadinessTree()
GameHost.getRendererHandoff()
```

The ash caravan domain patches the existing host through the base runtime path and composes ash caravan descriptors after the existing visual, expedition, siegecraft, and infernal contract descriptors.

## Files changed

```txt
games/rogue-lite-hellscape-siege/src/hellscape-ash-caravan-readiness-domain-kit.js
games/rogue-lite-hellscape-siege/src/main.js
games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js
games/rogue-lite-hellscape-siege/index.html
tests/hellscape-ash-caravan-readiness-domain-kits-smoke.mjs
tests/hellscape-ash-caravan-readiness-cdn-state-input-smoke.mjs
tests/hellscape-siege-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1813-hellscape-ash-caravan-upgrade.md
```

## Tests added

```txt
tests/hellscape-ash-caravan-readiness-domain-kits-smoke.mjs
tests/hellscape-ash-caravan-readiness-cdn-state-input-smoke.mjs
```

Both tests use 10 intake cases.

The kit smoke validates:

```txt
survivor caravan columns
soul lantern chains
hellgate breach maps
ash shelter pockets
brimstone ration caches
dawn extraction circles
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership boundary
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed runtime files
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through the existing Hellscape CDN/state smoke
10 simulated state/input outcomes
```

## Validation results

Static/wired validation completed through connector-safe inspection.

A local generated-file preflight smoke for the new ash caravan domain logic passed 10 intake cases before committing the kit.

The new ash caravan tests are routed transitively through:

```txt
tests/hellscape-siege-cdn-state-input-smoke.mjs
```

That parent smoke is already included in both full and deploy check suites, so the new checks run when the standard validation entrypoints run.

Runtime repo-wide shell execution was not available in this connector run, so this ledger does not claim a completed local `npm run check` or `npm run check:deploy` run.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime files use or preserve:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`games/rogue-lite-hellscape-siege/src/main.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`games/rogue-lite-hellscape-siege/index.html` still imports the shared page-loader helper whose function name contains `NexusRealtime`. That helper name is preserved as historical shared shell infrastructure; the changed runtime path is still moved toward NexusEngine main CDN.

The new ash caravan readiness kit does not import old NexusRealtime and does not own DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, or the frame loop.

## Cleanup pass

Kept the upgrade on the canonical base route:

```txt
games/rogue-lite-hellscape-siege/
```

No new versioned route was created.

No destructive route deletion was performed.

The existing manifest note for removed legacy `games/rogue-lite-hellscape-siege-v2/` was preserved.

Reusable ash caravan logic stayed in atomic kits.

The renderer consumes descriptor buckets and does not own ash caravan truth.

## Non-game handling

Rogue-Lite Hellscape Siege is a small experience-driven web game route. It was not deleted or renamed because it already provides useful movement, harvesting, inventory, build placement, core defense, expedition, siegecraft, and infernal contract functionality.

Lesson captured: a defense roguelite becomes more legible when civilian evacuation, safe shelter, rations, breaches, and dawn extraction are modeled as their own descriptor domain instead of being hidden inside enemy waves or renderer logic.

## Next safe ledge

Turn ash caravan descriptors into a light headless objective ledger:

```txt
caravans escorted
lantern chains stabilized
hellgate breaches sealed
shelter pockets filled
ration caches secured
dawn circles opened
```

Keep that future layer as a headless state kit and let renderer/canvas presentation continue consuming descriptors only.
