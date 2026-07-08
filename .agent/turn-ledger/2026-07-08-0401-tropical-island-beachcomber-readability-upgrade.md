# 2026-07-08 0401 — Tropical Island Scene beachcomber readability upgrade

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

The latest completed upgrade was `experiments/high-fidelity-meadow/`, so this run selected a different route. Tropical Island Scene was still a mostly passive orbitable island scene: visually attractive, but the player had little readable intent beyond watching water, fish, coconuts, and drift props. The upgrade adds beachcomber objective readability without moving scene truth or reusable logic into the renderer.

## Last upgraded experiment

`experiments/high-fidelity-meadow/`

Latest commit before this pass: `45f578e145ce1fb34231d6fe6b7055c80c3d63f0` — `Log meadow ecology readability upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig. | No changed-runtime old runtime CDN. | Yes through arena wrapper. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, consequence descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, consequences. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices. | Legacy file remains, active handoff uses CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build pressure route. | 5-12 minute objective loop. | Move, harvest, build mast, survive pressure. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview gateway. | 1-3 minute preview/interstitial. | Route preview, wind/waypoint/altitude descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, now beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and new overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place/upgrade towers, read path pressure, wave readiness. | No changed-runtime old runtime CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
tropical-beachcomber-readability-domain
├─ beach-objective-domain
│  ├─ task-beacon-domain
│  │  └─ beachcomber-task-beacon-kit
│  └─ shoreline-path-domain
│     └─ shoreline-path-ribbon-kit
├─ wildlife-and-drift-domain
│  ├─ fish-focus-domain
│  │  └─ fish-school-focus-ring-kit
│  └─ drift-collection-domain
│     └─ drift-collection-lane-kit
├─ safety-and-tide-domain
│  ├─ coconut-risk-domain
│  │  └─ coconut-risk-shadow-kit
│  └─ tide-window-domain
│     └─ tide-window-pulse-kit
└─ renderer-handoff
   └─ beachcomber-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `beachcomber-task-beacon-kit`
- `shoreline-path-ribbon-kit`
- `coconut-risk-shadow-kit`
- `fish-school-focus-ring-kit`
- `drift-collection-lane-kit`
- `tide-window-pulse-kit`
- `beachcomber-renderer-handoff-kit`
- `tropical-beachcomber-readability-domain-kit`

Changed route integration:

- Added `beachcomber-readability-entry.js`, a browser integration layer that imports NexusEngine main CDN, waits for `GameHost`, builds beachcomber descriptors from current state, patches `GameHost.getBeachcomberReadability()`, and extends `GameHost.getRendererHandoff()` with combined descriptor buckets.
- Added a presentation-only overlay canvas that renders from descriptors only.
- Kept the reusable kit file plain-input to plain-descriptor output.

## Files changed

- `experiments/tropical-island-scene/src/tropical-beachcomber-readability-domain-kit.js`
- `experiments/tropical-island-scene/src/beachcomber-readability-entry.js`
- `experiments/tropical-island-scene/index.html`
- `tests/tropical-beachcomber-readability-kits-smoke.mjs`
- `tests/tropical-beachcomber-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0401-tropical-island-beachcomber-readability-upgrade.md`

## Tests added

- `tests/tropical-beachcomber-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks task beacons, shoreline routes, coconut risks, fish focus rings, drift collection lanes, tide windows, renderer handoff, serializability, and ownership boundaries.
- `tests/tropical-beachcomber-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN usage in the changed entry.
  - Checks old `LuminaryLabs-Dev/NexusRealtime` runtime CDN absence in the changed entry.
  - Checks `GameHost.getBeachcomberReadability()` and extended `GameHost.getRendererHandoff()`.
  - Checks 10 state/input surfaces.

Both tests were wired into `npm run check` and `npm run check:deploy` via `scripts/run-checks.mjs`.

## Validation results

Static connector validation completed by refetching changed files and checking the expected tokens after each write.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- New changed entry imports: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New changed entry does not import `LuminaryLabs-Dev/NexusRealtime`.
- Existing Tropical Island `main.js` still imports `NexusRealtime-ProtoKits@0.0.2` URLs that are redirected by the route import-map to local kits. This was preserved because it is legacy ProtoKit compatibility, not the old core runtime CDN, and replacing every local island/water compatibility import was outside the safe ledge for this pass.

## Cleanup pass

- Kept reusable descriptors free of DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Left the old lagoon WebGL renderer intact to avoid destructive changes.
- Added the new overlay as an additive descriptor consumer instead of rewriting the large fragment shader.
- Updated route text and ARIA labels to mention beachcomber readability.
- Updated the manifest rather than creating a versioned route.

## Non-game route handling

Tropical Island Scene is a small experience-driven web scene, not a full game. It was not deleted or renamed. This pass preserved its original proof: a compact WebGL island/water composition with local ProtoKit compatibility and NexusEngine main CDN state exposure. The lesson logged: passive scenes still benefit from objective/readability descriptors when they stay renderer-neutral and additive.

## Next safe ledge

Fold the overlay renderer into the WebGL shader once the beachcomber descriptor buckets are stable, then add a deterministic orbit/replay fixture that hashes lagoon plus beachcomber renderer handoff descriptors across 10 camera states.
