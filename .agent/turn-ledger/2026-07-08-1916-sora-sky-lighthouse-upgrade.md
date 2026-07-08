# 2026-07-08 19:16 - Sora Sky Lighthouse Upgrade

## Summary

Upgraded `experiments/sora-the-infinite/` with a renderer-neutral sky lighthouse readiness loop. The route now adds cloud lens calibration, star prism alignment, wind buoy chains, storm lantern warnings, refuge runway marks, and dawn keeper logs on top of the existing route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, and sky rescue layers.

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest logged upgrade before this run was `experiments/cozy-island/` through the sea turtle hatchery pass, so this run selected a different route.

Sora remained one of the least game-like entries because it is primarily a route-preview gateway and flight-readiness lab. The new sky lighthouse pass gives it a stronger visual objective layer before handing off into The Open Above: calibrate beacons, guide refuge approach, and certify the dawn runway without moving reusable logic into the renderer.

## Last upgraded experiment

`experiments/cozy-island/` via sea turtle hatchery readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth extraction | no changed runtime import | yes via wrapper |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | 5-8 min | scene travel, inventory gates, clues, evidence ritual | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Campaign map / command app | 8-12 min | campaign map, orders, logistics, diplomacy, field hospital | no changed pass import | yes |
| `experiments/vr-platformer-board/` | Flat VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue | no changed runtime import | yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight | 4-7 min | camera flight, LOD rings, survey, resupply | no changed runtime import | yes |
| `experiments/the-open-above/` | Bird flight / aerial courier route | 4-7 min | flight, terrain streaming, route readability, courier | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 3-6 min | grass, flowers, sheep, flock safety, harvest festival | no changed runtime import | yes |
| `experiments/fogline-relay/` | First-person relay/scanning route | 5-8 min | movement, scan, relays, rescue, storm, radio, blackout | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | Frontier signal island route | 5-9 min | harvest, build mast, objectives, storm anchor, harbor relief | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Route preview gateway / flight-readiness lab | 2-4 min | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue, sky lighthouse | no changed runtime import | yes |
| `experiments/zombie-orchard/` | Survival orchard route | 5-8 min | move, collect, survival waves, cure crafting, safehouse evacuation | no changed runtime import | yes |
| `experiments/tropical-island-scene/` | Tropical island orbit scene | 3-6 min | orbit, lagoon navigation, reef rescue, tide salvage | legacy local island/water stack remains | yes in changed overlays |
| `experiments/cozy-island/` | Cozy generated island scene | 3-6 min | cloudbar island, campfire, castaway comfort, tidepool stewardship, turtle hatchery | legacy ProtoKits cloudbar still remains | yes in changed overlays |
| `games/signal-bastion/` | Oblique defense board | 10-15 min | placement, waves, command, evacuation, reconstruction | preserved generic defense ProtoKits | yes |
| `games/rogue-lite-hellscape-siege/` | Resource-defense roguelite board | 8-12 min | portals, harvesting, build, core defense, siegecraft, ash caravan | no changed runtime import | yes |

## Domain ASCII tree

```txt
sora-sky-lighthouse-readiness-domain
├─ beacon-calibration-domain
│  ├─ cloud-lens-domain
│  │  └─ sora-cloud-lens-focus-kit
│  └─ star-prism-domain
│     └─ sora-star-prism-alignment-kit
├─ refuge-approach-domain
│  ├─ wind-buoy-domain
│  │  └─ sora-wind-buoy-chain-kit
│  └─ storm-lantern-domain
│     └─ sora-storm-lantern-warning-kit
├─ handoff-runway-domain
│  ├─ refuge-runway-domain
│  │  └─ sora-refuge-runway-mark-kit
│  └─ dawn-keeper-domain
│     └─ sora-dawn-keeper-log-kit
└─ renderer-handoff
   └─ sora-sky-lighthouse-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `sora-cloud-lens-focus-kit`
- `sora-star-prism-alignment-kit`
- `sora-wind-buoy-chain-kit`
- `sora-storm-lantern-warning-kit`
- `sora-refuge-runway-mark-kit`
- `sora-dawn-keeper-log-kit`
- `sora-sky-lighthouse-renderer-handoff-kit`
- `sora-sky-lighthouse-readiness-domain-kit`

Changed composition:

- `GameHost.getSkyLighthouseReadinessDomain()`
- `GameHost.getSkyLighthouseReadiness()`
- `GameHost.getSoraSkyLighthouseReadiness()`
- `GameHost.getSkyLighthouseReadinessTree()`
- `GameHost.getRendererHandoff()` now composes `skyLighthouseReadiness` and `skyLighthouseDescriptorCount`.

## Files changed

```txt
experiments/_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js
experiments/sora-the-infinite/sora-sky-lighthouse-entry.js
experiments/sora-the-infinite/index.html
tests/sora-sky-lighthouse-readiness-kits-smoke.mjs
tests/sora-sky-lighthouse-cdn-state-input-smoke.mjs
tests/sora-compatibility-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1916-sora-sky-lighthouse-upgrade.md
```

## Tests added

```txt
tests/sora-sky-lighthouse-readiness-kits-smoke.mjs
tests/sora-sky-lighthouse-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake cases.

The kit smoke validates:

```txt
cloud lens focus descriptors
star prism alignment descriptors
wind buoy chain descriptors
storm lantern warning descriptors
refuge runway mark descriptors
dawn keeper log descriptors
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
validation routing through the existing Sora compatibility smoke
10 simulated state/input outcomes
```

## Validation results

Static/local scratch validation completed before push:

- `node --check` passed for the new kit file.
- `node --check` passed for the new entry file.
- `node --check` passed for the new kit smoke.
- `node --check` passed for the new CDN/state-input smoke.
- The new kit smoke was executed against generated files in scratch and passed all 10 intake cases.

Connector limitation:

- A full repo clone was not available from the execution sandbox.
- Repo-wide `npm run check` and `npm run check:deploy` were not executed in a cloned workspace.
- The new tests are wired through `tests/sora-compatibility-cdn-state-input-smoke.mjs`, which is already part of the existing Sora validation path.

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

`experiments/sora-the-infinite/sora-sky-lighthouse-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

## Cleanup pass

- Kept the upgrade on the canonical base route: `experiments/sora-the-infinite/`.
- No versioned route was created.
- No destructive deletion was performed.
- Reusable sky lighthouse logic stayed in atomic, descriptor-only kits.
- The overlay only samples host state and presents descriptor buckets.
- Existing sky rescue, microflight, preflight, flightplan, and sky negotiation passes were preserved.

## Non-game handling

Sora is a small gateway / route-preview experience rather than a full game. It was not deleted or renamed because it preserves useful alias continuity and The Open Above handoff behavior.

Lesson captured: a route gateway becomes more playable when it has visible calibration work and a refuge certification loop rather than only a launch button and readiness percent.

## Next safe ledge

Fold the new sky lighthouse descriptors into the main gateway telemetry list so players can see which lighthouse subgoal is blocking final launch:

```txt
cloud lenses focused
star prisms aligned
wind buoys connected
storm lanterns quiet
refuge runways open
dawn keeper logs sealed
```
