# 2026-07-08 0601 — Fogline Relay signal cartography upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The latest completed upgrade was `experiments/peer-scene-transition/`, so this pass selected a different route. Fogline Relay already had first-person movement, scan, route readability, and visual-fractal descriptors, but its play loop still relied too much on the player inferring the best scan route and safest retreat path from fog and pressure alone. This pass adds signal cartography so relay priority, wraith avoidance, scan windows, gate charge, retreat pockets, and triangulation lines become explicit descriptor surfaces.

## Last upgraded experiment

`experiments/peer-scene-transition/`

Latest known commit before this pass: `c4c8d7858d99317317735462182353eadf4ef3dc` — `Log peer scene decision readability upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, consequence, and decision readability descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, action likelihood, route choice scoring, pressure release, and narrative thread pins. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit, traversal readability descriptors. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery, traversal readability descriptors. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards, sample bookmarks, route task bands. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route with signal cartography. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory, relay priority, avoidance corridors, scan windows, retreat pockets, triangulation grid. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources, survival readability descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
fogline-signal-cartography-domain
├─ signal-priority-domain
│  ├─ relay-priority-domain
│  │  └─ fogline-relay-priority-map-kit
│  └─ scan-window-domain
│     └─ fogline-scan-window-ladder-kit
├─ route-safety-domain
│  ├─ wraith-avoidance-domain
│  │  └─ fogline-wraith-avoidance-corridor-kit
│  └─ retreat-pocket-domain
│     └─ fogline-retreat-pocket-compass-kit
├─ completion-memory-domain
│  ├─ gate-charge-domain
│  │  └─ fogline-gate-charge-thread-kit
│  └─ triangulation-grid-domain
│     └─ fogline-signal-triangulation-grid-kit
└─ renderer-handoff
   └─ fogline-cartography-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `fogline-relay-priority-map-kit`
- `fogline-wraith-avoidance-corridor-kit`
- `fogline-scan-window-ladder-kit`
- `fogline-gate-charge-thread-kit`
- `fogline-retreat-pocket-compass-kit`
- `fogline-signal-triangulation-grid-kit`
- `fogline-cartography-renderer-handoff-kit`
- `fogline-signal-cartography-domain-kit`

Changed integration:

- `session.js` now imports `createFoglineSignalCartographyDomain`.
- `session.js` folds cartography descriptors into existing compatible visual-fractal renderer buckets so Canvas and Three presentation remain consume-only.
- `session.js` exposes `signalCartography`, `domain.foglineSignalCartography`, and a composed `rendererHandoff`.
- `main.js` exposes `GameHost.getSignalCartography()` and now returns the composed renderer handoff.
- `scripts/run-checks.mjs` runs the new cartography kit and CDN/state checks in full and deploy validation.
- `experiments/domain-kit-cutover-manifest.json` records the signal-cartography pass.

## Files changed

- `experiments/fogline-relay/src/fogline-signal-cartography-kits.js`
- `experiments/fogline-relay/src/session.js`
- `experiments/fogline-relay/src/main.js`
- `tests/fogline-signal-cartography-domain-kits-smoke.mjs`
- `tests/fogline-signal-cartography-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0601-fogline-signal-cartography-upgrade.md`

## Tests added

- `tests/fogline-signal-cartography-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks relay priority markers, wraith avoidance corridors, scan window ladders, gate charge threads, retreat pocket compasses, signal triangulation grid, renderer handoff counts, serializability, and renderer-neutral ownership boundaries.
- `tests/fogline-signal-cartography-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime runtime absence, session import wiring, `GameHost` exposure, composed renderer handoff, renderer-neutral kit boundaries, compatible renderer buckets, route boot, and check wiring.

Updated:

- `scripts/run-checks.mjs` now runs both new checks in full and deploy suites.
- `experiments/domain-kit-cutover-manifest.json` now records `signal-cartography-readability-handoff-pass`.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking route/test/manifest tokens during the pass.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Fogline runtime keeps the requested NexusEngine import through `NEXUS_URL`: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Fogline runtime does not import `LuminaryLabs-Dev/NexusRealtime@main`.
- Existing `NexusRealtime-ProtoKits` render-layer and domain-foundation bridge references remain because they are not the old core runtime CDN and this pass did not destructively replace the render pipeline.
- New signal cartography kits are plain descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.

## Cleanup pass

- Preserved the Fogline relay route and all existing scan / relay / wraith / gate behavior.
- Reused existing visual-fractal renderer buckets instead of adding a second renderer.
- Kept cartography ranking, safety, retreat, gate charge, and triangulation logic inside reusable kits.
- Avoided version-suffix route creation.
- Avoided destructive deletes or renames.

## Non-game route handling

Fogline Relay is a small experience-driven web game. It was not deleted, renamed, or refactored away. The pass preserved the first-person scan loop and added explicit signal cartography to make the objective route more readable.

## Next safe ledge

Add a deterministic Fogline replay fixture that walks spawn → scan relay 1 → evade wraith → scan relay 2 → open gate → complete exit, then snapshot-hashes visual-fractal plus signal-cartography renderer handoff descriptors.
