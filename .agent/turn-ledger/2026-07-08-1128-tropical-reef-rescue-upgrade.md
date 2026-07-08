# Tropical Island Scene Reef Rescue Readiness Upgrade

## Summary

- Chosen experiment: `experiments/tropical-island-scene/`
- Upgrade: added renderer-neutral reef rescue readiness kits for distress flare arcs, snorkel search lanes, rip current hazards, first aid cache sparks, raft anchor routes, and extraction pier beacons.
- Last upgraded experiment avoided: `experiments/vr-platformer-board/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1115-vr-board-skill-rhythm-upgrade.md`, which chose `experiments/vr-platformer-board/`. This run picked a different route. `experiments/tropical-island-scene/` remains one of the least mechanically active canonical routes: a passive orbit island scene with readable overlays but no direct rescue objective layer. The new pass turns the lagoon into a small rescue-readiness micro-loop: locate distress signals, sweep snorkel search lanes, avoid rip currents, pick up first aid, anchor a raft, and commit to an extraction pier.

## Last upgraded experiment

```txt
experiments/vr-platformer-board/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1115-vr-board-skill-rhythm-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer upgraded with skill rhythm readiness. | Short platformer loop. | A/D move, Space jump, reset, coins, hazards, exit, jump gates, air vectors, combo lanes, hazard hesitation, checkpoint echoes, exit commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy local bridge name remains in base stack; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route upgraded with survey contract readiness. | Continuous flight sandbox. | WASD flight, terrain LOD, expedition descriptors, wayfinding, contract steps, tempo rings, fork scoring, altitude pledge, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight terrain streaming sandbox upgraded with route readability. | Continuous flight sandbox. | Pitch/bank/boost, flock, terrain streaming, updraft routing, ridge hazards, landing ghosts, draft wakes, altitude reserve, homeward bearing. | Changed runtime config migrated to NexusEngine main CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing routes, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, storm shelves, landing oath, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; local compatibility naming remains. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with reef rescue readiness. | Passive orbit scene with a short rescue planning layer. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return, distress flares, snorkel lanes, rip currents, first aid, raft anchors, extraction beacons. | Legacy local ProtoKit import-map remains for old island/water stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
tropical-reef-rescue-readiness-domain
├─ search-signal-domain
│  ├─ distress-signal-domain
│  │  └─ tropical-distress-flare-arc-kit
│  └─ snorkel-search-domain
│     └─ tropical-snorkel-search-lane-kit
├─ rescue-safety-domain
│  ├─ rip-current-domain
│  │  └─ tropical-rip-current-hazard-kit
│  └─ first-aid-cache-domain
│     └─ tropical-first-aid-cache-spark-kit
├─ extraction-routing-domain
│  ├─ raft-anchor-domain
│  │  └─ tropical-raft-anchor-route-kit
│  └─ pier-extraction-domain
│     └─ tropical-extraction-pier-beacon-kit
└─ renderer-handoff
   └─ tropical-reef-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

Integrated route stack:

```txt
tropical-island-scene
├─ lagoon-visual-fractal-domain
├─ beachcomber-readability-domain
├─ lagoon-navigation-readability-domain
├─ weather-shelter-readability-domain
├─ reef-rescue-readiness-domain
└─ renderer-handoff
   └─ renderer consumes combined descriptor buckets only
```

## Kits added or changed

Added:

```txt
tropical-distress-flare-arc-kit
tropical-snorkel-search-lane-kit
tropical-rip-current-hazard-kit
tropical-first-aid-cache-spark-kit
tropical-raft-anchor-route-kit
tropical-extraction-pier-beacon-kit
tropical-reef-rescue-renderer-handoff-kit
tropical-reef-rescue-readiness-domain-kit
```

Changed:

```txt
tropical island route shell
weather shelter CDN smoke routing
canonical domain-kit manifest
```

The new kits accept plain island/camera/rescue snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/tropical-island-scene/src/tropical-reef-rescue-readiness-domain-kit.js
experiments/tropical-island-scene/src/reef-rescue-readiness-entry.js
experiments/tropical-island-scene/index.html
tests/tropical-reef-rescue-readiness-kits-smoke.mjs
tests/tropical-reef-rescue-cdn-state-input-smoke.mjs
tests/tropical-weather-shelter-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1128-tropical-reef-rescue-upgrade.md
```

## Tests added

```txt
tests/tropical-reef-rescue-readiness-kits-smoke.mjs
tests/tropical-reef-rescue-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
distress flare arc descriptors
snorkel search lane descriptors
rip current hazard descriptors
first aid cache spark descriptors
raft anchor route descriptors
extraction pier beacon descriptors
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
subdomain split integrity
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the new overlay
route shell cache-busted overlay loading
GameHost reef rescue accessors
renderer handoff composition
Playwright-readable dataset marker
existing tropical weather smoke routing
manifest route registration
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the reef rescue readiness domain.
- Added 10-case CDN/state/input coverage for NexusEngine CDN usage, route shell, GameHost exposure, descriptor handoff, and manifest registration.
- Routed both new smoke tests through `tests/tropical-weather-shelter-cdn-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Updated `experiments/domain-kit-cutover-manifest.json` to register `tropical-reef-rescue-readiness-domain-kit`.
- Connector-only run did not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/tropical-island-scene/src/reef-rescue-readiness-entry.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new reef rescue overlay does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- `experiments/tropical-island-scene/src/tropical-reef-rescue-readiness-domain-kit.js` does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- The route still carries the historical local ProtoKit import-map for old island/water stack compatibility; this pass did not add or expand those legacy imports.

## Cleanup pass

- Avoided creating a versioned Tropical Island route.
- Kept reusable rescue scoring and descriptor generation in `tropical-reef-rescue-readiness-domain-kit.js`.
- Kept browser overlay, Canvas drawing, DOM mutation, and frame loop in `reef-rescue-readiness-entry.js` only.
- Preserved the existing lagoon, beachcomber, navigation, and weather shelter overlays.
- Composed the new reef rescue handoff additively through `GameHost.getRendererHandoff()`.
- Routed new tests through an existing tropical check instead of expanding the top-level suite surface.
- Updated the canonical manifest to register the new domain kit.

## Non-game handling

`experiments/tropical-island-scene/` is a small experience-driven web scene rather than a conventional game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a high-fidelity island scene composed from renderer-neutral environmental descriptor domains; this pass preserved that proof and added the missing rescue objective layer.

## Next safe ledge

Promote `tropical-reef-rescue-readiness-domain-kit` into a broader `shoreline-rescue-objective-domain-kit` that can also serve water-heavy routes without making the renderer own rescue truth, safety scoring, or extraction state.
