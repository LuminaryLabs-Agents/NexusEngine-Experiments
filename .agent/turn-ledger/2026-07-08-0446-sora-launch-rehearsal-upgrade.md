# 2026-07-08 0446 — Sora launch rehearsal readability upgrade

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest completed upgrade was `experiments/ThirdPersonFollowThrough/`, so this pass selected a different route. Sora the Infinite remains one of the smallest and lowest-variation routes in the canonical set: it is an authored route-preview/compatibility gateway that proves alias continuity and previews the handoff into The Open Above, but it still lacked a moment-to-moment launch rehearsal loop. This pass adds preflight, control confidence, thermal slot, drift warning, countdown, and target ghost descriptors so the route has more readable procedural variation before the handoff.

## Last upgraded experiment

`experiments/ThirdPersonFollowThrough/`

Latest known ledger before this pass: `.agent/turn-ledger/2026-07-08-0430-third-person-locomotion-readability-upgrade.md`.

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
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place/upgrade towers, read path pressure, wave readiness. | No changed-runtime old runtime CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
sora-launch-rehearsal-domain
├─ preflight-readiness-domain
│  ├─ checklist-domain
│  │  └─ sora-preflight-checklist-kit
│  └─ control-confidence-domain
│     └─ sora-control-confidence-kit
├─ route-risk-domain
│  ├─ thermal-slot-domain
│  │  └─ sora-thermal-slot-kit
│  └─ drift-warning-domain
│     └─ sora-drift-warning-kit
├─ handoff-rehearsal-domain
│  ├─ entry-countdown-domain
│  │  └─ sora-entry-countdown-kit
│  └─ target-ghost-domain
│     └─ sora-target-ghost-kit
└─ renderer-handoff
   └─ sora-launch-rehearsal-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `sora-preflight-checklist-kit`
- `sora-control-confidence-kit`
- `sora-thermal-slot-kit`
- `sora-drift-warning-kit`
- `sora-entry-countdown-kit`
- `sora-target-ghost-kit`
- `sora-launch-rehearsal-renderer-handoff-kit`
- `sora-launch-rehearsal-domain-kit`

Changed route integration:

- `sora-compatibility-gateway.js` now composes the existing route-preview domain with the launch-rehearsal domain.
- `GameHost.getLaunchRehearsal()` exposes launch rehearsal state.
- `GameHost.getRendererHandoff()` now exposes a composed route-preview plus launch-rehearsal handoff.
- The stage renders launch rehearsal descriptor buckets for thermal slots, drift warnings, target ghosts, countdown rings, and control confidence bars.
- Telemetry now includes a launch rehearsal checklist.

## Files changed

- `experiments/_kits/sora-the-infinite/sora-launch-rehearsal-domain-kits.js`
- `experiments/sora-the-infinite/sora-compatibility-gateway.js`
- `experiments/sora-the-infinite/index.html`
- `experiments/sora-the-infinite/sora-compatibility-style.css`
- `tests/sora-launch-rehearsal-domain-kits-smoke.mjs`
- `tests/sora-launch-rehearsal-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0446-sora-launch-rehearsal-upgrade.md`

## Tests added

- `tests/sora-launch-rehearsal-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks preflight checklist, control confidence, thermal slots, drift warnings, countdown rings, target ghosts, renderer handoff counts, serializability, and ownership boundaries.
- `tests/sora-launch-rehearsal-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN usage in the changed gateway.
  - Checks old `LuminaryLabs-Dev/NexusRealtime` runtime absence in the changed gateway.
  - Checks cache-busted route shell, `GameHost.getLaunchRehearsal()`, composed renderer handoff, and 10 state/input cases.

Updated:

- `scripts/run-checks.mjs` wires both new tests into full and deploy validation.

## Validation results

Static connector validation completed by writing the changed files through GitHub contents API and checking expected tokens in the updated files.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Sora gateway import remains: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Sora gateway does not import `LuminaryLabs-Dev/NexusRealtime`.
- New reusable launch rehearsal kits are plain JavaScript descriptor factories and do not import browser or renderer runtimes.
- Existing route-preview tests still cover the original Sora compatibility domain.

## Cleanup pass

- Kept reusable kit logic free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Preserved route-preview/alias continuity instead of replacing it.
- Avoided destructive route rewrites.
- Added new launch rehearsal behavior as a descriptor layer consumed by presentation only.
- Updated canonical manifest instead of creating a versioned route.

## Non-game route handling

Sora the Infinite is a small experience-driven compatibility gateway. It was not deleted or renamed. This pass preserved its original proof: a NexusEngine main CDN alias/route-preview gateway that hands off to The Open Above while preserving query/hash state.

## Next safe ledge

Add a deterministic Sora launch replay fixture that steps through idle, build lift, left bank, right bank, climb, pointer input, drift correction, countdown ready, launch click, and reset while snapshot-hashing the composed route-preview plus launch-rehearsal renderer handoff descriptors.
