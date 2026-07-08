# 2026-07-08 0516 — Cavalry battlefield orders readability upgrade

## Chosen experiment

`apps/the-cavalry-of-rome/`

## Why it was chosen

The latest completed upgrade was `games/signal-bastion/`, so this pass selected a different route. Cavalry already had campaign map, supply, morale, and command descriptors, but it was still weak at telling the player what the next useful military order should be. The upgrade adds a second descriptor layer for scouting, flank exposure, reinforcement need, attrition, turn tempo, and objective pressure.

## Last upgraded experiment

`games/signal-bastion/`

Latest known commit before this pass: `b8915a8c7e2f66f4ad0462eac49961da874787a6` — `Log Signal Bastion wave choreography upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, and consequence descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, consequences. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, and wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
cavalry-battlefield-orders-domain
├─ reconnaissance-domain
│  ├─ scouting-vector-domain
│  │  └─ cavalry-scouting-vector-kit
│  └─ flank-risk-domain
│     └─ cavalry-flank-risk-arc-kit
├─ formation-response-domain
│  ├─ reinforcement-domain
│  │  └─ cavalry-reinforcement-callout-kit
│  └─ attrition-domain
│     └─ cavalry-attrition-forecast-chip-kit
├─ campaign-tempo-domain
│  ├─ turn-tempo-domain
│  │  └─ cavalry-turn-tempo-standard-kit
│  └─ objective-pressure-domain
│     └─ cavalry-objective-pressure-banner-kit
└─ renderer-handoff
   └─ cavalry-battlefield-orders-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cavalry-scouting-vector-kit`
- `cavalry-flank-risk-arc-kit`
- `cavalry-reinforcement-callout-kit`
- `cavalry-attrition-forecast-chip-kit`
- `cavalry-turn-tempo-standard-kit`
- `cavalry-objective-pressure-banner-kit`
- `cavalry-battlefield-orders-renderer-handoff-kit`
- `cavalry-battlefield-orders-domain-kit`

Changed integration:

- `cavalry-campaign-fractal-handoff-pass.js` now composes the existing campaign fractal domain with the new battlefield orders domain.
- `GameHost.getCavalryBattlefieldOrders()` exposes the new domain state.
- `GameHost.getRendererHandoff()` returns a composed descriptor handoff.
- The Canvas overlay consumes order descriptors as presentation only.

## Files changed

- `experiments/The Cavalry of Rome/src/cavalry-battlefield-orders-domain-kit.js`
- `experiments/The Cavalry of Rome/src/cavalry-campaign-fractal-handoff-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `tests/cavalry-battlefield-orders-domain-kits-smoke.mjs`
- `tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs`
- `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0516-cavalry-battlefield-orders-upgrade.md`

## Tests added

- `tests/cavalry-battlefield-orders-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks six atomic kit surfaces plus the composite renderer handoff per intake.
  - Validates descriptor shape, serializability, handoff counts, and ownership boundaries.
- `tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime runtime absence, route cache busting, GameHost exposure, and check wiring.

Updated:

- `tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `scripts/run-checks.mjs`

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking expected tokens through the updated smoke files.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Cavalry handoff keeps the requested runtime import: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Cavalry handoff does not import `LuminaryLabs-Dev/NexusRealtime@main`.
- Existing legacy visual proof files may retain ProtoKit dependency paths, but the active changed handoff uses NexusEngine main CDN.
- New battlefield orders kits are plain JavaScript descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.

## Cleanup pass

- Preserved the canonical live app route instead of adding a version suffix.
- Updated both live and experiment route cache busts to `campaign-034`.
- Updated the route domain plan so the local DSK stack reflects the new battlefield orders layer.
- Reused the existing overlay canvas and kept reusable logic out of renderer ownership.
- Avoided destructive route rewrites.

## Non-game route handling

The Cavalry of Rome is a small experience-driven strategy prototype. It was not deleted, renamed, or refactored away. The pass preserved the large campaign map and added a clear next-order readability layer.

## Next safe ledge

Add a deterministic Cavalry campaign replay fixture that chooses a Roman cell, previews scout vectors, commits one march, ends a world turn, and snapshot-hashes the composed campaign plus battlefield-orders renderer handoff descriptors.
