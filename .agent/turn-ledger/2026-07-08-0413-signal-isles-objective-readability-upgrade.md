# 2026-07-08 0413 — Signal Isles objective readability upgrade

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

The latest completed upgrade was `experiments/tropical-island-scene/`, so this pass selected a different route. Signal Isles already had movement, scanning, harvesting, building, pressure, cargo, and beacon completion, but the weakest remaining surface was objective readability: the player could see a beautiful island and signal-flow overlays, yet the next useful action, gate dependencies, cargo route, safe pockets, and resource/build deltas were still implicit.

## Last upgraded experiment

`experiments/tropical-island-scene/`

Latest known ledger before this pass: `.agent/turn-ledger/2026-07-08-0401-tropical-island-beachcomber-readability-upgrade.md`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig. | No changed-runtime old runtime CDN. | Yes through arena wrapper. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, and consequence descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, consequences. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices. | Legacy file remains; active handoff uses CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview gateway. | 1-3 minute preview/interstitial. | Route preview, wind/waypoint/altitude descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place/upgrade towers, read path pressure, wave readiness. | No changed-runtime old runtime CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
signal-isles-objective-readability-domain
├─ objective-intent-domain
│  ├─ objective-step-domain
│  │  └─ signal-isles-objective-step-queue-kit
│  └─ proximity-action-domain
│     └─ signal-isles-proximity-action-cue-kit
├─ route-consequence-domain
│  ├─ gate-dependency-domain
│  │  └─ signal-isles-gate-dependency-thread-kit
│  └─ cargo-route-domain
│     └─ signal-isles-cargo-route-ribbon-kit
├─ survival-economy-domain
│  ├─ safe-pocket-domain
│  │  └─ signal-isles-pressure-safe-pocket-kit
│  └─ resource-build-domain
│     └─ signal-isles-resource-build-delta-kit
└─ renderer-handoff
   └─ signal-isles-objective-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `signal-isles-objective-step-queue-kit`
- `signal-isles-proximity-action-cue-kit`
- `signal-isles-gate-dependency-thread-kit`
- `signal-isles-cargo-route-ribbon-kit`
- `signal-isles-pressure-safe-pocket-kit`
- `signal-isles-resource-build-delta-kit`
- `signal-isles-objective-renderer-handoff-kit`
- `signal-isles-objective-readability-domain-kit`

Changed route integration:

- `game-composition.js` now composes objective readability after the existing visual-fractal domain.
- `renderer.js` now consumes objective readability descriptor buckets for action cues, active/completed objective beats, dependency threads, cargo ribbons, safe pockets, and resource/build deltas.
- `debug-host.js` exposes `getObjectiveReadabilityState()` and `getRendererHandoff()`.
- `main.js` keeps the NexusEngine main CDN import and surfaces cue/dependency counts in the HUD.

## Files changed

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-objective-readability-domain-kits.js`
- `experiments/nexus-frontier-signal-isles/src/game-composition.js`
- `experiments/nexus-frontier-signal-isles/src/renderer.js`
- `experiments/nexus-frontier-signal-isles/src/debug-host.js`
- `experiments/nexus-frontier-signal-isles/src/main.js`
- `experiments/nexus-frontier-signal-isles/index.html`
- `tests/signal-isles-objective-readability-kits-smoke.mjs`
- `tests/signal-isles-objective-readability-cdn-state-input-smoke.mjs`
- `tests/signal-isles-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0413-signal-isles-objective-readability-upgrade.md`

## Tests added

- `tests/signal-isles-objective-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks objective beats, proximity cues, gate dependencies, cargo ribbons, safe pockets, resource/build deltas, renderer handoff, serializability, and ownership boundaries.
- `tests/signal-isles-objective-readability-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN usage in the changed runtime.
  - Checks old `NexusRealtime@main` runtime CDN absence in the changed runtime.
  - Checks `GameHost`/composition objective readability and composed renderer handoff exposure.
  - Checks 10 state/input surfaces.

Updated:

- `tests/signal-isles-playwright-state-input-smoke.mjs` now recognizes the cache-busted route module and objective readability descriptor handoff.
- `scripts/run-checks.mjs` wires the new checks into full and deploy validation.

## Validation results

Static connector validation completed by refetching changed files after writes and checking the expected tokens in route, kit, debug host, renderer, tests, manifest, and ledger.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed runtime import remains: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed runtime does not import `NexusRealtime@main`.
- No new `LuminaryLabs-Dev/NexusRealtime` import was added.
- New reusable kits are plain JavaScript descriptors and do not import browser or renderer runtimes.

## Cleanup pass

- Kept reusable kit logic free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Preserved existing first-person movement, scan, harvest, build, pressure, cargo, and beacon loop behavior.
- Avoided destructive route rewrites.
- Used the existing `visualLayer` as a descriptor consumer instead of moving state into the renderer.
- Updated the manifest instead of creating a versioned route.

## Non-game route handling

Signal Isles is already a small experience-driven web game. It was not deleted or renamed. This pass preserved its original proof: a NexusEngine main CDN first-person island objective route with local domain composition and a renderer-only presentation layer.

## Next safe ledge

Add a deterministic Signal Isles objective replay fixture that walks through scan, harvest, build, pressure, gate, cargo pickup, cargo delivery, and beacon activation while snapshot-hashing the visual plus objective renderer handoff descriptors across 10 authored player states.
