# Peer Scene Oracle Readability Upgrade

## Summary

- Chosen experiment: `experiments/peer-scene-transition/`
- Upgrade: added renderer-neutral oracle readability kits and integrated an overlay entry that makes future route, pressure clock, resource route, memory branch, puzzle debt, and ending readiness explicit.
- Last upgraded experiment avoided: `experiments/nexus-frontier-signal-isles/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0815-signal-isles-expedition-readiness-upgrade.md`, which chose `experiments/nexus-frontier-signal-isles/`. This run picked a different route. `peer-scene-transition` is still a very small scene puzzle loop, and even after decision readability it remained weak at forward planning: the player could see local actions and gate requirements but not the future route forecast, unresolved puzzle debt, pressure clock, resource route map, or ending readiness. This pass keeps the route truth in descriptor kits and adds a presentation-only oracle overlay.

## Last upgraded experiment

```txt
experiments/nexus-frontier-signal-isles/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0815-signal-isles-expedition-readiness-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
peer-scene-oracle-readability-domain
├─ future-route-domain
│  ├─ objective-forecast-domain
│  │  └─ scene-objective-forecast-thread-kit
│  └─ ending-readiness-domain
│     └─ scene-ending-readiness-crown-kit
├─ pressure-clock-domain
│  ├─ pressure-clock-ring-domain
│  │  └─ scene-pressure-clock-ring-kit
│  └─ puzzle-debt-domain
│     └─ scene-puzzle-debt-stack-kit
├─ memory-resource-domain
│  ├─ resource-route-domain
│  │  └─ scene-resource-route-map-kit
│  └─ memory-branch-domain
│     └─ scene-memory-branch-echo-kit
└─ renderer-handoff
   └─ scene-oracle-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
scene-objective-forecast-thread-kit
scene-pressure-clock-ring-kit
scene-resource-route-map-kit
scene-memory-branch-echo-kit
scene-puzzle-debt-stack-kit
scene-ending-readiness-crown-kit
scene-oracle-renderer-handoff-kit
scene-oracle-readability-domain-kit
```

The new kits accept plain scene manifests and state snapshots. They produce serializable descriptors and do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/_kits/peer-scene-transition/peer-scene-oracle-readability-handoff-kits.js
experiments/peer-scene-transition/shared/scene-oracle-readability-entry.js
experiments/peer-scene-transition/index.html
experiments/peer-scene-transition/camp.html
experiments/peer-scene-transition/crossroads.html
experiments/peer-scene-transition/forest.html
experiments/peer-scene-transition/bridge.html
tests/peer-scene-transition-oracle-readability-handoff-smoke.mjs
tests/peer-scene-transition-oracle-readability-cdn-state-input-smoke.mjs
tests/peer-scene-transition-playwright-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0828-peer-scene-oracle-readability-upgrade.md
```

## Tests added

```txt
tests/peer-scene-transition-oracle-readability-handoff-smoke.mjs
tests/peer-scene-transition-oracle-readability-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
objective forecast threads
pressure clock rings
resource route maps
memory branch echoes
puzzle debt stacks
ending readiness crowns
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated scene state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed overlay
route shell cache busts
GameHost.getOracleReadabilityDomain exposure
GameHost.getRendererHandoff composition
renderer-neutral kit ownership
oracle overlay loading on scene HTML routes
```

## Validation results

- Added 10-case kit smoke coverage for the new Peer Scene oracle readability domain.
- Added 10-case CDN/state/input coverage for the changed overlay entry, route shells, host patch, and descriptor handoff.
- Wired both new smoke files through the existing `tests/peer-scene-transition-playwright-smoke.mjs`, which is already part of `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Extended the Playwright smoke to validate `GameHost.getOracleReadabilityDomain()`, `GameHost.getRendererHandoff().oracleReadability`, `document.body.dataset.sceneOracle`, and route navigation after the overlay loads.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `experiments/peer-scene-transition/shared/scene-demo.js` already imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The new oracle overlay imports NexusEngine main via the same CDN.
- The changed oracle overlay does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The new reusable oracle kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided creating a duplicate or version-suffixed Peer Scene route.
- Kept reusable oracle logic in a renderer-neutral kit file under `experiments/_kits`.
- Kept DOM overlay work in `shared/scene-oracle-readability-entry.js` only.
- Loaded the overlay through existing canonical scene HTML pages with a cache-busted module URL.
- Patched `GameHost` without mutating inventory, route state, action eligibility, or scene transition truth.
- Updated the canonical manifest instead of adding parallel metadata.

## Non-game handling

`peer-scene-transition` is a small experience-driven web experiment, not a complete long-form game. It was not deleted, renamed, or destructively refactored. The route is trying to prove a scene-domain transition stack, and this run preserved that proof while adding a future-facing oracle readability layer.

## Next safe ledge

Fold the oracle overlay directly into `scene-demo.js` once the legacy shrine/desert branch is normalized, then add a deterministic replay fixture that walks camp, crossroads, forest, bridge, shrine, and ending while hashing base, atmospheric, chronicle, consequence, decision, and oracle descriptor counts at each scene.
