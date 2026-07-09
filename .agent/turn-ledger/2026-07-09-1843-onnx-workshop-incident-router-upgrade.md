# 2026-07-09 18:43 UTC — ONNX Agent Lab incident router upgrade

## Chosen experiment

`experiments/onnx-agent-lab/incident-router.html`.

## Why it was chosen

The latest completed upgrade targeted `experiments/infinite-radial-terrain/`, so this run intentionally selected a different route. `experiments/onnx-agent-lab/` is still one of the lowest-variability experiences because it is primarily a workshop/readiness proof rather than a direct game loop. This upgrade preserves the earlier signal-calibration route and adds a concrete incident-operations loop where the player samples traces, acknowledges alerts, routes fallback briefs, loads the model, escalates incidents, and opens the scene handoff.

## Last upgraded experiment

`experiments/infinite-radial-terrain/` — glacier beacon rescue readiness.

Latest observed prior changelog: `.agent/turn-ledger/2026-07-09-1830-infinite-radial-terrain-glacier-beacon-rescue-upgrade.md`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene host puzzle proof with tokens, exits, oracle/readability, clue pressure, evidence ritual, archive/shelter/flood/courier/bell archive overlays. | 3-6 min | Click scene actions, inspect debug state, unlock transition routes. | Not observed in inventory shell; route uses shared scene modules. | Yes in shared scene module and upgraded overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale jump rescue pass with tether, wind, oxygen, medevac descriptors. | 2-4 min | A/D movement, jump, collect, avoid hazards, medevac readiness. | No in changed medevac entry. | Yes in upgraded entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, aquifer cartography, and glacier beacon rescue descriptors. | 2-6 min | WASD flight, vertical flight, mouse look, terrain readback, inspect route-readiness overlays. | No in latest glacier entry. | Yes in latest glacier entry. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, vegetation, ecology, creek irrigation, and soil mycelium overlays. | 3-8 min | First-person/look exploration, visual target inspection, ecological descriptor overlays. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset expedition, museum, mural, curriculum kiln readiness. | 5-15 min | Train/sample/checkpoint controls, inspect generated readiness panels. | Not observed in changed route inventory. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival mediation descriptors. | 3-8 min | Agent action selection, market trust, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, rescue overlays, observatory, courier descriptors. | 5-8 min | Move/look, scan targets, handle fog pressure, trigger rescue/courier readiness. | No in changed courier entry. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice with scan, harvest, build, pressure, hospital, desalination descriptors. | 6-10 min | Explore, scan, harvest, build gates/cargo, handle storm/hospital/water readiness. | No in changed entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Roman strategy map with panning, hover/dive, army visualization, logistics/diplomacy/hospital/grain/aqueduct/beacon/standard morale overlays. | 4-10 min | Pan map, select regions, inspect campaign descriptors. | No in latest standard morale pass. | Yes in upgraded entry. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, range rings, field hospital, supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue with block carrying, pressure, rune gates, survivor pings, clinic/pump/archive/cartography overlays. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation, avalanche/weather/drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, manage rescue readiness. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with camera, debug rays, traversal/afterimage rescue descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue/lighthouse/rookery/star orchard/sky radio descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, cure/seed/well/radio/cider overlays. | 5-12 min | Move, sprint, dodge, collect, swap/use gear, fight horde. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, covenant descriptors. | 8-15 min | Harvest, build, fight waves, maintain base. | No in changed covenant entry. | Yes in upgraded entry. |
| `experiments/onnx-agent-lab/incident-router.html` | ONNX workshop route for incident operations, trace sampling, classifier routing, fallback briefs, operator shifts, and audit ledgers. | 3-8 min | Click desk actions, improve trace quality, route fallbacks, load model, escalate incidents, open scene handoff. | No in changed incident-router entry. | Yes in changed incident-router entry. |

## Domain ASCII tree

```txt
onnx-workshop-incident-router-readiness-domain
├─ signal-intake-domain
│  ├─ alert-beacon-domain
│  │  └─ onnx-incident-alert-beacon-kit
│  └─ trace-sampler-domain
│     └─ onnx-incident-trace-sampler-kit
├─ diagnosis-routing-domain
│  ├─ classifier-lane-domain
│  │  └─ onnx-incident-classifier-lane-kit
│  └─ fallback-brief-domain
│     └─ fallback-playbook-domain
│        └─ onnx-incident-fallback-brief-kit
├─ resolution-handoff-domain
│  ├─ operator-shift-domain
│  │  └─ onnx-incident-operator-shift-kit
│  └─ audit-ledger-domain
│     └─ onnx-incident-audit-ledger-kit
└─ renderer-handoff
   └─ onnx-incident-router-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js`.

Atomic kits:

- `onnx-incident-alert-beacon-kit`
- `onnx-incident-trace-sampler-kit`
- `onnx-incident-classifier-lane-kit`
- `onnx-incident-fallback-brief-kit`
- `onnx-incident-operator-shift-kit`
- `onnx-incident-audit-ledger-kit`
- `onnx-incident-router-renderer-handoff-kit`

Composite kit:

- `onnx-workshop-incident-router-readiness-domain-kit`

Ownership boundary: reusable kit logic owns descriptor production only and does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX runtime loading, model inference, storage, navigation, network, or frame-loop ownership.

## Files changed

Added:

- `experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js`
- `experiments/onnx-agent-lab/incident-router.html`
- `experiments/onnx-agent-lab/incident-router-entry.js`
- `tests/onnx-workshop-incident-router-readiness-kits-smoke.mjs`
- `tests/onnx-workshop-incident-router-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1843-onnx-workshop-incident-router-upgrade.md`

Updated:

- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/onnx-workshop-incident-router-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain tree, kit list, ownership exclusions, descriptor families, readiness bounds, pressure bounds, mission-state enum, descriptor-only handoff, JSON safety, domain-kit composition, and mature-state improvement.
- `tests/onnx-workshop-incident-router-cdn-state-input-smoke.mjs`
  - 10 simulated state/input steps.
  - Checks route marker, cache-busted script, NexusEngine main CDN import, absence of old `NexusRealtime@` import in the changed entry, `GameHost` accessors, reusable-kit isolation, descriptor totals, readiness bounds, pressure bounds, and improvement after simulated actions.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/onnx-agent-lab/onnx-workshop-incident-router-kits.js
node --check experiments/onnx-agent-lab/incident-router-entry.js
node --check tests/onnx-workshop-incident-router-readiness-kits-smoke.mjs
node --check tests/onnx-workshop-incident-router-cdn-state-input-smoke.mjs
node tests/onnx-workshop-incident-router-readiness-kits-smoke.mjs
node tests/onnx-workshop-incident-router-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
ONNX workshop incident router readiness kits smoke passed 10 intake cases.
ONNX workshop incident router CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added CDN/state-input smoke performs the requested local Playwright-style source and state validation by reading the route shell and simulating 10 state cases through the kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no browser input listener, no audio ownership, no asset loading, no model inference ownership, and no graphics runtime ownership. The ownership exclusion strings mention Three.js/WebGL only as forbidden responsibilities.

## Cleanup pass

- Preserved `experiments/onnx-agent-lab/signal-calibration.html` and its existing signal-calibration workshop behavior.
- Added `incident-router.html` as the new gallery-facing route rather than deleting or renaming the old lab.
- Kept incident scoring and descriptor production in `_kits/`.
- Kept DOM rendering and click handling in `incident-router-entry.js` only.
- Updated gallery metadata to point ONNX Agent Lab at the richer incident-router route.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Non-game handling

ONNX Agent Lab is a workshop/agent-readiness proof rather than a traditional small web game. It was not deleted or renamed because it is still useful as a model/fallback/agent-lab demonstration. The lesson from the route is that model-loading workshops become clearer when the user has an operations-loop objective: collect evidence, route uncertainty, protect fallbacks, assign operator attention, and close an audit ledger.

## Next safe ledge

Make the incident router optionally consume live transcript snippets from the signal-calibration route through a shared descriptor-only bridge. Keep transcript parsing and scoring in reusable kits, and keep both route renderers as presentation-only descriptor consumers.
