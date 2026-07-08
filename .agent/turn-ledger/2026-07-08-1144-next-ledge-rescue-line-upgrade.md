# Next Ledge Rescue Line Readiness Upgrade

## Summary

- Chosen experiment: `experiments/next-ledge/`
- Upgrade: added renderer-neutral rescue line readiness kits for fall recovery nets, tether strain pulses, rescue anchor triage, stamina cache hops, cargo retention warnings, and summit extraction beacons.
- Last upgraded experiment avoided: `experiments/tropical-island-scene/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1128-tropical-reef-rescue-upgrade.md`, which chose `experiments/tropical-island-scene/`. This run picked a different route. `experiments/next-ledge/` is one of the smallest high-value game loops in the repo: a grapple/swing traversal prototype with route, cargo, traversal, and anchor timing readability already present, but no explicit rescue layer for near-fall recovery, tether strain, anchor triage, stamina cache routing, cargo retention, and summit extraction. The new pass makes the moment-to-moment survival route more readable without moving renderer, DOM, input, asset loading, audio, or frame-loop ownership into reusable kits.

## Last upgraded experiment

```txt
experiments/tropical-island-scene/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1128-tropical-reef-rescue-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype upgraded with logistics readiness. | Medium campaign loop. | World actions, scouting, reinforcement, objective pressure, supply depots, forage corridors, road strain, siege readiness, courier pulses, winter attrition. | No changed-runtime old CDN in overlay. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer upgraded with skill rhythm readiness. | Short platformer loop. | A/D move, Space jump, reset, coins, hazards, exit, jump gates, air vectors, combo lanes, hazard hesitation, checkpoint echoes, exit commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment now upgraded with rescue line readiness. | Short traversal loop. | Grapple, swing, cargo descriptors, fall pressure, traversal readability, anchor timing, fall recovery nets, tether strain pulses, rescue anchor triage, stamina cache hops, cargo retention warnings, summit extraction beacon. | Legacy base session still imports NexusRealtime for old tether/projection kits; changed overlay imports NexusEngine main CDN. | Yes for changed wrapper and new overlay. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route upgraded with survey contract readiness. | Continuous flight sandbox. | WASD flight, terrain LOD, expedition descriptors, wayfinding, contract steps, tempo rings, fork scoring, altitude pledge, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight terrain streaming sandbox upgraded with route readability. | Continuous flight sandbox. | Pitch/bank/boost, flock, terrain streaming, updraft routing, ridge hazards, landing ghosts, draft wakes, altitude reserve, homeward bearing. | Changed runtime config migrated to NexusEngine main CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing routes, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop upgraded with signal cartography and operator rhythm readability. | Short relay loop. | Move, scan, relays, wraith pressure, retreat, route drift, scanner cadence, relay repair beats, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch gateway upgraded with launch rehearsal, flightplan readability, sky negotiation, and preflight challenge readiness. | Short planning loop. | Preview, preflight, route continuity, thermal choice, storm shelves, landing oath, launch handoff. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival and foraging loop upgraded with horde pathing readiness. | Short wave loop. | Move, collect apples, scavenge gear, survive waves, read survival/foraging/horde approach descriptors. | New overlay and runtime stack use NexusEngine main CDN; local compatibility naming remains. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with reef rescue readiness. | Passive orbit scene with short rescue planning layers. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return, distress flares, snorkel lanes, rip currents, first aid, raft anchors, extraction beacons. | Legacy local ProtoKit import-map remains for old island/water stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend vital, read command choices, wave cadence, frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege upgraded with siegecraft readiness. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract, read build footprints, crossfire, resource burn, build priority, breach countdowns, extraction risk. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
next-ledge-rescue-line-readiness-domain
├─ emergency-recovery-domain
│  ├─ fall-recovery-domain
│  │  └─ next-ledge-fall-recovery-net-kit
│  └─ tether-strain-domain
│     └─ next-ledge-tether-strain-pulse-kit
├─ route-assurance-domain
│  ├─ rescue-anchor-domain
│  │  └─ next-ledge-rescue-anchor-triage-kit
│  └─ stamina-cache-domain
│     └─ next-ledge-stamina-cache-hop-kit
├─ cargo-extraction-domain
│  ├─ cargo-retention-domain
│  │  └─ next-ledge-cargo-retention-warning-kit
│  └─ summit-extraction-domain
│     └─ next-ledge-summit-extraction-beacon-kit
└─ renderer-handoff
   └─ next-ledge-rescue-line-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

Integrated route stack:

```txt
next-ledge
├─ visual-fractal-domain
├─ route-cargo-domain
├─ traversal-readability-domain
├─ anchor-timing-readability-domain
├─ rescue-line-readiness-domain
└─ renderer-handoff
   └─ renderer consumes combined descriptor buckets only
```

## Kits added or changed

Added:

```txt
next-ledge-fall-recovery-net-kit
next-ledge-tether-strain-pulse-kit
next-ledge-rescue-anchor-triage-kit
next-ledge-stamina-cache-hop-kit
next-ledge-cargo-retention-warning-kit
next-ledge-summit-extraction-beacon-kit
next-ledge-rescue-line-renderer-handoff-kit
next-ledge-rescue-line-readiness-domain-kit
```

Changed:

```txt
Next Ledge route shell
Next Ledge anchor timing CDN smoke routing
canonical domain-kit manifest
```

The new kits accept plain Next Ledge state/cargo snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
experiments/next-ledge/src/rescue-line-readiness-kits.js
experiments/next-ledge/src/rescue-line-readiness-entry.js
experiments/next-ledge/index.html
tests/next-ledge-rescue-line-readiness-kits-smoke.mjs
tests/next-ledge-rescue-line-readiness-cdn-state-input-smoke.mjs
tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1144-next-ledge-rescue-line-upgrade.md
```

## Tests added

```txt
tests/next-ledge-rescue-line-readiness-kits-smoke.mjs
tests/next-ledge-rescue-line-readiness-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
fall recovery net descriptors
tether strain pulse descriptors
rescue anchor triage descriptors
stamina cache hop descriptors
cargo retention warning descriptors
summit extraction beacon descriptors
renderer handoff counts
stable descriptor ids/kinds
serializable descriptor output
renderer ownership boundaries
```

The CDN/state/input smoke checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the new overlay
route shell cache-busted overlay loading
GameHost rescue line accessors
composed renderer handoff patching
Playwright-readable dataset marker
existing Next Ledge validation routing
manifest route registration
renderer-neutral kit ownership
10 state/input descriptor outcomes
```

## Validation results

- Added 10-case kit smoke coverage for the rescue line readiness domain.
- Added CDN/state/input coverage for NexusEngine CDN usage, route shell, GameHost exposure, descriptor handoff, and manifest registration.
- Routed both new smoke tests through `tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs`, which is already present in full and deploy validation.
- Updated `experiments/domain-kit-cutover-manifest.json` to register `next-ledge-rescue-line-readiness-domain-kit`.
- Connector-only run could not execute a local shell test runner. The intended validation commands remain:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/next-ledge/src/rescue-line-readiness-entry.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new rescue line overlay does not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- `experiments/next-ledge/src/rescue-line-readiness-kits.js` does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.
- The route still carries a historical base session import of `NexusRealtime@main` for old tether/projection kit compatibility. This pass did not expand that legacy dependency; changed files are moved toward NexusEngine main CDN usage.

## Cleanup pass

- Avoided creating a versioned Next Ledge route.
- Kept reusable rescue scoring and descriptor generation in `rescue-line-readiness-kits.js`.
- Kept DOM, Canvas overlay drawing, GameHost patching, and frame-loop presentation in `rescue-line-readiness-entry.js` only.
- Preserved the existing grapple/swing session, cargo extraction wrapper, traversal readability, and anchor timing readability.
- Composed the new rescue line handoff additively through `GameHost.getRendererHandoff()`.
- Routed new tests through an existing Next Ledge check instead of expanding the top-level suite list.
- Updated the canonical manifest to register the new domain kit.

## Non-game handling

`experiments/next-ledge/` is a small experience-driven web game. It was not deleted, renamed, or destructively refactored. It is trying to prove a reusable grapple/swing traversal loop with route, cargo, and readability descriptors; this pass preserved that proof and added the missing rescue-readiness objective layer.

## Next safe ledge

Promote `next-ledge-rescue-line-readiness-domain-kit` into a broader `tether-rescue-readiness-domain-kit` that can serve other grapple, climbing, swing, and cable traversal routes without making renderers own rescue truth, cargo pressure, or fall recovery state.
