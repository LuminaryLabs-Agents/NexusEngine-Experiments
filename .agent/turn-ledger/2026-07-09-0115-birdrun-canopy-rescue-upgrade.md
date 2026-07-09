# 2026-07-09 01:15 — BirdRun canopy rescue upgrade

## Summary

Upgraded `experiments/BirdRun/` from a static placeholder page into a playable canvas runner backed by renderer-neutral canopy rescue kits. BirdRun now has lane switching, wingbeat altitude, deterministic grove obstacles, glowing nestling rescue beacons, collision windows, rescue scoring, a NexusEngine main CDN entry, and 10-case smoke/state validation.

## Plan ledger

Goal: make BirdRun a real small experience-driven web game while keeping reusable play logic in atomic descriptor kits and leaving DOM, input, canvas drawing, and frame-loop ownership in the route entry only.

Checklist:

- [x] Read root `.agent` guidance.
- [x] Checked latest repo commits and found the last completed upgrade was `experiments/sora-the-infinite/` through sky rookery migration readiness.
- [x] Picked a different route: `experiments/BirdRun/`.
- [x] Listed experiment inventory before choosing.
- [x] Replaced the static BirdRun placeholder with a playable route shell.
- [x] Added atomic headless BirdRun canopy rescue kits.
- [x] Added NexusEngine main CDN route entry.
- [x] Added `GameHost.getBirdRunCanopyRescueReadiness()`.
- [x] Added `GameHost.getCanopyRescueReadiness()`.
- [x] Added `GameHost.getBirdRunCanopyRescueReadinessTree()`.
- [x] Added `GameHost.getRendererHandoff()` descriptor composition.
- [x] Added 10-case kit smoke validation.
- [x] Added 10-case CDN/state-input validation.
- [x] Ran scratch Node validation before connector writes.
- [x] Wrote this timestamped `.agent` changelog.
- [x] Pushed directly to `main` through purpose-driven commits.

## Chosen experiment

`experiments/BirdRun/`

## Why it was chosen

The latest completed upgrade was `experiments/sora-the-infinite/`, so this run intentionally selected a different experiment. BirdRun was also the weakest route found in the current known inventory because it was only a static HTML placeholder with a short description instead of an actual playable loop. The upgrade converts it into a small game without deleting useful intent.

## Last upgraded experiment

`experiments/sora-the-infinite/` via sky rookery migration readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `experiments/BirdRun/` | Bird forward runner placeholder, now canopy rescue runner | was 0 min, now 2-4 min | lane switching, altitude flap, grove dodging, nestling rescue beacons, score/restart | no | yes in changed entry |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth/medevac descriptors | no changed runtime import | yes via overlays |
| `experiments/peer-scene-transition/` | Multi-scene transition investigation route | 5-8 min | scene travel, inventory gates, clues, evidence/flood rescue descriptors | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | 8-12 min | campaign map, orders, logistics, diplomacy, hospital/grain convoy descriptors | no changed pass import | yes |
| `experiments/vr-platformer-board/` | Flat VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue descriptors | no changed runtime import | yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac, ravine evacuation | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight | 4-7 min | camera flight, LOD rings, survey, observatory evacuation | no changed runtime import | yes |
| `experiments/the-open-above/` | Bird flight / aerial courier route | 4-7 min | flight, terrain streaming, courier, storm shelter, alpine/ridge clinic | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 3-6 min | grass, flowers, sheep, flock safety, pollinator/night-watch descriptors | no changed runtime import | yes |
| `experiments/fogline-relay/` | First-person relay/scanning route | 5-8 min | movement, scan, relays, rescue, storm, radio, blackout, ambulance/clinic | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | Frontier island signal route | 5-9 min | harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Route preview gateway / flight-readiness lab | 2-4 min | route preview, launch rehearsal, flightplan, sky negotiation, preflight, microflight, rescue, lighthouse, rookery migration | no changed runtime import | yes |
| `experiments/zombie-orchard/` | Survival orchard route | 5-8 min | move, collect, survival waves, cure crafting, safehouse/well restoration | no changed runtime import | yes |
| `experiments/tropical-island-scene/` | Tropical island orbit scene | 3-6 min | orbit, lagoon navigation, reef rescue, salvage, storm clinic, rainwater, mangrove nursery | legacy local island/water stack remains | yes in changed overlays |
| `experiments/cozy-island/` | Cozy generated island scene | 3-6 min | cloudbar island, campfire, castaway comfort, tidepool, turtle, lagoon lantern rescue | legacy ProtoKits cloudbar remains | yes in changed overlays |
| `games/signal-bastion/` | Oblique defense board | 10-15 min | placement, waves, command, evacuation, reconstruction | preserved generic defense ProtoKits | yes |
| `games/rogue-lite-hellscape-siege/` | Resource-defense roguelite board | 8-12 min | portals, harvesting, build, core defense, siegecraft, ash caravan/sanctuary forge | no changed runtime import | yes |

## Domain ASCII tree

```txt
bird-run-canopy-rescue-readiness-domain
├─ flight-control-domain
│  ├─ lane-intent-domain
│  │  └─ bird-run-lane-intent-kit
│  └─ wingbeat-motion-domain
│     └─ bird-run-wingbeat-motion-kit
├─ forest-course-domain
│  ├─ obstacle-grove-domain
│  │  └─ bird-run-obstacle-grove-kit
│  └─ nestling-rescue-domain
│     └─ bird-run-nestling-rescue-beacon-kit
├─ scoring-safety-domain
│  ├─ collision-window-domain
│  │  └─ bird-run-collision-window-kit
│  └─ rescue-ledger-domain
│     └─ bird-run-rescue-ledger-kit
└─ renderer-handoff
   └─ bird-run-canopy-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `bird-run-lane-intent-kit`
- `bird-run-wingbeat-motion-kit`
- `bird-run-obstacle-grove-kit`
- `bird-run-nestling-rescue-beacon-kit`
- `bird-run-collision-window-kit`
- `bird-run-rescue-ledger-kit`
- `bird-run-canopy-rescue-renderer-handoff-kit`
- `bird-run-canopy-rescue-readiness-domain-kit`

Changed route composition:

- `GameHost.getBirdRunCanopyRescueReadiness()`
- `GameHost.getCanopyRescueReadiness()`
- `GameHost.getBirdRunCanopyRescueReadinessTree()`
- `GameHost.getRendererHandoff()` now returns `birdRunCanopyRescue` descriptors and `birdRunCanopyRescueDescriptorCount`.

## Files changed

```txt
experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js
experiments/BirdRun/bird-run-canopy-rescue-entry.js
experiments/BirdRun/index.html
tests/bird-run-canopy-rescue-readiness-kits-smoke.mjs
tests/bird-run-canopy-rescue-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0115-birdrun-canopy-rescue-upgrade.md
```

## Tests added

```txt
tests/bird-run-canopy-rescue-readiness-kits-smoke.mjs
tests/bird-run-canopy-rescue-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake/state cases.

The kit smoke validates:

```txt
lane intent descriptors
wingbeat motion descriptors
obstacle grove descriptors
nestling rescue beacon descriptors
collision window descriptors
rescue ledger descriptors
renderer handoff descriptor counts
JSON serializability
bounded lanes and numeric state
renderer-neutral ownership policy
```

The CDN/state-input smoke validates:

```txt
route marker
cache-busted route entry
NexusEngine main CDN import
old NexusRealtime runtime absence in changed entry
GameHost exposure
renderer handoff composition
DOM/frame-loop absence from reusable kit file
10 simulated input/state outcomes
```

## Validation results

Static/local scratch validation completed before connector writes:

- `node --check experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js` passed.
- `node --check experiments/BirdRun/bird-run-canopy-rescue-entry.js` passed.
- `node --check tests/bird-run-canopy-rescue-readiness-kits-smoke.mjs` passed.
- `node --check tests/bird-run-canopy-rescue-cdn-state-input-smoke.mjs` passed.
- `node tests/bird-run-canopy-rescue-readiness-kits-smoke.mjs` passed with 10 intake cases.
- `node tests/bird-run-canopy-rescue-cdn-state-input-smoke.mjs` passed with 10 intake cases.

Connector limitation:

- Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because the sandbox could not resolve `github.com`.
- The fixed `scripts/run-checks.mjs` suite was not rewritten in this pass. The new tests are present as direct Node smoke scripts and their syntax is covered by `tests/js-syntax-smoke.mjs` during full checks because that smoke walks all `experiments`, `games`, and `tests` JS/MJS files.

Expected repo commands:

```bash
node tests/bird-run-canopy-rescue-readiness-kits-smoke.mjs
node tests/bird-run-canopy-rescue-cdn-state-input-smoke.mjs
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`experiments/BirdRun/bird-run-canopy-rescue-entry.js` imports NexusEngine main CDN and does not import old `NexusRealtime@main`.

`experiments/BirdRun/bird-run-canopy-rescue-domain-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

## Cleanup pass

- Replaced the static BirdRun placeholder with one canonical playable route.
- Did not create a versioned duplicate route.
- Did not delete useful functionality.
- Kept canvas drawing, DOM event wiring, and frame-loop code in the route entry only.
- Kept reusable logic in atomic descriptor-producing kits.
- Preserved the original intent: a bird forward runner that dodges trees and survives distance.
- Added a concrete objective: rescue glowing nestlings while maintaining speed and avoiding canopy collisions.

## Non-game handling

BirdRun was already intended to be a small runner, but it was only a static placeholder. It was not deleted or renamed because the useful intent was clear. The lesson is that placeholder routes should become canonical playable proofs before receiving additional narrative overlays.

## Manifest note

`experiments/domain-kit-cutover-manifest.json` remains a large one-line JSON blob. This run did not rewrite it to avoid a destructive overwrite through the connector. The route, entry, tests, and ledger now register the pass.

## Next safe ledge

Add BirdRun to the fixed `scripts/run-checks.mjs` suite and gallery metadata once the manifest/check runner can be safely normalized without replacing large one-line files.
