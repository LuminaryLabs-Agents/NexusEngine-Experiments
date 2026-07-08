# 2026-07-08 0659 — VR Platformer Board objective readability upgrade

## Chosen experiment

`experiments/vr-platformer-board/`

## Why it was chosen

The latest completed upgrade was `experiments/tropical-island-scene/`, so this pass selected a different route. VR Platformer Board already had traversal readability for jump arcs, landing zones, checkpoint threads, recovery beacons, tempo bands, and control coaching, but its coin, hazard, exit, comfort, and route-risk decisions were still implicit. The most meaningful next improvement was to add objective-readability descriptors and fold them into the existing Canvas-visible checkpoint, recovery, and tempo buckets without moving reusable logic into the renderer.

## Last upgraded experiment

`experiments/tropical-island-scene/`

Latest known commit before this pass: `759648c9e22ed94ef16bafb7658d878a212cac42` — `Log tropical lagoon navigation readability upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, consequence, and decision readability descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, action likelihood, route choice scoring, pressure release, and narrative thread pins. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route with traversal and objective readability descriptors. | 2-5 minute traversal/collection run. | A/D movement, Space jump, R reset, collect coins, avoid hazards, reach exit, jump arcs, landing zones, checkpoint threads, recovery beacons, tempo bands, coin priority orbits, hazard approach funnels, momentum lanes, exit gates, comfort corridors, route risk scorecards. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery, traversal readability descriptors. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards, sample bookmarks, route task bands. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route with signal cartography. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory, relay priority, avoidance corridors, scan windows, retreat pockets, triangulation grid. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview, launch-rehearsal, and flightplan-readability gateway. | 2-5 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, runway vectors, energy budget, cloud slits, lane choice, risk/reward cards, and return anchors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route with foraging readability. | 5-12 minute survival/scavenging loop. | Move, collect apples, scavenge gear, melee/use gear, waves, survival pressure, apple rarity heat, gear choice arcs, harvest streak trails, safe harvest pockets, row memory, boss omen branches. | No changed-runtime old runtime CDN. ProtoKits survival bridge URL remains and is not the old core runtime CDN. | Yes through `kit-stack.js`. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene with visual, beachcomber, and lagoon navigation readability descriptors. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, reef descriptors, beachcomber objectives, reef depth contours, swim safety cones, current vector fans, snorkel point scores, raft return wakes, and sun glare timing bands. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed navigation entry. | Yes in base route and overlay entries. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
vr-board-traversal-readability-domain
├─ jump-readability
│  ├─ jump-arc-forecast
│  │  └─ vr-board-jump-arc-forecast-kit
│  └─ landing-zone-heat
│     └─ vr-board-landing-zone-heat-kit
├─ route-memory
│  ├─ checkpoint-thread
│  │  └─ vr-board-checkpoint-thread-kit
│  └─ fail-recovery-beacon
│     └─ vr-board-fail-recovery-beacon-kit
├─ cadence-and-coaching
│  ├─ tempo-pulse-band
│  │  └─ vr-board-tempo-pulse-band-kit
│  └─ control-coaching-strip
│     └─ vr-board-control-coaching-strip-kit
├─ objective-readability
│  ├─ collection-intent-domain
│  │  ├─ collectible-priority-orbit
│  │  │  └─ vr-board-collectible-priority-orbit-kit
│  │  └─ exit-readiness-gate
│  │     └─ vr-board-exit-readiness-gate-kit
│  ├─ risk-route-domain
│  │  ├─ hazard-approach-funnel
│  │  │  └─ vr-board-hazard-approach-funnel-kit
│  │  └─ momentum-lane
│  │     └─ vr-board-momentum-lane-kit
│  ├─ comfort-choice-domain
│  │  ├─ head-comfort-corridor
│  │  │  └─ vr-board-head-comfort-corridor-kit
│  │  └─ route-risk-scorecard
│  │     └─ vr-board-route-risk-scorecard-kit
│  └─ renderer-handoff
│     └─ vr-board-objective-renderer-handoff-kit
└─ renderer-handoff
   └─ vr-board-traversal-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `vr-board-collectible-priority-orbit-kit`
- `vr-board-hazard-approach-funnel-kit`
- `vr-board-momentum-lane-kit`
- `vr-board-exit-readiness-gate-kit`
- `vr-board-head-comfort-corridor-kit`
- `vr-board-route-risk-scorecard-kit`
- `vr-board-objective-renderer-handoff-kit`
- `vr-board-objective-readability-domain-kit`

Changed:

- `vr-board-traversal-readability-domain-kit` now composes the objective-readability domain.
- `vr-board-traversal-renderer-handoff-kit` now folds objective descriptors into existing visible checkpoint, recovery, and tempo descriptor buckets.
- `vr-board-traversal-renderer-handoff-kit` now exposes objective counts and `objectiveReadability` in its descriptor handoff.

## Files changed

- `experiments/_kits/vr-platformer-board/vr-board-objective-readability-kits.js`
- `experiments/_kits/vr-platformer-board/vr-board-traversal-readability-kits.js`
- `tests/vr-board-objective-readability-kits-smoke.mjs`
- `tests/vr-board-objective-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0659-vr-board-objective-readability-upgrade.md`

## Tests added

- `tests/vr-board-objective-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks collectible priority orbits, hazard approach funnels, momentum lanes, exit readiness gates, head comfort corridors, route risk scorecards, renderer handoff counts, serializability, ownership boundaries, and integration into traversal readability.
- `tests/vr-board-objective-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime core CDN absence, objective kit import wiring, descriptor folding functions, check wiring, and route objective input boundaries.

Updated wiring:

- `scripts/run-checks.mjs` now includes both new smoke tests in full validation.
- `scripts/run-checks.mjs` now includes both new smoke tests in deploy validation.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and re-fetching the changed traversal kit to inspect import wiring, objective folding functions, renderer handoff descriptors, and domain output fields.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- The active route already imports NexusEngine main CDN directly: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The active route does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- New objective readability kits do not import NexusRealtime, ProtoKits, renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.
- Changed traversal kits import only sibling objective-readability kits and keep the renderer as descriptor consumer.

## Cleanup pass

- Preserved the existing route shell, Canvas renderer, keyboard input, head-drag input, collision loop, and `GameHost` contract.
- Avoided destructive deletes or route renames.
- Avoided adding a versioned route.
- Kept new objective logic as plain serializable kit descriptors.
- Folded objective outputs into renderer-visible existing buckets instead of adding renderer-owned simulation logic.
- Left direct control coaching strip output unchanged to preserve existing smoke expectations.

## Non-game route handling

VR Platformer Board is a small experience-driven web game/sandbox rather than a full product route. It was not deleted or renamed because it proves NexusEngine CDN loading, board-scale platforming, traversal readability, and now objective readability with renderer-neutral descriptor composition.

## Next safe ledge

Add a deterministic board replay fixture that walks left/right, jumps over the two hazard gaps, collects all coins, enters the exit, and snapshot-hashes visual, traversal, and objective renderer-handoff descriptors together.
