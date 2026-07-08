# High Fidelity Meadow Flock Safety Readiness Upgrade

## Summary

- Chosen experiment: `experiments/high-fidelity-meadow/`
- Upgrade: added renderer-neutral flock safety readiness kits for lost lamb calls, fox shadow boundaries, bellwether lead threads, vet check pulses, nightfall fold gates, and cottage lantern returns.
- Last upgraded experiment avoided: `experiments/next-ledge/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1144-next-ledge-rescue-line-upgrade.md`, which chose `experiments/next-ledge/`. This run picked a different route. `experiments/high-fidelity-meadow/` is visually strong, but still low-variability mechanically: it is mostly orbiting a meadow with ecology and pasture route overlays. The new pass adds a shepherding decision layer: find strays, watch predator edges, follow the bellwether, check sheep health, prepare the fold gates, and read lantern return anchors.

## Last upgraded experiment

```txt
experiments/next-ledge/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1144-next-ledge-rescue-line-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Branching scene-puzzle prototype with chronicle, consequence, decision, and oracle overlays. | Short scene route, 3-8 minutes. | Scene transitions, inventory, gates, future route forecast, unresolved puzzle debt. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign strategy map/gateway with logistics readiness overlays. | Medium campaign loop. | World actions, campaign map, orders, supply, forage, courier, siege, winter attrition. | No changed-runtime old CDN in changed overlay. | Yes. |
| `experiments/vr-platformer-board/` | 2D/VR-board platformer prototype with traversal and skill-rhythm readability. | Short arcade route. | A/D movement, jump, coins, hazards, checkpoint echoes, exit commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal prototype with cargo, traversal, anchor timing, and rescue-line readability. | Short skill loop. | Grapple, swing, cargo routing, rescue nets, tether strain, stamina caches. | No changed-runtime old CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Radial flight terrain survey sandbox with mission-contract readability. | Continuous sandbox. | Camera flight, LOD rings, survey steps, risk/reward forks, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight route sandbox with lift, landing, flock draft, and homeward bearing overlays. | Continuous flight sandbox. | Bird flight, terrain streaming, updraft corridors, ridge hazards, landing ghosts. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Procedural WebGL meadow with grass, flowers, sheep, visual/ecology/pasture descriptors, now flock safety readiness. | Passive-to-light shepherding sandbox. | Orbit camera, meadow scene, sheep, ecology, pasture routes, lost lambs, fox edges, fold gates. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | First-person relay scanning route with signal cartography and operator rhythm. | Short mission route. | Movement, scan, relay repair, wraith pressure, route drift, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Frontier expedition/resource route with objective and expedition readiness descriptors. | Short expedition loop. | Move, harvest, build mast, shard ferry, pressure retreat, gate timing. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored Sora launch gateway into The Open Above with preflight challenge overlays. | Short gateway route. | Route preview, launch rehearsal, sky negotiation, gust sync, landing oath. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard wave route with survival, foraging, and horde pathing readability. | Short wave loop. | Move, collect, waves, horde lanes, choke rows, noise lure, weapon uptime. | No changed-runtime old CDN in changed overlay. | Yes. |
| `experiments/tropical-island-scene/` | Passive island/lagoon scene upgraded with beachcomber, navigation, weather shelter, and reef rescue readability. | Passive-to-light objective sandbox. | Drag orbit, fish, coconuts, rescue lanes, rip currents, extraction pier. | Legacy local import map remains for island/water; changed overlays use NexusEngine CDN. | Yes. |
| `games/signal-bastion/` | Tower-defense game with command, wave choreography, and frontline tactics descriptors. | Medium wave game. | Tower placement, waves, bosses, build slots, intercept zones, salvage windows. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Canvas roguelite defense/siege route with siegecraft readiness. | Medium survival-defense loop. | Harvest, inventory, build, core defense, extraction risk, breach countdown. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
meadow-flock-safety-readiness-domain
├─ flock-risk-domain
│  ├─ lost-lamb-domain
│  │  └─ meadow-lost-lamb-call-kit
│  └─ fox-shadow-domain
│     └─ meadow-fox-shadow-boundary-kit
├─ guidance-response-domain
│  ├─ bellwether-lead-domain
│  │  └─ meadow-bellwether-lead-thread-kit
│  └─ vet-check-domain
│     └─ meadow-vet-check-pulse-kit
├─ fold-return-domain
│  ├─ nightfall-fold-domain
│  │  └─ meadow-nightfall-fold-gate-kit
│  └─ cottage-lantern-domain
│     └─ meadow-cottage-lantern-return-kit
└─ renderer-handoff
   └─ meadow-flock-safety-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
meadow-lost-lamb-call-kit
meadow-fox-shadow-boundary-kit
meadow-bellwether-lead-thread-kit
meadow-vet-check-pulse-kit
meadow-nightfall-fold-gate-kit
meadow-cottage-lantern-return-kit
meadow-flock-safety-renderer-handoff-kit
meadow-flock-safety-readiness-domain-kit
```

Changed:

```txt
meadow visual fractal renderer handoff consumer
high-fidelity-meadow GameHost state facade
high-fidelity-meadow route shell
high-fidelity-meadow smoke routing
high-fidelity-meadow manifest registration
```

## Files changed

```txt
experiments/high-fidelity-meadow/src/meadow-flock-safety-readiness-kits.js
experiments/high-fidelity-meadow/src/main-aaa.js
experiments/high-fidelity-meadow/src/meadow-visual-fractal-renderers.js
experiments/high-fidelity-meadow/index.html
tests/high-fidelity-meadow-flock-safety-readiness-kits-smoke.mjs
tests/high-fidelity-meadow-flock-safety-cdn-state-input-smoke.mjs
tests/high-fidelity-meadow-playwright-state-input-smoke.mjs
tests/high-fidelity-meadow-ecology-cdn-state-input-smoke.mjs
tests/high-fidelity-meadow-pasture-route-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1200-high-fidelity-meadow-flock-safety-upgrade.md
```

## Tests added

```txt
tests/high-fidelity-meadow-flock-safety-readiness-kits-smoke.mjs
tests/high-fidelity-meadow-flock-safety-cdn-state-input-smoke.mjs
```

Coverage added:

- 10 kit intake cases.
- 10 Playwright-style state/input cases.
- Lost lamb calls.
- Fox shadow boundaries.
- Bellwether lead threads.
- Vet check pulses.
- Nightfall fold gates.
- Cottage lantern returns.
- Renderer handoff counts.
- JSON serialization boundaries.
- No renderer, DOM, input, Three.js, WebGL, audio, asset loading, or frame-loop ownership in reusable kits.

## Validation results

Static/wired validation completed in this connector run:

```txt
NexusEngine main CDN import present in changed main runtime.
Old NexusRealtime runtime import absent from changed main runtime.
GameHost exposes getFlockSafetyReadiness().
GameHost exposes getMeadowFlockSafetyReadiness().
GameHost getRendererHandoff() includes flockSafetyReadiness descriptor counts.
Renderer consumes lostLambCalls, foxShadowBoundaries, bellwetherLeadThreads, vetCheckPulses, nightfallFoldGates, and cottageLanternReturns descriptors.
New kit smoke is wired into full and deploy checks.
New CDN/state-input smoke is wired into full and deploy checks.
Existing meadow CDN smoke cache markers were refreshed to the latest route shell.
Manifest records flock-safety-readiness-renderer-handoff-pass.
```

Runtime shell execution was not available in this connector-only run. Intended commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime file:

```txt
experiments/high-fidelity-meadow/src/main-aaa.js
```

Audit result:

```txt
Imports NexusEngine main via https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
Does not import LuminaryLabs-Dev/NexusRealtime
```

The lower-level meadow scene still references the older ProtoKits package for legacy meadow generation, but this run did not expand that dependency and did not move any reusable safety logic into that older path.

## Cleanup pass

- Kept reusable logic in `meadow-flock-safety-readiness-kits.js` as plain snapshot-to-descriptor functions.
- Kept Three.js rendering in `meadow-visual-fractal-renderers.js` only.
- Kept DOM/canvas/bootstrap/frame loop in `main-aaa.js` only.
- Updated existing meadow CDN smoke markers so the latest route shell does not break older visual/ecology/pasture validation.
- Updated the manifest without adding a new versioned route.
- No destructive deletion was performed.

## Non-game handling

`experiments/high-fidelity-meadow/` is a small experience-driven web scene, not a broken non-game artifact. It was preserved and upgraded rather than deleted or renamed.

## Next safe ledge

The next safe upgrade for this route is to turn the flock safety descriptors into a small optional shepherd command loop: click/tap a bellwether thread, set a fold gate target, then have sheep drift toward the safest lantern route while the renderer still consumes descriptors only.
