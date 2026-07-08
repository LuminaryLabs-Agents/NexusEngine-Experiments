# Zombie Orchard Horde Pathing Readiness Upgrade

## Summary

- Chosen experiment: `experiments/zombie-orchard/`
- Upgrade: added renderer-neutral horde pathing readiness kits for spawn lane forecasts, choke row priorities, noise lure cones, panic retreat threads, weapon uptime rings, and round surge countdowns.
- Last upgraded experiment avoided: `experiments/sora-the-infinite/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1000-sora-sky-negotiation-readiness-upgrade.md`, which chose `experiments/sora-the-infinite/`. This run picked a different route. `experiments/zombie-orchard/` remained a compact short wave loop with survival and foraging descriptors, but the horde movement layer was still implicit. The most meaningful upgrade was to make the player read where pressure is approaching from, which orchard rows are becoming chokes, how noise projects forward, where retreat paths exist, whether gear is still reliable, and how hard the next round surge is.

## Last upgraded experiment

```txt
experiments/sora-the-infinite/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1000-sora-sky-negotiation-readiness-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in new overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime-named local bridge; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, and sky negotiation readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, energy budget, storm shelves, jetstream braids, glide pockets, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop now upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; old repo-local loader name remains only as compatibility wrapper naming. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, and extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
zombie-orchard-horde-pathing-readiness-domain
├─ horde-approach-domain
│  ├─ spawn-lane-domain
│  │  └─ orchard-spawn-lane-forecast-kit
│  └─ choke-row-domain
│     └─ orchard-choke-row-priority-kit
├─ noise-and-retreat-domain
│  ├─ noise-lure-domain
│  │  └─ orchard-noise-lure-cone-kit
│  └─ panic-retreat-domain
│     └─ orchard-panic-retreat-thread-kit
├─ combat-tempo-domain
│  ├─ weapon-uptime-domain
│  │  └─ orchard-weapon-uptime-ring-kit
│  └─ round-surge-domain
│     └─ orchard-round-surge-countdown-kit
└─ renderer-handoff
   └─ orchard-horde-pathing-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
orchard-spawn-lane-forecast-kit
orchard-choke-row-priority-kit
orchard-noise-lure-cone-kit
orchard-panic-retreat-thread-kit
orchard-weapon-uptime-ring-kit
orchard-round-surge-countdown-kit
orchard-horde-pathing-renderer-handoff-kit
zombie-orchard-horde-pathing-readiness-domain-kit
```

Changed:

```txt
Zombie Orchard route shell
Zombie Orchard horde pathing presentation overlay
Zombie Orchard survival CDN smoke routing
canonical domain-kit manifest
```

The new kits accept plain game/orchard snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/zombie-orchard/src/horde-pathing-readiness-kits.js
experiments/zombie-orchard/src/horde-pathing-readiness-entry.js
experiments/zombie-orchard/index.html
tests/zombie-orchard-horde-pathing-readiness-kits-smoke.mjs
tests/zombie-orchard-horde-pathing-cdn-state-input-smoke.mjs
tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1016-zombie-orchard-horde-pathing-upgrade.md
```

## Tests added

```txt
tests/zombie-orchard-horde-pathing-readiness-kits-smoke.mjs
tests/zombie-orchard-horde-pathing-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
spawn lane forecast descriptors
choke row priority descriptors
noise lure cone descriptors
panic retreat thread descriptors
weapon uptime ring descriptors
round surge countdown descriptors
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
late-case pressure escalation
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed overlay and runtime stack
route shell cache busting
GameHost.getHordePathingReadiness exposure
GameHost renderer handoff composition
horde overlay descriptor-only presentation marker
existing Zombie Orchard full/deploy smoke routing
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the Zombie Orchard horde pathing readiness domain.
- Added 10-case CDN/state/input coverage for the NexusEngine CDN runtime stack, route shell, GameHost facade, descriptor handoff, and presentation overlay.
- Routed the new smoke tests through `tests/zombie-orchard-survival-readability-cdn-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/zombie-orchard/src/kit-stack.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- `experiments/zombie-orchard/src/horde-pathing-readiness-entry.js` imports NexusEngine main via the same CDN and does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The reusable horde pathing kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- The old `nexus-realtime-page-loader.js` naming remains in the HTML as a local compatibility loader name only; it is not the changed runtime CDN path.

## Cleanup pass

- Avoided creating a versioned Zombie Orchard route.
- Kept horde pathing descriptor generation in `horde-pathing-readiness-kits.js`.
- Kept DOM/Canvas rendering inside `horde-pathing-readiness-entry.js` as presentation-only descriptor consumption.
- Patched GameHost through additive accessors: `getHordePathingReadiness()` and `getZombieOrchardHordePathingReadiness()`.
- Preserved the existing survival and foraging domains.
- Routed new tests through the existing Zombie Orchard survival smoke instead of expanding `scripts/run-checks.mjs` further.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`experiments/zombie-orchard/` is a small experience-driven web game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a compact horde survival/foraging loop; this pass preserved that proof and added a readable pressure-pathing layer.

## Next safe ledge

Fold survival readability, foraging readability, and horde pathing readiness into a single `zombie-orchard-field-director-domain-kit` facade that delegates to the existing subdomains while preserving their atomic boundaries and descriptor-only renderer handoff.
