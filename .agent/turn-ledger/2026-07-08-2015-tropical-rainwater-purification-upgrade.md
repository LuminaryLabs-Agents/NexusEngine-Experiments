# 2026-07-08 20:15 - Tropical Island Rainwater Purification Upgrade

## Summary

Upgraded `experiments/tropical-island-scene/` with a renderer-neutral rainwater purification readiness loop. The route now adds roof catchment gutters, palm leaf water channels, charcoal filter beds, cistern boil watches, clay jug ration routes, and dawn hydration stations on top of the existing lagoon, beachcomber, lagoon navigation, weather shelter, reef rescue, tide salvage, and storm clinic layers.

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

The latest logged upgrade before this run was `experiments/the-open-above/` through the storm shelter readiness pass, so this run selected a different route.

Tropical Island still carried one of the clearest passive-scene signatures: it was visually rich and had several descriptor overlays, but most of the late-stage objective pressure centered around rescue/clinic visibility rather than a concrete post-storm survival loop. Rainwater purification gives the route a clearer practical objective: catch water, route it through leaf channels, filter it, boil it, ration it, and prepare dawn hydration stations.

## Last upgraded experiment

`experiments/the-open-above/` via storm shelter readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth extraction | no changed runtime import | yes via wrapper |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | 5-8 min | scene travel, inventory gates, clues, evidence ritual | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Campaign map / command app | 8-12 min | campaign map, orders, logistics, diplomacy, field hospital | no changed pass import | yes |
| `experiments/vr-platformer-board/` | Flat VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue | no changed runtime import | yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac | no changed runtime import | yes |
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
tropical-rainwater-purification-readiness-domain
├─ collection-routing-domain
│  ├─ roof-catchment-domain
│  │  └─ tropical-roof-catchment-gutter-kit
│  └─ palm-leaf-channel-domain
│     └─ tropical-palm-leaf-channel-kit
├─ purification-safety-domain
│  ├─ charcoal-filter-domain
│  │  └─ tropical-charcoal-filter-bed-kit
│  └─ cistern-boil-domain
│     └─ tropical-cistern-boil-watch-kit
├─ ration-handoff-domain
│  ├─ clay-jug-route-domain
│  │  └─ tropical-clay-jug-ration-route-kit
│  └─ dawn-hydration-domain
│     └─ tropical-dawn-hydration-station-kit
└─ renderer-handoff
   └─ tropical-rainwater-purification-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tropical-roof-catchment-gutter-kit`
- `tropical-palm-leaf-channel-kit`
- `tropical-charcoal-filter-bed-kit`
- `tropical-cistern-boil-watch-kit`
- `tropical-clay-jug-ration-route-kit`
- `tropical-dawn-hydration-station-kit`
- `tropical-rainwater-purification-renderer-handoff-kit`
- `tropical-rainwater-purification-readiness-domain-kit`

Changed composition:

- `GameHost.getRainwaterPurificationReadiness()`
- `GameHost.getTropicalRainwaterPurificationReadiness()`
- `GameHost.getRainwaterPurificationReadinessTree()`
- `GameHost.getRendererHandoff()` now composes `rainwaterPurification` descriptors and counts.

## Files changed

```txt
experiments/tropical-island-scene/src/tropical-rainwater-purification-readiness-domain-kit.js
experiments/tropical-island-scene/src/rainwater-purification-readiness-entry.js
experiments/tropical-island-scene/index.html
tests/tropical-rainwater-purification-readiness-kits-smoke.mjs
tests/tropical-rainwater-purification-cdn-state-input-smoke.mjs
tests/tropical-lagoon-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-2015-tropical-rainwater-purification-upgrade.md
```

## Tests added

```txt
tests/tropical-rainwater-purification-readiness-kits-smoke.mjs
tests/tropical-rainwater-purification-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake cases.

The kit smoke validates:

```txt
roof catchment gutter descriptors
palm leaf channel descriptors
charcoal filter bed descriptors
cistern boil watch descriptors
clay jug ration route descriptors
dawn hydration station descriptors
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
manifest registration
validation routing through Tropical lagoon CDN/state smoke
10 simulated state/input outcomes
```

## Validation results

Static/local scratch validation completed before push:

- `node --check` passed for the new kit file.
- `node --check` passed for the new entry file.
- `node --check` passed for the new kit smoke.
- `node --check` passed for the new CDN/state-input smoke.
- The new kit smoke was executed against generated files in scratch and passed all 10 intake cases.
- The new CDN/state-input smoke was executed against generated files in scratch and passed all 10 state/input cases.
- The updated `tests/tropical-lagoon-cdn-state-input-smoke.mjs` was executed in scratch with route stubs and confirmed that it imports both new rainwater validation files.

Connector limitation:

- A full repo clone was not available from the execution sandbox.
- Repo-wide `npm run check` and `npm run check:deploy` were not executed in a cloned workspace.
- The new tests are routed through `tests/tropical-lagoon-cdn-state-input-smoke.mjs`, which is already in the full check suite.

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

`experiments/tropical-island-scene/src/rainwater-purification-readiness-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/tropical-island-scene/src/tropical-rainwater-purification-readiness-domain-kit.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

Preserved legacy:

- `experiments/tropical-island-scene/index.html` still contains the existing import map that redirects older `NexusRealtime-ProtoKits@0.0.2` island/water kit URLs to local kits.
- `experiments/tropical-island-scene/src/main.js` still imports the older ProtoKit island/water URLs through that local stack.
- This pass only migrated changed files toward NexusEngine main CDN and preserved the working island/water runtime.

## Cleanup pass

- Kept the upgrade on the canonical base route: `experiments/tropical-island-scene/`.
- No versioned route was created.
- No destructive deletion was performed.
- Reusable rainwater purification logic stayed in atomic, descriptor-only kits.
- The overlay only samples host state and presents descriptor buckets.
- Existing lagoon, beachcomber, navigation, weather shelter, reef rescue, tide salvage, and storm clinic passes were preserved.

## Non-game handling

Tropical Island Scene is a small experience-driven web game route. No destructive cleanup was needed.

Lesson captured: a scenic island becomes more playable when post-storm survival needs have a concrete chain of collection, purification, rationing, and dawn handoff rather than only visual rescue markers.

## Next safe ledge

Fold the rainwater purification descriptors into the main HUD so players can see which survival water subgoal is blocking dawn support:

```txt
catchment gutters aligned
leaf channels flowing
charcoal filters clear
cisterns boiled safe
clay jugs routed
hydration stations ready
```
