# 2026-07-09 01:01 — Sora sky rookery migration readiness upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` with a renderer-neutral sky rookery migration readiness loop. The route now adds migratory flock vectors, rookery nest anchors, updraft rest columns, storm-gap timing windows, dawn banding rosters, and sanctuary runway handoff descriptors on top of the existing route preview, launch rehearsal, flightplan, sky negotiation, microflight, sky rescue, and sky lighthouse layers.

## Plan ledger

Goal: make Sora less like a passive route gateway and more like an objective-driven conservation launch mission while keeping reusable logic out of DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.

Checklist:

- [x] Read root `.agent` guidance.
- [x] Checked latest repo commits and observed the latest completed route work was `experiments/tropical-island-scene/` through the tropical mangrove nursery pass.
- [x] Picked a different route: `experiments/sora-the-infinite/`.
- [x] Added atomic sky rookery migration kits.
- [x] Added NexusEngine main CDN overlay.
- [x] Loaded the new pass from the route shell.
- [x] Added a lightweight route style marker for the new objective layer.
- [x] Patched `GameHost.getRendererHandoff()` to compose rookery descriptors.
- [x] Added `GameHost.getSkyRookeryMigrationReadiness()` and `GameHost.getSoraSkyRookeryMigrationReadiness()`.
- [x] Added 10-case kit smoke validation.
- [x] Added 10-case CDN/state-input validation.
- [x] Routed the new tests through `tests/sora-compatibility-cdn-state-input-smoke.mjs`.
- [x] Wrote this timestamped `.agent` changelog.
- [x] Pushed directly to `main` through purpose-driven commits.

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest observed route upgrade before this run was `experiments/tropical-island-scene/`, so this run intentionally selected a different experiment. Sora was also one of the least direct small-game routes because it functions as a preview / launch gateway; adding a rookery migration mission gives it a concrete objective layer without deleting useful gateway functionality.

## Last upgraded experiment

`experiments/tropical-island-scene/` via tropical mangrove nursery readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
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
sora-sky-rookery-migration-readiness-domain
├─ flock-guidance-domain
│  ├─ migratory-vector-domain
│  │  └─ sora-migratory-flock-vector-kit
│  └─ rookery-anchor-domain
│     └─ sora-rookery-nest-anchor-kit
├─ weather-shelter-domain
│  ├─ updraft-rest-domain
│  │  └─ sora-updraft-rest-column-kit
│  └─ storm-gap-domain
│     └─ sora-storm-gap-timing-kit
├─ sanctuary-handoff-domain
│  ├─ dawn-banding-domain
│  │  └─ sora-dawn-banding-roster-kit
│  └─ sanctuary-runway-domain
│     └─ sora-sanctuary-runway-handoff-kit
└─ renderer-handoff
   └─ sora-sky-rookery-migration-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `sora-migratory-flock-vector-kit`
- `sora-rookery-nest-anchor-kit`
- `sora-updraft-rest-column-kit`
- `sora-storm-gap-timing-kit`
- `sora-dawn-banding-roster-kit`
- `sora-sanctuary-runway-handoff-kit`
- `sora-sky-rookery-migration-renderer-handoff-kit`
- `sora-sky-rookery-migration-readiness-domain-kit`

Changed composition:

- `GameHost.getSkyRookeryMigrationReadiness()`
- `GameHost.getSoraSkyRookeryMigrationReadiness()`
- `GameHost.getSkyRookeryMigrationReadinessTree()`
- `GameHost.getRendererHandoff()` now composes `skyRookeryMigration` descriptors and `skyRookeryMigrationDescriptorCount`.

## Files changed

```txt
experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js
experiments/sora-the-infinite/sora-sky-rookery-migration-entry.js
experiments/sora-the-infinite/sora-sky-rookery-migration-style.css
experiments/sora-the-infinite/index.html
tests/sora-sky-rookery-migration-readiness-kits-smoke.mjs
tests/sora-sky-rookery-migration-cdn-state-input-smoke.mjs
tests/sora-compatibility-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0101-sora-sky-rookery-migration-upgrade.md
```

## Tests added

```txt
tests/sora-sky-rookery-migration-readiness-kits-smoke.mjs
tests/sora-sky-rookery-migration-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake/state cases.

The kit smoke validates:

```txt
migratory flock vector descriptors
rookery nest anchor descriptors
updraft rest column descriptors
storm gap timing window descriptors
dawn banding roster descriptors
sanctuary runway handoff descriptors
renderer handoff counts
mission-state enum
JSON serializability
renderer-neutral ownership policy
```

The CDN/state-input smoke validates:

```txt
route marker
cache-busted route entry
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed entry
GameHost exposure
renderer handoff composition
parent smoke routing
10 simulated state/input outcomes
```

## Validation results

Static/local scratch validation completed before connector writes:

- `node --check experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js` passed.
- `node --check experiments/sora-the-infinite/sora-sky-rookery-migration-entry.js` passed.
- `node tests/sora-sky-rookery-migration-readiness-kits-smoke.mjs` passed with 10 intake cases.
- `node tests/sora-sky-rookery-migration-cdn-state-input-smoke.mjs` passed with 10 intake cases in scratch using the updated route and parent smoke text.

Connector limitation:

- Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because the sandbox could not resolve `github.com`.
- The new tests are routed through `tests/sora-compatibility-cdn-state-input-smoke.mjs`, which is the existing Sora compatibility validation entry point.

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

`experiments/sora-the-infinite/sora-sky-rookery-migration-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/sora-the-infinite/sora-sky-rookery-migration-readiness-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, physics, or the frame loop.

Preserved legacy:

- Existing Sora route gateway presentation remains in `sora-compatibility-gateway.js`.
- The new reusable kit is descriptor-only and the route shell only loads the overlay and style marker.

## Cleanup pass

- Kept the upgrade on the canonical route: `experiments/sora-the-infinite/`.
- No versioned route was created.
- No destructive deletion was performed.
- Existing Sora sky rescue and sky lighthouse layers were preserved.
- New reusable logic is split into atomic descriptor-producing kits.
- The overlay samples host state and composes descriptors; it does not own the route renderer.

## Non-game handling

Sora is a route preview gateway rather than a full standalone small game. It was not deleted or renamed because it is useful as an entry and continuity proof for The Open Above.

Lesson captured: gateway experiments become more useful when they prove a concrete readiness mission, not only a navigation handoff.

## Manifest note

`experiments/domain-kit-cutover-manifest.json` remains a large one-line JSON blob. This run did not rewrite it to avoid a destructive overwrite through the connector. The route, entry, parent smoke, tests, and ledger now register the pass.

## Next safe ledge

Fold the rookery descriptors into Sora's visible telemetry list so the route can show these concrete subgoals directly:

```txt
flock vectors aligned
rookery anchors stable
updraft rest columns open
storm gaps timed
dawn banding roster logged
sanctuary runway handoff ready
```
