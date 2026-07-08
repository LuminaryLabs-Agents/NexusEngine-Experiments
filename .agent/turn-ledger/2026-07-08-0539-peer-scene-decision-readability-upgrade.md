# 2026-07-08 0539 — Peer Scene decision readability upgrade

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

The latest completed upgrade was `games/rogue-lite-hellscape-siege/`, so this pass selected a different route. Peer Scene Transition is still one of the lowest-variation canonical experiences: a small HTML scene puzzle with action buttons, inventory checks, and route gates. Previous passes made atmosphere, chronicle, and consequences readable; this pass adds decision readability so the player can understand which action is likely useful next, which exit is worth attempting, which requirement blocks the route, which inventory item matters, and which action relieves pressure.

## Last upgraded experiment

`games/rogue-lite-hellscape-siege/`

Latest known commit before this pass: `1dd42dac0d5ab1fe27258bff70ba8ef3603abb28` — `Log Hellscape expedition readability upgrade`.

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
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources, survival readability descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
peer-scene-decision-readability-domain
├─ choice-intent-domain
│  ├─ action-likelihood-domain
│  │  └─ scene-action-likelihood-radar-kit
│  └─ exit-choice-domain
│     └─ scene-exit-choice-scorecard-kit
├─ requirement-memory-domain
│  ├─ gate-requirement-domain
│  │  └─ scene-gate-requirement-ladder-kit
│  └─ inventory-use-domain
│     └─ scene-inventory-use-echo-kit
├─ tempo-pressure-domain
│  ├─ pressure-release-domain
│  │  └─ scene-pressure-release-window-kit
│  └─ narrative-thread-domain
│     └─ scene-narrative-thread-pin-kit
└─ renderer-handoff
   └─ scene-decision-readability-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `scene-action-likelihood-radar-kit`
- `scene-gate-requirement-ladder-kit`
- `scene-inventory-use-echo-kit`
- `scene-pressure-release-window-kit`
- `scene-narrative-thread-pin-kit`
- `scene-exit-choice-scorecard-kit`
- `scene-decision-readability-renderer-handoff-kit`
- `scene-decision-readability-domain-kit`

Changed integration:

- `scene-demo.js` now imports `createSceneDecisionReadabilityDomainKit`.
- `describePeerSceneHandoff()` now composes base, atmospheric, chronicle, consequence, and decision readability descriptors.
- `renderVisualStage()` consumes decision descriptors through existing scene presentation layers.
- `renderStatePanel()` now reports decision readiness.
- `GameHost.getDecisionReadabilityDomain()` exposes the new domain snapshot.
- `GameHost.getRendererHandoff()` includes action likelihood, gate requirements, inventory echoes, pressure release windows, narrative thread pins, and exit choice scorecards.

## Files changed

- `experiments/_kits/peer-scene-transition/peer-scene-decision-readability-handoff-kits.js`
- `experiments/peer-scene-transition/shared/scene-demo.js`
- `tests/peer-scene-transition-decision-readability-handoff-smoke.mjs`
- `tests/peer-scene-transition-decision-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0539-peer-scene-decision-readability-upgrade.md`

## Tests added

- `tests/peer-scene-transition-decision-readability-handoff-smoke.mjs`
  - 10 intake cases.
  - Checks action likelihood radars, gate requirement ladders, inventory use echoes, pressure release windows, narrative thread pins, exit choice scorecards, renderer handoff counts, serializability, and renderer-neutral ownership boundaries.
- `tests/peer-scene-transition-decision-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime runtime absence, route import wiring, `GameHost` exposure, descriptor consumption, and ownership boundaries.

Updated:

- `scripts/run-checks.mjs` now runs the two new checks in full and deploy suites.
- `experiments/domain-kit-cutover-manifest.json` now records the decision-readability pass.

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking expected route/test/manifest tokens during the pass.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Peer Scene runtime keeps the requested runtime import: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Peer Scene runtime does not import `LuminaryLabs-Dev/NexusRealtime@main`.
- New decision readability kits are plain JavaScript descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.
- Existing repository-wide legacy references were not destructively removed because this pass touched only Peer Scene Transition.

## Cleanup pass

- Preserved every scene route and HTML entry.
- Reused the existing visual stage instead of creating another renderer.
- Kept action eligibility, route solving, inventory truth, and decision ranking in reusable kits.
- Avoided version-suffix route creation.
- Avoided destructive deletes or renames.

## Non-game route handling

Peer Scene Transition is a small experience-driven web game / puzzle prototype. It was not deleted, renamed, or refactored away. The pass preserved scene transitions, inventory, pressure, and puzzle solving while adding a clearer decision-readability layer.

## Next safe ledge

Add a deterministic Peer Scene replay fixture that starts at camp, takes the lantern and rope, attempts a blocked route, solves either forest or bridge, reaches the shrine, opens the shrine seal, and snapshot-hashes base, atmospheric, chronicle, consequence, and decision-readability renderer handoff descriptors.
