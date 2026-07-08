# Third Person Navigation Challenge Readiness Upgrade

## Summary

- Chosen experiment: `experiments/ThirdPersonFollowThrough/`
- Upgrade: added renderer-neutral navigation challenge readiness kits for checkpoint routing, turn commitment, vault windows, recovery pockets, camera/actor sync, and finish commitment.
- Last upgraded experiment avoided: `experiments/high-fidelity-meadow/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-1200-high-fidelity-meadow-flock-safety-upgrade.md`, which chose `experiments/high-fidelity-meadow/`. This run picked a different route. `experiments/ThirdPersonFollowThrough/` already had arena, locomotion, and camera-composition readability, but it was still a controller diagnostic more than a small play objective. The new pass adds a readable training-course layer: follow checkpoint threads, commit turns, read vault windows, recover from bad landings, maintain camera/actor sync, and push toward the finish beacon.

## Last upgraded experiment

```txt
experiments/high-fidelity-meadow/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-1200-high-fidelity-meadow-flock-safety-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded into a navigation challenge route with arena, locomotion, camera, and mastery-readiness descriptors. | Short sandbox-to-skill route. | WASD, spring camera, jump/backpedal/yaw, debug rays, checkpoint threads, turn commitment, vault windows, recovery pockets, camera/actor sync, finish beacon. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Branching scene-puzzle prototype with chronicle, consequence, decision, and oracle overlays. | Short scene route, 3-8 minutes. | Scene transitions, inventory, gates, future route forecast, unresolved puzzle debt. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign strategy map/gateway with logistics readiness overlays. | Medium campaign loop. | World actions, campaign map, orders, supply, forage, courier, siege, winter attrition. | No changed-runtime old CDN in changed overlay. | Yes. |
| `experiments/vr-platformer-board/` | 2D/VR-board platformer prototype with traversal and skill-rhythm readability. | Short arcade route. | A/D movement, jump, coins, hazards, checkpoint echoes, exit commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal prototype with cargo, traversal, anchor timing, and rescue-line readability. | Short skill loop. | Grapple, swing, cargo routing, rescue nets, tether strain, stamina caches. | No changed-runtime old CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Radial flight terrain survey sandbox with mission-contract readability. | Continuous sandbox. | Camera flight, LOD rings, survey steps, risk/reward forks, return compass. | No changed-runtime old CDN. | Yes. |
| `experiments/the-open-above/` | Bird-flight route sandbox with lift, landing, flock draft, and homeward bearing overlays. | Continuous flight sandbox. | Bird flight, terrain streaming, updraft corridors, ridge hazards, landing ghosts. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Procedural WebGL meadow with grass, flowers, sheep, visual/ecology/pasture/flock safety descriptors. | Passive-to-light shepherding sandbox. | Orbit camera, meadow scene, sheep, ecology, pasture routes, lost lambs, fox edges, fold gates. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | First-person relay scanning route with signal cartography and operator rhythm. | Short mission route. | Movement, scan, relay repair, wraith pressure, route drift, extraction commitment. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Frontier expedition/resource route with objective and expedition readiness descriptors. | Short expedition loop. | Move, harvest, build mast, shard ferry, pressure retreat, gate timing. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored Sora launch gateway into The Open Above with preflight challenge overlays. | Short gateway route. | Route preview, launch rehearsal, sky negotiation, gust sync, landing oath. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Survival orchard wave route with survival, foraging, and horde pathing readability. | Short wave loop. | Move, collect, waves, horde lanes, choke rows, noise lure, weapon uptime. | No changed-runtime old CDN in changed overlay. | Yes. |
| `experiments/tropical-island-scene/` | Passive island/lagoon scene upgraded with beachcomber, navigation, weather shelter, and reef rescue readability. | Passive-to-light objective sandbox. | Drag orbit, fish, coconuts, rescue lanes, rip currents, extraction pier. | Legacy local import map remains for island/water; changed overlays use NexusEngine CDN. | Yes. |
| `games/signal-bastion/` | Tower-defense game with command, wave choreography, and frontline tactics descriptors. | Medium wave game. | Tower placement, waves, bosses, build slots, intercept zones, salvage windows. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Canvas roguelite defense/siege route with siegecraft readiness. | Medium survival-defense loop. | Harvest, inventory, build, core defense, extraction risk, breach countdown. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
third-person-navigation-challenge-readiness-domain
├─ route-intent-domain
│  ├─ checkpoint-thread-domain
│  │  └─ third-person-checkpoint-thread-kit
│  └─ turn-commitment-domain
│     └─ third-person-turn-commitment-wedge-kit
├─ traversal-execution-domain
│  ├─ vault-window-domain
│  │  └─ third-person-vault-window-arc-kit
│  └─ recovery-pocket-domain
│     └─ third-person-recovery-pocket-kit
├─ mastery-feedback-domain
│  ├─ camera-actor-sync-domain
│  │  └─ third-person-camera-actor-sync-meter-kit
│  └─ finish-commitment-domain
│     └─ third-person-finish-commitment-beacon-kit
└─ renderer-handoff
   └─ third-person-navigation-challenge-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
third-person-checkpoint-thread-kit
third-person-turn-commitment-wedge-kit
third-person-vault-window-arc-kit
third-person-recovery-pocket-kit
third-person-camera-actor-sync-meter-kit
third-person-finish-commitment-beacon-kit
third-person-navigation-challenge-renderer-handoff-kit
third-person-navigation-challenge-readiness-domain-kit
```

Changed:

```txt
third-person route wrapper
third-person route shell
third-person domain registry
third-person camera composition smoke routing
third-person domain cutover manifest registration
```

## Files changed

```txt
experiments/ThirdPersonFollowThrough/kits/third-person-navigation-challenge-readiness-domain-kit.js
experiments/ThirdPersonFollowThrough/app/navigation-challenge-readiness-entry.js
experiments/ThirdPersonFollowThrough/app/index.js
experiments/ThirdPersonFollowThrough/index.html
experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js
tests/third-person-navigation-challenge-readiness-kits-smoke.mjs
tests/third-person-navigation-challenge-readiness-cdn-state-input-smoke.mjs
tests/third-person-camera-composition-readability-kits-smoke.mjs
tests/third-person-camera-composition-readability-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1216-third-person-navigation-challenge-upgrade.md
```

## Tests added

```txt
tests/third-person-navigation-challenge-readiness-kits-smoke.mjs
tests/third-person-navigation-challenge-readiness-cdn-state-input-smoke.mjs
```

Coverage added:

- 10 kit intake cases.
- 10 Playwright-style state/input cases.
- Checkpoint thread descriptors.
- Turn commitment wedge descriptors.
- Vault window arc descriptors.
- Recovery pocket descriptors.
- Camera/actor sync meter descriptors.
- Finish commitment beacon descriptors.
- Renderer handoff counts.
- JSON serialization boundaries.
- No renderer, DOM, input, Three.js, WebGL, audio, asset loading, or frame-loop ownership in reusable kits.

## Validation results

Static/wired validation completed in this connector run:

```txt
NexusEngine main CDN import present in changed navigation challenge overlay.
Old NexusRealtime runtime import absent from changed navigation challenge overlay.
GameHost exposes getNavigationChallengeReadiness().
GameHost exposes getThirdPersonNavigationChallengeReadiness().
GameHost getRendererHandoff() composes navigationChallenge descriptor counts with the existing handoff.
Route shell cache-busts navigation-challenge-readiness-v1.
Route shell exposes Navigation Challenge: ON.
New kit smoke is routed through the existing third-person camera composition kit smoke.
New CDN/state-input smoke is routed through the existing third-person camera composition CDN smoke.
Manifest records navigation-challenge-readiness-renderer-handoff-pass.
```

Runtime shell execution was not available in this connector-only run. Intended commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime overlay:

```txt
experiments/ThirdPersonFollowThrough/app/navigation-challenge-readiness-entry.js
```

Audit result:

```txt
Imports NexusEngine main via https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
Does not import LuminaryLabs-Dev/NexusRealtime
```

The lower-level third-person runtime still imports Three.js and NexusEngine utility kits as presentation/runtime code. The new reusable navigation challenge logic does not import NexusRealtime, Three.js, DOM, WebGL, audio, assets, browser input, or the frame loop.

## Cleanup pass

- Kept reusable navigation challenge logic in `third-person-navigation-challenge-readiness-domain-kit.js` as plain snapshot-to-descriptor functions.
- Kept DOM overlay rendering in `navigation-challenge-readiness-entry.js` only.
- Kept controller, input, Three.js scene, and frame-loop ownership in `app.js` only.
- Routed smoke tests through existing third-person validation instead of expanding the global check runner.
- Updated the manifest without adding a new versioned route.
- No destructive deletion was performed.

## Non-game handling

`experiments/ThirdPersonFollowThrough/` is a small experience-driven web controller scene, not a broken non-game artifact. It was preserved and upgraded rather than deleted or renamed.

## Next safe ledge

The next safe upgrade for this route is to let the checkpoint descriptors drive an optional ghost-runner challenge: a target time, split markers, and route replay ghost can be emitted by kits while the renderer continues to consume descriptors only.
