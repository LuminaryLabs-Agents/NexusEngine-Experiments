# 2026-07-08 0430 — Third Person Follow Through locomotion readability upgrade

## Chosen experiment

`experiments/ThirdPersonFollowThrough/`

## Why it was chosen

The latest completed upgrade was `experiments/nexus-frontier-signal-isles/`, so this pass selected a different route. Third Person Follow Through is still one of the lowest-variation experiences in the canonical set: it is a controller/camera sandbox with strong debug rays and an arena-fractal overlay, but it did not yet make the actual locomotion decisions readable enough for iteration. The upgrade adds descriptor-only guidance for yaw alignment, backpedal behavior, jump apex, landing risk, camera recentering, and input cadence.

## Last upgraded experiment

`experiments/nexus-frontier-signal-isles/`

Latest known ledger before this pass: `.agent/turn-ledger/2026-07-08-0413-signal-isles-objective-readability-upgrade.md`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
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
third-person-locomotion-readability-domain
├─ movement-intent-domain
│  ├─ root-yaw-alignment-domain
│  │  └─ third-person-root-yaw-alignment-fan-kit
│  └─ backpedal-guard-domain
│     └─ third-person-backpedal-guard-rail-kit
├─ aerial-control-domain
│  ├─ jump-apex-domain
│  │  └─ third-person-jump-apex-band-kit
│  └─ landing-safety-domain
│     └─ third-person-landing-safety-patch-kit
├─ camera-coaching-domain
│  ├─ recenter-leash-domain
│  │  └─ third-person-camera-recenter-leash-kit
│  └─ input-cadence-domain
│     └─ third-person-input-cadence-beat-kit
└─ renderer-handoff
   └─ third-person-locomotion-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-root-yaw-alignment-fan-kit`
- `third-person-backpedal-guard-rail-kit`
- `third-person-jump-apex-band-kit`
- `third-person-landing-safety-patch-kit`
- `third-person-camera-recenter-leash-kit`
- `third-person-input-cadence-beat-kit`
- `third-person-locomotion-renderer-handoff-kit`
- `third-person-locomotion-readability-domain-kit`

Changed route integration:

- `arena-fractal-entry.js` now composes the existing arena-fractal domain with the new locomotion-readability domain.
- The DOM overlay now consumes locomotion descriptor buckets for yaw fans, backpedal rails, jump bands, landing patches, recenter leashes, and cadence chips.
- `GameHost.getLocomotionReadability()` exposes the domain snapshot.
- `GameHost.getRendererHandoff()` exposes a composed arena plus locomotion renderer handoff.
- `index.html` and `app/index.js` were cache-busted to `locomotion-readability-v1`.

## Files changed

- `experiments/ThirdPersonFollowThrough/kits/third-person-locomotion-readability-domain-kit.js`
- `experiments/ThirdPersonFollowThrough/app/arena-fractal-entry.js`
- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/index.html`
- `experiments/ThirdPersonFollowThrough/domain/third-person-follow-through-domain.js`
- `tests/third-person-locomotion-readability-kits-smoke.mjs`
- `tests/third-person-locomotion-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0430-third-person-locomotion-readability-upgrade.md`

## Tests added

- `tests/third-person-locomotion-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks root yaw fans, backpedal rails, jump apex bands, landing safety patches, camera recenter leashes, input cadence beats, renderer handoff counts, serializability, and ownership boundaries.
- `tests/third-person-locomotion-readability-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN usage in the changed wrapper.
  - Checks old `LuminaryLabs-Dev/NexusRealtime` runtime absence in the changed wrapper.
  - Checks cache-busted route entry, `GameHost.getLocomotionReadability()`, `GameHost.getRendererHandoff()`, and 10 state/input cases.

Updated:

- `scripts/run-checks.mjs` wires the new checks into full and deploy validation.

## Validation results

Static connector validation completed by writing and refetching the changed files for expected tokens in route shell, wrapper entry, kit file, smoke files, manifest, and ledger.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed wrapper import remains: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed wrapper does not import `LuminaryLabs-Dev/NexusRealtime`.
- Base route already used NexusEngine main runtime files.
- New reusable kits are plain JavaScript descriptors and do not import browser or renderer runtimes.

## Cleanup pass

- Kept reusable kit logic free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Preserved the existing controller loop: WASD, backpedal behavior, jump, reset, debug rays, colliders, and camera orbit/handoff.
- Avoided destructive route rewrites.
- Used the existing overlay as a descriptor consumer instead of moving controller truth into presentation code.
- Updated the canonical manifest instead of creating a versioned route.

## Non-game route handling

Third Person Follow Through is a small experience-driven controller sandbox. It was not deleted or renamed. This pass preserved its original proof: a NexusEngine main CDN third-person camera/controller route with serializable debug export and renderer-only presentation layers.

## Next safe ledge

Add a deterministic controller replay fixture that walks through idle, forward, strafe, backpedal, jump rise, jump fall, left orbit handoff, right orbit handoff, near-obstacle landing, and debug-hidden states while snapshot-hashing the composed arena plus locomotion renderer handoff descriptors.
