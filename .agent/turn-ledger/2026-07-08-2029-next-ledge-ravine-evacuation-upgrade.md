# 2026-07-08 20:29 — Next Ledge ravine evacuation readiness upgrade

## Summary

Upgraded `experiments/next-ledge/` with a renderer-neutral ravine evacuation readiness loop. The route now adds ravine caller beacons, cliff stretcher routes, pulley anchor arrays, crosswind gap windows, signal smoke columns, and valley pickup zones on top of the existing grapple, cargo, rescue-line, and summit-bivouac layers.

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest logged upgrade before this run was `experiments/tropical-island-scene/` through the rainwater purification readiness pass, so this run selected a different route.

Next Ledge already had strong traversal mechanics, cargo extraction, rescue-line readability, and summit-bivouac survival descriptors. It still lacked a concrete human-stakes extraction loop that made the ravine itself feel populated, dangerous, and operationally recoverable. Ravine evacuation gives the route a clearer objective layer: locate callers, mark stretcher paths, stabilize pulley anchors, time crosswind gaps, raise smoke, and prepare valley pickup.

## Last upgraded experiment

`experiments/tropical-island-scene/` via rainwater purification readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth extraction | no changed runtime import | yes via wrapper |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | 5-8 min | scene travel, inventory gates, clues, evidence ritual | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Campaign map / command app | 8-12 min | campaign map, orders, logistics, diplomacy, field hospital | no changed pass import | yes |
| `experiments/vr-platformer-board/` | Flat VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue | no changed runtime import | yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac, ravine evacuation | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight | 4-7 min | camera flight, LOD rings, survey, resupply | no changed runtime import | yes |
| `experiments/the-open-above/` | Bird flight / aerial courier route | 4-7 min | flight, terrain streaming, route readability, courier, storm shelter airlift | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 3-6 min | grass, flowers, sheep, flock safety, harvest festival | no changed runtime import | yes |
| `experiments/fogline-relay/` | First-person relay/scanning route | 5-8 min | movement, scan, relays, rescue, storm, radio, blackout | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | Frontier signal island route | 5-9 min | harvest, build mast, objectives, storm anchor, harbor relief | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Route preview gateway / flight-readiness lab | 2-4 min | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue, sky lighthouse | no changed runtime import | yes |
| `experiments/zombie-orchard/` | Survival orchard route | 5-8 min | move, collect, survival waves, cure crafting, safehouse evacuation | no changed runtime import | yes |
| `experiments/tropical-island-scene/` | Tropical island orbit scene | 3-6 min | orbit, lagoon navigation, reef rescue, tide salvage, storm clinic, rainwater purification | legacy local island/water stack remains | yes in changed overlays |
| `experiments/cozy-island/` | Cozy generated island scene | 3-6 min | cloudbar island, campfire, castaway comfort, tidepool stewardship, turtle hatchery | legacy ProtoKits cloudbar still remains | yes in changed overlays |
| `games/signal-bastion/` | Oblique defense board | 10-15 min | placement, waves, command, evacuation, reconstruction | preserved generic defense ProtoKits | yes |
| `games/rogue-lite-hellscape-siege/` | Resource-defense roguelite board | 8-12 min | portals, harvesting, build, core defense, siegecraft, ash caravan | no changed runtime import | yes |

## Domain ASCII tree

```txt
next-ledge-ravine-evacuation-readiness-domain
├─ casualty-location-domain
│  ├─ ravine-caller-domain
│  │  └─ next-ledge-ravine-caller-beacon-kit
│  └─ cliff-stretcher-domain
│     └─ next-ledge-cliff-stretcher-route-kit
├─ safety-rigging-domain
│  ├─ pulley-anchor-domain
│  │  └─ next-ledge-pulley-anchor-array-kit
│  └─ crosswind-gap-domain
│     └─ next-ledge-crosswind-gap-window-kit
├─ extraction-handoff-domain
│  ├─ signal-smoke-domain
│  │  └─ next-ledge-signal-smoke-column-kit
│  └─ valley-pickup-domain
│     └─ next-ledge-valley-pickup-zone-kit
└─ renderer-handoff
   └─ next-ledge-ravine-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `next-ledge-ravine-caller-beacon-kit`
- `next-ledge-cliff-stretcher-route-kit`
- `next-ledge-pulley-anchor-array-kit`
- `next-ledge-crosswind-gap-window-kit`
- `next-ledge-signal-smoke-column-kit`
- `next-ledge-valley-pickup-zone-kit`
- `next-ledge-ravine-evacuation-renderer-handoff-kit`
- `next-ledge-ravine-evacuation-readiness-domain-kit`

Changed composition:

- `GameHost.getRavineEvacuationReadiness()`
- `GameHost.getNextLedgeRavineEvacuationReadiness()`
- `GameHost.getRavineEvacuationReadinessTree()`
- `GameHost.getRendererHandoff()` now composes `ravineEvacuationReadiness` descriptors and counts.

## Files changed

```txt
experiments/next-ledge/src/ravine-evacuation-readiness-kits.js
experiments/next-ledge/src/ravine-evacuation-readiness-entry.js
experiments/next-ledge/index.html
tests/next-ledge-ravine-evacuation-readiness-kits-smoke.mjs
tests/next-ledge-ravine-evacuation-cdn-state-input-smoke.mjs
tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-08-2029-next-ledge-ravine-evacuation-upgrade.md
```

## Tests added

```txt
tests/next-ledge-ravine-evacuation-readiness-kits-smoke.mjs
tests/next-ledge-ravine-evacuation-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake/state cases.

The kit smoke validates:

```txt
ravine caller beacon descriptors
cliff stretcher route descriptors
pulley anchor array descriptors
crosswind gap window descriptors
signal smoke column descriptors
valley pickup zone descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership policy
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed entry
route cache-busting
GameHost exposure
renderer handoff composition
validation routing through Next Ledge anchor timing smoke
10 simulated state/input outcomes
```

## Validation results

Static/local scratch validation completed before push:

- `node --check` passed for the new kit file.
- `node --check` passed for the new entry file.
- `node --check` passed for the new kit smoke.
- `node --check` passed for the new CDN/state-input smoke.
- The new 10-case kit smoke was executed against generated files and passed.
- The new 10-case CDN/state-input smoke was executed against generated files and passed.

Connector limitation:

- Full repo `npm run check` and `npm run check:deploy` were not executed in a cloned workspace in this run.
- The new tests are routed through `tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs`, which already participates in the Next Ledge validation path.

Expected repo commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`experiments/next-ledge/src/ravine-evacuation-readiness-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/next-ledge/src/ravine-evacuation-readiness-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, physics, or the frame loop.

Preserved legacy:

- The route shell still imports `../_shared/nexus-realtime-page-loader.js` as the existing page loader utility. This is preserved as route boot presentation infrastructure, not as the changed runtime source for the new ravine evacuation domain.

## Cleanup pass

- Kept the upgrade on the canonical base route: `experiments/next-ledge/`.
- No versioned route was created.
- No destructive deletion was performed.
- Reusable ravine evacuation logic stayed in atomic, descriptor-only kits.
- The overlay only samples host state and presents descriptor buckets.
- Existing cargo, traversal, anchor timing, rescue-line, and summit-bivouac layers were preserved.

## Non-game handling

Next Ledge is a small experience-driven web game route. No delete, rename, or destructive refactor was required.

Lesson captured: traversal routes become more meaningful when the traversal line supports a concrete rescue operation, not only player movement optimization.

## Next safe ledge

Fold ravine evacuation descriptors into the main HUD / diegetic effects layer so players can see the blocking rescue subgoal directly:

```txt
callers located
stretcher path marked
pulley anchors stable
crosswind gap open
signal smoke visible
valley pickup ready
```
