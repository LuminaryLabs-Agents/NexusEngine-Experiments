# 2026-07-09 01:29 — Stonewake Depths flood rescue upgrade

## Summary

Upgraded `games/stonewake-depths/` from a block-carry hotfix route into a gallery-visible flood rescue game layer backed by renderer-neutral Stonewake flood rescue readiness kits. The route now exposes survivor echo pings, chalk route marks, floodline pressure bands, air pocket caches, rope lift anchors, and a rescue-bell extraction handoff while keeping reusable domain logic out of DOM, canvas, input, assets, audio, and frame-loop ownership.

## Plan ledger

Goal: make Stonewake Depths more objective-driven and visibly procedural by adding a flood rescue readiness domain that composes small atomic kits into descriptor-only renderer handoffs.

Checklist:

- [x] Read root `.agent` guidance.
- [x] Checked latest commits and found the last completed upgrade was `experiments/BirdRun/`.
- [x] Picked a different route: `games/stonewake-depths/`.
- [x] Listed experiment inventory before choosing.
- [x] Chose Stonewake because it was still outside the main gallery and did not yet import NexusEngine main CDN.
- [x] Added atomic Stonewake flood rescue kits.
- [x] Added NexusEngine main CDN overlay entry.
- [x] Patched `GameHost` with `getStonewakeFloodRescueReadiness()`.
- [x] Patched `GameHost` with `getFloodRescueReadiness()`.
- [x] Patched `GameHost` with `getStonewakeFloodRescueReadinessTree()`.
- [x] Patched `GameHost.getRendererHandoff()` to compose `stonewakeFloodRescue` descriptors.
- [x] Added an overlay renderer that consumes descriptors only.
- [x] Predeclared the existing pointer state used by the route mousemove handler.
- [x] Added Stonewake to the gallery data.
- [x] Added 10-case kit smoke validation.
- [x] Added 10-case CDN/state-input validation.
- [x] Ran scratch Node validation before connector writes.
- [x] Wrote this timestamped `.agent` changelog.
- [x] Pushed directly to `main` through purpose-driven commits.

## Chosen experiment

`games/stonewake-depths/`

## Why it was chosen

The latest completed upgrade was `experiments/BirdRun/`, so this pass selected a different route. Stonewake Depths was the weakest safe target because it had a playable but narrow block/plate/valve loop, was listed in the root noscript route fallback but not in the gallery data, and did not yet load NexusEngine main via CDN.

## Last upgraded experiment

`experiments/BirdRun/` via canopy rescue readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---:|---:|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof | 5-8 min | scene travel, inventory gates, clue routing, flood rescue descriptors | no changed runtime import | yes |
| `experiments/vr-platformer-board/` | Floating VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue descriptors | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight | 4-7 min | camera flight, LOD rings, survey, observatory evacuation | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | Procedural meadow route | 3-6 min | terrain, wind, vegetation, creatures, flock/pasture safety descriptors | no changed runtime import | yes |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training lab | 3-6 min | CPU denoising, sampling, checkpoints, training mission descriptors | no changed runtime import | yes |
| `experiments/fogline-relay/` | First-person relay/scanning route | 5-8 min | movement, scan, relays, rescue, storm, radio, blackout, ambulance/clinic | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | Frontier island signal route | 5-9 min | harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Roman campaign command app | 8-12 min | campaign map, orders, logistics, diplomacy, hospital/grain convoy descriptors | no changed pass import | yes |
| `games/signal-bastion/` | Oblique tower defense board | 10-15 min | placement, waves, command, evacuation, reconstruction | preserved generic defense ProtoKits | yes |
| `games/stonewake-depths/` | Flooded cavern block/valve puzzle, now flood rescue route | 4-8 min | move, jump, carry/drop block, plate, valve, rising water, survivor echo pings, air pockets, rope lifts, rescue bell | no | yes in changed entry |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac, ravine evacuation | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Route preview gateway / flight readiness lab | 2-4 min | preview, launch rehearsal, flightplan, rookery migration, microflight descriptors | no changed runtime import | yes |
| `experiments/zombie-orchard/` | Survival orchard route | 5-8 min | move, collect, survival waves, cure crafting, safehouse/well restoration | no changed runtime import | yes |
| `games/rogue-lite-hellscape-siege/` | Resource-defense roguelite board | 8-12 min | portals, harvesting, build, core defense, siegecraft, ash caravan/sanctuary forge | no changed runtime import | yes |
| `experiments/BirdRun/` | Playable canopy runner from last pass | 2-4 min | lane switching, wingbeat altitude, grove dodging, nestling rescue, score/restart | no | yes |
| `experiments/tropical-island-scene/` | Tropical island orbit scene | 3-6 min | orbit, lagoon navigation, reef rescue, salvage, storm clinic, rainwater, mangrove nursery | legacy local island/water stack remains | yes in changed overlays |
| `experiments/cozy-island/` | Cozy generated island scene | 3-6 min | cloudbar island, campfire, castaway comfort, tidepool, turtle, lagoon lantern rescue | legacy ProtoKits cloudbar remains | yes in changed overlays |
| `experiments/the-open-above/` | Bird flight / aerial courier route | 4-7 min | flight, terrain streaming, courier, storm shelter, alpine/ridge clinic | no changed runtime import | yes |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth/medevac descriptors | no changed runtime import | yes via overlays |

## Domain ASCII tree

```txt
stonewake-flood-rescue-readiness-domain
├─ survivor-location-domain
│  ├─ echo-ping-domain
│  │  └─ stonewake-survivor-echo-ping-kit
│  └─ chalk-mark-domain
│     └─ stonewake-chalk-route-mark-kit
├─ water-pressure-domain
│  ├─ floodline-domain
│  │  └─ stonewake-floodline-pressure-band-kit
│  └─ air-pocket-domain
│     └─ stonewake-air-pocket-cache-kit
├─ escape-handoff-domain
│  ├─ rope-lift-domain
│  │  └─ stonewake-rope-lift-anchor-kit
│  └─ rescue-bell-domain
│     └─ stonewake-rescue-bell-handoff-kit
└─ renderer-handoff
   └─ stonewake-flood-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `stonewake-survivor-echo-ping-kit`
- `stonewake-chalk-route-mark-kit`
- `stonewake-floodline-pressure-band-kit`
- `stonewake-air-pocket-cache-kit`
- `stonewake-rope-lift-anchor-kit`
- `stonewake-rescue-bell-handoff-kit`
- `stonewake-flood-rescue-renderer-handoff-kit`
- `stonewake-flood-rescue-readiness-domain-kit`

Changed route composition:

- `GameHost.getStonewakeFloodRescueReadiness()`
- `GameHost.getFloodRescueReadiness()`
- `GameHost.getStonewakeFloodRescueReadinessTree()`
- `GameHost.getRendererHandoff()` now returns `stonewakeFloodRescue` descriptors and `stonewakeFloodRescueDescriptors` count.

## Files changed

```txt
games/stonewake-depths/stonewake-rescue-readiness-kits.js
games/stonewake-depths/stonewake-rescue-readiness-entry.js
games/stonewake-depths/index.html
experiments/_shared/nexus-gallery-data.js
tests/stonewake-flood-rescue-readiness-kits-smoke.mjs
tests/stonewake-flood-rescue-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0129-stonewake-flood-rescue-upgrade.md
```

## Tests added

```txt
tests/stonewake-flood-rescue-readiness-kits-smoke.mjs
tests/stonewake-flood-rescue-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake/state cases.

## Validation results

Static/local scratch validation completed before connector writes:

- `node --check games/stonewake-depths/stonewake-rescue-readiness-kits.js` passed.
- `node --check games/stonewake-depths/stonewake-rescue-readiness-entry.js` passed.
- `node --check experiments/_shared/nexus-gallery-data.js` passed.
- `node --check tests/stonewake-flood-rescue-readiness-kits-smoke.mjs` passed.
- `node --check tests/stonewake-flood-rescue-cdn-state-input-smoke.mjs` passed.
- `node tests/stonewake-flood-rescue-readiness-kits-smoke.mjs` passed with 10 intake cases.
- `node tests/stonewake-flood-rescue-cdn-state-input-smoke.mjs` passed with 10 intake cases.

Connector limitation:

- Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because the sandbox could not resolve `github.com`.
- `scripts/run-checks.mjs` was not rewritten in this pass to avoid unsafe replacement of a large fixed suite file. The new smoke tests are direct Node scripts and their syntax is covered by the existing JS syntax walker during full checks.

## NexusRealtime import audit

Changed runtime entry uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`games/stonewake-depths/stonewake-rescue-readiness-entry.js` imports NexusEngine main CDN and does not import old `NexusRealtime@main`.

`games/stonewake-depths/stonewake-rescue-readiness-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

## Cleanup pass

- Added Stonewake to the gallery data instead of leaving it only in the root noscript fallback.
- Preserved the existing playable block/plate/valve route.
- Predeclared pointer state expected by the existing route mousemove handler.
- Did not delete useful functionality.
- Kept reusable flood rescue logic in atomic descriptor-producing kits.
- Kept canvas drawing, DOM, CDN import, and frame-loop work in the route entry.

## Non-game handling

Stonewake is a small experience-driven web game, so no delete, refactor, or rename was needed. The lesson is that hotfix routes should be lifted into gallery-visible canonical games once they have enough state and validation to be safely surfaced.

## Manifest note

`experiments/domain-kit-cutover-manifest.json` remains a large one-line JSON blob. This run did not rewrite it to avoid a destructive overwrite through the connector. The route, gallery data, entry, tests, and ledger now register the pass.

## Next safe ledge

Normalize `scripts/run-checks.mjs` or convert it to globbed suites, then add `stonewake-flood-rescue-readiness-kits-smoke.mjs` and `stonewake-flood-rescue-cdn-state-input-smoke.mjs` to the fixed check list without replacing the whole file.
