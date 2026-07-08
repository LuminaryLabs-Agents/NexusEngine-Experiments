# 2026-07-08 0643 — Tropical Lagoon Navigation readability upgrade

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

The latest completed upgrade was `experiments/sora-the-infinite/`, so this pass selected a different route. Tropical Island Scene already had lagoon visual descriptors and beachcomber objectives, but its water layer still read mostly as a passive vista. The next meaningful improvement was to make the lagoon itself readable: reef depth, safe swim lanes, current force, snorkel value, raft return paths, and sun-glare timing are now represented as independent descriptor domains.

## Last upgraded experiment

`experiments/sora-the-infinite/`

Latest known commit before this pass: `d948bd828fef09182cf556a8e57cb6913419bdb1` — `Log Sora flightplan readability upgrade`.

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
| `experiments/sora-the-infinite/` | Authored route-preview, launch-rehearsal, and flightplan-readability gateway. | 2-5 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, runway vectors, energy budget, cloud slits, lane choice, risk/reward cards, and return anchors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route with foraging readability. | 5-12 minute survival / scavenging loop. | Move, collect apples, scavenge gear, melee/use gear, waves, survival pressure, apple rarity heat, gear choice arcs, harvest streak trails, safe harvest pockets, row memory, boss omen branches. | No changed-runtime old runtime CDN. ProtoKits survival bridge URL remains and is not the old core runtime CDN. | Yes through `kit-stack.js`. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene with visual, beachcomber, and lagoon navigation readability descriptors. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, reef descriptors, beachcomber objectives, reef depth contours, swim safety cones, current vector fans, snorkel point scores, raft return wakes, and sun glare timing bands. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed navigation entry. | Yes in base route and overlay entries. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
tropical-lagoon-navigation-readability-domain
├─ water-reading-domain
│  ├─ reef-depth-contour-domain
│  │  └─ lagoon-reef-depth-contour-kit
│  └─ current-vector-domain
│     └─ lagoon-current-vector-fan-kit
├─ safe-route-domain
│  ├─ swim-safety-cone-domain
│  │  └─ lagoon-swim-safety-cone-kit
│  └─ raft-return-domain
│     └─ lagoon-raft-return-wake-kit
├─ discovery-window-domain
│  ├─ snorkel-score-domain
│  │  └─ lagoon-snorkel-point-score-kit
│  └─ sun-glare-domain
│     └─ lagoon-sun-glare-timing-band-kit
└─ renderer-handoff
   └─ lagoon-navigation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `lagoon-reef-depth-contour-kit`
- `lagoon-swim-safety-cone-kit`
- `lagoon-current-vector-fan-kit`
- `lagoon-snorkel-point-score-kit`
- `lagoon-raft-return-wake-kit`
- `lagoon-sun-glare-timing-band-kit`
- `lagoon-navigation-renderer-handoff-kit`
- `tropical-lagoon-navigation-readability-domain-kit`

Changed integration:

- `index.html` now loads `lagoon-navigation-readability-entry.js` after the existing lagoon and beachcomber modules.
- `lagoon-navigation-readability-entry.js` imports NexusEngine main CDN and the new navigation domain kit.
- `lagoon-navigation-readability-entry.js` patches `GameHost.getLagoonNavigationReadability()` and folds the navigation handoff into `GameHost.getRendererHandoff()`.
- The overlay renders reef contours, swim cones, current vectors, snorkel rings, raft return wakes, and glare bands from descriptor buckets only.
- `experiments/domain-kit-cutover-manifest.json` records the lagoon navigation readability pass.

## Files changed

- `experiments/tropical-island-scene/src/tropical-lagoon-navigation-readability-domain-kit.js`
- `experiments/tropical-island-scene/src/lagoon-navigation-readability-entry.js`
- `experiments/tropical-island-scene/index.html`
- `tests/tropical-lagoon-navigation-readability-kits-smoke.mjs`
- `tests/tropical-lagoon-navigation-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0643-tropical-lagoon-navigation-readability-upgrade.md`

## Tests added

- `tests/tropical-lagoon-navigation-readability-kits-smoke.mjs`
  - 10 intake cases.
  - Checks reef contours, swim safety cones, current vector fans, snorkel point scores, raft return wakes, sun glare timing bands, renderer handoff counts, serializability, and ownership boundaries.
- `tests/tropical-lagoon-navigation-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime core CDN absence in the changed entry, route shell wiring, `GameHost.getLagoonNavigationReadability()`, composed renderer handoff, descriptor rendering hooks, check wiring, and renderer-neutral kit boundaries.

Updated wiring:

- `scripts/run-checks.mjs` now includes both new smoke tests in full validation.
- `scripts/run-checks.mjs` now includes both new smoke tests in deploy validation.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking route/test/manifest tokens during the pass.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed lagoon navigation entry imports the requested NexusEngine main CDN directly: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed lagoon navigation entry does not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`.
- The route still preserves its existing `NexusRealtime-ProtoKits` import-map compatibility entries for the old local island/water stack; these are not the old core runtime CDN and were not destructively removed.
- New lagoon navigation kits are plain descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.
- The overlay consumes descriptor buckets only.

## Cleanup pass

- Preserved the existing lagoon renderer, beachcomber overlay, ProtoKit import-map compatibility, ARIA route shell, and canonical base path.
- Avoided destructive deletes or renames.
- Kept reef, swim, current, snorkel, raft, and glare logic in reusable kit functions.
- Added visual variety through descriptor counts, positions, pulse, scores, safety, force, and timing values instead of introducing renderer-owned simulation logic.
- Avoided version-suffix route creation.

## Non-game route handling

Tropical Island Scene is a small experience-driven web scene rather than a traditional objective game. It was not deleted or renamed because it proves lagoon rendering, beachcomber readability, local ProtoKit compatibility, and now lagoon navigation readability as a reusable descriptor handoff layer.

## Next safe ledge

Add a deterministic Tropical Island replay fixture that sweeps orbit left/right, advances fish and float props, and snapshot-hashes visual, beachcomber, and lagoon navigation renderer-handoff descriptors together.
